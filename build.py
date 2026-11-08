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
<title>Yash weds Dr. Muskan · Wedding 20–21 November 2026 · Express Inn, Nashik</title>
<meta name="description" content="Yash Jatia weds Dr. Muskan Choudhari on 20–21 November 2026 at Express Inn, Nashik. Wedding schedule, venue, directions and travel details.">
{{ROBOTS}}
<link rel="canonical" href="https://yashkimuskan.com/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Yash weds Dr. Muskan">
<meta property="og:url" content="https://yashkimuskan.com/">
<meta property="og:title" content="Yash weds Dr. Muskan · 20–21 November 2026">
<meta property="og:description" content="Express Inn, Nashik. The Jatia &amp; Choudhari families invite you to two days of celebration.">
<meta property="og:image" content="https://yashkimuskan.com/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Yash and Dr. Muskan illustration, 20–21 November 2026, Express Inn, Nashik">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Yash weds Dr. Muskan · 20–21 November 2026">
<meta name="twitter:description" content="Express Inn, Nashik. The Jatia &amp; Choudhari families invite you to two days of celebration.">
<meta name="twitter:image" content="https://yashkimuskan.com/og.jpg">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script type="application/ld+json">{{JSONLD}}</script>
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

import json, re, shutil
def _plain(t): return re.sub(r'<[^>]+>','',t).replace('&middot;','·').replace('&amp;','&')
_sub=[]
for d in g.DAYS:
    for t,tm,nm,pl in d['ev']:
        _sub.append({"@type":"Event","name":_plain(nm)+" · Yash weds Dr. Muskan","startDate":t,
                     "location":{"@type":"Place","name":"Express Inn, Nashik · "+_plain(pl).split(' · ')[-1]}})
JSONLD = json.dumps({
  "@context":"https://schema.org","@type":"Event",
  "name":"Yash weds Dr. Muskan",
  "alternateName":["Yash and Muskan wedding","Yash Jatia and Muskan Choudhari wedding"],
  "description":"Wedding of Yash Jatia and Dr. Muskan Choudhari, 20–21 November 2026 at Express Inn, Nashik.",
  "startDate":"2026-11-20T12:00:00+05:30","endDate":"2026-11-21T23:00:00+05:30",
  "eventStatus":"https://schema.org/EventScheduled",
  "eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode",
  "location":{"@type":"Place","name":"Express Inn","address":{"@type":"PostalAddress","addressLocality":"Nashik","addressRegion":"Maharashtra","addressCountry":"IN"}},
  "image":["https://yashkimuskan.com/og.jpg"],
  "url":"https://yashkimuskan.com/",
  "organizer":{"@type":"Organization","name":"The Jatia & Choudhari families","url":"https://yashkimuskan.com/"},
  "performer":[{"@type":"Person","name":"Yash Jatia"},{"@type":"Person","name":"Dr. Muskan Choudhari","honorificPrefix":"Dr."}],
  "subEvent":_sub
}, ensure_ascii=False, separators=(',',':')).replace('</','<\\/')
head = head.replace('{{JSONLD}}', JSONLD)

# v2 variant (noindex, as built)
out_dir = os.path.join(HERE, 'dist')
os.makedirs(os.path.join(out_dir, 'v2'), exist_ok=True)
with open(os.path.join(out_dir, 'v2', 'index.html'), 'w') as f:
    f.write(head.replace('{{ROBOTS}}', '<meta name="robots" content="noindex, follow">'))

# root/canonical variant: same content, minus the noindex meta tag
root_html = head.replace('{{ROBOTS}}', '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">')  # root is the canonical, indexable copy
with open(os.path.join(out_dir, 'index.html'), 'w') as f:
    f.write(root_html)

print(f"Built {len(head)} bytes -> dist/v2/index.html")
print(f"Built {len(root_html)} bytes -> dist/index.html")
for fn in ('og.jpg','favicon.ico','favicon-192.png','apple-touch-icon.png'):
    shutil.copy(os.path.join(HERE,'assets',fn), os.path.join(out_dir,fn))
open(os.path.join(out_dir,'robots.txt'),'w').write("User-agent: *\nAllow: /\n\nSitemap: https://yashkimuskan.com/sitemap.xml\n")
import datetime
open(os.path.join(out_dir,'sitemap.xml'),'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n  <url>\n    <loc>https://yashkimuskan.com/</loc>\n    <lastmod>'+datetime.date.today().isoformat()+'</lastmod>\n    <image:image><image:loc>https://yashkimuskan.com/og.jpg</image:loc></image:image>\n  </url>\n</urlset>\n')
print("Wrote og.jpg, favicons, robots.txt, sitemap.xml -> dist/")
print("Note: dist/v1/index.html (the old traditional-design backup with RSVP) has no")
print("generator here — it's preserved only as already-built HTML in the deploy repo's")
print("main branch at v1/index.html. Copy it over manually if reassembling a full deploy folder.")
