#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import math

SIZE = 512
img  = Image.new('RGB', (SIZE, SIZE), (0, 0, 0))
draw = ImageDraw.Draw(img)

# Subtle grid
for i in range(0, SIZE, 32):
    draw.line([(i,0),(i,SIZE)], fill=(8,12,8), width=1)
    draw.line([(0,i),(SIZE,i)], fill=(8,12,8), width=1)

# Outer ring
cx, cy, r = 256, 256, 218
draw.ellipse([cx-r,cy-r,cx+r,cy+r], outline=(74,222,128), width=5)
draw.ellipse([cx-170,cy-170,cx+170,cy+170], outline=(20,40,20), width=2)

# Candlestick bars — mini chart
candles = [
    (130, 310, 260, True),   # x, bottom, top, up
    (175, 290, 280, False),
    (220, 320, 250, True),
    (265, 295, 230, True),
    (310, 270, 210, True),
    (355, 285, 220, False),
]
for x, bot, top, up in candles:
    col  = (74, 222, 128) if up else (224, 85, 85)
    col2 = (30, 80, 30)   if up else (80, 30, 30)
    h    = bot - top
    w    = 28
    # Wick
    draw.line([(x, top-8), (x, bot+8)], fill=col2, width=2)
    # Body
    draw.rectangle([x-w//2, top, x+w//2, bot], fill=col)

# Trend line through candle tops
pts = [(c[0], c[2]) for c in candles]
for i in range(len(pts)-1):
    draw.line([pts[i], pts[i+1]], fill=(0,245,255), width=2)

# Dot at each point
for px, py in pts:
    draw.ellipse([px-4,py-4,px+4,py+4], fill=(0,245,255))

# Title
try:
    font_big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 44)
    font_sm  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
except:
    font_big = font_sm = ImageFont.load_default()

for text, font, y, col in [
    ("MZANSI", font_big, 390, (74,222,128)),
    ("MARKETS", font_sm,  440, (0,245,255)),
]:
    bb = font.getbbox(text)
    draw.text((cx-(bb[2]-bb[0])//2, y), text, font=font, fill=col)

img.save('public/icon.png', 'PNG')
print("icon.png saved")
