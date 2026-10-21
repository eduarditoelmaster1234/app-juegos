#!/usr/bin/env bash
# Compila la app web, la empaqueta como APK de Android y la instala en el
# dispositivo conectado por USB (si hay uno).
set -euo pipefail

cd "$(dirname "$0")/.."

# Capacitor 8 necesita JDK 21 o superior para compilar.
java_major() {
  local home="$1"
  [ -x "$home/bin/javac" ] || return 1
  "$home/bin/javac" -version 2>&1 | sed -E 's/javac ([0-9]+).*/\1/'
}

if [ "$(java_major "${JAVA_HOME:-}")" -lt 21 ] 2>/dev/null; then
  for candidate in "$HOME/.local/opt"/jdk-2[1-9]* "$HOME"/.gradle/jdks/*; do
    major="$(java_major "$candidate")" || continue
    if [ "$major" -ge 21 ]; then
      export JAVA_HOME="$candidate"
      break
    fi
  done
fi

if [ -n "${JAVA_HOME:-}" ]; then
  export PATH="$JAVA_HOME/bin:$PATH"
fi

if [ "$(java_major "${JAVA_HOME:-}")" -lt 21 ] 2>/dev/null; then
  echo "Error: se necesita JDK 21 o superior para compilar la app Android." >&2
  echo "Instalá uno y volvé a ejecutar el script." >&2
  exit 1
fi

echo "==> Compilando la app web (Vite)..."
npm run build

echo "==> Copiando los archivos al proyecto Android (Capacitor)..."
npx cap sync android

echo "==> Generando el APK de debug..."
(cd android && ./gradlew assembleDebug)

APK="android/app/build/outputs/apk/debug/app-debug.apk"
echo "==> APK listo: $APK"

if command -v adb >/dev/null 2>&1 && adb devices | grep -qE "device$"; then
  echo "==> Instalando en el celular..."
  adb install -r "$APK"
  echo "==> Abriendo GANAMOS..."
  adb shell am start -n com.ganamos.app/.MainActivity
else
  echo "==> No hay ningún celular conectado por USB. Instalá el APK manualmente."
fi
