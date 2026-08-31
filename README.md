# PRODERMA PLUS — novi sajt

Statički sajt: `HTML + CSS + vanilla JS`. Bez build koraka, bez `node_modules`, bez frameworka.
Razlog je namerno: isti fajlovi idu na Vercel danas i u WordPress temu kasnije, **bez ponovnog pisanja**.

---

## Struktura

```
proderma-plus/
├── index.html          naslovna (hero, o nama, Skin Lab, usluge, tim, utisci, kontakt)
├── cenovnik.html       cenovnik sa filterom po kategorijama
├── vercel.json         cache i security headeri
└── assets/
    ├── css/style.css   ceo dizajn, sve boje kroz CSS varijable
    └── js/app.js       16 nezavisnih modula (IIFE)
```

---

## Pokretanje lokalno

Ne otvarati `index.html` duplim klikom — `fetch` ka UV API-ju pukne na `file://`.

```bash
cd proderma-plus
python3 -m http.server 8080
# ili: npx serve .
```

Otvoriti `http://localhost:8080`.

---

## Deploy na Vercel

```bash
npm i -g vercel
cd proderma-plus
vercel            # preview link za klijenta
vercel --prod     # produkcija
```

Alternativa bez CLI-ja: prevuci folder na `vercel.com/new` → Framework Preset: **Other**.
Nema build komande, output directory je root.

---

## Šta je urađeno

### Logo
`PRODERMA` + `PLUS` badge + descriptor `DERMATOVENEROLOŠKA KLINIKA · NIŠ`.
Znak su tri koncentrična luka (slojevi kože) sa `+` u jezgru.
Definisan kao inline SVG `<g id="logoFull">` / `<g id="logoLight">` — vektorski, skalabilan,
boje se povlače iz CSS varijabli pa se menja zajedno sa paletom.

**Za finalnu isporuku:** ako klijent ima originalni `.ai`/`.eps` logo, zameniti `<g id="logoFull">`
sadržajem tog fajla i zadržati `PLUS` badge.

### Tri palete
Dugme dole desno prebacuje paletu uživo — namerno, da klijent bira na sastanku.

| Paleta | Primarna | Akcenat | Ton |
|---|---|---|---|
| **Aqua Clinic** (default) | `#4E9E96` teal | `#E5A98D` breskva | najbliža postojećem brendu, medicinski čisto |
| **Sage Calm** | `#7BA286` žalfija | `#DA9F98` puder roze | organsko, umirujuće |
| **Lilac Soft** | `#8189BE` perivinkl | `#D6A0B8` roze | premium, ka estetskoj medicini |

**Pre objave:** izbrisati `<div class="pal-switch">` iz oba HTML fajla i fiksirati izabranu
paletu u `data-palette` atributu na `<html>`.

### Efekti (inspiracija: Lepa Svaki Dan)
- **Animirana mesh pozadina** — `<canvas>` sa 4–6 radijalnih blobova koji plutaju. Pauzira se kad je tab u pozadini.
- **Svetlo koje prati kursor** — dva sloja: veliki blurovan glow (lerp `.075`) + mala tačka (lerp `.30`) koja se širi nad linkovima i karticama.
- **Scroll reveal** sa stagger-om preko `IntersectionObserver`.
- **Tilt** na hero vizualu, **magnetic** dugmad, **spotlight** na karticama usluga.
- **Reveal po linijama** u H1, animirani brojači, marquee traka usluga, film-grain overlay.
- Sve poštuje `prefers-reduced-motion` i gasi se na `pointer: coarse` (mobilni).

### Skin Lab — 4 vidžeta
1. **UV indeks danas** — Open-Meteo API (bez ključa, bez registracije). Gauge, nivo, graf po satima, vrhunac dana. Bira se Fitzpatrick fototip (I–VI) → procena vremena do prvog crvenila + preporučeni SPF. Dugme za geolokaciju.
2. **Kviz tipa kože** — 6 pitanja, skoring po 6 dimenzija (suva / masna / mešovita / osetljiva / zrela / hiperpigmentacije) → rezultat + 3 konkretna tretmana iz Proderma ponude. Lead generator.
3. **ABCDE samopregled mladeža** — 5 kartica sa custom SVG ilustracijama + CTA ka dermoskopiji.
4. **Sezonski kalendar nege** — svih 12 meseci, otvara se na tekućem. Uz live temperaturu i vlažnost vazduha za Niš sa tumačenjem šta to znači za kožu.

