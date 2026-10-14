# Arma la Guía de reportes (PDF) del Diagnóstico de Rentabilidad · Profit AI System.
# Las capturas van en la carpeta capturas/ con el nombre que indica cada recuadro
# (por ejemplo capturas/01-transacciones-menu.png). Si falta una, se dibuja el recuadro
# punteado con lo que debe mostrar.
import os, sys
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, KeepTogether, Image, Flowable)
from reportlab.lib.styles import ParagraphStyle

AQUI = os.path.dirname(os.path.abspath(__file__))
CAPTURAS = os.path.join(AQUI, 'capturas')
SALIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, 'Guia de reportes - Profit AI System.pdf')

pdfmetrics.registerFont(TTFont('Sans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('Sans-B', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Mono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

NAVY, PANEL, ORANGE, INK, MUTED, LINE, SOFT = (HexColor(c) for c in
    ('#0f1b2d', '#152338', '#ff9900', '#16202e', '#5b6577', '#d9dee6', '#fff4e5'))

S = {
    'eyebrow': ParagraphStyle('eyebrow', fontName='Mono', fontSize=8.5, textColor=ORANGE, leading=11, spaceAfter=4),
    'h1': ParagraphStyle('h1', fontName='Sans-B', fontSize=24, leading=29, textColor=INK, spaceAfter=8),
    'h2': ParagraphStyle('h2', fontName='Sans-B', fontSize=16, leading=20, textColor=INK, spaceBefore=6, spaceAfter=6),
    'p': ParagraphStyle('p', fontName='Sans', fontSize=10.5, leading=15.5, textColor=INK, spaceAfter=6),
    'muted': ParagraphStyle('muted', fontName='Sans', fontSize=9.5, leading=14, textColor=MUTED, spaceAfter=6),
    'step': ParagraphStyle('step', fontName='Sans', fontSize=10.5, leading=15, textColor=INK),
    'cap': ParagraphStyle('cap', fontName='Sans', fontSize=9, leading=12, textColor=MUTED, alignment=1),
    'box': ParagraphStyle('box', fontName='Sans', fontSize=10, leading=14.5, textColor=INK),
}

def P(t, s='p'): return Paragraph(t, S[s])

class Captura(Flowable):
    """Imagen de capturas/<archivo> o, si no existe, un recuadro punteado con lo que debe mostrar."""
    def __init__(self, archivo, describe, alto=70*mm):
        super().__init__(); self.archivo, self.describe, self.alto = archivo, describe, alto
        self.ruta = os.path.join(CAPTURAS, archivo)
    def wrap(self, aw, ah):
        self.aw = aw
        if os.path.exists(self.ruta):
            from reportlab.lib.utils import ImageReader
            iw, ih = ImageReader(self.ruta).getSize()
            self.w = min(aw, iw); self.h = self.w * ih / iw
            if self.h > 110*mm: self.h = 110*mm; self.w = self.h * iw / ih
            return aw, self.h + 6*mm
        return aw, self.alto + 6*mm
    def draw(self):
        c = self.canv
        if os.path.exists(self.ruta):
            x = (self.aw - self.w) / 2
            c.drawImage(self.ruta, x, 6*mm, self.w, self.h, preserveAspectRatio=True)
            c.setStrokeColor(LINE); c.rect(x, 6*mm, self.w, self.h)
            return
        c.setFillColor(SOFT); c.setStrokeColor(ORANGE); c.setDash(4, 3)
        c.roundRect(0, 6*mm, self.aw, self.alto, 8, fill=1, stroke=1); c.setDash()
        c.setFillColor(ORANGE); c.setFont('Mono', 9)
        c.drawCentredString(self.aw/2, 6*mm + self.alto/2 + 10, 'CAPTURA PENDIENTE · ' + self.archivo)
        c.setFillColor(MUTED); c.setFont('Sans', 9.5)
        c.drawCentredString(self.aw/2, 6*mm + self.alto/2 - 6, self.describe)

def pasos(lista):
    filas = [[Paragraph('<font name="Sans-B" color="#ff9900">%d</font>' % (i+1), S['step']), Paragraph(t, S['step'])]
             for i, t in enumerate(lista)]
    t = Table(filas, colWidths=[9*mm, None])
    t.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                           ('LEFTPADDING', (0,0), (-1,-1), 0)]))
    return t

