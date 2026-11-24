# Nginx Projects: Multi-Service Architecture & Reverse Proxy Implementations

A collection of production-grade Nginx reverse proxy configurations, migration blueprints, and deployment architectures for multi-tier industrial and web applications (Node.js, Express, React, Vite, Flask, MariaDB, and Socket.IO).

---

## 🏗️ Master Architecture & Port Allocation Matrix

This repository contains multi-module deployments where Nginx orchestrates multiple frontend Single Page Applications (SPAs), backend REST APIs, WebSocket streams, and static media under decoupled ports and subpaths.

| Directory / Project | Public Port | Subpaths / Routes | Backend Target | WebSockets | Purpose & Technology |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EMS** | **82** | `/` `(Root)`<br>`/EMS/`<br>`/MallikEMS/`<br>`/api/` | `127.0.0.1:8005` | `Yes` (`/socket.io/`) | **Energy Management System**: React SPA frontend with real-time meter telemetry & Node.js backend. |
| **Mallik ERP** | **80** | `/` -> `/MallikEngineering/`<br>`/api/`, `/user/`<br>`/uploads/`, `/public/` | `127.0.0.1:8000` | `Yes` (`/socket.io/`) | **Enterprise Resource Planning**: Core ERP system serving production React client, document uploads & backend APIs. |
| **ShopFloor** | **81** | `/`<br>`/MallikShopFloor/`<br>`/api/`, `/uploads/` | `127.0.0.1:8004` (or `8003`) | `Yes` | **Shop Floor Execution**: Machine parameter monitoring, operator dashboards, and sensor dispatching. |
| **Triveni MES** | **80** | `/` `(Admin Portal)`<br>`/operator/` `(Kiosk UI)`<br>`/api/`, `/uploads/`, `/health` | `127.0.0.1:5050` *(via `upstream triveni_backend`)* | `Yes` (`/socket.io/`) | **Dual-Frontend Factory MES**: Vite React Admin + touch-optimized Operator Kiosk UI, Gzip compression, keepalive pools. |
| **Js Based** | **80** | `/`<br>`/api/` | `127.0.0.1:5000` | `No` | **Analytics Dashboard**: React + Express decoupled architecture demonstrating CORS elimination via Nginx reverse proxy. |
| **ShopLite (Random Files)** | **80** | `/`<br>`/static/` | `127.0.0.1:5000` | `No` | **Python E-Commerce**: Nginx serving static CSS/images with 30-day cache headers, reverse proxying dynamic requests to Flask. |

---

## 🔍 Detailed Breakdown of Each Project

