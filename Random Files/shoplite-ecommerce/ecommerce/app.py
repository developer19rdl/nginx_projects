import os
import hashlib
import uuid
from flask import (Flask, render_template, request, redirect, url_for,
                   session, flash, jsonify)
from db import init_db, get_db

app = Flask(__name__)
app.secret_key = os.urandom(24)


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def get_or_create_session_id():
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    return session['session_id']


def get_cart(session_id, user_id=None):
    db = get_db()
    if user_id:
        items = db.execute(
            '''SELECT cart_items.id, products.name, products.price,
               cart_items.quantity, products.image, products.stock
               FROM cart_items JOIN products ON cart_items.product_id = products.id
               WHERE cart_items.user_id = ?''', (user_id,)
        ).fetchall()
    else:
        items = db.execute(
            '''SELECT cart_items.id, products.name, products.price,
               cart_items.quantity, products.image, products.stock
               FROM cart_items JOIN products ON cart_items.product_id = products.id
               WHERE cart_items.session_id = ?''', (session_id,)
        ).fetchall()
    db.close()
    return items


def get_cart_count(session_id, user_id=None):
    db = get_db()
    if user_id:
        row = db.execute(
            'SELECT COALESCE(SUM(quantity),0) FROM cart_items WHERE user_id = ?',
            (user_id,)
        ).fetchone()
    else:
        row = db.execute(
            'SELECT COALESCE(SUM(quantity),0) FROM cart_items WHERE session_id = ?',
            (session_id,)
        ).fetchone()
    db.close()
    return row[0]


# ── Routes ──────────────────────────────────────────────────────────────────

@app.route('/')
def home():
    db = get_db()
    category = request.args.get('category')
    search = request.args.get('search', '').strip()

    if search:
        products = db.execute(
            '''SELECT * FROM products
               WHERE name LIKE ? OR description LIKE ?
               ORDER BY id DESC''',
            (f'%{search}%', f'%{search}%')
        ).fetchall()
    elif category:
        products = db.execute(
            'SELECT * FROM products WHERE category = ? ORDER BY id DESC',
            (category,)
        ).fetchall()
    else:
        products = db.execute('SELECT * FROM products ORDER BY id DESC').fetchall()

    categories = [row[0] for row in db.execute(
        'SELECT DISTINCT category FROM products ORDER BY category'
    ).fetchall()]
    db.close()

    session_id = get_or_create_session_id()
    user_id = session.get('user_id')
    cart_count = get_cart_count(session_id, user_id)

    return render_template('home.html', products=products, categories=categories,
                           cart_count=cart_count, current_category=category,
                           search=search)


@app.route('/product/<int:pid>')
def product_detail(pid):
    db = get_db()
    product = db.execute('SELECT * FROM products WHERE id = ?', (pid,)).fetchone()
    db.close()
    if not product:
        flash('Product not found.', 'error')
        return redirect(url_for('home'))

    session_id = get_or_create_session_id()
    user_id = session.get('user_id')
    cart_count = get_cart_count(session_id, user_id)

    return render_template('product.html', product=product, cart_count=cart_count)


@app.route('/cart/add/<int:pid>', methods=['POST'])
def add_to_cart(pid):
    db = get_db()
    product = db.execute('SELECT stock FROM products WHERE id = ?', (pid,)).fetchone()
    if not product:
        flash('Product not found.', 'error')
        return redirect(url_for('home'))

    session_id = get_or_create_session_id()
    user_id = session.get('user_id')
    qty = min(int(request.form.get('quantity', 1)), product['stock'])

    if user_id:
        existing = db.execute(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            (user_id, pid)
        ).fetchone()
    else:
        existing = db.execute(
            'SELECT id, quantity FROM cart_items WHERE session_id = ? AND product_id = ?',
            (session_id, pid)
        ).fetchone()

    if existing:
        new_qty = min(existing['quantity'] + qty, product['stock'])
        db.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', (new_qty, existing['id']))
    else:
        db.execute(
            'INSERT INTO cart_items (user_id, product_id, quantity, session_id) VALUES (?,?,?,?)',
            (user_id, pid, qty, session_id if not user_id else None)
        )

    db.commit()
    db.close()
    flash(f'Added to cart!', 'success')
    return redirect(request.referrer or url_for('home'))


