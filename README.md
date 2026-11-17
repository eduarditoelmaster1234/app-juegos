# GANAMOS — App Android

App web (React + Vite) empaquetada como aplicación nativa de Android con
[Capacitor](https://capacitorjs.com/). El APK compilado ya está instalado en el
celular conectado por USB.

## Datos del APK

- Nombre: **GANAMOS**
- Paquete: `com.ganamos.app`
- Archivo: `android/app/build/outputs/apk/debug/app-debug.apk`
- Firma: debug (sirve para uso personal, no para publicar en Play Store)

## Recompilar e instalar

Con el celular conectado por USB y la depuración USB activada:

```bash
npm run android
```

Ese comando hace todo:

1. Compila la web con Vite (`npm run build`).
2. Copia los archivos al proyecto Android (`npx cap sync android`).
3. Genera el APK de debug con Gradle.
4. Lo instala en el celular y abre la app.

Para compilar sin instalar, o para abrir el proyecto en Android Studio:

```bash
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug
npm run android:open
```

## Requisitos

- Node.js 20+
- JDK 21 o superior (Capacitor 8 lo exige). El script busca uno automáticamente
  en `~/.local/opt/jdk-21*` o en `~/.gradle/jdks/`.
- Android SDK con `ANDROID_HOME` configurado.
- `adb` para instalar en el celular.

## Estructura agregada

- `capacitor.config.ts`: configuración de Capacitor (nombre, ID y carpeta web).
- `android/`: proyecto Android generado.
- `scripts/build-android.sh`: script de compilación + instalación.
- `scripts/generate-icons.mjs`: regenera los iconos del launcher (`npm run icons`).

## Chat con Chatwoot

El chat de la app usa una bandeja **API** de Chatwoot como backend real de
mensajería. No se incrusta el widget, ni un iframe, ni pantallas de
administración: la UI sigue siendo la de GANAMOS y solo cambia la fuente de
datos.

- `src/lib/chatwoot/client.ts`: cliente REST de la API pública de la bandeja.
- `src/lib/chatwoot/socket.ts`: cliente mínimo de ActionCable (`/cable`), con
  reconexión y detección de conexiones vencidas.
- `src/lib/chatwoot/messages.ts`: normalización, orden y deduplicación.
- `src/hooks/useChatwootChat.ts`: contacto, conversación, historial, envío,
  tiempo real y recuperación ante errores.
- `src/components/ChatScreen.tsx`: UI existente conectada al hook.

### Variables de entorno

Solo se usan datos públicos de conexión. **No** agregues tokens de
administrador, secretos de webhook ni claves HMAC en variables `VITE_*`: todo
lo que empieza con `VITE_` termina en el bundle del navegador.

```bash
VITE_CHATWOOT_BASE_URL="https://chatwoot.example.com"
VITE_CHATWOOT_INBOX_IDENTIFIER="identificador-publico-de-la-bandeja"
```

Para desarrollo local, creá `.env.local` (está ignorado por git):

```bash
VITE_CHATWOOT_BASE_URL="http://chatwoot.local"
VITE_CHATWOOT_INBOX_IDENTIFIER="tu-inbox-identifier"
```

`VITE_CHATWOOT_BASE_URL` es la raíz de Chatwoot, sin `/api` ni `/public`. Se
admiten `http://` y `https://`; con `https://` el WebSocket usa `wss://`.

### Cómo funciona

1. Se genera un identificador aleatorio por usuario y se guarda en
   `localStorage` (`ganamos.chatwoot.identities.v1`), junto con el `source_id`,
   el `pubsub_token` y el id del contacto. Nunca se usa el nombre de usuario
   como identificador único. Si el navegador bloquea el almacenamiento, se usa
   un respaldo en memoria durante la sesión.
2. Al abrir el chat se recupera el contacto por `source_id`. Si ya no existe,
   se recrea con el mismo identificador. El nombre visible es
   `nombre + apellido`; el usuario de GANAMOS se envía como atributo
   personalizado (`ganamos_username`).
3. Se reutiliza la conversación abierta más reciente. Solo se crea una nueva
   cuando todas están resueltas. Un lock en memoria evita conversaciones
   duplicadas si la pantalla se vuelve a montar.
4. El historial se carga por REST y el tiempo real llega por
   `RoomChannel` (`/cable` + `pubsub_token`). Los mensajes propios se
   correlacionan con `echo_id`, se deduplican por id de servidor y se
   reconcilian con el historial al reconectar o volver a la pestaña.
5. `Cargar fichas` y `Retirar fichas` envían un mensaje real de contexto una
   sola vez por conversación (marcador de 2 minutos + control del último
   mensaje). No se simula una respuesta de agente.
6. Al salir del chat se cierra el WebSocket y se cancelan las peticiones en
   curso. Si se corta la red, el socket reintenta con backoff y el historial se
   vuelve a sincronizar al recuperar la conexión.

No se habilitó ni se modificó la validación de identidad de Chatwoot.

### Probar en local

1. Tené Chatwoot accesible (por ejemplo `http://chatwoot.local`) y una bandeja
   de tipo **API** con su `inbox_identifier`.
2. Completá `.env.local` con esa URL y ese identificador.
3. Ejecutá `npm run dev` y abrí `http://localhost:3000`.
4. Entrá a la pestaña **Chat**. La app debe crear (o recuperar) el contacto y la
   conversación, mostrar el historial y el estado **En línea**.
5. Enviá un mensaje y verificalo en la bandeja de Chatwoot. Respondé desde
   Chatwoot para comprobar el tiempo real.
6. Probá **Cargar fichas** y **Retirar fichas** desde Inicio: cada uno debe
   generar un solo mensaje de contexto, incluso al entrar y salir del chat.
7. Recargá la app: el historial debe mantenerse y no debe haber mensajes
   duplicados.

Para probar sin agente conectado podés usar dos pestañas con usuarios
distintos, pero cada pestaña representa un contacto diferente. La respuesta de
un agente real requiere iniciar sesión en la interfaz de Chatwoot.

### PWA

La app es instalable como PWA en la build de producción:

```bash
npm run build
npm run preview
```

- `/` es la **landing pública de instalación** (`index.html` + `src/landing.ts` + `src/landing.css`). Su único objetivo es que el cliente instale la app.
- `/app.html` es la aplicación React y el `start_url` de la PWA.
- `src/components/PwaAccessGate.tsx` bloquea la aplicación cuando se abre desde un navegador normal y muestra la pantalla de instalación.
- La detección de "app instalada" usa `display-mode: standalone` (Android y escritorio) y `navigator.standalone` (iOS). Nunca `localStorage`.
- En iPhone, la instalación se hace desde Safari con Compartir → Añadir a pantalla de inicio; no existe una API para forzarla desde un botón.

El manifest está en `public/manifest.webmanifest`, los iconos en
`public/icons/` y el service worker en `public/sw.js`. El service worker se
registra solo en producción y nunca cachea las llamadas a Chatwoot (otro
origen): la mensajería y el WebSocket siempre van a la red. El shell de la app
queda disponible offline, pero el chat necesita conexión.

Para probar la instalación en local hay que usar `npm run build` +
`npm run preview` (en `npm run dev` el service worker no se registra y Chrome
no ofrece instalar).


## Notas

- La app no tiene backend propio: el chat usa Chatwoot como servicio externo.
- En la app nativa se oculta la barra de estado simulada (hora, wifi y batería)
  para no duplicar la barra real del celular.
- El icono del launcher y el splash screen usan el emblema de la corona de
  GANAMOS con el degradado violeta de la marca.
- La pantalla de juego carga el sitio en un `iframe`. Si el sitio bloquea la
  incrustación por cabeceras de seguridad, usá el botón **Abrir directo**.
- Para publicar en Play Store hace falta generar un APK/AAB firmado con tu
  propio keystore.

## Limitaciones conocidas del chat

- La bandeja API no valida identidad. Cualquiera que conozca el
  `inbox_identifier` público puede crear contactos y mensajes en esa bandeja.
  Es el modelo de la API pública de Chatwoot; para producción conviene aplicar
  límites de uso y monitoreo del lado de Chatwoot.
- La app nativa de Android bloquea tráfico HTTP en texto plano. Para que el APK
  use Chatwoot hace falta una URL `https://` (el servidor local
  `http://chatwoot.local` solo sirve para probar en navegador/PWA). No se
  debilitó la política de seguridad de Android.
- Solo se implementaron mensajes de texto y emojis. No hay adjuntos, audios ni
  notificaciones push.
- El contador de no leídos del inicio no se sincroniza con Chatwoot; se limpia
  al abrir el chat.
- Si un agente resuelve la conversación, la próxima visita crea una nueva y el
  mensaje de contexto de `Cargar/Retirar` puede volver a enviarse.