def recuadro(texto, fondo=SOFT, borde=ORANGE):
    t = Table([[Paragraph(texto, S['box'])]], colWidths=[None])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), fondo), ('BOX', (0,0), (-1,-1), 1, borde),
                           ('LEFTPADDING', (0,0), (-1,-1), 10), ('RIGHTPADDING', (0,0), (-1,-1), 10),
                           ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8)]))
    return t

def encabezado(c, doc):
    w, h = letter
    c.saveState()
    c.setFillColor(NAVY); c.rect(0, h - 16*mm, w, 16*mm, fill=1, stroke=0)
    c.setFillColor(white); c.setFont('Sans-B', 10); c.drawString(18*mm, h - 10*mm, 'Profit AI System')
    c.setFillColor(ORANGE); c.setFont('Mono', 7.5); c.drawRightString(w - 18*mm, h - 10*mm, 'GUÍA DE REPORTES · DIAGNÓSTICO DE RENTABILIDAD')
    c.setFillColor(MUTED); c.setFont('Sans', 8)
    c.drawString(18*mm, 10*mm, '© 2026 Gerardo Villa · Summa Products')
    c.drawRightString(w - 18*mm, 10*mm, 'Página %d' % doc.page)
    c.restoreState()

def portada(c, doc):
    w, h = letter
    c.saveState()
    c.setFillColor(NAVY); c.rect(0, 0, w, h, fill=1, stroke=0)
    c.setFillColor(ORANGE); c.rect(18*mm, h - 60*mm, 14*mm, 2, fill=1, stroke=0)
    c.setFillColor(white); c.setFont('Sans-B', 13); c.drawString(18*mm, h - 40*mm, 'Profit AI System')
    c.setFillColor(HexColor('#b3bfd2')); c.setFont('Mono', 8); c.drawString(18*mm, h - 46*mm, 'BY GERARDO VILLA')
    c.setFillColor(ORANGE); c.setFont('Mono', 10); c.drawString(18*mm, h - 85*mm, 'DIAGNÓSTICO DE RENTABILIDAD AMAZON')
    c.setFillColor(white); c.setFont('Sans-B', 34)
    c.drawString(18*mm, h - 105*mm, 'Guía de reportes')
    c.setFillColor(ORANGE); c.drawString(18*mm, h - 120*mm, 'paso a paso.')
    c.setFillColor(HexColor('#b3bfd2')); c.setFont('Sans', 12)
    for i, l in enumerate(['Qué descargar de Seller Central, de dónde y cómo dejarlo',
                           'listo para correr tu diagnóstico con tus propios números.']):
        c.drawString(18*mm, h - 138*mm - i*16, l)
    c.setFillColor(HexColor('#b3bfd2')); c.setFont('Sans', 9)
    c.drawString(18*mm, 18*mm, 'Corre en tu propia cuenta de Claude. Tus archivos no salen de ahí.')
    c.restoreState()