---

## Medicinska odgovornost — pročitati

UV vidžet **ne** kaže „štetno / nije štetno“. Daje broj, nivo i vremensku procenu po modelu
minimalne eritemske doze:

```
minuta_do_eritema = MED[fototip] / (UV_indeks × 1.5)
MED (J/m²): I=200, II=250, III=350, IV=450, V=600, VI=1000
```

Provereno: fototip II na UV 8 → ~21 min. WHO/INTERSUN za svetlu kožu na UV 8 navodi 15–25 min. Model je u opsegu.

Ispod svakog vidžeta stoji disclaimer da je procena informativna i da ne zamenjuje pregled.
**Ne uklanjati te blokove** — to je sajt zdravstvene ustanove.

---

## Šta treba od klijenta pre objave

- [ ] **Cenovnik** — sve cene su `na upit`. Zameniti stvarnim iznosima ili obrisati redove koje klinika ne pruža.
- [ ] **Fotografije tima** — trenutno su inicijali u gradijentu. Zameniti `<span class="tm-init">` sa `<img>` u sekciji `#tim`.
- [ ] **Slike** — hero i „o nama“ trenutno vuku slike sa `proderma.rs`. Skinuti ih, konvertovati u WebP i staviti u `assets/img/`. Hotlink sa starog sajta nije rešenje za produkciju.
- [ ] **Brojke u heroju** — `7 članova tima`, `20+ tretmana`, `3× profesora` su prebrojani sa starog sajta. Potvrditi sa klinikom.
- [ ] **Forma** — sada je demo bez servera. Za Vercel: `api/kontakt.js` serverless funkcija + Resend/SendGrid. Za WordPress: Contact Form 7 ili WPForms.
- [ ] **Galerija i Vesti** — postoje na starom sajtu, nisu prenete. Reći da li ostaju.
- [ ] **Politika privatnosti / GDPR** — obavezna za zdravstvenu ustanovu koja prikuplja podatke kroz formu.

---

## Migracija u WordPress (kasnije)

Ovo je razlog zašto sajt nije rađen u Next.js-u. Koraci:

1. **Custom tema**, ne page builder. Elementor bi razbio canvas pozadinu i cursor glow.
2. Podela `index.html`:
   - topbar + header + `<svg><defs>` sprite → `header.php`
   - sekcije naslovne → `front-page.php`
   - footer + FAB + skripte → `footer.php`
   - `cenovnik.html` → `page-cenovnik.php`
3. `assets/` kopirati 1:1 u temu, uključiti preko `wp_enqueue_style` / `wp_enqueue_script` u `functions.php`. **JS se ne dira.**
4. Putanje: `assets/...` → `<?php echo get_template_directory_uri(); ?>/assets/...`
5. Sadržaj u ACF:
   - Usluge → custom post type `usluga` (naziv, opis, tagovi, ikona)
   - Tim → CPT `clan_tima`
   - Utisci → CPT `utisak`
   - Cenovnik → ACF repeater (kategorija → stavke → cena)
6. Skin Lab vidžeti ostaju čisti JS — nijedan ne traži backend. Sadržaj kalendara i kviza po želji preseliti u ACF options page da klinika može sama da menja tekstove.
7. Za Vercel-only period: ništa dodatno.

**Procena:** 2–3 dana za temu jednom kada je dizajn odobren, jer se prepisuje samo struktura, ne i CSS/JS.

---

## Performanse i pristupačnost

- Nula JS zavisnosti. Ukupno ~120 KB nekompresovano, ~30 KB gzip.
- Slike lazy-load, mesh pauzira van fokusa tab-a.
- `prefers-reduced-motion` gasi sve animacije.
- Semantički HTML, `aria-label` na ikonskim linkovima, vidljiv focus ring, kontrast teksta iznad 4.5:1.
- Jedini eksterni resursi: Google Fonts, Open-Meteo API, Google Maps embed.

---

