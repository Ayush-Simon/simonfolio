#!/usr/bin/env python3
"""
Builds Ayush's avatar SVGs (waving + DJ) from shared parts, then renders them
to public/avatar/*.webp with headless Chrome + Pillow.

  python3 avatar-src/build.py

Everything is drawn in one "head space": the face is centred at (400, 360),
the shoulders sit at y ~590. Poses place that space with a transform.
"""
import os
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "avatar")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# palette (taken from the reference avatar)
SKIN_LINE = "#7a4528"
HAIR_LINE = "#0c0a0a"
SHIRT_LINE = "#9c9586"
ACCENT = "#ff4d2e"

DEFS = """
<defs>
  <radialGradient id="skinFace" cx=".42" cy=".36" r=".72">
    <stop offset="0" stop-color="#eeb07f"/><stop offset=".5" stop-color="#d9935e"/><stop offset="1" stop-color="#b36d42"/>
  </radialGradient>
  <linearGradient id="skinFlat" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#dc9864"/><stop offset="1" stop-color="#b8744a"/>
  </linearGradient>
  <linearGradient id="skinNeck" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9c5a35"/><stop offset=".45" stop-color="#c47f50"/><stop offset="1" stop-color="#d48e5b"/>
  </linearGradient>
  <linearGradient id="hairGrad" x1="0" y1="0" x2=".3" y2="1">
    <stop offset="0" stop-color="#3d3839"/><stop offset=".55" stop-color="#1f1c1d"/><stop offset="1" stop-color="#121011"/>
  </linearGradient>
  <radialGradient id="beardGrad" cx=".5" cy=".25" r=".8">
    <stop offset="0" stop-color="#2c2728"/><stop offset=".7" stop-color="#181516"/><stop offset="1" stop-color="#0e0c0d"/>
  </radialGradient>
  <linearGradient id="shirtGrad" x1="0" y1="0" x2="1" y2=".2">
    <stop offset="0" stop-color="#e9e4d8"/><stop offset=".5" stop-color="#d8d2c4"/><stop offset="1" stop-color="#bdb6a6"/>
  </linearGradient>
  <linearGradient id="sleeveGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#e6e0d3"/><stop offset="1" stop-color="#c4bdad"/>
  </linearGradient>
  <linearGradient id="collarGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e4dfd4"/>
  </linearGradient>
  <radialGradient id="iris" cx=".45" cy=".4" r=".6">
    <stop offset="0" stop-color="#9a6438"/><stop offset="1" stop-color="#4a2915"/>
  </radialGradient>
  <pattern id="knit" width="9" height="7" patternUnits="userSpaceOnUse">
    <path d="M0 3.5 Q2.25 1 4.5 3.5 T9 3.5" fill="none" stroke="#000" stroke-opacity=".07" stroke-width="1.3"/>
  </pattern>
  <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3a3a40"/><stop offset="1" stop-color="#18181b"/>
  </linearGradient>
  <linearGradient id="deckTop" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3b3b42"/><stop offset="1" stop-color="#26262b"/>
  </linearGradient>
  <linearGradient id="deckFront" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1c1c20"/><stop offset="1" stop-color="#0d0d0f"/>
  </linearGradient>
  <radialGradient id="platter" cx=".45" cy=".35" r=".7">
    <stop offset="0" stop-color="#55555d"/><stop offset=".6" stop-color="#2a2a30"/><stop offset="1" stop-color="#141417"/>
  </radialGradient>
  <radialGradient id="cone" cx=".42" cy=".38" r=".7">
    <stop offset="0" stop-color="#5a5a62"/><stop offset=".55" stop-color="#26262b"/><stop offset="1" stop-color="#0b0b0d"/>
  </radialGradient>
  <linearGradient id="cabinet" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#2f2f35"/><stop offset="1" stop-color="#1a1a1e"/>
  </linearGradient>
  <linearGradient id="cup" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#3c3c42"/><stop offset="1" stop-color="#0f0f11"/>
  </linearGradient>
</defs>
"""