def construir():
    doc = BaseDocTemplate(SALIDA, pagesize=letter, leftMargin=18*mm, rightMargin=18*mm, topMargin=24*mm, bottomMargin=18*mm,
                          title='Guía de reportes · Profit AI System', author='Gerardo Villa · Summa Products')
    marco = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='f')
    doc.addPageTemplates([PageTemplate(id='portada', frames=[marco], onPage=portada),
                          PageTemplate(id='normal', frames=[marco], onPage=encabezado)])
    from reportlab.platypus.doctemplate import NextPageTemplate
    st = [NextPageTemplate('normal'), PageBreak()]

    # ---- Qué vas a necesitar
    st += [P('ANTES DE EMPEZAR', 'eyebrow'), P('Qué vas a necesitar', 'h1'),
           P('Cuatro reportes de Seller Central, tu plantilla de costos y una cuenta de Claude que permita usar skills. '
             'Todo del <b>mismo mes calendario completo y cerrado</b>: del día 1 al último día del mes. Nunca el mes en curso.'),
           Spacer(1, 4)]
    tabla = [[Paragraph('<b>#</b>', S['step']), Paragraph('<b>Archivo</b>', S['step']), Paragraph('<b>Para qué sirve</b>', S['step'])]] + [
        [Paragraph(a, S['step']), Paragraph(b, S['step']), Paragraph(c, S['step'])] for a, b, c in [
        ('1', '<b>Transacciones</b> (CSV)', 'El más importante: ventas, comisión, FBA, devoluciones, impuestos y cargos.'),
        ('2', '<b>Business Report</b> por Child', 'Sesiones y unidades, para ver conversión.'),
        ('3', '<b>Bulk de publicidad</b> (.xlsx)', 'Gasto y ventas por anuncios, por SKU.'),
        ('4', '<b>Fee Preview</b>', 'Nombres, ASIN y SKU para unir todo.'),
        ('5', '<b>Plantilla de costos por Child</b>', 'Tu costo por pieza. Viene en tu kit.'),
        ('6', '<b>Cuenta de Claude</b>', 'Donde corre la skill del diagnóstico.')]]
    t = Table(tabla, colWidths=[9*mm, 58*mm, None])
    t.setStyle(TableStyle([('LINEBELOW', (0,0), (-1,-1), 0.5, LINE), ('VALIGN', (0,0), (-1,-1), 'TOP'),
                           ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                           ('LEFTPADDING', (0,0), (-1,-1), 0), ('LINEBELOW', (0,0), (-1,0), 1.2, ORANGE)]))
    st += [t, Spacer(1, 10),
           recuadro('<b>Importante:</b> antes de subir cualquier reporte, borra los datos de tus compradores. '
                    'Te decimos exactamente cómo en la sección 6.'), PageBreak()]

    # ---- 1 Transacciones
    st += [P('REPORTE 1 DE 4', 'eyebrow'), P('Transacciones', 'h1'),
           P('Es el único reporte que trae comisión, FBA e impuestos. Sin él, el diagnóstico no corre.'),
           pasos(['En Seller Central abre <b>Pagos › Reports Repository</b>.',
                  'En <b>Tipo de reporte</b> elige <b>Transacción</b>.',
                  'En <b>Rango de fechas</b> elige el mes cerrado completo (del 1 al último día).',
                  'Dale <b>Solicitar</b> y, cuando esté listo, <b>Descargar</b> (CSV).']),
           Captura('01-transacciones-menu.png', 'Pagos › Reports Repository, con el menú abierto'),
           Captura('02-transacciones-filtros.png', 'Tipo "Transacción" y el rango de fechas del mes cerrado'),
           recuadro('<b>Evita estos dos errores:</b> no uses el botón Download de Transaction View (corta a 600 filas) '
                    'ni el tipo Summary.'), PageBreak()]

    # ---- 2 Business Report
    st += [P('REPORTE 2 DE 4', 'eyebrow'), P('Business Report por Child', 'h1'),
           P('Sesiones y unidades por producto, para medir conversión.'),
           pasos(['Abre <b>Informes › Business Reports</b>.',
                  'En el menú de la izquierda elige <b>Ventas y tráfico por página de detalle (Child)</b>.',
                  'Pon el mismo mes cerrado y descarga el CSV.']),
           Captura('03-business-report.png', 'Business Reports › Ventas y tráfico por página de detalle (Child)'),
           PageBreak()]

    # ---- 3 Bulk
    st += [P('REPORTE 3 DE 4', 'eyebrow'), P('Bulk de publicidad', 'h1'),
           P('Gasto y ventas de tus anuncios por SKU. Con él salen tu ACOS y tu TACOS.'),
           pasos(['Entra a la consola de <b>Publicidad › Operaciones masivas</b> (Bulk operations).',
                  'Elige el mismo mes cerrado e incluye las campañas de Sponsored Products.',
                  'Genera el archivo y descarga el <b>.xlsx</b>.']),
           Captura('04-bulk-publicidad.png', 'Publicidad › Operaciones masivas, con fechas y opciones marcadas'),
           PageBreak()]

    # ---- 4 Fee Preview
    st += [P('REPORTE 4 DE 4', 'eyebrow'), P('Fee Preview', 'h1'),
           P('Trae nombres, ASIN y SKU para que el diagnóstico una todos los reportes.'),
           pasos(['Abre <b>Informes › Logística de Amazon</b> y busca <b>Vista previa de comisiones</b> (Fee Preview).',
                  'Solicita el reporte y descárgalo.']),
           Captura('05-fee-preview.png', 'Logística de Amazon › Vista previa de comisiones'),
           PageBreak()]

    # ---- 5 Costos
    st += [P('TU PLANTILLA', 'eyebrow'), P('Costos por Child', 'h1'),
           P('Abre <b>Plantilla de costos por Child.xlsx</b> de tu kit y llena solo las celdas color durazno.'),
           pasos(['<b>Una fila por Child</b>: cada talla, color o presentación es una fila. Basta el ASIN o el SKU.',
                  '<b>Costo unitario</b>: una pieza, sin IVA, en la moneda de tu tienda. El costo que tú confirmas.',
                  '<b>¿Ya incluye flete y aduana?</b> Si es Sí, se toman en cero. Si es No, llena flete y aduana por unidad.',
                  '<b>Otros costos</b>: empaque, etiquetado o preparación por pieza.',
                  'El <b>costo total por unidad</b> se calcula solo. Borra la fila gris de ejemplo.']),
           Captura('06-plantilla-costos.png', 'La plantilla llena con 2 o 3 productos de ejemplo'),
           PageBreak()]

    # ---- 6 Borrar compradores
    st += [P('PRIVACIDAD', 'eyebrow'), P('Borra los datos de tus compradores', 'h1'),
           P('El reporte de transacciones puede traer datos personales. El análisis no usa ninguno, así que bórralos antes de subirlo.'),
           pasos(['Abre el CSV de transacciones en Excel o Google Sheets.',
                  'Borra las columnas completas de: <b>nombre, dirección, ciudad, estado, código postal, correo y teléfono</b>.',
                  'Guarda el archivo otra vez como CSV.']),
           Captura('07-borrar-columnas.png', 'Columnas de compradores seleccionadas, con datos tapados'),
           recuadro('Cuida tus capturas también: si compartes una pantalla, que no se vean datos de clientes.'),
           PageBreak()]

    # ---- 7 Correr
    st += [P('ÚLTIMO PASO', 'eyebrow'), P('Corre tu diagnóstico', 'h1'),
           pasos(['En Claude, instala la skill del diagnóstico que viene en tu kit.',
                  'Abre un chat nuevo y sube los 4 reportes y tu plantilla de costos.',
                  'Pide: <i>"Corre mi diagnóstico de rentabilidad"</i>.',
                  'Revisa tus tres prioridades del mes.']),
           Captura('08-instalar-skill.png', 'Dónde se instala la skill en Claude'),
           Spacer(1, 4), P('Si te falta algo, igual corre', 'h2')]
    falta = [['Sin costos', 'Se entrega todo menos el retorno sobre costo, y se avisa qué te falta.'],
             ['Sin bulk de publicidad', 'Sin ACOS ni TACOS. Las decisiones de publicidad quedan fuera.'],
             ['Sin Business Report', 'Sin conversión ni cuadre de unidades.'],
             ['Sin Fee Preview', 'Los productos aparecen con su código en vez de nombre.'],
             ['Sin transacciones', '<b>Este sí detiene todo</b>: es el único con comisión, FBA e impuestos.']]
    t = Table([[Paragraph('<b>%s</b>' % a, S['step']), Paragraph(b, S['step'])] for a, b in falta], colWidths=[48*mm, None])
    t.setStyle(TableStyle([('LINEBELOW', (0,0), (-1,-1), 0.5, LINE), ('VALIGN', (0,0), (-1,-1), 'TOP'),
                           ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5), ('LEFTPADDING', (0,0), (-1,-1), 0)]))
    st += [t, Spacer(1, 10), recuadro('¿Dudas? Escríbenos por WhatsApp al <b>+52 222 328 8421</b> o a <b>cursos@summaproducts.com</b>.')]
    doc.build(st)

if __name__ == '__main__':
    construir(); print(SALIDA)