## Poznata ograničenja

- **Google Fonts** — po strogom tumačenju GDPR-a treba ih hostovati lokalno. Preporučeno pre objave.
- **Open-Meteo** je besplatan bez ključa, ali bez SLA. Ako fetch padne, vidžet prikazuje „Podatak nedostupan“ i opšti savet — nikad prazan ekran.
- **Geolokacija** traži HTTPS. Radi na Vercelu, ne radi na `http://localhost` u nekim browserima.
- Google Maps embed postavlja kolačiće — pokriti cookie noticom.

---

## WOW sloj — dodato u drugoj rundi, spojeno u trećoj

Efekti su originalno stigli u posebnim fajlovima: `assets/css/wow.css` (~280 linija) i
`assets/js/wow.js` (~560 linija), učitani u sve tri stranice **posle** osnovnih fajlova.
Ta dva fajla su od tada **spojena** u `assets/css/style.css` i `assets/js/app.js` (razdelnik
"WOW SLOJ — spojeno iz wow.css/wow.js" obeležava gde počinje taj deo u svakom fajlu) — sada
postoji samo jedan CSS i jedan JS fajl na sajtu. Da se ceo sloj isključi, više nije dovoljno
obrisati jedan red; treba ručno ukloniti odgovarajući blok označen tim razdelnikom.

Usput je uklonjen i **FlowingMenu** (slika koja prati kursor u sekciji Usluge, opisan ispod) —
sukobljavao se sa novijim dizajnom kartica (dupli, međusobno suprotstavljeni CSS za `.svc-row`)
i pravio vizuelni bag: kursor-prateća kopija slike koja iskače van kartice. Kartice Usluga sada
imaju samo jedan, aktivni hover-dizajn (širenje opisa + dugme "Pogledaj cenu").

### Efekti (logika portovana sa reactbits.dev u vanilla JS)

| Efekat | Gde | Napomena |
|---|---|---|
| **Aurora** | pozadina celog sajta | WebGL shader, 4-oktavni simpleks fbm. Boje čita iz `--glow-a/b/c`, prati promenu palete kroz `MutationObserver`. Ako nema WebGL-a, canvas se ukloni i ostaje postojeći mesh. |
| **Inercijalni skrol** | globalno | `lenis` logika u 40 linija. Gasi `scroll-behavior:smooth` (tukli su se) i preuzima kotve kroz isti tween. Samo miš — touch ostaje nativan. |
| **Page transition** | između stranica | Zavesa gore/dole, `sessionStorage` pamti da je prelaz u toku. Deluje kao SPA. |
| **TiltedCard + Glare** | kartice tima | 3D nagib + sjaj koji prati kursor. |
| **ClickSpark** | globalno | 9 varnica na klik mišem. |
| **StarBorder** | primarna dugmad | Konusni gradijent u rotaciji preko `@property --sb-a`, sa `@supports` fallback-om. |
| **ScrollStack** | Utisci | 5 recenzija se slažu jedna preko druge uz skaliranje. |
| **ScrollVelocity** | traka opreme | Marquee ubrza srazmerno brzini skrola. |
| **GooeyNav pill** | header | Pozadina klizi ispod linka pod kursorom. |
| **Kursor sa kontekstom** | globalno | „PREVUCI", „VIDI", „CENA", „PROFIL" zavisno od elementa. |

### Nove sekcije

- **`#rezultati` — Pre / Posle.** Drag slider (pointer events + tastatura + `role="slider"`),
  5 tretmana u tabovima, uvodni sweep kad sekcija uđe u vidno polje.
- **Traka opreme** iznad Rezultata — 6 tehnologija, infinite marquee.
- **Utisci** prerađeni u ScrollStack, 5 recenzija + Google 4.9★ badge.
- **Sticky CTA na mobilnom** — „Pozovi" + „Zakaži pregled", pojavljuje se posle heroja.

### Tier 2 — dodato u trećoj rundi

