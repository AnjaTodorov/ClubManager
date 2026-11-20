# 07 – Pregled projekta ClubManager

ClubManager je spletna aplikacija za vodenje amaterskega nogometnega kluba. Uporabniški vmesnik je napisan v Reactu, poslovna pravila in pravice uveljavlja modularni REST API v Expressu, podatki pa so v PostgreSQL prek Prisme. Prijava uporablja strežniške seje. Statistika se izračuna iz zabeleženih treningov in tekem. [Arhitektura](04-arhitektura-in-tehnoloski-sklad.md) · [Arhitekturne odločitve](adr/)

## Implementirane funkcionalnosti MVP

- Upravljanje sezon, ekip in članstev, dodeljevanje vlog ter arhiviranje ekip.
- Načrtovanje, urejanje in odpoved treningov, potrjevanje udeležbe igralcev ter evidenca dejanske prisotnosti z zgodovino sprememb.
- Razpored tekem in evidenca nasprotnih klubov, pregled razpoložljivosti igralcev ter poročila z rezultatom, postavo, minutami in dogodki. Trener lahko popravi tudi potrjeno poročilo.
- Pregled osebne in ekipne statistike po sezonah ter vnos razpoložljivosti igralcev.
- Prijava, odjava in registracija prek e-poštnih povabil.

## Ocena petih uporabniških zgodb

Izbral sem pet zgodb, ki pokrijejo administracijo kluba, delo trenerja in vključitev novega člana. Pri vsaki sem primerjal pogoje sprejemljivosti s kodo uporabniškega vmesnika, pravili v API-ju in obstoječimi testi. [Uporabniške zgodbe](05-uporabniske-zgodbe.md)

| Zgodba | Ocena | Ugotovitev |
| --- | --- | --- |
| US-01 – Ustvarjanje sezone | Delno ustreza | Administrator lahko ustvari sezono. API preveri obvezna polja, vrstni red datumov in prekrivanje. Zaključene sezone ostanejo na voljo v statistiki. Status se ob vsakem branju izračuna iz datumov. Ker lahko administrator vnese tudi neprekrivajoče se obdobje v preteklosti ali obdobje, ki vključuje današnji dan, lahko novo ustvarjena sezona takoj dobi status »Zaključena« ali »Aktivna«. Pogoj 3 določa, da nova sezona dobi status »Načrtovana«. [API](../backend/src/modules/sezone/routes.ts) · [Testi](../backend/test/sezone.test.ts) |
| US-08 – Evidentiranje dejanske prisotnosti | Ustreza po pregledu kode | Seznam upošteva članstvo na dan treninga, začetni izbor pa prijavo igralca. Trener ima tri izbire in gumb »Označi vse prisotne«. Po začetku treninga lahko evidenco shrani, trening dobi status »Izveden«, poznejši popravki pa so vidni v zgodovini z avtorjem, časom ter staro in novo vrednostjo. [Zaslon](../frontend/src/pages/Prisotnost.tsx) · [Testi](../backend/test/prisotnost.test.ts) |
| US-11 – Vnos rezultata in postave | Ustreza po pregledu kode | Trener odpre poročilo po terminu tekme. Izbira igralce z veljavnim članstvom in potrdi opozorilo za odsotnega ali poškodovanega igralca. Poročilo lahko shrani kot osnutek. Potrditev zahteva enajst igralcev v začetni postavi in celoštevilske minute od 0 do 120. Zaključena tekma se upošteva v statistiki. [Zaslon](../frontend/src/pages/Porocilo.tsx) · [Testi](../backend/test/porocilo.test.ts) |
| US-15 – Pregled statistike ekipe | Ustreza po pregledu kode | Povzetek prikaže izide in gole za izbrano sezono. Tabela vključuje nastope, minute, gole, asistence, kartone in prisotnost. Klik na glavo stolpca razvrsti podatke, klik na igralca odpre njegovo statistiko po sezonah. Trener ima dostop do svojih ekip, administrator do vseh. [Zaslon](../frontend/src/pages/StatistikaEkipe.tsx) · [Testi](../backend/test/statistika-ekipe.test.ts) |
| US-18 – Pošiljanje povabila | Ustreza po pregledu kode | Administrator izbere e-poštni naslov, ekipo, sezono in vlogo. Registracijska povezava velja sedem dni in je enkratna. Povabilo za obstoječi račun je zavrnjeno. Seznam prikazuje statuse in ponuja ponovno pošiljanje poteklih povabil. [Zaslon](../frontend/src/pages/Povabila.tsx) · [Testi](../backend/test/povabila.test.ts) |

## Lokalno preverjanje

Pri lokalnem zagonu sem s podatki iz `db:seed` preveril odziv frontenda in API-ja, prijavo administratorja prek razvojnega posrednika Vite ter dostop do statistike zaključene sezone prek API-ja. Na ločeni lokalni podatkovni bazi je uspelo vseh 120 obstoječih testov backenda.

### Ročno preverjanje v brskalniku

- **Sezone.** Kot administrator poskusi shraniti sezono s koncem pred začetkom in nato še sezono s prekrivajočimi se datumi. Preveri prikaz obeh napak in v statistiki ekipe Člani izberi zaključeno sezono.
- **Prisotnost.** Kot trener odpri že izveden trening, klikni »Označi vse prisotne«, spremeni eno vrednost in shrani. Znova odpri zaslon in v zgodovini preveri avtorja, čas ter staro in novo vrednost.
- **Poročilo.** Kot trener pri pretekli tekmi brez poročila shrani osnutek z manj kot enajstimi igralci v začetni postavi. Preveri, da ga lahko znova odpreš in da je potrditev onemogočena. Dopolni začetno postavo na enajst igralcev, potrdi poročilo in preveri, ali se je tekma vključila v statistiko ekipe.
- **Statistika.** Na strani ekipe Člani dvakrat klikni glavo stolpca »Minute«, nato odpri igralca in zamenjaj sezono.
- **Povabila.** Kot administrator pošlji povabilo na nov testni naslov, v [Mailpitu](http://localhost:8025) odpri sporočilo in registracijo dokončaj v zasebnem oknu. Preveri, da je status »Sprejeto« in da iste povezave ni mogoče ponovno uporabiti.
