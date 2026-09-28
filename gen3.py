import random, urllib.parse

def clapper(uid, cls='clap'):
    stripes=''.join(f'<path d="M{6+i*14} 2 l10 0 l-8 12 l-10 0Z" fill="{"#fff" if i%2==0 else "#161016"}"/>' for i in range(6))
    return f'''<svg class="{cls}" viewBox="0 0 72 62" aria-hidden="true"><g class="arm"><rect x="2" y="2" width="68" height="14" rx="2" fill="#161016" stroke="#F4C55A" stroke-width="1.4"/><g transform="translate(0,1)" clip-path="url(#cp{uid})">{stripes}</g></g>
<defs><clipPath id="cp{uid}"><rect x="3" y="2" width="66" height="12"/></clipPath></defs>
<rect x="2" y="20" width="68" height="40" rx="2" fill="#161016" stroke="#F4C55A" stroke-width="1.4"/><g stroke="#F4C55A" stroke-width=".9" opacity=".7"><path d="M2 32H70M2 44H70M26 20V60M48 20V60"/></g>
<rect x="2" y="16" width="68" height="4" fill="#F4C55A"/></svg>'''

def sticker():
    pts=[]
    import math
    n=16
    for i in range(n*2):
        a=math.pi*2*i/(n*2); r=48 if i%2==0 else 39
        pts.append(f'{50+r*math.cos(a):.1f},{50+r*math.sin(a):.1f}')
    return f'''<svg class="stk" viewBox="0 0 100 100" aria-hidden="true"><polygon points="{' '.join(pts)}" fill="#F0357D" stroke="#FFE29A" stroke-width="2"/>
<text x="50" y="41" text-anchor="middle" class="stt s">SHAADI OF</text><text x="50" y="59" text-anchor="middle" class="stt b">THE</text><text x="50" y="76" text-anchor="middle" class="stt b">YEAR</text></svg>'''

def scallop_uri():
    svg=("<svg xmlns='http://www.w3.org/2000/svg' width='48' height='64' viewBox='0 0 48 64'>"
         "<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#4a0a1c'/><stop offset='1' stop-color='#a01a40'/></linearGradient></defs>"
         "<path d='M0 0H48V36A24 24 0 0 1 0 36Z' fill='url(#g)'/>"
         "<path d='M0 36A24 24 0 0 0 48 36' fill='none' stroke='#F4C55A' stroke-width='2.2'/>"
         "<circle cx='24' cy='62' r='2.4' fill='#F4C55A'/></svg>")
    return "url(\"data:image/svg+xml,"+urllib.parse.quote(svg,safe="/:=' ")+"\")"

def grain_uri():
    svg=("<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>")
    return "url(\"data:image/svg+xml,"+urllib.parse.quote(svg,safe="/:=' ")+"\")"

def dust_css():
    r=random.Random(3); out=[]
    for name,tile,n,sz in (('s1',320,10,1.4),('s2',420,7,2.0),('s3',520,4,2.8)):
        gs=[]
        for _ in range(n):
            c=r.choice(['#FFE29A','#FFC26B','#FF8FB8','#FFF3DB'])
            gs.append(f'radial-gradient({sz}px {sz}px at {r.randint(0,tile)}px {r.randint(0,tile)}px,{c} 50%,transparent 52%)')
        out.append(f'#stars .{name}{{background-image:{",".join(gs)};background-size:{tile}px {tile}px}}')
    return '\n'.join(out)

FR_NAMES=[('Nourish','To keep one another fed in body and in spirit.'),
('Strength','To stand strong together, in health and in trial.'),
('Prosper','To build a home of plenty, honestly earned.'),
('Friendship',"To be, above all, each other's best friend.")]

def frames_html():
    return ''.join(f'<div class="fr" data-i="{i}"><b>{i+1}</b></div>' for i,n in enumerate(FR_NAMES))
def vtext_html():
    t=['<div class="vt vt0"><p class="vroman">OUR VOWS</p><p class="vname">Four promises<br>to each other</p><p class="vline">Made in front of everyone we love,<br>for all the years ahead.</p></div>']
    for i,(n,l) in enumerate(FR_NAMES):
        t.append(f'<div class="vt" data-i="{i+1}"><p class="vroman">VOW 0{i+1}</p><p class="vname">{n}</p><p class="vline">{l}</p></div>')
    return ''.join(t)

DAYS=[
 dict(id='d1',num='20',dow='Friday',sub='The build-up',mood='night',ev=[
  ('2026-11-20T13:00:00+05:30','1:00 PM','Lunch','Grandeur Hall'),
  ('2026-11-20T15:00:00+05:30','3:00 PM','Mayara','Groom side &middot; Express Royal'),
  ('2026-11-20T14:00:00+05:30','2:00 PM','Mayara','Bride side &middot; Grandeur Hall'),
  ('2026-11-20T18:00:00+05:30','6:00 PM','Tilak','Lawn'),
  ('2026-11-20T19:00:00+05:30','7:00 PM','Ring ceremony &amp; Sangeet','Lawn'),
  ('2026-11-20T23:00:00+05:30','11:00 PM','After party','Express Royal')]),
 dict(id='d2',num='21',dow='Saturday',sub='The main event',mood='day',ev=[
  ('2026-11-21T08:00:00+05:30','8:00 AM','Groom haldi','Grandeur Hall'),
  ('2026-11-21T10:00:00+05:30','10:00 AM','Carnival','Express Royal'),
  ('2026-11-21T15:00:00+05:30','3:00 PM','Baraat','Main Lobby'),
  ('2026-11-21T17:00:00+05:30','5:00 PM','Varmala','Lawn'),
  ('2026-11-21T18:00:00+05:30','6:00 PM','Phera','Lawn'),
  ('2026-11-21T20:00:00+05:30','8:00 PM','Reception','Lawn')])]

def days_html():
    out=[]; n=0
    for d in DAYS:
        evs=[]
        for t,tm,nm,pl in d['ev']:
            n+=1
            evs.append(f'<li class="ev rv" data-t="{t}" style="--i:{n%3}"><span class="et"><small>SCENE {n:02d}</small>{tm}</span><span class="eb"><span class="en">{nm}</span><span class="ep">{pl}</span></span><i class="tag">NEXT UP</i></li>')
        out.append(f'''<div class="day {d['mood']}" id="{d['id']}">
<div class="dayhead">{clapper(d['id'])}<span class="dtag">DAY {d['id'][1]}</span><span class="dnum">{d['num']}</span><span class="dtxt"><b>{d['dow']}</b><em>{d['sub']}</em></span></div>
<ol class="tl"><i class="tlfill"></i>{''.join(evs)}</ol></div>''')
    return '\n'.join(out)

CREDITS=[('STARRING','Yash Jatia &nbsp;&amp;&nbsp; Muskan Choudhari'),
('BLESSED BY','Sushilkumar Jatia &amp; Gayatridevi Jatia<br>Sureshkumar Choudhari &amp; Meera Choudhari'),
('PRESENTED BY','Yogesh Jatia &amp; Ambica Jatia<br>Umesh Choudhari &amp; Neha Choudhari'),
('LOCATION','Express Inn, Nashik'),
('MUSIC','Dhol, DJ and a very loud baraat'),
('CHOREOGRAPHY','Everyone, ready or not'),
('SPECIAL APPEARANCE','You')]
def credits_html():
    return ''.join(f'<div class="crd rv" style="--i:{i%2}"><span>{a}</span><b>{b}</b></div>' for i,(a,b) in enumerate(CREDITS))
