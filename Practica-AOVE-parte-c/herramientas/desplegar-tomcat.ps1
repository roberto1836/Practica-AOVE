# Despliega Oleum en Tomcat (Windows).
#
#   powershell -ExecutionPolicy Bypass -File herramientas\desplegar-tomcat.ps1          copia y arranca
#   powershell -ExecutionPolicy Bypass -File herramientas\desplegar-tomcat.ps1 -Parar   detiene Tomcat
#
# Copia proyecto\ en webapps\oleum (el nombre de la carpeta es el context path: /oleum),
# arranca Tomcat si no está en marcha y abre la web en el navegador.
# Las rutas por defecto son las de este equipo; en otro, pásalas con -Tomcat y -Java.

param(
  [string]$Tomcat = 'C:\Users\nolog\tomcat\apache-tomcat-10.1.61',
  [string]$Java = 'C:\Program Files\Java\jdk-23',
  [switch]$Parar
)

$env:JAVA_HOME = $Java
$env:CATALINA_HOME = $Tomcat   # sin esto, startup.bat solo funciona lanzado desde su carpeta bin

if ($Parar) {
  & "$Tomcat\bin\shutdown.bat"
  return
}

# 1. Copia: /MIR deja webapps\oleum idéntica a proyecto\ (también borra lo que sobre).
$proyecto = Join-Path (Split-Path $PSScriptRoot -Parent) 'proyecto'
robocopy $proyecto "$Tomcat\webapps\oleum" /MIR /NJH /NJS /NFL /NDL | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy ha fallado (código $LASTEXITCODE)" }
Write-Host "Copiado proyecto\ en $Tomcat\webapps\oleum"

# 2. Arranque, solo si nadie escucha ya en el puerto 8080.
$enMarcha = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if (-not $enMarcha) {
  & "$Tomcat\bin\startup.bat"
  Write-Host 'Arrancando Tomcat...'
  Start-Sleep -Seconds 5
}

# 3. Tomcat detecta la carpeta nueva en unos segundos (autoDeploy).
Start-Process 'http://localhost:8080/oleum/'
