# Fotografija za hero — specifikacija

Sajt je pripremljen za **jednu široku fotografiju** preko celog heroja.
Stavi je kao `assets/img/hero-full.jpg` i režim se uključuje sam.
Ako tog fajla nema, sajt se vraća na dve bočne fotografije — ništa ne puca.

---

## 1. Tehnički zahtevi

| Stavka | Vrednost |
|---|---|
| Format | JPG (ili WebP, pa preimenuj u `hero-full.jpg` i promeni putanju) |
| Dimenzije | **2400 × 1400 px** minimum |
| Odnos stranica | ~16:9 do 16:10 (širi je bolji nego viši) |
| Težina fajla | **ispod 400 KB** posle kompresije — hero se učitava prvi |
| Putanja | `assets/img/hero-full.jpg` |

Za kompresiju: [squoosh.app](https://squoosh.app) → MozJPEG, kvalitet 72–78.
Iznad 400 KB primetno usporava prvi utisak na mobilnom.

---

## 2. Kompozicija — ovo je najvažnije

Preko slike ide naslov, podnaslov i dva dugmeta. Zato:

**Centar mora biti prazan i svetao.**
Zamisli vertikalnu traku od ~35% do ~65% širine slike — u njoj ne sme biti
ničeg bitnog. Ni predmeta, ni tamnih površina, ni jakog kontrasta.
Sav sadržaj ide u levu i desnu trećinu.

```
┌────────────┬──────────────┬────────────┐
│            │              │            │
│  sadržaj   │   PRAZNO     │  sadržaj   │
│  (police,  │   svetlo     │  (oprema,  │
│   detalji) │   ovde ide   │   detalj)  │
│            │   tekst      │            │
└────────────┴──────────────┴────────────┘
     35%           30%            35%
```

Sajt preko slike ionako stavlja mekani svetli preliv u centru, ali ako je
ispod njega tamna ili šarena površina, tekst gubi čitljivost.

**Donjih ~12% ostaje čisto** — tu je traka sa brojkama i radnim vremenom.

---

## 3. Zabranjeno — ovo je sajt zdravstvene ustanove

Ne sme da se nađe na slici:

- **Čitljiv tekst bilo koje vrste.** Etikete proizvoda, natpisi na aparatima,
  posteri na zidu, brošure. AI generatori tu izmišljaju besmislice
  (`CLDANXEA`, `GLENISEX`, `Estetific poster`) koje na medicinskom sajtu
  izgledaju kao lažni brendovi.
- **Prepoznatljive bočice kozmetike.** Pacijent koji ih vidi pretpostavlja
  da ih klinika drži i prodaje.
- **Lažni anatomski prikazi** (preseci kože, dijagrami slojeva epiderma).
  Ako se prikazuje anatomija, mora biti tačna i ne sme delovati kao da je
  klinikin edukativni materijal.
- **Ekrani aparata sa prikazanim nalazom.** To je izmišljen klinički nalaz.
- **Lica i prepoznatljive osobe**, osim ako klinika ima potpisanu saglasnost.

Ako alat ubaci nešto od ovoga, retuširaj ili generiši ponovo.

---

## 4. Prompt za AI generator

Na engleskom — modeli daju bolje rezultate. Zalepi kako jeste:

```
Wide cinematic interior photograph of a modern, luxurious dermatology
clinic treatment room. Soft natural daylight from the left. Palette:
warm ivory, cream, pale blush pink, soft rose, brushed gold accents,
white marble. Shallow depth of field.

Composition: the CENTER THIRD of the frame must be empty, bright and
uncluttered — a clean softly-lit wall or open floor with nothing in it.
All visual interest is in the left and right thirds.

Left third: an out-of-focus glass shelf with unbranded, plain white and
amber cosmetic containers, no labels, no text, blurred.
Right third: a modern medical skin-analysis device on a clean cart,
screen switched off, neutral white and chrome.

No text anywhere. No logos. No brand names. No readable labels.
No posters. No diagrams. No people. No faces.

Photorealistic, editorial interior photography, 35mm, natural colour,
gentle contrast, airy and calm. Aspect ratio 16:9.
```

**Negative prompt** (ako alat ima to polje):

```
text, letters, words, logos, brand names, labels, packaging text,
posters, charts, anatomical diagrams, screens with images, people,
faces, hands, watermark, oversaturated, harsh shadows, clutter,
busy center, dark center
```

Posle generisanja **uveličaj sliku na 100% i pregledaj svaku etiketu i
zid.** Modeli često ubace sitan nečitak tekst koji na velikom ekranu
postane vidljiv.

---

## 5. Alternative bez AI-ja

AI slika je najbrža, ali nije jedina opcija i nije nužno najbolja.

**Fotograf u ordinaciji** — jedan sat rada rešava hero, galeriju, sekciju
O nama i portrete tima odjednom. Za sajt koji ide klijentu na odobrenje
ovo je najjači potez: sve je stvarno, sve je njihovo, nema pitanja licence.

**Licencirani stock** — Unsplash i Pexels imaju besplatne fotografije
klinika i kozmetike sa slobodnom komercijalnom upotrebom. Traži:
`dermatology clinic interior`, `aesthetic clinic treatment room`,
`minimal skincare shelf`. Proveri licencu pre upotrebe.

**Njihove postojeće fotografije** — otvori `izbor-slika.html` u browseru;
tamo su sve fotografije sa starog sajta sa živim pregledom heroja.

---

## 6. Kad dobiješ sliku

1. Ubaci je kao `assets/img/hero-full.jpg`
2. Osveži sajt sa `Ctrl+Shift+R`
3. Proveri čitljivost naslova — ako se gubi, javi mi pa pojačam preliv
4. Proveri na telefonu — mobilni kadrira uži isečak iz centra slike