### 1. EMS (Energy Management System)
* **Configuration Files**:
  * [`EMS/BackEnd/Nginx/nginx.conf`](file:///c:/Developer_19_Projects/Nginx%20demo/EMS/BackEnd/Nginx/nginx.conf)
  * [`EMS/BackEnd/Nginx/Locations/ems.locations.conf`](file:///c:/Developer_19_Projects/Nginx%20demo/EMS/BackEnd/Nginx/Locations/ems.locations.conf)
* **What Nginx Does Here**:
  1. **Port 82 Binding**: Operates on a dedicated public port (`listen 82;`) alongside ERP and ShopFloor without port collisions.
  2. **Multi-Subpath SPA Routing**: Serves React static builds with `try_files $uri $uri/ /index.html` across multiple paths (`/`, `/EMS/`, `/MallikEMS/`).
  3. **High-Throughput API Proxy**: Proxies `/api/` calls to the Node.js backend on `127.0.0.1:8005` with 300-second read/send timeouts.
  4. **Full-Duplex WebSockets (`/socket.io/`)**: Upgrades HTTP connections to persistent WebSockets (`Upgrade $http_upgrade`, `Connection "upgrade"`) for real-time energy consumption telemetry.
  5. **Large File Uploads**: Allocates `client_max_body_size 500m;` for heavy data logging, report exports, and firmware blobs.

---

### 2. Mallik ERP & ShopFloor Integration
* **Configuration Files**:
  * [`Mallik_Nginx _Compatible/ShopFloor/Client Deployment/Nginx/nginx.conf`](file:///c:/Developer_19_Projects/Nginx%20demo/Mallik_Nginx%20_Compatible/ShopFloor/Client%20Deployment/Nginx/nginx.conf)
  * [`locations/erp.locations.conf`](file:///c:/Developer_19_Projects/Nginx%20demo/Mallik_Nginx%20_Compatible/ShopFloor/Client%20Deployment/Nginx/locations/erp.locations.conf)
  * [`locations/shopfloor.locations.conf`](file:///c:/Developer_19_Projects/Nginx%20demo/Mallik_Nginx%20_Compatible/ShopFloor/Client%20Deployment/Nginx/locations/shopfloor.locations.conf)
* **What Nginx Does Here**:
  1. **Replaces XAMPP / Apache**: Solves Apache thread exhaustion, crash cascades, and `.htaccess` rewrite issues by introducing event-driven Nginx with Native MariaDB (Windows Service).
  2. **Modular Architecture**: The master `nginx.conf` imports isolated configuration files via `include locations/*.conf`.
  3. **Port 80 (Mallik ERP)**:
     - 301 redirection from root `/` to `/MallikEngineering/`.
     - Static file serving directly from disk (`D:/ERP/Client/`).
     - Proxying `/api/`, `/user/`, `/uploads/`, and `/contractReview/` to Node.js on `127.0.0.1:8000`.
  4. **Port 81 (ShopFloor Module)**:
     - Hosts the machine monitoring UI (`D:/Shopfloor/Frontend/build/`).
     - Proxies backend services to `127.0.0.1:8004` (or `8003`).

---

### 3. Triveni MES (Manufacturing Execution System)
* **Configuration Files**:
  * [`Triveni/nginx.conf`](file:///c:/Developer_19_Projects/Nginx%20demo/Triveni/nginx.conf)
  * [`Triveni/DEPLOYMENT_GUIDE_NSSM.txt`](file:///c:/Developer_19_Projects/Nginx%20demo/Triveni/DEPLOYMENT_GUIDE_NSSM.txt)
* **What Nginx Does Here**:
  1. **Dual-Application Single-Port Orchestration (Port 80)**:
     - **Operator Kiosk (`/operator/`)**: Dedicated touch UI for factory machine operators mapped to `Triveni/operator/dist/`.
     - **Admin Management Portal (`/`)**: Comprehensive ERP/MES dashboard for inventory, planning, and quality mapped to `Triveni/frontend/dist`.
  2. **Upstream Connection Pooling**:
     ```nginx
     upstream triveni_backend {
         server 127.0.0.1:5050;
         keepalive 32;
     }
     ```
  3. **High-Performance Gzip Compression**: Pre-compresses text, CSS, JS, JSON, XML, and SVG at compression level 6.
  4. **Real-Time Factory Floor Streaming**: Proxies `/socket.io/` for live machine status, coil counters, downtime tracking, and MQTT messages.
  5. **Windows Service Management**: Fully automated startup, shutdown, and reload via NSSM and `.bat` control scripts.

---

### 4. Js Based (Modern Full-Stack Dashboard)
* **Configuration Files & References**:
  * [`Random Files/js_based_nginx_guide.html`](file:///c:/Developer_19_Projects/Nginx%20demo/Random%20Files/js_based_nginx_guide.html)
  * [`Js Based/client/`](file:///c:/Developer_19_Projects/Nginx%20demo/Js%20Based/client/)
* **What Nginx Does Here**:
  1. **Elimination of CORS (Cross-Origin Resource Sharing)**: Unifies client (port 3000/5173 in dev) and backend (port 5000) under standard port 80.
  2. **Direct Static Serving**: Serves compiled Vite assets from disk while proxying `/api/` to Express.
  3. **Clean Architecture**: Enables relative client API calls (`/api/dashboard`) without hardcoded backend hostnames or ports.

---

### 5. ShopLite & Migration Resources (Random Files)
* **Configuration Files & Guides**:
  * [`Random Files/nginx_react_nodejs_migration_guide.md`](file:///c:/Developer_19_Projects/Nginx%20demo/Random%20Files/nginx_react_nodejs_migration_guide.md)
  * [`Random Files/implementation_plan.md`](file:///c:/Developer_19_Projects/Nginx%20demo/Random%20Files/implementation_plan.md)
* **What Nginx Does Here**:
  1. **Python Flask Reverse Proxy**: Proxies dynamic HTTP requests to Python WSGI/Flask (`127.0.0.1:5000`) and serves static CSS/assets directly with `expires 30d;`.
  2. **Migration Playbooks**: Architectural blueprints for migrating legacy XAMPP/Apache deployments to crash-resilient Nginx environments.
  3. **Traffic Analytics**: Bundles GoAccess real-time visual log analysis for monitoring traffic and response latency.

---

## 🛠️ Key Nginx Directives Explained

* `worker_processes auto;` - Spawns worker processes matching CPU core counts for optimal concurrency.
* `sendfile on;` - Enables direct kernel-space data transfers for static file delivery without context switching.
* `try_files $uri $uri/ /index.html;` - Core directive for Single Page Applications (React, Vue, Vite); ensures client-side routes (e.g. `/dashboard`, `/orders/123`) don't return 404s on browser refresh.
* `proxy_http_version 1.1;` + `proxy_set_header Upgrade $http_upgrade;` - Enables persistent HTTP/1.1 connections and seamless WebSocket upgrades for Socket.IO.
* `client_max_body_size 500m;` - Overcomes default 1MB request entity limits to support large file uploads.

---

## 🚀 Git Setup & Deployment Guide

Follow these steps to initialize and push this repository to GitHub:

```bash
# 1. Initialize Git repository
git init

# 2. Stage .gitignore and README
git add .gitignore README.md

# 3. Create the initial commit
git commit -m "docs: comprehensive Nginx architecture guide and repository documentation"

# 4. Set default branch to main
git branch -M main

# 5. Add remote origin (corrected URL)
git remote add origin https://github.com/developer19rdl/nginx_projects.git

# 6. Push to GitHub
git push -u origin main
```
