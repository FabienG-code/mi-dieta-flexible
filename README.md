# Mi dieta flexible — versión desplegada

App de seguimiento del sistema de bloques de "Quema tu dieta", accesible
desde cualquier dispositivo (no depende del navegador de Claude).

## Paso obligatorio tras el despliegue: conectar una base de datos

Sin esto, la app carga pero ningún dato se guarda (verás un error al
intentar crear tu perfil).

1. Ve al proyecto en vercel.com → pestaña **Storage**.
2. **Marketplace Database Integrations** → busca **Upstash** → **Redis** →
   plan gratuito → **Connect to project**.
3. Vercel añade automáticamente las variables de entorno necesarias.
4. Vuelve a desplegar el proyecto (Deployments → ⋯ → Redeploy) para que la
   función de API las recoja.

A partir de ahí, todos los que abran la URL del proyecto comparten los
mismos datos (perfil "yo", perfil "pareja", comidas, medidas) — ideal para
que dos personas registren su dieta desde sus propios móviles.

## Nota de seguridad

No hay contraseña ni login: cualquiera con el enlace puede ver y editar los
datos. Para un uso de pareja esto suele bastar, pero si el enlace se
comparte más ampliamente, se puede añadir protección por contraseña desde
Vercel (Project → Settings → Deployment Protection).
