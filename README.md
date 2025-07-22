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
