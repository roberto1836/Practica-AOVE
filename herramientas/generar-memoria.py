"""Genera la memoria de la Parte 1 en PDF a partir de los Markdown del repositorio.

Uso, desde la raíz del repositorio:
    python3 herramientas/generar-memoria.py

Necesita Python con `markdown`, `pypdf`, `pdfplumber`, `Pillow` y `playwright` (con Chromium).
Fuentes: memoria/memoria.md (cuerpo común) y, como anexos, ACUERDOS.md y memoria/analisis/*.md.
Salida: memoria/memoria-parte-1.pdf
"""
import html
import re
import shutil
import sys
import unicodedata
import tempfile
from pathlib import Path

import markdown
import pdfplumber
from PIL import Image
from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter

RAIZ = Path(__file__).resolve().parent.parent if len(sys.argv) < 2 else Path(sys.argv[1]).resolve()
MEMORIA = RAIZ / 'memoria'
CAPTURAS = MEMORIA / 'evidencias' / 'capturas'
SALIDA = MEMORIA / 'memoria-parte-1.pdf'

INTEGRANTES = [
    ('A', 'Noe López García'),
    ('B', 'Roberto Riofrío Ortega'),
    ('C', '<span class="pendiente">Nombre de C</span>'),
]
FECHA = '9 de noviembre de 2026'

# Capturas: (fichero, altura máxima en px antes de recortar, pie)
GALERIA = [
    ('catalogo-movil', 760, 'Catálogo en móvil, con los filtros plegados.'),
    ('ficha-escritorio', 900, 'Ficha de producto en escritorio.'),
    ('ficha-movil', 760, 'Ficha de producto en móvil.'),
    ('ficha-error-cantidad', 900, 'Error de cantidad junto al campo.'),
    ('ficha-agotado', 900, 'Producto agotado: compra desactivada.'),
    ('ficha-no-encontrado', 700, 'Producto no encontrado (el 404 de la Parte 2).'),
    ('catalogo-sin-resultados', 900, 'Búsqueda sin resultados.'),
    ('catalogo-error-precio', 900, 'Error en el filtro de precio.'),
    ('carrito-movil', 760, 'Carrito en móvil.'),
    ('mis-pedidos-escritorio', 800, 'Historial de pedidos.'),
    ('pedido-detalle-escritorio', 900, 'Detalle de un pedido con sus precios congelados.'),
    ('perfil-escritorio', 800, 'Perfil del cliente.'),
]
# Capturas que usa el cuerpo de la memoria (img/<nombre>.png)
CUERPO = {
    'inicio-escritorio': 860, 'inicio-movil': 760, 'catalogo-filtros-aplicados': 900,
    'carrito-escritorio': 800, 'confirmacion-escritorio': 800, 'foco-teclado-tarjeta': 900,
}

ANEXOS = [
    ('A', 'Acuerdos del grupo', RAIZ / 'ACUERDOS.md'),
    ('B', 'Historias de usuario del visitante', MEMORIA / 'analisis' / 'historias-visitante.md'),
    ('C', 'Historias de usuario del cliente', MEMORIA / 'analisis' / 'historias-cliente.md'),
    ('D', 'Historias de usuario del administrador', None),
    ('E', 'Pruebas y calidad de la Parte A', MEMORIA / 'analisis' / 'pruebas-parte-a.md'),
    ('F', 'Pruebas y calidad de la Parte B', MEMORIA / 'analisis' / 'pruebas-parte-b.md'),
]

EXTENSIONES = ['tables', 'fenced_code', 'md_in_html', 'attr_list', 'sane_lists']


def a_html(texto):
    texto = texto.replace('<div class="pendiente">', '<div class="pendiente" markdown="1">')
    resultado = markdown.markdown(texto, extensions=EXTENSIONES)
    # Los identificadores (VIS-01, CLI-12, P-B03…) no se parten al final de la línea.
    return re.sub(r'(>[^<]*)', lambda m: re.sub(r'\b((?:VIS|CLI|ADM|P)-[A-Z]?\d{2,3})\b',
                                                r'<span class="id">\1</span>', m.group(1)), resultado)


