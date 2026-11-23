# Designthesis ADK Cleaning (concept)

**Subject, publiek, taak:** glas-, gevel- en dakreiniger die heel Nederland op locatie bedient. Particuliere woningbezitters, bedrijfspanden en VvE-beheerders. De ene taak: een offerte aanvragen of direct bellen/appen.

**Signatuur: de veeg.** Eén beweging die het vak laat zien: een lat (trekker) haalt vuil van glas en laat een streeploos vlak achter. Hoek van de lat: 4 graden. Dezelfde hoek keert terug in de sectieranden, de voor-en-na-lat en de wipe van de dienstpanelen. Er is geen tweede decoratief idee.

**Type**
- Logo: het eigen ADK-merkteken van de huidige site (navy #132B49, cyaan #00C8D4, oranje #FF8500) met de naam in Plus Jakarta Sans Bold. Niet aangepast, wel geanimeerd (tekent zich, hover-veeg).
- Display: Bricolage Grotesque (variabel, breedte-as 76 tot 88 voor hoge, smalle koppen), zwaar gewicht.
- Body: Hanken Grotesk 400 tot 700.
- Geen mono, geen eyebrows, cijfers alleen waar een echte volgorde bestaat (werkwijze).

**Kleur (OKLCH, contrast gemeten met `tools/contrast.mjs`, alles ≥ 4,5:1)**
| Token | Waarde | Rol |
| --- | --- | --- |
| kozijn | oklch(.24 .012 235) | tekst en donkere vlakken, antraciet als een kozijn |
| glas | oklch(.975 .006 215) | pagina, daglicht |
| spiegel | oklch(.93 .022 220) | lucht in glas, rustige sectie |
| staal | oklch(.46 .022 235) | secundaire tekst |
| glaskant | oklch(.46 .075 190) | het groen van de rand van floatglas: accent op licht |
| signaal | oklch(.74 .17 55) | uitsluitend actie: CTA en de lat |

De oranje van de huidige site blijft bestaan als signaalkleur (klantherkenning), maar de navy/cyaan-verloop-look verdwijnt.

**Ruimte en vorm:** een gevelraster. Rechthoeken met 3 px radius, geen pillen, geen bubbels. Donkere vlakken lezen als kozijnen. Eén content-rail (max 1360 px).

**Beeld:** echte ADK-foto's en film, met in de hero iemand die echt aan het reinigen is. In dit prototype staan stand-ins (twee vrije foto's van Wikimedia Commons, rest van de huidige site), gemarkeerd als voorbeeld. De vuilfilm en de vuile gevel in de voor-na-lat zijn procedureel (canvas).

**Beweging:** één georkestreerd moment (hero-veeg), daarna alleen functionele beweging: panelen die openveegt, een lat die je sleept, een lijn die meegroeit. Koppen staan stil (een wipe van links naar rechts bleek vervelend); foto's komen van onder naar boven in beeld. Geen fade-up op elke sectie, geen hover-lift, geen ambient loops. `prefers-reduced-motion`: geen Lenis, geen film, alles direct schoon.

**Uitlijning:** koppen links, rail gedeeld door nav, secties en footer; hero-tekst, feitenstrook en alle secties delen dezelfde rail.

**Bewust vermeden:** gecentreerde gradient-hero, drie gelijke icoonkaarten, glaskaarten, near-black + neon, crème + serif, pill-knoppen, stat-strip met verzonnen cijfers, logo-muur, verzonnen reviews.
