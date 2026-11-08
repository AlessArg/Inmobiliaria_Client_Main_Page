# Proyecto Final Ingenieria en Sistemas - Client Main Page

Portal público con React + TypeScript + Vite. Permite explorar como invitado,
crear cuenta con correo y contraseña o entrar con Google mediante Firebase.
La sesión se restaura con Firebase Authentication; los perfiles se guardan en
Firestore a través del backend.

## Scripts

- npm run dev: inicia servidor de desarrollo.
- npm run start:dev: alias explicito para desarrollo.
- npm run build: compila TypeScript y genera la build de produccion.
- npm run preview: sirve localmente la build de produccion.
- npm run lint: ejecuta ESLint.
- npm run test: ejecuta pruebas con Vitest.

## Variables de entorno

El proyecto soporta variables con prefijo VITE_ y BACKEND_URL_. El catálogo público no requiere credenciales en el navegador.

Ejemplos:

- BACKEND_URL_BASE
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_APP_ID (opcional para Authentication)

Configuracion rapida:

1. Copia .env.example a .env.
2. Completa valores segun tu backend.

Ejemplo:

```dotenv
BACKEND_URL_BASE=http://localhost:3000
VITE_FIREBASE_API_KEY=API_KEY_DE_LA_APP_WEB
VITE_FIREBASE_PROJECT_ID=ID_DEL_PROYECTO
VITE_FIREBASE_AUTH_DOMAIN=ID_DEL_PROYECTO.firebaseapp.com
```

Solo incluye configuración pública de la app web. La clave privada y el correo
de la cuenta de servicio pertenecen exclusivamente al `.env` del backend.

En Firebase Console habilita **Authentication → Sign-in method → Google** y
**Email/Password**, agrega `localhost` en dominios autorizados y crea Firestore
`(default)`. El backend debe usar credenciales Admin del mismo proyecto. Su
`MAIN_PAGE_URL` debe coincidir con el origen del portal (`http://localhost:5174`).
Reinicia Vite y el backend después de cambiar sus archivos `.env`.

## Perfil, consultas y procesos

- Mi perfil permite guardar nombre y teléfono. El correo proviene de la cuenta Firebase.
- El formulario de una propiedad se completa con los datos del perfil; Google
  normalmente no entrega un teléfono, por lo que el cliente puede agregarlo en su perfil.
- Las consultas autenticadas usan `POST /portal/leads` con un Firebase ID token.
  El backend verifica el token, fija el correo y asocia el lead al UID en una
  transacción MySQL. Se consultan mediante `GET /portal/processes`.
- Los procesos muestran la fase actual del CRM y la propiedad consultada.
- Los invitados conservan `POST /leads/contact-center`. Sus consultas históricas
  no se vinculan automáticamente al crear una cuenta con el mismo correo.
- `PATCH /portal/profile` guarda el nombre y teléfono en Firestore. Ninguna ruta
  del portal requiere una sesión de empleado ni claves privadas en el navegador.
- El backend crea `portal_customer_leads` al usar por primera vez procesos o
  consultas autenticadas. Su usuario MySQL necesita permiso de creación de esa tabla.
- Si falta la configuración Firebase, el acceso como invitado sigue disponible.

La primera entrada con Google requiere selección de cuenta. El registro con
correo crea la cuenta en Authentication y sincroniza su perfil. Si la cuenta ya
se creó pero la sincronización falla, usa **Reintentar cargar mi sesión** o
inicia sesión con la cuenta existente; no necesitas volver a registrarla.

## Estructura

src/
  app/                # entrypoint de app y orquestacion principal
  features/           # modulos funcionales (home, layout, etc.)
  shared/             # recursos transversales (config, styles, ui)
  services/           # infraestructura y adaptadores (http, api)
  types/              # contratos globales y tipos de entorno

Mas detalle en ARCHITECTURE.md.
