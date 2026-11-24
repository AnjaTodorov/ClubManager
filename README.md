# ClubManager

[![CI/CD](https://github.com/AnjaTodorov/ClubManager/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/AnjaTodorov/ClubManager/actions/workflows/ci-cd.yml)

[Odpri ClubManager na Renderju](https://clubmanager-22ep.onrender.com)

Spletna aplikacija za upravljanje amaterskega nogometnega kluba z več ekipami različnih starostnih kategorij. Združuje upravljanje ekip in članstev, načrtovanje treningov in tekem, evidentiranje prisotnosti, poročila o tekmah, spremljanje razpoložljivosti igralcev ter samodejni izračun statistike igralcev in ekip.

Uporabniške vloge: administrator kluba, trener, igralec in vodja ekipe.

![Nadzorna plošča igralca](docs/slike/nadzorna-plosca.png)

## Tehnologije

| Področje | Tehnologija |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| API | REST, JSON |
| Podatkovna baza | PostgreSQL |
| ORM | Prisma |
| Avtentikacija | express-session, Argon2id |
| Lokalni razvoj | Docker Compose, npm |
| Testi | Vitest, Supertest |

## Lokalni zagon

### Predpogoji

- [Node.js](https://nodejs.org/) 22 ali novejši (z npm)
- [Docker](https://www.docker.com/) z Docker Compose (Docker Desktop mora biti zagnan)
- Git

### 1. Prenos kode

```bash
git clone https://github.com/DAVIDekNOVAK/ClubManager.git
cd ClubManager
```

### 2. Podatkovna baza in poštni strežnik

```bash
docker compose up -d
```

Ukaz zažene dva vsebnika:

| Storitev | Namen | Naslov |
|---|---|---|
| `db` | PostgreSQL 16 | `localhost:5433` |
| `mail` | Mailpit – prestreže e-pošto (povabila), nič se ne pošlje na prave naslove | SMTP `localhost:1025`, spletni vmesnik <http://localhost:8025> |

> Baza na gostitelju posluša na vratih **5433** (ne 5432), da ni navzkrižja z morebitnim lokalno nameščenim PostgreSQL. Vrata lahko spremenite s spremenljivko `POSTGRES_PORT`; v tem primeru popravite tudi `DATABASE_URL` v `backend/.env`.

### 3. Backend (REST API)

```bash
cd backend
cp .env.example .env     # privzete vrednosti ustrezajo docker-compose.yml
npm install              # namesti odvisnosti in ustvari odjemalca Prisma
npm run db:deploy        # ustvari tabele (migracije)
npm run db:seed          # napolni bazo s testnimi podatki
npm run dev              # zažene API na http://localhost:3000/api
```

Delovanje preverite na <http://localhost:3000/api/health>.

### 4. Frontend

V **drugem** terminalu:

```bash
cd frontend
npm install
npm run dev              # zažene vmesnik na http://localhost:5173
```

Aplikacijo odprite na <http://localhost:5173>. Razvojni strežnik zahteve na `/api` posreduje backendu, zato dodatne nastavitve niso potrebne.

### Testni uporabniški računi

Ukaz `npm run db:seed` ustvari demo klub z dvema ekipama, tremi sezonami, treningi, tekmami in statistiko:

| Vloga | E-pošta | Geslo | Kaj lahko preizkusite |
|---|---|---|---|
| Administrator | `admin@clubmanager.si` | `Admin1234` | sezone, ekipe, članstva, arhiviranje, povabila |
| Trener (Člani) | `trener@clubmanager.si` | `Trener1234` | treningi, prisotnost, poročila o tekmah, statistika ekipe |
| Vodja ekipe (Člani) | `vodja@clubmanager.si` | `Vodja1234` | razpored tekem, nasprotni klubi |
| Igralci (Člani) | `igralec1@clubmanager.si` … `igralec16@clubmanager.si` | `Igralec1234` | potrjevanje udeležbe, razpoložljivost, osebna statistika |

`igralec1@clubmanager.si` je hkrati igralec članov ter trener in vodja ekipe U17 (uporabnik z več vlogami).

Testne podatke lahko kadarkoli ponastavite z `npm run db:seed` (skripta najprej izprazni bazo).

### Povabilo novega člana

1. Prijavite se kot administrator in na strani **Povabila** pošljite povabilo na poljuben naslov.
2. Odprite Mailpit na <http://localhost:8025> in v prejetem sporočilu kliknite povezavo za registracijo.

## Testi

Testi frontenda preverjajo odjemalca REST API brez povezave s strežnikom. Testi backenda preverjajo validacijo in pogoje sprejemljivosti uporabniških zgodb. Uporabljajo ločeno bazo `clubmanager_test` v lokalnem vsebniku PostgreSQL.

```bash
docker compose up -d db
npm --prefix frontend test
npm --prefix backend test
```

Za poročili o pokritosti zaženite `npm --prefix frontend run test:coverage` in `npm --prefix backend run test:coverage`. Poročili HTML in LCOV sta v mapi `coverage/` posamezne aplikacije.

Preverjanje tipov in produkcijska gradnja:

```bash
cd backend && npm run typecheck && npm run build
cd frontend && npm run build
```

## CI/CD in namestitev na Render

GitHub Actions pri vsakem pull requestu v `main` in pri vsakem pushu na `main` izvede tri preverjanja:

- `lint` preveri frontend in backend z ESLintom.
- `build` uporabi npm predpomnilnik, zgradi oba dela in shrani skupno sliko Docker kot artefakt `clubmanager-image`.
- `test` zažene teste frontenda in backenda s testnim PostgreSQL ter shrani obe poročili o pokritosti.

Po uspešnih preverjanjih ob pushu na `main` job `deploy` v okolju `production` prenese sliko iz joba `build`, jo objavi v GitHub Container Registry in počaka, da Render zažene objavljeno sliko. Express na istem javnem naslovu streže React in API. Nastavitev `VITE_API_URL=/api` ob gradnji usmeri zahteve na API na tem naslovu.

### Prva namestitev

1. V svojem forku omogočite GitHub Actions in v **Settings → Environments** pripravite okolje `production`. Združite pripadajoči pull request v `main`. Prvi zagon joba `deploy` objavi sliko v GHCR in v povzetku izpiše njen naslov. Dokler manjka konfiguracija Render, se job po objavi ustavi z napako.
2. Na Renderju ustvarite PostgreSQL in v isti regiji še **Web Service → Existing Image**. Kot izvor uporabite naslov slike iz povzetka joba. Za zasebno sliko dodajte registrsko poverilnico s klasičnim GitHub žetonom z dovoljenjem `read:packages`.
3. V okoljskih spremenljivkah spletne storitve nastavite `DATABASE_URL` na interni naslov baze Render, `SESSION_SECRET` na dolgo naključno vrednost in `FRONTEND_URL` na javni naslov spletne storitve, brez končne poševnice. Za prvi zagon prazne baze nastavite še `INITIAL_ADMIN_EMAIL` in `INITIAL_ADMIN_PASSWORD` (vsaj 12 znakov). Po uspešni prijavi lahko obe nastavitvi odstranite. V Renderju nastavite pot preverjanja zdravja `/api/health`. Migracije se izvedejo ob zagonu vsebnika.
4. V GitHub okolju `production` dodajte skrivnost `RENDER_API_KEY` in spremenljivki `RENDER_SERVICE_ID` ter `RENDER_APP_URL`. ID storitve ima obliko `srv-…`, URL pa je javni naslov spletne storitve. V GitHub Actions ponovno zaženite neuspešni job `deploy`.
5. Preverite prijavo na javnem naslovu.

Za e-poštna povabila nastavite `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` in `MAIL_FROM` za svojega ponudnika SMTP. Brezplačni Render blokira odhodna vrata SMTP 25, 465 in 587. Uporabite ponudnika, ki podpira vrata 2525. Brezplačni Render PostgreSQL poteče po 30 dneh. [Omejitve brezplačnega Renderja](https://render.com/docs/free)

Za bazo lahko uporabite tudi Supabase PostgreSQL. V Renderju nastavite `DATABASE_URL` na povezovalni niz Supabase v načinu **Session pooler** (vrata 5432) in uporabite isto spletno storitev. [Supabase in Prisma](https://supabase.com/docs/guides/database/prisma)

Za oddajo nastavite obvezna preverjanja `lint`, `build` in `test` v zaščiti veje `main`. Na ločenem pull requestu preverite, da napaka ESLint blokira združitev, nato jo popravite.

## Uporabni ukazi

| Ukaz (v mapi `backend/`) | Namen |
|---|---|
| `npm run dev` | razvojni strežnik s samodejnim ponovnim zagonom |
| `npm run db:migrate` | nova migracija po spremembi `prisma/schema.prisma` |
| `npm run db:deploy` | izvedba obstoječih migracij |
| `npm run db:seed` | ponastavitev testnih podatkov |
| `npm run db:reset` | izbris baze, ponovna izvedba migracij in testni podatki |
| `npm run db:studio` | pregledovalnik baze Prisma Studio |

Ustavitev okolja: `docker compose down` (podatki ostanejo) ali `docker compose down -v` (izbriše tudi podatke baze).

## Struktura repozitorija

```
ClubManager/
├── docker-compose.yml        PostgreSQL in Mailpit za lokalni razvoj
├── backend/                  REST API (Express + TypeScript)
│   ├── prisma/               shema podatkovnega modela, migracije, testni podatki
│   ├── src/
│   │   ├── common/           napake, validacija, pravice (RBAC + članstvo), datumi, e-pošta
│   │   └── modules/          moduli: auth, uporabniki, sezone, ekipe, clanstva, povabila,
│   │                         treningi, klubi, tekme, razpolozljivost, statistika
│   └── test/                 testi API-ja po uporabniških zgodbah
├── frontend/                 uporabniški vmesnik (React + Vite)
│   └── src/
│       ├── components/       skupni gradniki in gradniki po področjih
│       └── pages/            zasloni aplikacije
└── docs/                     projektna dokumentacija
```

## Implementirane funkcionalnosti (MVP)

| Funkcionalnost | Uporabniške zgodbe |
|---|---|
| F1 – Upravljanje ekip in članstev | US-01, US-02, US-03, US-04 |
| F2 – Načrtovanje treningov | US-05, US-06 |
| F3 – Evidentiranje prisotnosti | US-07, US-08 |
| F4 – Razpored tekem | US-09, US-10 |
| F5 – Poročila o tekmah | US-11, US-12, US-13 |
| F6 – Statistika igralcev in ekip | US-14, US-15 |
| F7 – Razpoložljivost igralcev | US-16, US-17 |
| Povabila in prijava | US-18, US-19, US-20 |

Pregled implementacije in ocena petih uporabniških zgodb sta v dokumentu [07 – Pregled projekta](docs/07-pregled-projekta.md). Razvoj je voden na [GitHub Project tabli](https://github.com/users/DAVIDekNOVAK/projects/3).

## Dokumentacija

- [01 – Zasnova rešitve](docs/01-zasnova-resitve.md)
- [02 – Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [03 – Podatkovni model](docs/03-podatkovni-model.md)
- [04 – Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [05 – Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [06 – Wireframes](docs/06-wireframes.md)
- [07 – Pregled projekta](docs/07-pregled-projekta.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)