def mirror(d):
    """Mirror an SVG path across x = 400 (absolute M/L/C/Q/T/Z commands with x y pairs only)."""
    import re
    tokens = re.findall(r"[A-Za-z]|-?[0-9]*\.?[0-9]+", d)
    res, i = [], 0
    while i < len(tokens):
        t = tokens[i]
        if t.isalpha():
            res.append(t)
            i += 1
            continue
        res.append(f"{800 - float(t):g} {float(tokens[i + 1]):g}")
        i += 2
    return " ".join(res)


# ---------------------------------------------------------------- head

def eye_open(cx, side):
    s = -1 if side == "L" else 1  # iris looks very slightly toward the centre
    sclera = f"M{cx-28} 358 C{cx-18} 342 {cx+18} 340 {cx+30} 356 C{cx+18} 368 {cx-16} 370 {cx-28} 358 Z"
    if side == "R":
        sclera = mirror(f"M{800-cx-28} 358 C{800-cx-18} 342 {800-cx+18} 340 {800-cx+30} 356 C{800-cx+18} 368 {800-cx-16} 370 {800-cx-28} 358 Z")
    lid = f"M{cx-30} 358 C{cx-18} 338 {cx+20} 336 {cx+32} 354"
    if side == "R":
        lid = mirror(f"M{800-cx-30} 358 C{800-cx-18} 338 {800-cx+20} 336 {800-cx+32} 354")
    ix = cx + 2 * (-s)
    return f"""
    <clipPath id="eye{side}"><path d="{sclera}"/></clipPath>
    <path d="{sclera}" fill="#fdfbf8" stroke="{SKIN_LINE}" stroke-width="2"/>
    <g clip-path="url(#eye{side})">
      <circle cx="{ix}" cy="356" r="12" fill="url(#iris)"/>
      <circle cx="{ix}" cy="356" r="5.6" fill="#120b08"/>
      <circle cx="{ix+4}" cy="351" r="3.3" fill="#fff"/>
      <circle cx="{ix-4}" cy="360" r="1.4" fill="#fff" opacity=".8"/>
      <path d="M{cx-30} 344 Q{cx} 352 {cx+30} 344 L{cx+30} 336 L{cx-30} 336 Z" fill="#000" opacity=".12"/>
    </g>
    <path d="{lid}" fill="none" stroke="#24150e" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M{cx-22} 365 Q{cx} 373 {cx+22} 364" fill="none" stroke="#9c5a33" stroke-width="2" opacity=".55"/>
    """


def eye_closed(cx):
    return f"""
    <path d="M{cx-26} 362 Q{cx} 340 {cx+26} 362" fill="none" stroke="#24150e" stroke-width="5" stroke-linecap="round"/>
    <path d="M{cx-20} 368 Q{cx} 374 {cx+20} 368" fill="none" stroke="#9c5a33" stroke-width="2" opacity=".5"/>
    """


BROW_L = "M314 322 C328 302 360 296 390 307 C393 313 391 318 386 321 C362 312 338 316 318 331 Z"


