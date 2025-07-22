# 🪶 Kiwcha Repo Frontend

Este es el **frontend** de Kiwcha Repo, una aplicación de consulta y gestión de materiales educativos conectada a un backend Django REST API.

---

## 🚀 Stack Tecnológico

- **React 18** + **TypeScript**
- **Vite**
- **Context API** para manejo de auth y favoritos
- **CSS modules** / `index.css`
- Consumo de API RESTful (backend Django)
- reCAPTCHA V3 (Google)

---

## 📁 Estructura Principal

```

src/
├── api/ # Módulos para llamadas a la API (auth, materiales, favoritos, etc)
├── components/ # Componentes reutilizables (cards, rating, paginación, etc)
├── contexts/ # Contexts de React para auth y favoritos
├── layout/ # Layouts generales (Navbar, Footer, etc)
├── pages/ # Páginas principales
│ ├── auth/ # Páginas de auth: login, registro, recuperación, perfil...
│ └── ... # Home, Materiales, Mis Materiales, Favoritos, etc.
├── App.tsx # Ruteo principal
├── main.tsx # Entry point
├── index.css # Estilos globales
└── vite-env.d.ts # Types Vite

```


---

## ⚙️ Instalación y Ejecución

1. **Clona el repo**
    ```bash
    git clone https://github.com/xMane13/KiwchaYachay.git
    cd KiwchaYachay
    ```
2. **Instala dependencias**
    ```bash
    npm install
    ```
3. **Configura tu archivo `.env`**
    Crea el archivo `.env` con el siguiente contenido (pon tu propia clave reCAPTCHA):

    ```
    VITE_RECAPTCHA_SITE_KEY=tu_clave_recaptcha
    ```

    > Recuerda: **No subas nunca tu `.env` real**. Sube solo `.env.example`.

4. **Inicia la app**
    ```bash
    npm run dev
    ```
    Abre [http://localhost:5173](http://localhost:5173)

---

## 🌐 Variables de Entorno

- `VITE_RECAPTCHA_SITE_KEY` — Tu clave pública de Google reCAPTCHA (obligatorio).
- (Opcional) Si alguna vez agregas más variables, documenta aquí.

---

## 🗂️ Pages y Componentes Principales

### **Pages**
- `/` — Home
- `/materiales` — Lista y buscador de materiales
- `/materiales/:id` — Detalle de material (descarga, rating, comentarios)
- `/favoritos` — Tus materiales favoritos
- `/mis-materiales` — Materiales que subiste
- `/subir` — Subir nuevo material
- `/auth/login` — Login
- `/auth/register` — Registro
- `/auth/profile` — Perfil y edición
- `/auth/forgot-password` — Recuperar contraseña
- `/auth/reset-password` — Cambiar contraseña
- `/auth/email-confirmation` — Confirmar email

### **Componentes**
- `MaterialCard`, `CommentsSection`, `Rating`, `Pagination`, `AuthGuard`, `ModalConfirm`, `LanguageSelector`, etc.

---

## 🔗 Conexión con el Backend

- Los endpoints de API están configurados como rutas relativas (`/api/...`), así que el frontend funciona con proxy en desarrollo (ver vite.config.js si usas proxy) y en producción espera estar servido bajo el mismo dominio o con CORS permitido.

---

## 🧑‍💻 Contribuir

1. Haz fork del repo
2. Crea una nueva rama
3. Haz tus cambios y commitea
4. Abre un Pull Request 🚀

---

## 📝 Notas

- El frontend **NO contiene información sensible ni claves privadas** (revisa el código si contribuyes).
- La clave reCAPTCHA que uses debe ser **pública** (site key).
- Si tu backend está en otro dominio/puerto, asegúrate de configurar correctamente CORS y/o el proxy en `vite.config.js`.

---

