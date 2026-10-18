const API_URL = "https://dt207g-projekt-api-xqcb.onrender.com";

// 1. Registrera ny användare
const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("reg-username").value;
        const password = document.getElementById("reg-password").value;
        const errorEl = document.getElementById("error-message");
        const successEl = document.getElementById("success-message");

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                successEl.textContent = "Konto skapat! Du kan nu logga in.";
                errorEl.textContent = "";
                registerForm.reset();
            } else {
                errorEl.textContent = data.error || "Kunde inte skapa konto.";
                successEl.textContent = "";
            }
        } catch (err) {
            errorEl.textContent = "Kunde inte ansluta till servern.";
        }
    });
}

// 2. Logga in
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        const errorEl = document.getElementById("error-message");
        const successEl = document.getElementById("success-message");

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Spara token i sessionStorage och omdirigera till secret.html
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("username", username);
                window.location.href = "secret.html";
            } else {
                errorEl.textContent = data.error || "Felaktiga inloggningsuppgifter.";
                successEl.textContent = "";
            }
        } catch (err) {
            errorEl.textContent = "Kunde inte ansluta till servern.";
        }
    });
}

// 3. Hantera admin-panelen på secret.html
const menuList = document.getElementById("menu-list");
if (menuList) {
    const token = sessionStorage.getItem("token");
    const username = sessionStorage.getItem("username");
    const welcomeMsg = document.getElementById("welcome-msg");
    const protectedContent = document.getElementById("protected-content");

    if (!token) {
        welcomeMsg.textContent = "Åtkomst nekad. Du måste logga in först.";
        document.getElementById("error-message").textContent = "Ingen token hittades.";
    } else {
        welcomeMsg.textContent = `Välkommen ${username || 'Admin'}! Du är inloggad.`;
        protectedContent.style.display = "block";
        getMenu();
    }

    // Funktion för att hämta och visa menyn
    async function getMenu() {
        try {
            const response = await fetch(`${API_URL}/api/menu`);
            const menu = await response.json();

            if (response.ok) {
                menuList.innerHTML = "";
                if (menu.length === 0) {
                    menuList.innerHTML = `<tr><td colspan="5">Inga rätter i menyn ännu.</td></tr>`;
                    return;
                }

                menu.forEach(item => {
                    menuList.innerHTML += `
                        <tr>
                            <td>${item.id}</td>
                            <td><strong>${item.title}</strong></td>
                            <td>${item.description || '-'}</td>
                            <td>${item.price} kr</td>
                            <td>
                                <button onclick="deleteMenuItem(${item.id})" style="background-color: #ff4d4d; padding: 0.3rem 0.6rem; font-size: 0.85rem;">Radera</button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                document.getElementById("error-message").textContent = "Kunde inte hämta menyn.";
            }
        } catch (err) {
            document.getElementById("error-message").textContent = "Fel vid hämtning av meny.";
        }
    }

    // Lägg till ny rätt i menyn
    const addMenuForm = document.getElementById("add-menu-form");
    if (addMenuForm) {
        addMenuForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("title").value.trim();
            const description = document.getElementById("description").value.trim();
            const price = document.getElementById("price").value.trim();
            const errorEl = document.getElementById("error-message");
            const successEl = document.getElementById("success-message");

            try {
                const response = await fetch(`${API_URL}/api/menu`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, description, price: Number(price) })
                });

                const data = await response.json();

                if (response.ok) {
                    successEl.textContent = "Rätten har lagts till i menyn!";
                    errorEl.textContent = "";
                    addMenuForm.reset();
                    getMenu(); // Uppdatera listan direkt
                } else {
                    errorEl.textContent = data.error || "Kunde inte lägga till rätten.";
                    successEl.textContent = "";
                }
            } catch (err) {
                errorEl.textContent = "Fel vid anslutning till servern.";
            }
        });
    }

    // Global funktion för att radera en rätt
    window.deleteMenuItem = async function(id) {
        if (!confirm("Är du säker på att du vill radera denna rätt?")) return;

        const errorEl = document.getElementById("error-message");
        const successEl = document.getElementById("success-message");

        try {
            const response = await fetch(`${API_URL}/api/menu/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                successEl.textContent = "Rätten har raderats!";
                errorEl.textContent = "";
                getMenu(); // Uppdatera listan
            } else {
                errorEl.textContent = data.error || "Kunde inte radera rätten.";
                successEl.textContent = "";
            }
        } catch (err) {
            errorEl.textContent = "Fel vid anslutning till servern.";
        }
    };
}

// 4. Utloggning
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        window.location.href = "index.html";
    });
}