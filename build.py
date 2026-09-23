import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen3 as g

HERE = os.path.dirname(os.path.abspath(__file__))

couple = open(os.path.join(HERE, 'assets/couple_webp.datauri')).read().strip()
dance = open(os.path.join(HERE, 'assets/dance_webp.datauri')).read().strip()
body = open(os.path.join(HERE, 'body3.html')).read()
css = (open(os.path.join(HERE, 'style3.css')).read()
       .replace('{{DUST}}', g.dust_css())
       .replace('{{GRAIN}}', g.grain_uri())
       .replace('{{SCALLOP}}', g.scallop_uri()))
js = open(os.path.join(HERE, 'app3.js')).read()

body = (body.replace('{{STICKER}}', g.sticker())
            .replace('{{DAYS}}', g.days_html())
            .replace('{{CLAP}}', g.clapper('v', cls='clap'))
            .replace('{{VTEXT}}', g.vtext_html())
            .replace('{{FRAMES}}', g.frames_html())
            .replace('{{CREDITS}}', g.credits_html())
            .replace('{{COUPLE}}', couple)
            .replace('{{DANCE}}', dance))

head = '''<!DOCTYPE html>
<html lang="en" class="nojs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Yash &amp; Muskan · 20–21 November 2026</title>
<meta name="description" content="Yash weds Muskan. 20 and 21 November 2026, Express Inn, Nashik.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0A0308">
<script>document.documentElement.className='js';</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rozha+One&family=Bebas+Neue&family=Yatra+One&family=Yellowtail&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
''' + css + '''
</style>
</head>
<body>
''' + body + '''
<script>
''' + js + '''
</script>
</body>
</html>
'''

# v2 variant (noindex, as built)
out_dir = os.path.join(HERE, 'dist')
os.makedirs(os.path.join(out_dir, 'v2'), exist_ok=True)
with open(os.path.join(out_dir, 'v2', 'index.html'), 'w') as f:
    f.write(head)

# root/canonical variant: same content, minus the noindex meta tag
root_html = head.replace('<meta name="robots" content="noindex">\n', '')
with open(os.path.join(out_dir, 'index.html'), 'w') as f:
    f.write(root_html)

print(f"Built {len(head)} bytes -> dist/v2/index.html")
print(f"Built {len(root_html)} bytes -> dist/index.html")
print("Note: dist/v1/index.html (the old traditional-design backup with RSVP) has no")
print("generator here — it's preserved only as already-built HTML in the deploy repo's")
print("main branch at v1/index.html. Copy it over manually if reassembling a full deploy folder.")
