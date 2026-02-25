# 👟 Calzado de Enfermería — Instrucciones de instalación

## ¿Cómo funciona?
- Los **estudiantes** entran al link principal y ponen sus datos
- Tú entras a `tu-link.vercel.app/?admin` y gestionas pagos y producción

---

## PASO 1 — Crear la base de datos en Firebase (gratis)

1. Ve a **https://firebase.google.com** e inicia sesión con tu cuenta de Google
2. Haz clic en **"Crear un proyecto"**
3. Ponle un nombre (ej: `zapatos-enfermeria`) y sigue los pasos (puedes desactivar Google Analytics)
4. Una vez creado, haz clic en **"Firestore Database"** en el menú izquierdo
5. Haz clic en **"Crear base de datos"** → elige **"Modo de prueba"** → siguiente → listo
6. Ahora ve a ⚙️ **Configuración del proyecto** (ícono de engranaje arriba a la izquierda)
7. Baja hasta **"Tus apps"** y haz clic en el ícono `</>`  (web)
8. Registra la app con cualquier nombre
9. **Copia los valores** que aparecen en `firebaseConfig` (apiKey, projectId, etc.)

---

## PASO 2 — Pegar tu configuración de Firebase

Abre el archivo `src/firebase.js` y reemplaza los valores con los tuyos:

```js
const firebaseConfig = {
  apiKey: "TU_API_KEY",              // ← pega aquí
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

---

## PASO 3 — Cambiar tu contraseña y precios

Abre `src/App.jsx` y busca estas líneas al inicio:

```js
const ADMIN_PASSWORD = "zapatos2025";   // ← cambia esto
const MODELOS = {
  mujer:  { label: "👩 Dama",      precio: 45000 },  // ← tu precio
  hombre: { label: "👨 Caballero", precio: 48000 },  // ← tu precio
};
```

---

## PASO 4 — Subir a GitHub

1. Ve a **https://github.com** y crea una cuenta si no tienes
2. Crea un **nuevo repositorio** (botón verde "+")  → "New repository"
3. Nómbralo `zapatos-enfermeria`, déjalo público, y crea el repo
4. Sube todos los archivos de esta carpeta a ese repositorio

---

## PASO 5 — Publicar en Vercel (gratis)

1. Ve a **https://vercel.com** y regístrate con tu cuenta de GitHub
2. Haz clic en **"Add New Project"**
3. Importa el repositorio `zapatos-enfermeria`
4. Vercel lo detecta automáticamente como proyecto Vite
5. Haz clic en **"Deploy"** y espera 1-2 minutos
6. ¡Listo! Te da un link como `zapatos-enfermeria.vercel.app`

---

## ¿Cómo usar?

| Quién | Link |
|---|---|
| Estudiantes | `https://zapatos-enfermeria.vercel.app` |
| Tú (admin) | `https://zapatos-enfermeria.vercel.app/?admin` |

Guarda bien el link de admin y tu contraseña 🔐