def head(expr="open"):
    eyes = (eye_open(352, "L") + eye_open(448, "R")) if expr == "open" else (eye_closed(352) + eye_closed(448))
    brow_lift = "" if expr == "open" else ' transform="translate(0 -4)"'
    return f"""
  <g class="head">
    <!-- ears -->
    <ellipse cx="272" cy="390" rx="22" ry="30" fill="url(#skinFace)" stroke="{SKIN_LINE}" stroke-width="3"/>
    <path d="M268 374 Q257 390 270 406" fill="none" stroke="#9c5a33" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="528" cy="390" rx="22" ry="30" fill="url(#skinFace)" stroke="{SKIN_LINE}" stroke-width="3"/>
    <path d="M532 374 Q543 390 530 406" fill="none" stroke="#9c5a33" stroke-width="3" stroke-linecap="round"/>

    <!-- face -->
    <path d="M280 330 C278 236 330 208 400 208 C470 208 522 236 520 330 C520 424 498 500 400 520 C302 500 280 424 280 330 Z"
          fill="url(#skinFace)" stroke="{SKIN_LINE}" stroke-width="3"/>
    <!-- soft light on the forehead and cheeks (the 3D bit) -->
    <ellipse cx="372" cy="292" rx="60" ry="30" fill="#fff" opacity=".12" filter="url(#blur8)"/>
    <ellipse cx="322" cy="398" rx="20" ry="11" fill="#e2765a" opacity=".22"/>
    <ellipse cx="478" cy="398" rx="20" ry="11" fill="#e2765a" opacity=".22"/>

    <!-- brows -->
    <g{brow_lift}>
      <path d="{BROW_L}" fill="#191516"/>
      <path d="{mirror(BROW_L)}" fill="#191516"/>
    </g>

    {eyes}

    <!-- nose -->
    <path d="M394 334 Q390 372 384 396" fill="none" stroke="#b06c41" stroke-width="3" opacity=".45" stroke-linecap="round"/>
    <ellipse cx="400" cy="396" rx="11" ry="8" fill="#f6c393" opacity=".55"/>
    <path d="M378 400 Q390 418 400 414 Q410 418 422 400" fill="none" stroke="#8a4f2e" stroke-width="3" stroke-linecap="round"/>

    <!-- beard: sideburns, cheeks, chin and moustache in one shape -->
    <path d="M280 336 C278 444 308 530 362 553 Q400 568 438 553 C492 530 522 444 520 336
             C514 362 504 390 490 405 C478 419 462 428 448 433 C432 424 416 419 400 423
             C384 419 368 424 352 433 C338 428 322 419 310 405 C296 390 286 362 280 336 Z"
          fill="url(#beardGrad)" stroke="{HAIR_LINE}" stroke-width="2"/>
    <g fill="none" stroke="#4a4344" stroke-width="2.5" stroke-linecap="round" opacity=".55">
      <path d="M302 430 Q312 462 332 486"/><path d="M498 430 Q488 462 468 486"/>
      <path d="M352 512 Q376 530 400 532"/><path d="M448 512 Q424 530 400 532"/>
      <path d="M296 380 Q300 404 310 420"/><path d="M504 380 Q500 404 490 420"/>
    </g>

    <!-- smile -->
    <path d="M364 458 Q400 490 436 458 Q400 467 364 458 Z" fill="#5c1f1a"/>
    <path d="M369 460 Q400 469 431 460 L428 467 Q400 476 372 467 Z" fill="#fffdf8"/>
    <path d="M378 482 Q400 491 422 482" fill="none" stroke="#c3735c" stroke-width="3" stroke-linecap="round" opacity=".85"/>

    <!-- hair: thick, swept up and back, short at the sides -->
    <path d="M272 348 C263 302 263 254 286 218 C298 198 314 186 332 178 C342 162 364 151 388 153
             C404 141 432 140 452 150 C476 150 498 163 510 182 C527 194 539 216 538 246
             C541 282 536 316 528 348 C522 322 514 304 502 296 C490 276 466 263 434 258
             C402 253 362 259 332 271 C308 281 292 302 284 332 Z"
          fill="url(#hairGrad)" stroke="{HAIR_LINE}" stroke-width="3" stroke-linejoin="round"/>
    <!-- faded sides -->
    <path d="M273 348 C266 318 266 292 274 270 L292 300 C288 316 286 330 284 338 Z" fill="#5a5455" opacity=".55"/>
    <path d="M527 348 C534 318 534 292 526 270 L508 300 C512 316 514 330 516 338 Z" fill="#5a5455" opacity=".55"/>
    <!-- the front swept up and back -->
    <path d="M330 271 C350 238 394 222 442 228 C474 232 498 250 506 272 C488 258 460 250 430 252 C396 254 360 262 330 271 Z" fill="#2a2627"/>
    <g fill="none" stroke="#625a5b" stroke-linecap="round" stroke-width="4" opacity=".55">
      <path d="M346 262 Q356 214 398 186"/><path d="M386 252 Q398 206 440 176"/>
      <path d="M428 250 Q446 210 486 190"/><path d="M466 258 Q490 226 514 212"/>
      <path d="M318 248 Q318 214 344 192"/>
    </g>
    <g fill="none" stroke="#7a7172" stroke-linecap="round" stroke-width="3" opacity=".35">
      <path d="M372 172 Q404 160 440 166"/><path d="M412 204 Q446 196 478 210"/>
    </g>
  </g>"""


