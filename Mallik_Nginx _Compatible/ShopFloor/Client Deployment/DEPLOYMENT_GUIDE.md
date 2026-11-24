# ShopFloor Client Deployment Guide (UltraViewer Quick Start)

This package contains everything needed to deploy the **ShopFloor** application alongside the existing **Mallik ERP** on the client machine (`192.168.8.8`).

---

## 🏗️ Architecture Overview

| Application | Port | Frontend Path | Backend Port / Proxy |
| :--- | :--- | :--- | :--- |
| **Mallik ERP** (Untouched) | **80** | `D:/ERP/Client/` | `127.0.0.1:8000` |
| **ShopFloor** (New) | **81** | `D:/ERP/ShopFloor/Frontend/build/` | `127.0.0.1:8003` |

Both applications share the same Nginx instance without any port or URL collisions.

---

## 📋 5-Step Deployment Checklist (UltraViewer)

### Step 1: Transfer & Extract
1. In your UltraViewer session, transfer `ShopFloor_Client_Deployment.zip` to the client server.
2. Extract the contents to:
   ```
   D:\ERP\ShopFloor
   ```
   *(If the client machine does not have a `D:` drive, extract to `C:\ShopFloor` and update the alias path in `Nginx\locations\shopfloor.locations.conf` to `C:/ShopFloor/Frontend/build/`)*.

---

### Step 2: Configure Database Credentials (.env)
1. Open `D:\ERP\ShopFloor\Backend\.env` in Notepad.
2. Verify / update the database settings for the client's MySQL / MariaDB instance:
   ```env
   DB_HOST = 127.0.0.1
   DB_PORT = 3306
   DB_DATABASE = mallik_demo3
   DB_USER = root
   DB_PASSWORD = your_actual_password
   ```
3. **MAC Address Validation Note**:
   - If the backend outputs `Unauthorized access` upon launch, either:
     - Set `SKIP_MAC_VALIDATION = true` in `.env`, OR
     - Add the client's MAC to `ALLOWED_MACS = 'XX:XX:XX:XX:XX:XX'` in `.env`.

---

### Step 3: Run the Automated Nginx Deployment
1. Right-click on `D:\ERP\ShopFloor\deploy.ps1` and select **Run with PowerShell** (or run as Administrator in PowerShell).
2. The script will:
   - ✅ Automatically open Windows Firewall for Port 81.
   - ✅ Detect the Nginx installation directory.
   - ✅ Create a timestamped backup of the current `nginx.conf`.
   - ✅ Install the modular `nginx.conf` and `locations/` configs.
   - ✅ Validate syntax (`nginx -t`) and reload Nginx (`nginx -s reload`).

---

### Step 4: Start the ShopFloor Backend
1. Double-click `D:\ERP\ShopFloor\start_backend.bat`.
2. A command prompt window will open displaying:
   ```
   Server running on http://127.0.0.1:8003
   ```
3. *(Optional for Autostart on boot)*: You can create a Windows shortcut to `start_backend.bat` in the Windows Startup folder:
   `Win + R` -> `shell:startup` -> paste shortcut.
   Or register `server.exe` as a Windows service using **NSSM** (`nssm install ShopFloorBackend`).

---

### Step 5: Verification & Testing
Open Chrome or Edge on any machine in the client's network (`192.168.8.x`):

1. **Test Mallik ERP**:
   - URL: `http://192.168.8.8/`
   - Should redirect to `http://192.168.8.8/MallikEngineering/` and load normally.
2. **Test ShopFloor**:
   - URL: `http://192.168.8.8:81/`
   - Log in with user credentials (e.g. `admin` / `admin`).
   - Verify dashboard loads and API calls return 200 OK.

---

## 🛠️ Troubleshooting

- **Firewall issue**: If client machines cannot reach `http://192.168.8.8:81/`, run:
  ```powershell
  New-NetFirewallRule -DisplayName "ShopFloor Web Port 81" -Direction Inbound -LocalPort 81 -Protocol TCP -Action Allow
  ```
- **Nginx reload error**: Test syntax manually with:
  ```powershell
  cd C:\nginx-1.31.5
  .\nginx.exe -t
  ```
- **Database connection failure**: Confirm MariaDB / MySQL is running on port 3306 and that databases `mallik_demo3` and `mallik_03_26` exist.