@app.route('/cart/remove/<int:item_id>', methods=['POST'])
def remove_from_cart(item_id):
    db = get_db()
    db.execute('DELETE FROM cart_items WHERE id = ?', (item_id,))
    db.commit()
    db.close()
    return redirect(url_for('cart'))


@app.route('/cart')
def cart():
    session_id = get_or_create_session_id()
    user_id = session.get('user_id')
    items = get_cart(session_id, user_id)
    total = sum(item['price'] * item['quantity'] for item in items)
    cart_count = get_cart_count(session_id, user_id)
    return render_template('cart.html', items=items, total=total, cart_count=cart_count)


@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    session_id = get_or_create_session_id()
    user_id = session.get('user_id')
    items = get_cart(session_id, user_id)

    if not items:
        flash('Your cart is empty.', 'error')
        return redirect(url_for('home'))

    total = sum(item['price'] * item['quantity'] for item in items)
    cart_count = get_cart_count(session_id, user_id)

    if request.method == 'POST':
        address = request.form.get('address', '').strip()
        if not address:
            flash('Please enter a shipping address.', 'error')
            return render_template('checkout.html', items=items, total=total,
                                   cart_count=cart_count)

        db = get_db()
        cursor = db.execute(
            'INSERT INTO orders (user_id, session_id, total, shipping_address, status) VALUES (?,?,?,?,?)',
            (user_id, session_id if not user_id else None, total, address, 'confirmed')
        )
        order_id = cursor.lastrowid

        for item in items:
            db.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)',
                (order_id, item['product_id'] if 'product_id' in item.keys() else
                 db.execute('SELECT product_id FROM cart_items WHERE id=?', (item['id'],)).fetchone()[0],
                 item['quantity'], item['price'])
            )
            # Decrease stock
            pid = db.execute('SELECT product_id FROM cart_items WHERE id=?', (item['id'],)).fetchone()[0]
            db.execute('UPDATE products SET stock = stock - ? WHERE id = ?', (item['quantity'], pid))

        # Clear cart
        if user_id:
            db.execute('DELETE FROM cart_items WHERE user_id = ?', (user_id,))
        else:
            db.execute('DELETE FROM cart_items WHERE session_id = ?', (session_id,))

        db.commit()
        db.close()

        return render_template('order_success.html', order_id=order_id, total=total,
                               cart_count=0)

    return render_template('checkout.html', items=items, total=total, cart_count=cart_count)


# ── Auth Routes ─────────────────────────────────────────────────────────────

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')

        if not username or not email or not password:
            flash('All fields are required.', 'error')
            return redirect(url_for('register'))

        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'error')
            return redirect(url_for('register'))

        db = get_db()
        if db.execute('SELECT id FROM users WHERE username = ?', (username,)).fetchone():
            flash('Username already taken.', 'error')
            db.close()
            return redirect(url_for('register'))

        if db.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone():
            flash('Email already registered.', 'error')
            db.close()
            return redirect(url_for('register'))

        db.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?,?,?)',
            (username, email, hash_password(password))
        )
        db.commit()
        db.close()
        flash('Account created! Please log in.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        db = get_db()
        user = db.execute(
            'SELECT * FROM users WHERE username = ? AND password_hash = ?',
            (username, hash_password(password))
        ).fetchone()
        db.close()

        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash(f'Welcome back, {user["username"]}!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid username or password.', 'error')
            return redirect(url_for('login'))

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    flash('Logged out.', 'success')
    return redirect(url_for('home'))


# ── API endpoint for cart count (used by JS) ────────────────────────────────

@app.route('/api/cart-count')
def api_cart_count():
    session_id = get_or_create_session_id()
    user_id = session.get('user_id')
    return jsonify({'count': get_cart_count(session_id, user_id)})


if __name__ == '__main__':
    init_db()
    app.run(debug=False, host='0.0.0.0', port=5000)