# ---------------------------------------------------------------- body

def torso():
    body = "M180 860 C180 662 252 592 400 590 C548 592 620 662 620 860 Z"
    collar = "M368 586 C346 590 322 598 308 606 L344 652 C358 641 376 632 394 642 Z"
    return f"""
  <g class="torso">
    <!-- neck -->
    <path d="M348 498 L348 606 Q400 624 452 606 L452 498 Z" fill="url(#skinNeck)" stroke="{SKIN_LINE}" stroke-width="3"/>
    <!-- knit polo -->
    <path d="{body}" fill="url(#shirtGrad)" stroke="{SHIRT_LINE}" stroke-width="3"/>
    <path d="{body}" fill="url(#knit)"/>
    <path d="M540 640 C590 680 612 760 612 860 L560 860 C566 780 556 700 540 640 Z" fill="#000" opacity=".06" filter="url(#blur8)"/>
    <!-- open neck + white collar -->
    <path d="M362 592 L400 654 L438 592 Z" fill="url(#skinNeck)"/>
    <ellipse cx="400" cy="600" rx="40" ry="10" fill="#6e3a1f" opacity=".35" filter="url(#blur3)"/>
    <path d="{collar}" fill="url(#collarGrad)" stroke="#b5ae9f" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="{mirror(collar)}" fill="url(#collarGrad)" stroke="#b5ae9f" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M400 656 L400 730" stroke="#b2ab9b" stroke-width="2.5"/>
    <!-- left arm at the side: sleeve, white cuff, forearm -->
    <path d="M252 702 Q250 780 246 860" fill="none" stroke="{SHIRT_LINE}" stroke-width="2.5" opacity=".7"/>
    <path d="M181 770 Q216 760 252 772 L250 794 Q214 782 181 792 Z" fill="url(#collarGrad)" stroke="#b5ae9f" stroke-width="2"/>
    <path d="M181 792 Q214 782 250 794 L246 860 L180 860 Z" fill="url(#skinFlat)" stroke="{SKIN_LINE}" stroke-width="3"/>
  </g>"""


def skin_stroke(d, w):
    """A limb drawn as a thick stroke with an outline and a soft highlight."""
    return f"""
    <path d="{d}" fill="none" stroke="{SKIN_LINE}" stroke-width="{w+8}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="{d}" fill="none" stroke="#cf8a57" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="{d}" fill="none" stroke="#eaa774" stroke-width="{w*0.28:.0f}" stroke-linecap="round" opacity=".55" transform="translate(-{w*0.2:.0f} 0)"/>"""


def sleeve(cx, cy, angle, w=82, h=104):
    """A short polo sleeve (rect rotated to the arm) with the white trim at the elbow end."""
    return f"""
    <g transform="rotate({angle} {cx} {cy})">
      <rect x="{cx-w/2}" y="{cy-h/2}" width="{w}" height="{h}" rx="30" fill="url(#sleeveGrad)" stroke="{SHIRT_LINE}" stroke-width="3"/>
      <rect x="{cx-w/2}" y="{cy-h/2}" width="{w}" height="{h}" rx="30" fill="url(#knit)"/>
      <rect x="{cx-w/2+1}" y="{cy-h/2}" width="{w-2}" height="18" rx="9" fill="url(#collarGrad)" stroke="#b5ae9f" stroke-width="2"/>
    </g>"""


