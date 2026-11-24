import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'ecommerce.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image TEXT DEFAULT '/static/css/placeholder.png',
        category TEXT DEFAULT 'General',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        session_id TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id)
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_id TEXT,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )''')

    # Seed sample products if empty
    c.execute('SELECT COUNT(*) FROM products')
    if c.fetchone()[0] == 0:
        sample_products = [
            ('Wireless Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life and deep bass.', 79.99, 50, 'Electronics'),
            ('Organic Cotton T-Shirt', 'Soft, breathable organic cotton tee available in multiple colors.', 29.99, 200, 'Clothing'),
            ('Stainless Steel Water Bottle', 'Double-walled insulated bottle that keeps drinks cold for 24 hours.', 24.99, 150, 'Accessories'),
            ('Mechanical Keyboard', 'Compact 75% mechanical keyboard with hot-swappable switches and RGB backlight.', 129.99, 30, 'Electronics'),
            ('Yoga Mat', 'Extra thick non-slip yoga mat with alignment lines and carrying strap.', 39.99, 100, 'Fitness'),
            ('Leather Wallet', 'Slim bifold wallet made from genuine leather with RFID blocking.', 49.99, 75, 'Accessories'),
            ('LED Desk Lamp', 'Adjustable LED desk lamp with 5 brightness levels and USB charging port.', 34.99, 60, 'Home'),
            ('Running Shoes', 'Lightweight running shoes with responsive cushioning and breathable mesh upper.', 89.99, 80, 'Fitness'),
            ('Coffee Beans (1kg)', 'Single-origin Arabica coffee beans, medium roast, rich and smooth flavor.', 19.99, 300, 'Food'),
            ('Bluetooth Speaker', 'Portable waterproof Bluetooth speaker with 360-degree sound.', 59.99, 90, 'Electronics'),
            ('Notebook Set (3-Pack)', 'Premium lined notebooks with hardcovers and ribbon bookmarks.', 14.99, 120, 'Stationery'),
            ('Sunglasses', 'Polarized UV400 sunglasses with lightweight acetate frames.', 44.99, 65, 'Accessories'),
        ]
        c.executemany(
            'INSERT INTO products (name, description, price, stock, category) VALUES (?,?,?,?,?)',
            sample_products
        )

    conn.commit()
    conn.close()
