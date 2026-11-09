#!/usr/bin/env bash
# Script de sincronización / despliegue en Apache Tomcat (Oleum)
set -e

TOMCAT_DIR="${TOMCAT_HOME:-/home/roberto/dev/tomcat}"
DESTINO="$TOMCAT_DIR/webapps/oleum"

if [ ! -d "$TOMCAT_DIR" ]; then
  echo "Error: no se encontró el directorio de Tomcat en $TOMCAT_DIR"
  exit 1
fi

echo "Sincronizando archivos del prototipo con $DESTINO..."
mkdir -p "$DESTINO"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete proyecto/ "$DESTINO/"
else
  cp -r proyecto/* "$DESTINO/"
fi

echo "Despliegue actualizado correctamente en Tomcat."
echo "Accede en: http://localhost:8080/oleum/index.html"
