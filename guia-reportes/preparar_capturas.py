# Recorta, tapa y marca las capturas de Seller Central para la guía.
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
src, out = sys.argv[1], sys.argv[2]
OR = (255, 153, 0)
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
def marca(d, box, n=None):
    x0, y0, x1, y1 = box
    d.rounded_rectangle((x0-4, y0-4, x1+4, y1+4), radius=8, outline=OR, width=4)
    if n:
        cx, cy = x1 + 6, y0 - 14
        d.ellipse((cx, cy, cx+28, cy+28), fill=OR); d.text((cx+14, cy+14), str(n), fill='white', font=F, anchor='mm')
def tapa(im, box):
    im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(14)), box[:2])
def hacer(n, crop, marcas, tapas=()):
    im = Image.open(f'{src}/{n}.jpg').convert('RGB')
    for t in tapas: tapa(im, t)
    d = ImageDraw.Draw(im)
    for i, b in enumerate(marcas): marca(d, b, i+1)
    return im.crop(crop)
# 1 · Menú › Payments › Reports Repository (solo el menú; el tablero de atrás queda fuera)
hacer(1, (0, 120, 495, 700), [(4, 464, 196, 498), (208, 500, 450, 535)]).save(f'{out}/01-transacciones-menu.png')
# 2 · Reports Repository: tipo Transaction, mes, Request Report y Download CSV
hacer(2, (0, 120, 1600, 838), [(419, 426, 579, 452), (617, 352, 998, 430), (1232, 540, 1353, 567), (1309, 760, 1392, 784)]
      ).save(f'{out}/02-transacciones-filtros.png')
# 3a · Menú › Reports › Business Reports
hacer(3, (0, 120, 495, 800), [(4, 427, 196, 461), (208, 428, 450, 461)]).save(f'{out}/03a-business-menu.png')
# 3b · Business Reports: By Child Item, fechas y Download (.csv). La gráfica de tráfico se tapa.
hacer(4, (0, 120, 1600, 838), [(28, 416, 150, 444), (208, 683, 482, 710), (226, 722, 338, 750)],
      tapas=[(210, 210, 1560, 590)]).save(f'{out}/03b-business-report-child.png')
# 4a · Consola de publicidad: menú izquierdo › Bulk operations (solo los menús; métricas y marcas fuera)
hacer(5, (0, 120, 480, 640), [(64, 500, 216, 528)], tapas=[(228, 170, 480, 640)]).save(f'{out}/04a-bulk-menu.png')
# 4b · Bulk Operations: país y Download campaigns. Se tapan el historial (archivos y correos) y el nombre de la cuenta.
hacer(6, (0, 120, 1600, 838), [(70, 187, 158, 213), (382, 374, 519, 401)],
      tapas=[(243, 468, 1578, 838), (1285, 128, 1455, 162)]).save(f'{out}/04b-bulk-download.png')
# 4c · Ventana Download Campaigns: fechas, Performance data y Download
im = hacer(7, (0, 0, 1600, 900), [(746, 321, 923, 350), (742, 408, 872, 428), (742, 549, 892, 568), (975, 753, 1053, 780)])
im.crop((520, 160, 1095, 800)).save(f'{out}/04c-bulk-opciones.png')
# 5a · Menú › Reports › Fulfillment
hacer(8, (0, 120, 495, 800), [(4, 427, 196, 461), (208, 500, 450, 535)]).save(f'{out}/05a-fee-menu.png')
# 5b · Payments › Fee Preview · Request .csv Download · Download (la captura 9 repite lo mismo con un globo de ayuda)
hacer(10, (0, 120, 1600, 838), [(4, 747, 190, 769), (284, 320, 433, 346), (1346, 473, 1408, 495)]).save(f'{out}/05b-fee-preview.png')