def open_hand(x, y):
    fingers = [((x - 28, y - 30), (x - 42, y - 90)), ((x - 8, y - 40), (x - 12, y - 108)),
               ((x + 12, y - 38), (x + 20, y - 102)), ((x + 30, y - 24), (x + 48, y - 78)),
               ((x - 40, y + 10), (x - 80, y - 14))]
    outl = "".join(f'<path d="M{a[0]} {a[1]} L{b[0]} {b[1]}"/>' for a, b in fingers)
    return f"""
    <g fill="none" stroke="{SKIN_LINE}" stroke-width="31" stroke-linecap="round">{outl}</g>
    <ellipse cx="{x}" cy="{y}" rx="50" ry="56" transform="rotate(10 {x} {y})" fill="url(#skinFace)" stroke="{SKIN_LINE}" stroke-width="3"/>
    <g fill="none" stroke="#d59160" stroke-width="24" stroke-linecap="round">{outl.replace(f'M{x-40} {y+10}', f'M{x-34} {y+6}')}</g>
    <g fill="none" stroke="#eaa774" stroke-width="7" stroke-linecap="round" opacity=".5">{''.join(f'<path d="M{b[0]-3} {b[1]+6} L{(a[0]+b[0])/2-3} {(a[1]+b[1])/2}"/>' for a, b in fingers[:4])}</g>"""


# ---------------------------------------------------------------- poses

