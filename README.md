# DT207G Projektarbete - Pizzeria Bianconeri – Administrationsgränssnitt (Frontend)
Ett klientbaserat administrationsgränssnitt för Pizzeria Bianconeri som kommunicerar med en REST-webbtjänst för att hantera menyn och autentisering via JWT (JSON Web Tokens).

## GitHub-repo
https://github.com/ardalansale/dt207g-projekt-client

## Publicerad webbplats
https://dt207g-pizzeria-bianconeri.netlify.app

## Funktionalitet
- Registrering av nya adminkonton samt inloggning för befintliga användare.
- Lagring och hantering av JWT-tokens i `sessionStorage` för säker autentisering.
- Skyddad adminpanel som kräver inloggning för åtkomst.
- Visning av aktuell meny i ett tabellformat.
- Formulär för att lägga till nya maträtter i menyn (kräver inloggning).
- Möjlighet att radera maträtter från menyn (kräver inloggning).
- Utloggningsfunktion som rensar sparad token och omdirigerar användaren.

## Komponenter och struktur
- `index.html` – Startsida med formulär för inloggning och konto-registrering.
- `secret.html` – Skyddad adminpanel för hantering av pizzerians meny (visning, tillägg och radering).
- `css/style.css` – Stilmall som hanterar layout, typografi, formulär och tabeller.
- `js/main.js` – JavaScript-logik som hanterar formulärhändelser, `fetch`-anrop mot REST API:et och sessionshantering.

## Tekniker
- HTML5
- CSS3
- JavaScript (Fetch API, ES6+)
- SessionStorage för JWT-hantering

## Användning
1. Klona repot lokalt eller öppna filerna direkt i en webbläsare.
2. Säkerställ att backend-tjänsten på Render rullar.
3. Öppna `index.html` för att logga in eller skapa ett nytt konto.