def preparar_anexo(letra, ruta):
    texto = ruta.read_text(encoding='utf-8')
    texto = re.sub(r'\A# .*\n', '', texto)                 # el título lo pone el anexo
    texto = re.sub(r'\A(\s*>.*\n)+', '', texto.lstrip('\n'))  # avisos de trabajo al principio
    if ruta.name == 'ACUERDOS.md':                          # el plan y lo pendiente ya no aplican
        texto = re.split(r'\n## 11\. ', texto)[0]
    if ruta.name == 'historias-visitante.md':
        texto = re.sub(
            r'## CLI-01 .*?(?=## Trazabilidad)',
            'La historia CLI-01 (elegir cuántas unidades se añaden al carrito), que se resuelve en la ficha, '
            'se detalla en el anexo C junto al resto de historias del cliente.\n\n',
            texto, flags=re.S)
    return texto


def recortar(nombre, alto, destino):
    imagen = Image.open(CAPTURAS / f'{nombre}.png').convert('RGB')
    imagen = imagen.crop((0, 0, imagen.width, min(alto, imagen.height)))
    imagen.save(destino / f'{nombre}.png', optimize=True)


def encabezados(html_cuerpo, html_anexos):
    """Entradas del índice: h1 y h2 del cuerpo, y solo el h1 de cada anexo."""
    entradas = []
    for nivel, texto in re.findall(r'<h([12])[^>]*>(.*?)</h\1>', html_cuerpo):
        entradas.append((int(nivel), re.sub(r'<[^>]+>', '', texto)))
    for texto in re.findall(r'<h1[^>]*>(.*?)</h1>', html_anexos):
        entradas.append((1, re.sub(r'<[^>]+>', '', texto)))
    return entradas