| Efekat | Gde | Napomena |
|---|---|---|
| **Sticky storytelling** | nova sekcija `#put` | „Vaš put kod nas" — 4 koraka. Vizual je CSS-om pinovan, JS bira koja je slika aktivna po tome koji je korak najbliži 42% visine ekrana. Na mobilnom se pin gasi i svaki korak nosi svoju sliku. |
| **Horizontalni skrol** | nova sekcija `#tehnologija` | 6 kartica opreme. Visina sekcije se računa iz `track.scrollWidth - innerWidth`, pa se traka pomera po napretku kroz sekciju. Ispod 940px pin se gasi i prelazi u swipe sa `scroll-snap`. |
| **Bio na tim karticama** | `#tim` | Hover/fokus otvara biografiju kroz `grid-template-rows: 0fr → 1fr` (animira se bez fiksne visine). Na `pointer:coarse` je uvek otvorena. Kartice su dobile `tabindex` da bio bude dostupan i tastaturom. |

**Dark mode nije implementiran** — klijent traži samo svetli mod.

#### Merenja koja se lako pokvare

`techScroll` računa visinu sekcije iz širine trake. Ako se doda ili ukloni kartica,
ili se promeni `flex-basis`, visina se preračuna sama na `resize` i na `load` svake slike.
Ali ako se kartice ubacuju dinamički posle učitavanja (npr. iz ACF-a u WordPress-u),
treba pozvati `dispatchEvent(new Event('resize'))` posle ubacivanja.

#### Sadržaj koji treba potvrditi sa klinikom

- [ ] **Biografije 7 članova tima** — napisane su na osnovu titula sa starog sajta.
      Uže oblasti i reference su pretpostavka. Obavezno dati klinici da pročita.
- [ ] **Opisi opreme** u sekciji Tehnologija — brojevi („uvećanje do 70 puta", „48 sati")
      su standardne vrednosti za te metode, ali potvrditi za konkretne aparate koje klinika ima.
- [ ] **Fotografije opreme** — trenutno su slike enterijera iz galerije. Ako klinika ima
      fotografije samih aparata, zameniti; sekcija se time znatno pojačava.
- [ ] **Trajanja u „Vaš put kod nas"** („20–30 minuta", „odgovor isti dan") — potvrditi
      da je to realno obećanje koje klinika može da ispuni.

### Slike — rešeno

Svih **30 slika je skinuto lokalno** u `assets/img/`. Hotlinka ka `proderma.rs` više nema
nigde — hero ne može da ostane prazan ako padne net na prezentaciji.
`data-remote` atributi su ostavljeni u HTML-u kao dokumentacija porekla; ne koriste se.

### Pre objave — dopuna postojeće liste

- [ ] **Before/after fotografije su demonstracione** (Unsplash). Zameniti stvarnim parovima iz
      kartona, uz **pisanu saglasnost pacijenta** — Zakon o pravima pacijenata, čl. 21.
      Do tada disclaimer ispod slajdera ostaje.
- [ ] **Google ocena 4.9** je pretpostavljena. Proveriti stvarnu ocenu na Google Business profilu
      pre objave, ili ukloniti badge.
- [ ] **Tri nove recenzije** (Ana S., Nevena P., Dušan J.) su napisane kao popuna za demo.
      Zameniti stvarnim recenzijama sa Google-a ili obrisati.
- [ ] **Nazivi opreme** u traci potvrditi sa klinikom — navedeno je ono što piše na starom sajtu.

### Poznati kompromisi

- Inercijalni skrol presreće `wheel`. Elementi koji imaju sopstveni skrol moraju da nose
  `data-noscroll` (već pokriveni: `.ba`, `select`, `textarea`, mobilni meni).
- Aurora je `position:fixed` sa `z-index:-3` — ispod svega, iznad body pozadine.
  Ako se u WordPress temi doda element sa negativnim z-index-om, proveriti redosled.
- WebGL na starijim Intel integrisanim GPU-ovima ume da troši bateriju. Ako se to pokaže
  kao problem, `#aurora` se gasi jednim redom u `app.js` (WOW deo, sekcija Aurora).

### Pokretanje na Macu

`POKRENI-SAJT.command` — dupli klik. Nalazi slobodan port od 8080 naviše, diže server
i otvara browser. Prozor terminala mora da ostane otvoren dok traje prezentacija.

Ako macOS odbije da pokrene skriptu („nepoznat developer"): desni klik → Open → Open.
