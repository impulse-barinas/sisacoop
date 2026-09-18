# Sistema de Ahorro Cooperativo — despliegue en Hostinger

## Contenido del ZIP

El paquete contiene el build de producción en `dist/`, el servidor Node, el cliente compilado, las migraciones Drizzle y los archivos de instalación. No contiene `node_modules`, archivos `.env`, contraseñas, claves SSH ni registros locales.

## Subida manual

1. En Hostinger, crea o abre la aplicación Node.js asociada al dominio `sisacoop.impulsabarinas.com`.
2. Usa como **Application root** la carpeta `sisacoop`.
3. Sube `sistema-ahorro-cooperativo-sisacoop.zip` dentro de esa carpeta y extráelo allí. El archivo `package.json` debe quedar directamente en `sisacoop/package.json`, no dentro de una subcarpeta adicional.
4. En la configuración de Node selecciona Node.js 20 o superior y el modo `production`.
5. Ejecuta `npm install --omit=dev` desde la carpeta `sisacoop`.
6. Crea las variables de entorno usando `.env.example` como referencia. No subas el archivo `.env.example` con valores reales.
7. Configura el **Startup file** como `dist/index.js` y el puerto asignado por Hostinger mediante la variable `PORT`.
8. Reinicia la aplicación y verifica `https://sisacoop.impulsabarinas.com/`.

## Variables requeridas

Como mínimo, configura `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`, `OWNER_NAME`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL` y `VITE_FRONTEND_FORGE_API_KEY`. Usa los valores del entorno donde ya está funcionando la aplicación; no inventes valores para las credenciales de base de datos, OAuth o almacenamiento.

## Base de datos

La base de datos de producción debe ser MySQL/TiDB compatible. Antes de usar la aplicación, aplica las migraciones de `drizzle/migrations/` sobre la base de datos de Hostinger. Haz un respaldo antes de migrar y confirma que el usuario de base de datos tenga permisos para crear y alterar tablas.

## Imágenes de comprobantes

La aplicación guarda las referencias de almacenamiento de los comprobantes, no los archivos binarios en la base de datos. Configura el almacenamiento compatible con el entorno de producción antes de aceptar comprobantes reales.

## Advertencias

No incluyas secretos dentro del ZIP ni en archivos del repositorio. Para esta aplicación full-stack no es suficiente subir solamente `dist/public`; también debe ejecutarse el servidor Node y existir la base de datos.