def paginas_de(pdf, entradas):
    """Busca cada encabezado, en orden, en el texto del PDF del contenido."""
    with pdfplumber.open(pdf) as documento:
        paginas = [re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', p.extract_text() or '')) for p in documento.pages]
    resultado, desde = [], 0
    for _, texto in entradas:
        buscado = re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', html.unescape(texto))).strip()
        for i in range(desde, len(paginas)):
            if buscado in paginas[i]:
                resultado.append(i + 1)
                desde = i
                break
        else:
            raise SystemExit(f'No encuentro el encabezado en el PDF: {buscado}')
    return resultado


def documento(cuerpo, clase=''):
    return (f'<!doctype html><html lang="es"><head><meta charset="utf-8">'
            f'<link rel="stylesheet" href="estilos.css"></head>'
            f'<body class="{clase}">{cuerpo}</body></html>')


def main():
    trabajo = Path(tempfile.mkdtemp(prefix='memoria-'))
    (trabajo / 'img').mkdir()
    for nombre, alto in CUERPO.items():
        recortar(nombre, alto, trabajo / 'img')
    for nombre, alto, _ in GALERIA:
        recortar(nombre, alto, trabajo / 'img')
    shutil.copy(MEMORIA / 'analisis' / 'mapa-navegacion.svg', trabajo / 'img')
    shutil.copy(RAIZ / 'proyecto' / 'assets' / 'img' / 'favicon.svg', trabajo / 'img')
    shutil.copy(Path(__file__).with_name('memoria.css'), trabajo / 'estilos.css')

    html_cuerpo = a_html((MEMORIA / 'memoria.md').read_text(encoding='utf-8'))

    partes = []
    for letra, titulo, ruta in ANEXOS:
        cabecera = f'<h1 class="anexo">Anexo {letra}. {titulo}</h1>'
        if ruta is None:
            partes.append(cabecera + '<div class="pendiente"><p>Pendiente: historias del administrador '
                          '(y del registro y el inicio de sesión) de la Parte C.</p></div>')
        else:
            partes.append(cabecera + f'<div class="anexo-cuerpo">{a_html(preparar_anexo(letra, ruta))}</div>')
    galeria = ''.join(
        f'<figure><img src="img/{n}.png" alt="{html.escape(pie)}"><figcaption>{pie}</figcaption></figure>'
        for n, _, pie in GALERIA)
    partes.append('<h1 class="anexo">Anexo G. Capturas</h1>'
                  '<p>Selección de estados de las páginas. Las capturas completas están en '
                  '<code>memoria/evidencias/capturas/</code> y los informes de Lighthouse en '
                  '<code>memoria/evidencias/lighthouse/</code>.</p>'
                  f'<div class="galeria">{galeria}</div>')
    html_anexos = ''.join(partes)

    filas = ''.join(f'<tr><th>{l}</th><td>{n}</td></tr>' for l, n in INTEGRANTES)
    portada = f'''
      <div class="portada">
        <div class="portada__marca"><img src="img/favicon.svg" alt=""><span>Oleum</span></div>
        <p class="portada__antetitulo">Tienda online de aceite de oliva virgen extra</p>
        <h1 class="portada__titulo">Memoria de la Parte 1</h1>
        <p class="portada__subtitulo">Experiencia de usuario y prototipo de la interfaz<br>HTML5, CSS3 y JavaScript desplegados en Apache Tomcat</p>
        <div class="portada__datos">
          <p><strong>Arquitectura y Diseño de Sistemas Web y C/S</strong><br>Universidad de Alcalá · Curso 2026-27<br>Profesor: Roberto Barchino</p>
          <table class="portada__grupo"><caption>Integrantes</caption>{filas}</table>
          <p class="portada__fecha">{FECHA}</p>
        </div>
      </div>'''

    (trabajo / 'portada.html').write_text(documento(portada, 'pagina-portada'), encoding='utf-8')
    (trabajo / 'contenido.html').write_text(documento(html_cuerpo + html_anexos), encoding='utf-8')

    pie = ('<div style="width:100%;font-family:Inter,sans-serif;font-size:7.5pt;color:#5a604f;'
           'padding:0 20mm;display:flex;justify-content:space-between;">'
           '<span>Oleum · Memoria de la Parte 1</span><span class="pageNumber"></span></div>')
    margenes = {'top': '18mm', 'bottom': '20mm', 'left': '20mm', 'right': '20mm'}

    with sync_playwright() as p:
        navegador = p.chromium.launch()
        pagina = navegador.new_page()

        def imprimir(nombre, con_pie):
            pagina.goto((trabajo / f'{nombre}.html').as_uri())
            pagina.wait_for_load_state('networkidle')
            pagina.pdf(path=str(trabajo / f'{nombre}.pdf'), format='A4', print_background=True,
                       margin=margenes if con_pie else {'top': '0', 'bottom': '0', 'left': '0', 'right': '0'},
                       display_header_footer=con_pie, header_template='<span></span>',
                       footer_template=pie if con_pie else '<span></span>')

        imprimir('portada', False)
        imprimir('contenido', True)

        entradas = encabezados(html_cuerpo, html_anexos)
        numeros = paginas_de(trabajo / 'contenido.pdf', entradas)
        lineas = ''.join(
            f'<li class="indice__nivel{nivel}"><span class="indice__texto">{texto}</span>'
            f'<span class="indice__relleno"></span><span class="indice__pagina">{numero}</span></li>'
            for (nivel, texto), numero in zip(entradas, numeros))
        (trabajo / 'indice.html').write_text(
            documento(f'<h1 class="indice__titulo">Índice</h1><ol class="indice">{lineas}</ol>'),
            encoding='utf-8')
        pagina.goto((trabajo / 'indice.html').as_uri())
        pagina.pdf(path=str(trabajo / 'indice.pdf'), format='A4', print_background=True, margin=margenes)
        navegador.close()

    final = PdfWriter()
    for nombre in ('portada', 'indice', 'contenido'):
        for hoja in PdfReader(trabajo / f'{nombre}.pdf').pages:
            final.add_page(hoja)
    final.add_metadata({'/Title': 'Oleum · Memoria de la Parte 1',
                        '/Author': ', '.join(re.sub(r'<[^>]+>', '', n) for _, n in INTEGRANTES),
                        '/Subject': 'Arquitectura y Diseño de Sistemas Web y C/S · UAH 2026-27'})
    with open(SALIDA, 'wb') as fichero:
        final.write(fichero)
    print(f'{SALIDA} · {len(final.pages)} páginas')
    shutil.rmtree(trabajo)


if __name__ == '__main__':
    main()
