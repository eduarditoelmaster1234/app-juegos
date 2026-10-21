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

## Notas

- La app es 100% cliente: no necesita servidor para funcionar.
- En la app nativa se oculta la barra de estado simulada (hora, wifi y batería)
  para no duplicar la barra real del celular.
- El icono del launcher y el splash screen usan el emblema de la corona de
  GANAMOS con el degradado violeta de la marca.
- La pantalla de juego carga el sitio en un `iframe`. Si el sitio bloquea la
  incrustación por cabeceras de seguridad, usá el botón **Abrir directo**.
- Para publicar en Play Store hace falta generar un APK/AAB firmado con tu
  propio keystore.
