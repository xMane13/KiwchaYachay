# 🪶 Kiwcha Repo — Proyecto Completo

Plataforma fullstack para gestión y consulta de materiales educativos:

- **Backend:** Django + Django REST Framework
- **Frontend:** React + Vite + TypeScript

---

## 🗂️ Estructura del Proyecto

```

/
├── backend/ # Django REST API
│ └── README.md
├── frontend/ # React + Vite
│ └── README.md
└── README.md # (este archivo)

```


---

## ✨ Características

- Autenticación con JWT y verificación por email
- Subida y gestión de materiales educativos
- Comentarios, favoritos y calificaciones (rating)
- Frontend desacoplado que consume la API REST
- Listo para producción en **AlmaLinux + Apache**

---

## ⚡ Instalación Rápida (Desarrollo)

### 1. Clonar el repositorio

```bash
git clone https://github.com/xMane13/KiwchaYachay.git
cd kiwcha_repo_full

```

### 2. Instalar dependencias del backend

```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Completa tus variables
python manage.py migrate
python manage.py createsuperuser  # Opcional: crea usuario admin
```

### 3. Instalar dependencias del frontend

```
cd ../frontend
npm install
cp .env.example .env  # Agrega tu clave reCAPTCHA pública
```

### 4. Ejecutar en desarrollo

- Backend:

```
cd backend
source venv/bin/activate
python manage.py runserver
```

-Frontend:

```
cd frontend
npm run dev
```

----

## 🚀 Despliegue en Producción con **AlmaLinux** y Apache

### 1. Instala dependencias del sistema

```bash
sudo dnf update -y
sudo dnf install -y python3 python3-venv python3-pip httpd mod_ssl git nodejs npm
sudo dnf install -y epel-release
sudo dnf install -y python3-mod_wsgi  # Puede ser python3-mod_wsgi o mod_wsgi dependiendo del repositorio
```
> Si python3-mod_wsgi no existe, instala con pip install mod_wsgi y compila manualmente, pero en la mayoría de los casos el paquete oficial está disponible.

### 2. Configura el backend (Django)

```
cd /ruta/a/tu/proyecto/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Rellena tus variables
python manage.py migrate
python manage.py collectstatic  # Si usas archivos estáticos
```

### 3. Compila el Frontend

```
cd /ruta/a/tu/proyecto/frontend
npm install
npm run build
# Archivos finales en frontend/dist/
```

### 4. Configura Apache para servir backend y frontend

Crea un archivo, por ejemplo: `/etc/httpd/conf.d/kiwcha.conf`

```
<VirtualHost *:80>
    ServerName tu_dominio.com

    # --- Django Backend por WSGI ---
    WSGIDaemonProcess kiwcha python-path=/ruta/a/tu/proyecto/backend python-home=/ruta/a/tu/proyecto/backend/venv
    WSGIProcessGroup kiwcha
    WSGIScriptAlias /api /ruta/a/tu/proyecto/backend/kiwcha_repo/wsgi.py

    <Directory /ruta/a/tu/proyecto/backend>
        <Files wsgi.py>
            Require all granted
        </Files>
    </Directory>

    # --- Frontend estático (React/Vite) ---
    Alias /static/ /ruta/a/tu/proyecto/frontend/dist/
    <Directory /ruta/a/tu/proyecto/frontend/dist>
        Require all granted
        Options -Indexes
    </Directory>

    # (Opcional) SPA fallback: todo lo que no sea /api lo manda al frontend
    RewriteEngine On
    RewriteCond %{REQUEST_URI} !^/api
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^(.*)$ /static/index.html [L]

    # Archivos estáticos de Django (si usas)
    Alias /backend_static/ /ruta/a/tu/proyecto/backend/static/
    <Directory /ruta/a/tu/proyecto/backend/static>
        Require all granted
    </Directory>
</VirtualHost>
```

> Cambia ```/ruta/a/tu/proyecto``` por tu ruta real.

### 5. Habilita y reinicia Apache

```

sudo systemctl enable httpd
sudo systemctl restart httpd
```
> Si tienes firewall, permite el puerto 80 y 443 (para SSL):
 ```
 sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

```
