"""Build the Lawee demo into one self-contained HTML file (template + CSS + fonts + sprite + portal + story + engine),
at public/<SLUG>/index.html. Everything is inlined, so the page works offline."""
import base64, os, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")
MEDIA = os.path.join(HERE, "media")
SLUG = "lawee-umhudb"  # the private address: https://<site>/lawee-umhudb/
OUT = os.path.join(HERE, "..", "public", SLUG, "index.html")


def read(*p):
    with open(os.path.join(*p), encoding="utf-8") as f:
        return f.read()


def data_uri(name, mime):
    with open(os.path.join(MEDIA, name), "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


fonts = {
    "{{F_CLASH}}": data_uri("ClashDisplay-Variable.ttf", "font/ttf"),
    "{{F_SATOSHI}}": data_uri("Satoshi-Variable.woff2", "font/woff2"),
    "{{F_SERIF}}": data_uri("source-serif-4-latin-400-normal.woff2", "font/woff2"),
    "{{F_SERIF_I}}": data_uri("source-serif-4-latin-400-italic.woff2", "font/woff2"),
    "{{F_SERIF_6}}": data_uri("source-serif-4-latin-600-normal.woff2", "font/woff2"),
    "{{F_MONO}}": data_uri("ibm-plex-mono-latin-400-normal.woff2", "font/woff2"),
    "{{F_MONO_5}}": data_uri("ibm-plex-mono-latin-500-normal.woff2", "font/woff2"),
}
css = read(SRC, "style.css")
for k, v in fonts.items():
    css = css.replace(k, v)
sprite = read(SRC, "sprite.svg")
# The favicon: the chameleon in Petrolio.
mark = sprite.split('<symbol id="lawee-mark" viewBox="0 0 543 543">', 1)[1].split("</symbol>", 1)[0]
favicon = "data:image/svg+xml," + urllib.parse.quote(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 543 543" style="color:#1F4A57">{mark}</svg>')
js = "\n".join([read(SRC, "portal.js"), read(SRC, "story.js"), read(SRC, "engine.js")])
html = (read(SRC, "template.html")
        .replace("{{FAVICON}}", favicon)
        .replace("{{CSS}}", css)
        .replace("{{SPRITE}}", sprite)
        .replace("{{JS}}", js))
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)
print(os.path.normpath(OUT), f"{os.path.getsize(OUT) / 1024:.1f} KB")
