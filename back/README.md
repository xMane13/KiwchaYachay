# 🪶 Kiwcha Repo Backend

¡Bienvenido/a al backend del proyecto **Kiwcha Repo**!  
Este backend está construido en **Django + Django REST Framework** y provee la API y lógica de negocio para el sistema de gestión y consulta de materiales educativos, usuarios, favoritos, comentarios y calificaciones.

---

## 🚀 Tabla de Contenidos
1. [Descripción](#descripción)
2. [Características](#características)
3. [Requisitos](#requisitos)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Variables de Entorno](#variables-de-entorno)
6. [Estructura de Carpetas](#estructura-de-carpetas)
7. [Modelos](#modelos)
8. [Serializers](#serializers)
9. [API REST](#api-rest)
10. [Testing](#testing)
11. [Notas de Desarrollo](#notas-de-desarrollo)

---

## 📖 Descripción

Este repositorio contiene el **backend** para la plataforma **Kiwcha Repo**, una aplicación para la gestión y distribución de materiales educativos, con autenticación de usuarios, subida y descarga de archivos, comentarios, calificaciones y favoritos.

El backend expone una **API RESTful** segura, lista para integrarse con el frontend (SPA o móvil).

---

## ✨ Características

- **Autenticación JWT** (login, registro, verificación por email, recuperación de contraseña)
- **Subida de archivos/materiales** (PDF, imágenes, videos, presentaciones)
- **Miniaturas automáticas** (para imágenes y PDFs)
- **Sistema de favoritos, comentarios y calificaciones**
- **Filtros y búsquedas en la API**
- **CORS habilitado para frontend separado**
- **Gestión avanzada de usuarios (CustomUser)**

---

## ⚙️ Requisitos

- Python 3.10+
- Django 5.x
- [pipenv](https://pipenv.pypa.io/) o `venv` (recomendado)
- **Dependencias:** ver `requirements.txt`
- Base de datos por defecto: SQLite3 (puedes usar PostgreSQL fácilmente)
- Acceso a un servidor SMTP para emails (para producción)

---

## 🛠️ Instalación y Configuración

```bash
# 1. Clona el repositorio
git clone https://github.com/tu_usuario/kiwcha_repo.git
cd kiwcha_repo

# 2. Crea un entorno virtual
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows

# 3. Instala dependencias
pip install -r requirements.txt

# 4. Copia el ejemplo de variables de entorno
cp .env.example .env
# Edita .env con tus credenciales (ver sección de Variables de Entorno)

# 5. Migra la base de datos
python manage.py migrate

# 6. Crea un superusuario (opcional, para admin)
python manage.py createsuperuser

# 7. Levanta el servidor
python manage.py runserver
```
---

## 🔑 Variables de Entorno

Ejemplo en `.env.example` (¡no olvides crear tu propio archivo `.env`!):

```
DJANGO_SECRET_KEY=tu_clave_secreta
RECAPTCHA_SECRET_KEY=tu_clave_recaptcha
EMAIL_HOST=smtp.tuservidor.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=usuario@tudominio.com
EMAIL_HOST_PASSWORD=tu_contraseña
DEFAULT_FROM_EMAIL=usuario@tudominio.com
BACKEND_DOMAIN=http://127.0.0.1:8000
FRONTEND_DOMAIN=http://localhost:5173

```

> **Tip:** Nunca subas tu `.env` real al repo público.  
> Usa `.env.example` para compartir el formato.

---

## 📁 Estructura de Carpetas

```

kiwcha_repo/
│
├── core/                  # App principal: modelos, views, serializers, etc.
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── permissions.py
│   ├── serializers.py
│   ├── signals.py
│   ├── tests.py
│   ├── urls.py
│   ├── utils.py
│   └── views.py
│
├── kiwcha_repo/           # Configuración del proyecto Django
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── requirements.txt       # Dependencias
├── .env.example           # Variables de entorno ejemplo
└── manage.py

```

---

## 🏗️ Modelos Principales

### 1. CustomUser

```
class CustomUser(AbstractBaseUser, PermissionsMixin):
    email         = models.EmailField(unique=True)
    first_name    = models.CharField(max_length=30, blank=True)
    last_name     = models.CharField(max_length=30, blank=True)
    is_active     = models.BooleanField(default=True)
    is_staff      = models.BooleanField(default=False)
    date_joined   = models.DateTimeField(auto_now_add=True)
    is_verified   = models.BooleanField(default=False)

- Autenticación personalizada vía email.
- Relación con Material, Favorito, Comentario, Calificación.
```

---

### 2. Material

```
class Material(models.Model):
    titulo         = models.CharField(max_length=200)
    descripcion    = models.TextField(blank=True)
    archivo_blob   = models.BinaryField(blank=True, null=True)
    archivo_nombre = models.CharField(max_length=255, blank=True, null=True)
    archivo_tipo   = models.CharField(max_length=100, blank=True, null=True)
    video_url      = models.URLField(blank=True, null=True)
    tipo           = models.CharField(max_length=15, choices=[...])
    usuario        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='materiales')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    thumbnail_blob = models.BinaryField(blank=True, null=True)
    thumbnail_tipo = models.CharField(max_length=100, blank=True, null=True)
```
- Puede ser archivo (pdf, imagen, presentación) o video.
- Genera miniaturas automáticas.

---

### 3. Favorito

```
class Favorito(models.Model):
    usuario        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favoritos')
    material       = models.ForeignKey('Material', on_delete=models.CASCADE, related_name='favoritos')
    fecha_agregado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'material')
```
- Relaciona usuarios con materiales favoritos.
- Un usuario no puede tener el mismo material dos veces en favoritos.

---

### 4. Comentario
```
class Comentario(models.Model):
    usuario  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    material = models.ForeignKey('Material', on_delete=models.CASCADE, related_name='comentarios')
    texto    = models.TextField()
    fecha    = models.DateTimeField(auto_now_add=True)
```
- Permite comentar materiales.

---

### 5. Calificacion
```
class Calificacion(models.Model):
    usuario  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    material = models.ForeignKey('Material', on_delete=models.CASCADE, related_name='calificaciones')
    puntaje  = models.PositiveSmallIntegerField()
    fecha    = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'material')
```
- Puntaje de 1 a 5 estrellas a materiales.

---

## 📦 Serializers Principales

User y Auth

- UserSerializer: Devuelve info básica de usuario.
- RegisterSerializer: Registro (incluye reCAPTCHA y creación de usuario).
- LoginSerializer: Login con email y password.
- UserProfileSerializer: Info extendida, estadísticas, actividad reciente.

Material

- MaterialSerializer: CRUD de materiales. Permite subir archivos como base64 o links de video, y devuelve URLs para descargar archivo y miniatura. También agrega estadísticas y nombre del usuario.

Favorito

- FavoritoSerializer: Relaciona usuario y material como favorito. Devuelve fechas y datos relacionados.

Comentario

- ComentarioSerializer: CRUD de comentarios, incluyendo usuario y material, y el nombre del usuario.

Calificación

- CalificacionSerializer: CRUD de calificaciones (solo 1 por usuario por material). Valida rango 1-5.

---

## 🔌 API REST

Prefijo común: `/api/`

### Autenticación y Usuarios

| Método | Endpoint                   | Descripción                                              |
|--------|----------------------------|----------------------------------------------------------|
| POST   | `/api/register/`           | Registra un nuevo usuario con email y contraseña, incluye validación de reCAPTCHA y envía email de verificación. |
| POST   | `/api/login/`              | Login de usuario, retorna JWT y datos del usuario.       |
| GET    | `/api/verify-email/<uidb64>/<token>/` | Verifica email del usuario a través del link enviado al correo. |
| GET/PUT| `/api/profile/`            | Obtiene o actualiza los datos del usuario autenticado.   |
| POST   | `/api/token/refresh/`      | Refresca el token JWT (por seguridad).                   |
| POST   | `/api/logout/`             | Invalida el refresh token JWT.                           |

Recuperación de Contraseña

| Método | Endpoint                                             | Descripción                                  |
|--------|------------------------------------------------------|----------------------------------------------|
| POST   | `/api/password-reset/`                               | Envía email con link para resetear contraseña|
| POST   | `/api/reset-password/<uidb64>/<token>/`              | Cambia la contraseña usando el link recibido |

---

### Materiales

| Método | Endpoint                                   | Descripción                                              |
|--------|--------------------------------------------|----------------------------------------------------------|
| GET    | `/api/materiales/`                        | Lista todos los materiales (filtros: título, tipo, usuario, fechas, búsqueda, ordenación). |
| POST   | `/api/materiales/`                        | Sube un nuevo material (archivo o video).                |
| GET    | `/api/materiales/<id>/`                   | Detalle de un material específico.                       |
| PUT    | `/api/materiales/<id>/`                   | Actualiza material (solo dueño).                         |
| DELETE | `/api/materiales/<id>/`                   | Elimina material (solo dueño).                           |
| GET    | `/api/materiales/<id>/descargar/`         | Descarga el archivo asociado al material.                |
| GET    | `/api/materiales/<id>/thumbnail/`         | Devuelve la miniatura (si aplica) como imagen.           |

Filtros y búsquedas:
- `?titulo=...`  
- `?tipo=...`  
- `?usuario=...`  
- `?fecha_creacion=...`  
- Búsqueda en `titulo` y `descripcion`

---

### Favoritos

| Método | Endpoint               | Descripción                                             |
|--------|------------------------|---------------------------------------------------------|
| GET    | `/api/favoritos/`      | Lista tus materiales favoritos.                         |
| POST   | `/api/favoritos/`      | Añade un material a tus favoritos.                      |
| GET    | `/api/favoritos/<id>/` | Detalle de favorito.                                    |
| PUT    | `/api/favoritos/<id>/` | Actualiza favorito (poco común, normalmente no se usa). |
| DELETE | `/api/favoritos/<id>/` | Elimina de favoritos.                                   |

---

### Comentarios

| Método | Endpoint                  | Descripción                                                    |
|--------|---------------------------|----------------------------------------------------------------|
| GET    | `/api/comentarios/`       | Lista comentarios (por defecto, los más recientes). Puede filtrar por `?material=<id>`. |
| POST   | `/api/comentarios/`       | Publica un nuevo comentario sobre un material.                 |
| GET    | `/api/comentarios/<id>/`  | Detalle de un comentario.                                      |
| PUT    | `/api/comentarios/<id>/`  | Edita comentario (solo dueño).                                 |
| DELETE | `/api/comentarios/<id>/`  | Elimina comentario (solo dueño).                               |

---

### Calificaciones

| Método | Endpoint                    | Descripción                                               |
|--------|-----------------------------|-----------------------------------------------------------|
| GET    | `/api/calificaciones/`      | Lista calificaciones (puede filtrar por material: `?material=<id>`). |
| POST   | `/api/calificaciones/`      | Califica un material (puntaje 1 a 5).                     |
| GET    | `/api/calificaciones/<id>/` | Detalle de calificación.                                  |
| PUT    | `/api/calificaciones/<id>/` | Edita tu calificación (solo dueño).                       |
| DELETE | `/api/calificaciones/<id>/` | Elimina tu calificación (solo dueño).                     |

---

### Autenticación

- Todos los endpoints de creación, edición o borrado requieren autenticación con JWT excepto el registro, login y recuperación de contraseña.
- Se debe enviar el token en el header:

Authorization: Bearer <tu_token_jwt>

---

### Ejemplo de autenticación

curl -H "Authorization: Bearer <tu_token_jwt>" http://localhost:8000/api/profile/

---

## 🧪 Testing

python manage.py test core

Los tests básicos están en `core/tests.py`.  
Puedes ampliarlos para cada endpoint/modelo según necesidades.

---

## 📝 Notas de Desarrollo

- CORS está habilitado para `http://localhost:5173` (Vite, React, etc.)
- Para producción, cambia `DEBUG = False` y ajusta `ALLOWED_HOSTS`
- Archivos grandes: Si usas producción, configura almacenamiento S3/GCS.
- PDF thumbnails: Usa `pdf2image` (requiere poppler instalado).
- Emails: Usa SMTP real; para pruebas puedes poner `EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'`.

---
