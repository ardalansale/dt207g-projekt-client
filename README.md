# DT207G Projektarbete - Pizzeria Bianconeri – Administrationsgränssnitt (Frontend)
Ett klientbaserat administrationsgränssnitt för Pizzeria Bianconeri som kommunicerar med en REST-webbtjänst för att hantera menyn, erbjuda bordsbokning och hantera autentisering via JWT.

## GitHub-repo
https://github.com/ardalansale/dt207g-projekt-client

## Publicerad webbplats
https://dt207g-pizzeria-bianconeri.netlify.app

## Funktionalitet
- Publik visning av meny samt formulär för bordsbokning.
- Säker inloggning för personal via förskapat admin-konto (publik registrering borttagen).
- Lagring och hantering av JWT-tokens för säker autentisering.
- Skyddad adminpanel för fullständig CRUD-hantering av menyn (visa, lägga till, redigera och radera).
- Skyddad översikt och hantering (visning och radering) av inkomna bordsbokningar.
- Utloggningsfunktion som rensar sparad token och återställer gränssnittet.

## Komponenter och struktur
- `index.html` – Publik startsida med meny, om oss, öppettider och bordsbokning.
- `admin.html` – Skyddad adminpanel för inloggning, menyhantering och administration av bokningar.
- `css/style.css` – Stilmall som hanterar layout, typografi, formulär, tabeller och responsivitet.
- `js/main.js` – JavaScript-logik som hanterar formulärhändelser, `fetch`-anrop mot REST API:et och sessionshantering.

## Tekniker
- HTML5
- CSS3
- JavaScript (Fetch API, ES6+)
- Lagring av JWT för autentisering

## Användning
1. Klona repot lokalt eller öppna filerna direkt i en webbläsare.
2. Säkerställ att backend-tjänsten på Render rullar.
3. Öppna `index.html` för den publika sidan eller navigera till `admin.html` för att logga in som personal (`admin` / `SvartVitt1`).