def wave_svg(layer="all"):
    arm = f"""
  <g id="wave-arm">
    {skin_stroke("M600 700 Q672 640 690 560 L705 410", 64)}
    {open_hand(712, 352)}
    {sleeve(632, 662, 33)}
  </g>
  <g id="motion" fill="none" stroke="#8d8a85" stroke-width="6" stroke-linecap="round" opacity=".8">
    <path d="M800 270 Q822 310 806 352"/><path d="M830 240 Q862 300 836 368"/><path d="M606 252 Q586 290 600 328"/>
  </g>"""
    show_arm = layer in ("all", "arm")
    show_body = layer in ("all", "body")
    parts = []
    if show_arm:
        parts.append(arm)
    if show_body:
        parts.append(torso())
        parts.append(head("open"))
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="150 150 760 760" width="760" height="760">
{DEFS}
<g transform="translate(30 50)">{''.join(parts)}
</g>
</svg>"""


def headphones():
    band = "M262 368 C250 140 550 140 538 368"
    return f"""
  <g class="headphones">
    <path d="{band}" fill="none" stroke="#151517" stroke-width="28" stroke-linecap="round"/>
    <path d="{band}" fill="none" stroke="#3c3c42" stroke-width="8" stroke-linecap="round" transform="translate(0 -6)" opacity=".8"/>
    <rect x="226" y="322" width="70" height="132" rx="32" fill="url(#cup)" stroke="#060607" stroke-width="3"/>
    <rect x="240" y="342" width="42" height="92" rx="20" fill="none" stroke="{ACCENT}" stroke-width="5"/>
    <rect x="504" y="322" width="70" height="132" rx="32" fill="url(#cup)" stroke="#060607" stroke-width="3"/>
    <rect x="518" y="342" width="42" height="92" rx="20" fill="none" stroke="{ACCENT}" stroke-width="5"/>
    <ellipse cx="250" cy="352" rx="10" ry="18" fill="#fff" opacity=".12"/>
    <ellipse cx="528" cy="352" rx="10" ry="18" fill="#fff" opacity=".12"/>
  </g>"""


def jog(cx, cy):
    return f"""
    <ellipse cx="{cx}" cy="{cy+8}" rx="104" ry="38" fill="#0b0b0d"/>
    <ellipse cx="{cx}" cy="{cy}" rx="100" ry="36" fill="url(#platter)" stroke="#0a0a0c" stroke-width="2"/>
    <ellipse cx="{cx}" cy="{cy}" rx="76" ry="27" fill="none" stroke="#4a4a52" stroke-width="1.5"/>
    <ellipse cx="{cx}" cy="{cy}" rx="56" ry="20" fill="none" stroke="#4a4a52" stroke-width="1.5"/>
    <ellipse cx="{cx}" cy="{cy}" rx="30" ry="11" fill="{ACCENT}"/>
    <ellipse cx="{cx-6}" cy="{cy-3}" rx="12" ry="4" fill="#fff" opacity=".35"/>
    <path d="M{cx} {cy-11} L{cx+40} {cy-28}" stroke="#d9d9de" stroke-width="3" stroke-linecap="round"/>"""


def controller():
    pads_l = "".join(f'<rect x="{168+i*34}" y="812" width="28" height="12" rx="3" fill="{c}"/>' for i, c in enumerate([ACCENT, "#ffb02e", "#2ec4b6", "#8a7dff"]))
    pads_r = "".join(f'<rect x="{560+i*34}" y="812" width="28" height="12" rx="3" fill="{c}"/>' for i, c in enumerate([ACCENT, "#ffb02e", "#2ec4b6", "#8a7dff"]))
    knobs = "".join(f'<ellipse cx="{x}" cy="{y}" rx="9" ry="5" fill="#d9d9de" stroke="#111" stroke-width="1.5"/>' for x in (410, 440, 470) for y in (726, 744))
    return f"""
  <g class="controller">
    <ellipse cx="440" cy="960" rx="360" ry="30" fill="#000" opacity=".25" filter="url(#blur8)"/>
    <!-- top plate in perspective, then the front edge -->
    <path d="M152 708 L728 708 L778 834 L102 834 Z" fill="url(#deckTop)" stroke="#0c0c0e" stroke-width="3" stroke-linejoin="round"/>
    <path d="M102 834 L778 834 L778 1000 L102 1000 Z" fill="url(#deckFront)" stroke="#0c0c0e" stroke-width="3"/>
    <path d="M110 840 L770 840" stroke="#4a4a52" stroke-width="2" opacity=".6"/>
    <circle cx="140" cy="880" r="5" fill="{ACCENT}"/><circle cx="740" cy="880" r="5" fill="{ACCENT}"/>
    {jog(262, 762)}
    {jog(618, 762)}
    <!-- mixer -->
    <rect x="388" y="716" width="104" height="112" rx="8" fill="#1b1b1f" stroke="#0a0a0c" stroke-width="2"/>
    {knobs}
    <rect x="408" y="760" width="6" height="40" rx="3" fill="#0a0a0c"/><rect x="401" y="772" width="20" height="10" rx="2" fill="#e8e8ec"/>
    <rect x="466" y="760" width="6" height="40" rx="3" fill="#0a0a0c"/><rect x="459" y="782" width="20" height="10" rx="2" fill="#e8e8ec"/>
    <rect x="404" y="812" width="72" height="5" rx="2.5" fill="#0a0a0c"/><rect x="432" y="806" width="16" height="16" rx="3" fill="{ACCENT}"/>
    <rect x="428" y="758" width="24" height="44" rx="3" fill="#0a0a0c"/>
    <rect x="432" y="782" width="6" height="16" fill="#2ec4b6"/><rect x="442" y="774" width="6" height="24" fill="#ffb02e"/>
    {pads_l}{pads_r}
  </g>"""


def speaker():
    waves = "".join(
        f'<path d="M{875 - r * 0.77:.0f} {620 - r * 0.64:.0f} A{r} {r} 0 0 1 {875 + r * 0.17:.0f} {620 - r * 0.98:.0f}" fill="none" stroke="{c}" stroke-width="{sw}" stroke-linecap="round" opacity="{o}"/>'
        for r, c, sw, o in [(250, ACCENT, 6, 0.9), (300, ACCENT, 5, 0.55), (350, "#bdb6a6", 4, 0.4)]
    )
    return f"""
  <g class="speaker">
    <ellipse cx="880" cy="975" rx="110" ry="20" fill="#000" opacity=".3" filter="url(#blur8)"/>
    <path d="M790 384 L768 400 L768 980 L790 972 Z" fill="#0d0d10"/>
    <rect x="790" y="384" width="172" height="588" rx="16" fill="url(#cabinet)" stroke="#08080a" stroke-width="3"/>
    <!-- tweeter -->
    <circle cx="876" cy="452" r="30" fill="#0c0c0e"/><circle cx="876" cy="452" r="22" fill="url(#cone)"/><circle cx="870" cy="446" r="6" fill="#fff" opacity=".25"/>
    <!-- woofers, with rings showing the bass thumping -->
    <circle cx="876" cy="620" r="98" fill="none" stroke="{ACCENT}" stroke-width="3" opacity=".6"/>
    <circle cx="876" cy="620" r="112" fill="none" stroke="{ACCENT}" stroke-width="2" opacity=".3"/>
    <circle cx="876" cy="620" r="78" fill="#0b0b0d"/><circle cx="876" cy="620" r="68" fill="url(#cone)"/>
    <circle cx="876" cy="620" r="40" fill="none" stroke="#3a3a40" stroke-width="2"/>
    <circle cx="876" cy="620" r="20" fill="#222226"/><circle cx="870" cy="613" r="7" fill="#fff" opacity=".22"/>
    <circle cx="876" cy="820" r="70" fill="#0b0b0d"/><circle cx="876" cy="820" r="60" fill="url(#cone)"/>
    <circle cx="876" cy="820" r="18" fill="#222226"/><circle cx="871" cy="814" r="6" fill="#fff" opacity=".2"/>
    <circle cx="876" cy="930" r="6" fill="{ACCENT}"/>
    <!-- shake lines -->
    <g stroke="#bdb6a6" stroke-width="4" stroke-linecap="round" opacity=".6">
      <path d="M752 470 L736 476"/><path d="M752 500 L732 500"/><path d="M752 530 L736 524"/>
    </g>
    <!-- sound, pushing out toward the dj and up -->
    {waves}
    <g fill="none" stroke="{ACCENT}" stroke-linecap="round">
      <path d="M752 560 Q736 600 752 640" stroke-width="5" opacity=".85"/>
      <path d="M730 540 Q708 600 730 660" stroke-width="4" opacity=".55"/>
    </g>
  </g>"""


def note(x, y, s=1.0, rot=0):
    return f"""
  <g transform="translate({x} {y}) rotate({rot}) scale({s})">
    <path d="M16 -4 L16 -80 Q48 -66 42 -38" fill="none" stroke="#1b1b1f" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="0" cy="0" rx="20" ry="15" transform="rotate(-20)" fill="{ACCENT}" stroke="#1b1b1f" stroke-width="5"/>
  </g>"""


def dj_svg():
    # the dj, placed from head space into the 1000x1000 canvas
    place = "translate(430 318) scale(0.8) translate(-400 -360)"
    # arms: shoulder -> elbow -> hand on each jog wheel (canvas coords)
    l_upper, r_upper = "M300 590 Q246 628 238 690", "M560 590 Q614 628 624 690"
    l_fore, r_fore = "M238 690 Q244 736 270 760", "M624 690 Q618 736 600 758"

    def hand(x, y, flip=1):
        """A hand resting palm-down on a platter: palm, four fingers toward the viewer, thumb in."""
        fingers = "".join(
            f'<ellipse cx="{x + dx * flip}" cy="{y + 20 + dy}" rx="9" ry="13" fill="url(#skinFace)" stroke="{SKIN_LINE}" stroke-width="2.5"/>'
            for dx, dy in ((-20, 0), (-6, 4), (8, 4), (21, 0))
        )
        return f"""
    {fingers}
    <ellipse cx="{x}" cy="{y}" rx="32" ry="22" fill="url(#skinFace)" stroke="{SKIN_LINE}" stroke-width="3"/>
    <ellipse cx="{x - 30 * flip}" cy="{y + 6}" rx="10" ry="15" transform="rotate({-30 * flip} {x - 30 * flip} {y + 6})" fill="url(#skinFace)" stroke="{SKIN_LINE}" stroke-width="2.5"/>
    <path d="M{x - 18} {y + 8} Q{x} {y + 14} {x + 18} {y + 8}" fill="none" stroke="#9c5a33" stroke-width="2" opacity=".6"/>
    <ellipse cx="{x - 6}" cy="{y - 9}" rx="13" ry="6" fill="#fff" opacity=".2"/>"""

    def sleeve_stub(d):
        return f"""
    <path d="{d}" fill="none" stroke="{SHIRT_LINE}" stroke-width="70" stroke-linecap="round"/>
    <path d="{d}" fill="none" stroke="url(#sleeveGrad)" stroke-width="64" stroke-linecap="round"/>
    <path d="{d}" fill="none" stroke="url(#knit)" stroke-width="64" stroke-linecap="round"/>"""

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
{DEFS}
{speaker()}
{note(150, 280, 0.9, -12)}
{note(700, 230, 0.75, 10)}
<g transform="{place}">
  {torso()}
  <g transform="rotate(-5 400 560)">
    {head("closed")}
    {headphones()}
  </g>
</g>
{controller()}
<g class="arms">
  {skin_stroke(l_upper + " " + l_fore[l_fore.index("Q"):], 42)}
  {skin_stroke(r_upper + " " + r_fore[r_fore.index("Q"):], 42)}
  {sleeve_stub("M300 592 Q276 606 266 628")}
  {sleeve_stub("M560 592 Q584 606 594 628")}
  <path d="M236 640 Q262 648 292 632" fill="none" stroke="url(#collarGrad)" stroke-width="14" stroke-linecap="round"/>
  <path d="M568 632 Q598 648 624 640" fill="none" stroke="url(#collarGrad)" stroke-width="14" stroke-linecap="round"/>
  {hand(268, 756)}{hand(602, 754, -1)}
</g>
</svg>"""


# ---------------------------------------------------------------- render

def render(svg, name, size, scale):
    tmp = tempfile.mkdtemp()
    src = os.path.join(tmp, name + ".svg")
    png = os.path.join(tmp, name + ".png")
    with open(src, "w") as f:
        f.write(svg)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--force-device-scale-factor={scale}",
                    f"--window-size={size},{size}", "--default-background-color=00000000", f"--screenshot={png}", "file://" + src],
                   check=True, capture_output=True)
    from PIL import Image
    Image.open(png).convert("RGBA").resize((1200, 1200), Image.LANCZOS).save(os.path.join(OUT, name + ".webp"), "WEBP", quality=90, method=6)


if __name__ == "__main__":
    sources = {"wave": wave_svg(), "wave-body": wave_svg("body"), "wave-arm": wave_svg("arm"), "dj": dj_svg()}
    for name, svg in sources.items():
        with open(os.path.join(HERE, name + ".svg"), "w") as f:
            f.write(svg)
    render(sources["wave"], "wave", 760, 2)
    render(sources["wave-body"], "wave-body", 760, 2)
    render(sources["wave-arm"], "wave-arm", 760, 2)
    render(sources["dj"], "dj", 1000, 1.5)
    print("built", ", ".join(sources))
