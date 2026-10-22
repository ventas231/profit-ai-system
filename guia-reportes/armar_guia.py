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
    def __init__(self, archivo, describe, alto=70*mm, maxh=110*mm):
        super().__init__(); self.archivo, self.describe, self.alto, self.maxh = archivo, describe, alto, maxh
        self.ruta = os.path.join(CAPTURAS, archivo)
    def wrap(self, aw, ah):
        self.aw = aw
        if os.path.exists(self.ruta):
            from reportlab.lib.utils import ImageReader
            iw, ih = ImageReader(self.ruta).getSize()
            self.w = min(aw, iw); self.h = self.w * ih / iw
            if self.h > self.maxh: self.h = self.maxh; self.w = self.h * iw / ih
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
    c.drawString(18*mm, 10*mm, '© 2026 Profit AI System · Gerardo Villa')
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
                          title='Guía de reportes · Profit AI System', author='Profit AI System · Gerardo Villa')
    marco = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='f')
    doc.addPageTemplates([PageTemplate(id='portada', frames=[marco], onPage=portada),
                          PageTemplate(id='normal', frames=[marco], onPage=encabezado)])
    from reportlab.platypus.doctemplate import NextPageTemplate
    st = [NextPageTemplate('normal'), PageBreak()]

    # ---- Qué vas a necesitar
    st += [P('ANTES DE EMPEZAR', 'eyebrow'), P('Qué vas a necesitar', 'h1'),
           P('El diagnóstico es para tiendas de <b>Amazon México</b>. '
             'Cuatro reportes de Seller Central del <b>mismo mes calendario completo y cerrado</b> (del día 1 al último día; nunca el mes en curso), '
             'las <b>transacciones del mes anterior</b>, tu plantilla de costos y una cuenta de Claude que permita usar skills.'),
           recuadro('<b>Antes de empezar:</b> te recomendamos tener Seller Central <b>en inglés</b> (arriba a la derecha, '
                    'el selector de idioma: <b>EN</b>), porque así se llaman los menús en esta guía. Revisa también, arriba a la '
                    'izquierda, que estés en <b>tu tienda</b> y en el país <b>Mexico</b>.'),
           Spacer(1, 8)]
    tabla = [[Paragraph('<b>#</b>', S['step']), Paragraph('<b>Archivo</b>', S['step']), Paragraph('<b>Para qué sirve</b>', S['step'])]] + [
        [Paragraph(a, S['step']), Paragraph(b, S['step']), Paragraph(c, S['step'])] for a, b, c in [
        ('1', '<b>Transaction</b> (Transacciones) · CSV', 'El más importante: ventas, comisión, FBA, devoluciones, impuestos y cargos.'),
        ('1B', '<b>Transaction del mes anterior</b> · CSV', 'El mismo reporte 1, pero del mes anterior. Sirve para confirmar el ISR que Amazon cobra en el mes.'),
        ('2', '<b>Business Report</b> · By Child Item', 'Sesiones y unidades, para ver conversión.'),
        ('3', '<b>Bulk Operations</b> (publicidad) · .xlsx', 'Gasto y ventas por anuncios, por SKU.'),
        ('4', '<b>Fee Preview</b>', 'Nombres, ASIN y SKU para unir todo.'),
        ('5', '<b>Plantilla de costos</b> (Excel)<br/><font size="8" color="#5b6577">PAS_Plantilla_Costos_por_Child.xlsx</font>', 'Tu costo por pieza. Es el Excel que viene en tu kit.'),
        ('6', '<b>Cuenta de Claude</b>', 'Donde corre la skill del diagnóstico.')]]
    t = Table(tabla, colWidths=[9*mm, 66*mm, None])
    t.setStyle(TableStyle([('LINEBELOW', (0,0), (-1,-1), 0.5, LINE), ('VALIGN', (0,0), (-1,-1), 'TOP'),
                           ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                           ('LEFTPADDING', (0,0), (-1,-1), 0), ('LINEBELOW', (0,0), (-1,0), 1.2, ORANGE)]))
    st += [t, PageBreak()]

    # ---- 1 Transacciones
    st += [P('REPORTE 1 DE 4', 'eyebrow'), P('Transaction <font color="#5b6577" size="14">(Transacciones)</font>', 'h1'),
           P('Es el único reporte que trae comisión, FBA e impuestos. Sin él, el diagnóstico no corre.'),
           P('<b>A · Llega a la pantalla</b>', 'p'),
           pasos(['Abre el menú (☰) y entra a <b>Payments</b> (Pagos).',
                  'Elige <b>Reports Repository</b> (Repositorio de reportes).']),
           Captura('01-transacciones-menu.png', 'Menu › Payments › Reports Repository', maxh=85*mm),
           KeepTogether([P('<b>B · Pide y descarga el reporte</b>', 'p'),
           pasos(['En <b>Report Type</b> (Tipo de reporte) elige <b>Transaction</b>. Deja <b>Account Type</b> en <b>Standard Orders</b>.',
                  'En <b>Reporting Date Range</b> marca <b>Month</b> y elige el <b>mes</b> y el <b>año</b> del mes cerrado.',
                  'Dale <b>Request Report</b> (Solicitar reporte).',
                  'Cuando el <b>Status</b> diga <b>Ready</b>, dale <b>Download CSV</b>. Si dice In Progress, espera y dale Refresh.']),
           Captura('02-transacciones-filtros.png', 'Report Type: Transaction · Month · Request Report · Download CSV')]),
           recuadro('<b>Descárgalo dos veces:</b> una con el <b>mes cerrado</b> que vas a analizar y otra con el <b>mes anterior</b> '
                    '(por ejemplo, septiembre y agosto). El del mes anterior sirve para confirmar el ISR que Amazon cobra en el mes.'),
           PageBreak()]

    # ---- 2 Business Report
    st += [P('REPORTE 2 DE 4', 'eyebrow'), P('Business Report <font color="#5b6577" size="14">· By Child Item</font>', 'h1'),
           P('Sesiones y unidades por producto, para medir conversión.'),
           P('<b>A · Llega a la pantalla</b>', 'p'),
           pasos(['Abre el menú (☰) y entra a <b>Reports</b> (Informes).',
                  'Elige <b>Business Reports</b> (Informes de negocio).']),
           Captura('03a-business-menu.png', 'Menu › Reports › Business Reports', maxh=85*mm),
           KeepTogether([P('<b>B · Elige el reporte y descárgalo</b>', 'p'),
           pasos(['En la columna izquierda, bajo <b>By ASIN</b>, elige <b>Detail Page Sales and Traffic By Child Item</b> '
                  '(Ventas y tráfico por página de detalle, por Child).',
                  'En <b>Date</b> elige <b>Custom</b> y pon del primer al último día del mismo mes cerrado.',
                  'Dale <b>Download (.csv)</b>.']),
           Captura('03b-business-report-child.png', 'By ASIN › Detail Page Sales and Traffic By Child Item · fechas · Download (.csv)')]),
           PageBreak()]

    # ---- 3 Bulk
    st += [P('REPORTE 3 DE 4', 'eyebrow'), P('Bulk Operations <font color="#5b6577" size="14">(publicidad)</font>', 'h1'),
           P('Gasto y ventas de tus anuncios por SKU. Con él salen tu ACOS y tu TACOS.'),
           recuadro('<b>Ojo:</b> este reporte <b>no</b> está en Seller Central. Se descarga en tu <b>consola de publicidad</b> '
                    '(Amazon Ads, se abre en otra ventana con la dirección <b>advertising.amazon...</b>). '
                    'Revisa arriba que sea tu cuenta y el país <b>Mexico</b>.'),
           Spacer(1, 6),
           P('<b>A · Entra a tu consola de publicidad</b>', 'p'),
           pasos(['En Seller Central abre el menú (☰) › <b>Advertising</b> (Publicidad) › <b>Campaign Manager</b>. '
                  'Se abre la consola de publicidad.',
                  'En el menú de la izquierda elige <b>Bulk operations</b> (Operaciones masivas).']),
           Captura('04a-bulk-menu.png', 'Consola de publicidad › Bulk operations', maxh=80*mm),
           PageBreak(),
           KeepTogether([P('<b>B · Pide el archivo</b>', 'p'),
           pasos(['Revisa que el país sea <b>Mexico</b>.',
                  'Dale <b>Download campaigns</b> (Descargar campañas).']),
           Captura('04b-bulk-download.png', 'País · Download campaigns', maxh=80*mm)]),
           KeepTogether([P('<b>C · Elige fechas y datos</b>', 'p'),
           pasos(['En <b>Date range for performance metrics</b> pon del primer al último día del mes cerrado.',
                  'Deja marcado <b>Performance data</b> (datos de rendimiento).',
                  'Deja marcado <b>Sponsored Products data</b>. Lo demás puede quedarse como está.',
                  'Dale <b>Download</b>. Cuando en la lista diga <b>Success</b>, dale <b>Download</b> en esa fila para bajar el <b>.xlsx</b>.']),
           Captura('04c-bulk-opciones.png', 'Date range · Performance data · Sponsored Products data · Download', maxh=95*mm)]),
           PageBreak()]

    # ---- 4 Fee Preview
    st += [P('REPORTE 4 DE 4', 'eyebrow'), P('Fee Preview <font color="#5b6577" size="14">(Vista previa de comisiones)</font>', 'h1'),
           P('Trae nombres, ASIN y SKU para que el diagnóstico una todos los reportes. Este reporte no pide fechas: '
             'muestra tus comisiones actuales.'),
           P('<b>A · Llega a la pantalla</b>', 'p'),
           pasos(['Abre el menú (☰) y entra a <b>Reports</b> (Informes).',
                  'Elige <b>Fulfillment</b> (Logística de Amazon).']),
           Captura('05a-fee-menu.png', 'Menu › Reports › Fulfillment', maxh=85*mm),
           PageBreak(),
           KeepTogether([P('<b>B · Pide y descarga el reporte</b>', 'p'),
           pasos(['En la columna izquierda, bajo <b>Payments</b>, elige <b>Fee Preview</b>.',
                  'Dale <b>Request .csv Download</b> (Solicitar descarga .csv).',
                  'En la tabla de abajo, cuando aparezca tu reporte, dale <b>Download</b>.']),
           Captura('05b-fee-preview.png', 'Payments › Fee Preview · Request .csv Download · Download', maxh=95*mm)]),
           PageBreak()]

    # ---- 5 Costos
    st += [P('TU PLANTILLA', 'eyebrow'), P('Costos por Child', 'h1'),
           P('Abre el Excel <b>PAS_Plantilla_Costos_por_Child.xlsx</b> de tu kit y llena solo las celdas color durazno.'),
           pasos(['<b>Una fila por Child</b>: cada talla, color o presentación es una fila. Basta el ASIN o el SKU.',
                  '<b>Costo unitario</b>: una pieza, sin IVA, en la moneda de tu tienda. El costo que tú confirmas.',
                  '<b>¿Ya incluye flete y aduana?</b> Si es Sí, se toman en cero. Si es No, llena flete y aduana por unidad.',
                  '<b>Otros costos</b>: empaque, etiquetado o preparación por pieza.',
                  'El <b>costo total por unidad</b> se calcula solo. Borra la fila gris de ejemplo.']),
           Captura('06-plantilla-costos.png', 'Pestaña Costos por Child · llena solo la zona color durazno', maxh=85*mm),
           PageBreak()]

    # ---- 7 Correr
    st += [P('ÚLTIMO PASO', 'eyebrow'), P('Corre tu diagnóstico', 'h1'),
           P('<b>A · Instala la skill en Claude</b> (solo la primera vez)', 'p'),
           pasos(['En Claude abre <b>Personalización</b> (Customize) y entra a la pestaña <b>Skills</b>.',
                  'Dale <b>+ Agregar</b> (Add).',
                  'Elige <b>Subir Skill</b> (Upload skill) y selecciona el archivo de la skill que viene en tu kit.']),
           Captura('07-instalar-skill.png', 'Personalización › Skills › + Agregar › Subir Skill', maxh=60*mm),
           P('<b>B · Corre tu diagnóstico</b>', 'p'),
           pasos(['Abre un chat nuevo y sube los 4 reportes y tu Excel de costos.',
                  'Pide: <i>"Corre mi diagnóstico de rentabilidad"</i>.',
                  'Revisa tus tres prioridades del mes.']),
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
