#!/usr/bin/env python3
"""
Ayush's avatar: flat 2D cartoon, bold ink outlines, matched to his Bitmoji
(black swept-up quiff, full beard, thick arched brows, cream knit polo with a
white collar and white sleeve trims). Builds the waving pose (plus separate
body/arm layers so the arm can wave on the site) and the DJ pose, then renders
them to public/avatar/*.webp with headless Chrome + Pillow.

  python3 avatar-src/build.py

Everything is drawn in one "head space": face centred at (400, 360),
shoulders at y ~590. Poses place that space with a transform.
"""
import os
import re
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "avatar")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

INK = "#111111"
SKIN = "#d48f5c"
SKIN_SH = "#b8733f"
HAIR = "#1d191a"
HAIR_HI = "#3d3637"
SHIRT = "#e6e0d3"
SHIRT_SH = "#cec7b6"
WHITE = "#fbf9f4"
ACCENT = "#ff4d2e"
GEAR = "#26262b"
GEAR_HI = "#3a3a41"

DEFS = f"""
<defs>
  <pattern id="knit" width="10" height="8" patternUnits="userSpaceOnUse">
    <path d="M0 4 Q2.5 1.5 5 4 T10 4" fill="none" stroke="{INK}" stroke-opacity=".08" stroke-width="1.5"/>
  </pattern>
</defs>
"""


def mirror(d):
    """Mirror an SVG path across x = 400 (absolute commands with x y pairs only)."""
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


def outlined(d, w, fill=SKIN, ink=8):
    """A limb as a thick stroke with an ink outline (cartoon style)."""
    return (f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{w + ink * 2}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="{fill}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>')


# ---------------------------------------------------------------- face

def eye_open(side):
    m = (lambda d: d) if side == "L" else mirror
    white = m("M319 360 C331 335 373 332 387 353 C375 366 335 369 319 360 Z")
    lash = m("M388 353 C374 328 330 331 317 361 L307 354")
    ix = 356 if side == "L" else 444
    return f"""
    <clipPath id="eye{side}"><path d="{white}"/></clipPath>
    <path d="{white}" fill="{WHITE}"/>
    <g clip-path="url(#eye{side})">
      <circle cx="{ix}" cy="354" r="15" fill="#6b3d20"/>
      <circle cx="{ix}" cy="354" r="7" fill="{INK}"/>
      <circle cx="{ix + 5}" cy="348" r="4.5" fill="#fff"/>
    </g>
    <path d="{white}" fill="none" stroke="{INK}" stroke-width="4"/>
    <path d="{lash}" fill="none" stroke="{INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>"""


def eye_closed(side):
    m = (lambda d: d) if side == "L" else mirror
    return f"""
    <path d="{m('M322 364 C334 342 372 340 386 362')}" fill="none" stroke="{INK}" stroke-width="8" stroke-linecap="round"/>
    <path d="{m('M322 364 L311 358')}" fill="none" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="{m('M330 376 Q353 386 378 374')}" fill="none" stroke="{SKIN_SH}" stroke-width="4" stroke-linecap="round"/>"""


BROW_L = "M302 326 C314 300 356 288 396 298 C401 305 400 314 394 319 C360 309 330 314 306 336 Z"


def head(expr="open"):
    eyes = (eye_open("L") + eye_open("R")) if expr == "open" else (eye_closed("L") + eye_closed("R"))
    brows = f'<path d="{BROW_L}" fill="{HAIR}" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>' \
            f'<path d="{mirror(BROW_L)}" fill="{HAIR}" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
    if expr != "open":
        brows = f'<g transform="translate(0 -6)">{brows}</g>'
    if expr == "open":
        mouth = f"""
    <clipPath id="mouth"><path d="M350 452 Q400 512 450 452 Q400 463 350 452 Z"/></clipPath>
    <path d="M342 448 Q400 524 458 448 Q400 457 342 448 Z" fill="#c4705f"/>
    <path d="M350 452 Q400 512 450 452 Q400 463 350 452 Z" fill="#5e1611"/>
    <g clip-path="url(#mouth)">
      <path d="M350 452 Q400 466 450 452 L450 471 Q400 484 350 471 Z" fill="#fff"/>
      <ellipse cx="400" cy="500" rx="22" ry="12" fill="#d9645a"/>
    </g>
    <path d="M350 452 Q400 512 450 452 Q400 463 350 452 Z" fill="none" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>"""
    else:
        mouth = f"""
    <clipPath id="mouth"><path d="M344 448 Q400 528 456 448 Q400 461 344 448 Z"/></clipPath>
    <path d="M336 444 Q400 540 464 444 Q400 453 336 444 Z" fill="#c4705f"/>
    <path d="M344 448 Q400 528 456 448 Q400 461 344 448 Z" fill="#5e1611"/>
    <g clip-path="url(#mouth)">
      <path d="M344 448 Q400 464 456 448 L456 468 Q400 482 344 468 Z" fill="#fff"/>
      <ellipse cx="400" cy="508" rx="26" ry="14" fill="#d9645a"/>
    </g>
    <path d="M344 448 Q400 528 456 448 Q400 461 344 448 Z" fill="none" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>"""

    return f"""
  <g class="head">
    <!-- ears -->
    <ellipse cx="272" cy="392" rx="24" ry="31" fill="{SKIN}" stroke="{INK}" stroke-width="7"/>
    <path d="M270 376 Q258 392 271 409" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="528" cy="392" rx="24" ry="31" fill="{SKIN}" stroke="{INK}" stroke-width="7"/>
    <path d="M530 376 Q542 392 529 409" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>

    <!-- face, with one flat shadow down the right side -->
    <path d="M282 322 C282 236 334 206 400 206 C466 206 518 236 518 322 C518 424 500 506 400 534 C300 506 282 424 282 322 Z" fill="{SKIN}"/>
    <path d="M478 236 C508 262 518 300 518 340 C518 380 512 408 504 430 L492 424 C500 394 504 360 500 320 C496 284 490 258 478 236 Z" fill="{SKIN_SH}" opacity=".7"/>
    <path d="M282 322 C282 236 334 206 400 206 C466 206 518 236 518 322 C518 424 500 506 400 534 C300 506 282 424 282 322 Z" fill="none" stroke="{INK}" stroke-width="8"/>
    <ellipse cx="322" cy="406" rx="20" ry="11" fill="{ACCENT}" opacity=".22"/>
    <ellipse cx="478" cy="406" rx="20" ry="11" fill="{ACCENT}" opacity=".22"/>

    {brows}
    {eyes}

    <!-- nose -->
    <path d="M392 360 Q388 384 384 398" fill="none" stroke="{SKIN_SH}" stroke-width="5" stroke-linecap="round"/>
    <path d="M382 400 C368 410 376 428 392 424 Q400 430 408 424 C424 428 432 410 418 400" fill="none" stroke="{INK}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- full beard: sideburns, cheeks, rounded chin, thick moustache -->
    <path d="M282 330 C278 450 306 538 362 564 Q400 580 438 564 C494 538 522 450 518 330
             C513 362 506 392 492 410 C480 425 464 434 450 440 C434 432 416 427 400 431
             C384 427 366 432 350 440 C336 434 320 425 308 410 C294 392 287 362 282 330 Z"
          fill="{HAIR}" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>
    <g fill="none" stroke="{HAIR_HI}" stroke-width="4" stroke-linecap="round">
      <path d="M302 436 Q312 472 334 498"/><path d="M498 436 Q488 472 466 498"/>
      <path d="M352 524 Q376 542 400 544"/><path d="M448 524 Q424 542 400 544"/>
      <path d="M296 384 Q300 408 310 424"/><path d="M504 384 Q500 408 490 424"/>
    </g>

    {mouth}

    <!-- hair: tall quiff swept up and back -->
    <path d="M274 352 C264 304 264 252 288 214 C302 194 318 182 338 174 C348 150 376 132 410 132
             C440 122 478 132 498 152 C522 166 539 196 539 238 C542 278 536 316 528 352
             C522 324 514 300 503 288 C491 264 466 250 434 245 C402 240 362 246 332 258
             C308 270 292 296 285 330 Z"
          fill="{HAIR}" stroke="{INK}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M336 214 C364 176 418 160 470 172 C430 176 392 192 364 220 Z" fill="{HAIR_HI}"/>
    <g fill="none" stroke="{HAIR_HI}" stroke-width="5" stroke-linecap="round">
      <path d="M352 248 Q358 202 398 172"/><path d="M432 240 Q448 198 490 178"/><path d="M470 248 Q492 216 516 202"/>
    </g>
  </g>"""


# ---------------------------------------------------------------- body

COLLAR_L = "M368 586 C346 590 322 598 306 606 L344 656 C358 644 376 634 396 644 Z"


def torso():
    body = "M180 860 C180 662 252 592 400 590 C548 592 620 662 620 860 Z"
    return f"""
  <g class="torso">
    <path d="M348 498 L348 606 Q400 624 452 606 L452 498 Z" fill="{SKIN}" stroke="{INK}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M348 520 Q400 560 452 520 L452 498 L348 498 Z" fill="{SKIN_SH}"/>
    <path d="{body}" fill="{SHIRT}"/>
    <path d="{body}" fill="url(#knit)"/>
    <path d="M548 630 C592 670 614 760 614 860 L568 860 C570 770 560 690 548 630 Z" fill="{SHIRT_SH}"/>
    <path d="{body}" fill="none" stroke="{INK}" stroke-width="8"/>
    <!-- open neck, white collar, placket -->
    <path d="M362 592 L400 656 L438 592 Z" fill="{SKIN}" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="{COLLAR_L}" fill="{WHITE}" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="{mirror(COLLAR_L)}" fill="{WHITE}" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M400 658 L400 734" stroke="{INK}" stroke-width="4" stroke-linecap="round" opacity=".55"/>
    <!-- the other arm at his side: sleeve seam, white trim, forearm -->
    <path d="M252 704 Q250 780 246 860" fill="none" stroke="{INK}" stroke-width="5" opacity=".6"/>
    <path d="M181 790 Q214 780 250 794 L246 860 L180 860 Z" fill="{SKIN}" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M181 768 Q216 758 252 770 L250 796 Q214 782 181 792 Z" fill="{WHITE}" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>
  </g>"""


def sleeve(cx, cy, angle, w=86, h=108):
    return f"""
    <g transform="rotate({angle} {cx} {cy})">
      <rect x="{cx - w / 2}" y="{cy - h / 2}" width="{w}" height="{h}" rx="32" fill="{SHIRT}" stroke="{INK}" stroke-width="7"/>
      <rect x="{cx - w / 2}" y="{cy - h / 2}" width="{w}" height="{h}" rx="32" fill="url(#knit)"/>
      <rect x="{cx - w / 2}" y="{cy - h / 2}" width="{w}" height="22" rx="11" fill="{WHITE}" stroke="{INK}" stroke-width="6"/>
    </g>"""


def open_hand(x, y):
    fingers = [((x - 28, y - 30), (x - 42, y - 92)), ((x - 8, y - 40), (x - 12, y - 110)),
               ((x + 12, y - 38), (x + 20, y - 104)), ((x + 30, y - 24), (x + 48, y - 80)),
               ((x - 40, y + 8), (x - 82, y - 16))]
    segs = "".join(f'<path d="M{a[0]} {a[1]} L{b[0]} {b[1]}"/>' for a, b in fingers)
    return f"""
    <g fill="none" stroke="{INK}" stroke-width="34" stroke-linecap="round">{segs}</g>
    <ellipse cx="{x}" cy="{y}" rx="52" ry="58" transform="rotate(10 {x} {y})" fill="{SKIN}" stroke="{INK}" stroke-width="7"/>
    <g fill="none" stroke="{SKIN}" stroke-width="20" stroke-linecap="round">{segs}</g>
    <path d="M{x - 18} {y + 20} Q{x + 4} {y + 32} {x + 26} {y + 18}" fill="none" stroke="{SKIN_SH}" stroke-width="4" stroke-linecap="round"/>"""


# ---------------------------------------------------------------- waving pose

def wave_svg(layer="all"):
    arm = f"""
  <g id="wave-arm">
    {outlined("M600 700 Q672 640 690 560 L705 410", 66)}
    {open_hand(712, 352)}
    {sleeve(634, 660, 33)}
  </g>
  <g id="motion" fill="none" stroke="{INK}" stroke-width="8" stroke-linecap="round">
    <path d="M806 268 Q828 308 812 350"/><path d="M836 238 Q868 298 842 366"/><path d="M604 250 Q584 288 598 326"/>
  </g>"""
    parts = []
    if layer in ("all", "arm"):
        parts.append(arm)
    if layer in ("all", "body"):
        parts += [torso(), head("open")]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="150 150 760 760" width="760" height="760">
{DEFS}
<g transform="translate(30 50)">{''.join(parts)}
</g>
</svg>"""


# ---------------------------------------------------------------- dj pose

def headphones():
    band = "M260 372 C248 136 552 136 540 372"
    return f"""
  <g class="headphones">
    <path d="{band}" fill="none" stroke="{INK}" stroke-width="30" stroke-linecap="round"/>
    <path d="{band}" fill="none" stroke="{ACCENT}" stroke-width="8" stroke-linecap="round" transform="translate(0 6) scale(1 .98)"/>
    <rect x="224" y="320" width="72" height="136" rx="32" fill="{INK}"/>
    <rect x="238" y="340" width="44" height="96" rx="20" fill="{ACCENT}"/>
    <rect x="504" y="320" width="72" height="136" rx="32" fill="{INK}"/>
    <rect x="518" y="340" width="44" height="96" rx="20" fill="{ACCENT}"/>
  </g>"""


def jog(cx, cy):
    return f"""
    <ellipse cx="{cx}" cy="{cy}" rx="102" ry="38" fill="{GEAR_HI}" stroke="{INK}" stroke-width="6"/>
    <ellipse cx="{cx}" cy="{cy}" rx="74" ry="27" fill="none" stroke="{INK}" stroke-width="3" opacity=".7"/>
    <ellipse cx="{cx}" cy="{cy}" rx="52" ry="19" fill="none" stroke="{INK}" stroke-width="3" opacity=".7"/>
    <ellipse cx="{cx}" cy="{cy}" rx="30" ry="11" fill="{ACCENT}" stroke="{INK}" stroke-width="3"/>"""


def controller():
    pads = lambda x0: "".join(
        f'<rect x="{x0 + i * 34}" y="808" width="28" height="14" rx="3" fill="{c}" stroke="{INK}" stroke-width="3"/>'
        for i, c in enumerate([ACCENT, "#ffb02e", "#2ec4b6", "#8a7dff"]))
    knobs = "".join(f'<circle cx="{x}" cy="{y}" r="8" fill="{WHITE}" stroke="{INK}" stroke-width="3"/>' for x in (412, 440, 468) for y in (728, 748))
    return f"""
  <g class="controller">
    <path d="M152 708 L728 708 L778 834 L102 834 Z" fill="{GEAR}" stroke="{INK}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M102 834 L778 834 L778 1006 L102 1006 Z" fill="#18181c" stroke="{INK}" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="140" cy="880" r="7" fill="{ACCENT}"/><circle cx="740" cy="880" r="7" fill="{ACCENT}"/>
    {jog(262, 760)}
    {jog(618, 760)}
    <rect x="388" y="714" width="104" height="114" rx="10" fill="#1b1b1f" stroke="{INK}" stroke-width="5"/>
    {knobs}
    <rect x="410" y="764" width="6" height="36" rx="3" fill="{INK}"/><rect x="402" y="774" width="22" height="11" rx="2" fill="{WHITE}" stroke="{INK}" stroke-width="2"/>
    <rect x="464" y="764" width="6" height="36" rx="3" fill="{INK}"/><rect x="456" y="786" width="22" height="11" rx="2" fill="{WHITE}" stroke="{INK}" stroke-width="2"/>
    <rect x="404" y="812" width="72" height="6" rx="3" fill="{INK}"/><rect x="431" y="804" width="18" height="20" rx="3" fill="{ACCENT}" stroke="{INK}" stroke-width="2.5"/>
    {pads(166)}{pads(560)}
  </g>"""


def speaker():
    big_waves = "".join(
        f'<path d="M{876 - r * 0.77:.0f} {620 - r * 0.64:.0f} A{r} {r} 0 0 1 {876 + r * 0.17:.0f} {620 - r * 0.98:.0f}" '
        f'fill="none" stroke="{c}" stroke-width="{sw}" stroke-linecap="round"/>'
        for r, c, sw in [(250, ACCENT, 8), (300, INK, 7), (350, ACCENT, 6)])
    return f"""
  <g class="speaker">
    <rect x="790" y="384" width="172" height="600" rx="18" fill="{GEAR}" stroke="{INK}" stroke-width="8"/>
    <circle cx="876" cy="454" r="30" fill="{GEAR_HI}" stroke="{INK}" stroke-width="6"/><circle cx="876" cy="454" r="10" fill="{INK}"/>
    <circle cx="876" cy="622" r="104" fill="none" stroke="{ACCENT}" stroke-width="5"/>
    <circle cx="876" cy="622" r="76" fill="{GEAR_HI}" stroke="{INK}" stroke-width="7"/>
    <circle cx="876" cy="622" r="44" fill="none" stroke="{INK}" stroke-width="4"/>
    <circle cx="876" cy="622" r="20" fill="{INK}"/>
    <circle cx="876" cy="822" r="66" fill="{GEAR_HI}" stroke="{INK}" stroke-width="7"/>
    <circle cx="876" cy="822" r="18" fill="{INK}"/>
    <!-- it's banging: shake marks, bass rings, sound pushing out -->
    <g stroke="{INK}" stroke-width="6" stroke-linecap="round">
      <path d="M770 450 L748 456"/><path d="M770 480 L744 480"/><path d="M770 510 L748 504"/>
    </g>
    <g fill="none" stroke="{ACCENT}" stroke-linecap="round">
      <path d="M752 560 Q734 600 752 640" stroke-width="7"/><path d="M728 540 Q704 600 728 660" stroke-width="6"/>
    </g>
    {big_waves}
  </g>"""


def note(x, y, s=1.0, rot=0):
    return f"""
  <g transform="translate({x} {y}) rotate({rot}) scale({s})">
    <path d="M16 -4 L16 -80 Q48 -66 42 -38" fill="none" stroke="{INK}" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="0" cy="0" rx="20" ry="15" transform="rotate(-20)" fill="{ACCENT}" stroke="{INK}" stroke-width="6"/>
  </g>"""


def dj_svg():
    place = "translate(430 318) scale(0.8) translate(-400 -360)"

    def hand(x, y, flip=1):
        fingers = "".join(
            f'<ellipse cx="{x + dx * flip}" cy="{y + 20 + dy}" rx="10" ry="14" fill="{SKIN}" stroke="{INK}" stroke-width="4.5"/>'
            for dx, dy in ((-21, 0), (-7, 4), (7, 4), (21, 0)))
        return f"""
    {fingers}
    <ellipse cx="{x}" cy="{y}" rx="34" ry="24" fill="{SKIN}" stroke="{INK}" stroke-width="6"/>
    <ellipse cx="{x - 32 * flip}" cy="{y + 6}" rx="11" ry="16" transform="rotate({-30 * flip} {x - 32 * flip} {y + 6})" fill="{SKIN}" stroke="{INK}" stroke-width="4.5"/>"""

    def short_sleeve(d):
        return outlined(d, 66, SHIRT, 7)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
{DEFS}
{speaker()}
{note(150, 280, 0.95, -12)}
{note(690, 220, 0.8, 10)}
<g transform="{place}">
  {torso()}
  <g transform="rotate(-5 400 560)">
    {head("closed")}
    {headphones()}
  </g>
</g>
{controller()}
<g class="arms">
  {outlined("M300 592 Q246 628 238 690 Q244 736 270 756", 42)}
  {outlined("M560 592 Q614 628 624 690 Q618 736 600 754", 42)}
  {short_sleeve("M300 592 Q276 606 266 628")}
  {short_sleeve("M560 592 Q584 606 594 628")}
  <path d="M232 640 Q262 650 294 632" fill="none" stroke="{INK}" stroke-width="22" stroke-linecap="round"/>
  <path d="M232 640 Q262 650 294 632" fill="none" stroke="{WHITE}" stroke-width="10" stroke-linecap="round"/>
  <path d="M566 632 Q598 650 628 640" fill="none" stroke="{INK}" stroke-width="22" stroke-linecap="round"/>
  <path d="M566 632 Q598 650 628 640" fill="none" stroke="{WHITE}" stroke-width="10" stroke-linecap="round"/>
  {hand(268, 754)}{hand(602, 752, -1)}
</g>
</svg>"""


# ---------------------------------------------------------------- render

def render(svg, name, size, scale):
    tmp = tempfile.mkdtemp()
    src, png = os.path.join(tmp, name + ".svg"), os.path.join(tmp, name + ".png")
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
