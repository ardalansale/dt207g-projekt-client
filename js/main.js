const API_URL = "https://dt207g-projekt-api-xqcb.onrender.com";

// Hämta och visa menyn
async function loadPublicMenu() {
    const menuContainer = document.getElementById("public-menu-list");
    if (!menuContainer) return; // Körs bara om elementet finns på sidan

    try {
        const response = await fetch(`${API_URL}/api/menu`);
        const menu = await response.json();

        if (response.ok) {
            menuContainer.innerHTML = "";
            if (menu.length === 0) {
                menuContainer.innerHTML = "<p>Inga rätter i menyn för tillfället.</p>";
                return;
            }

            menu.forEach(item => {
                menuContainer.innerHTML += `
                    <div class="menu-item">
                        <h3>${item.title}</h3>
                        <p>${item.description || "Ingen beskrivning angiven."}</p>
                        <p class="price">${item.price} kr</p>
                    </div>
                `;
            });
        } else {
            menuContainer.innerHTML = "<p>Kunde inte ladda menyn.</p>";
        }
    } catch (err) {
        menuContainer.innerHTML = "<p>Fel vid anslutning till servern.</p>";
    }
}

// Kör funktionen när index.html laddas
document.addEventListener("DOMContentLoaded", () => {
    loadPublicMenu();
});

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
                successEl.style.display = "block";
                errorEl.textContent = "";
                errorEl.style.display = "none";
                registerForm.reset();
            } else {
                errorEl.textContent = data.error || "Kunde inte skapa konto.";
                errorEl.style.display = "block";
                successEl.textContent = "";
                successEl.style.display = "none";
            }
        } catch (err) {
            errorEl.textContent = "Kunde inte ansluta till servern.";
            errorEl.style.display = "block";
            successEl.textContent = "";
            successEl.style.display = "none";
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
                // Spara token i sessionStorage och omdirigera till admin.html
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("username", username);
                window.location.href = "admin.html";
            } else {
                errorEl.textContent = data.error || "Felaktiga inloggningsuppgifter.";
                errorEl.style.display = "block";
                successEl.textContent = "";
                successEl.style.display = "none";
            }
        } catch (err) {
            errorEl.textContent = "Kunde inte ansluta till servern.";
            errorEl.style.display = "block";
            successEl.textContent = "";
            successEl.style.display = "none";
        }
    });
}

// 3. Hantera admin-panelen på admin.html
const protectedContent = document.getElementById("protected-content");
if (protectedContent) {
    const token = sessionStorage.getItem("token");
    const username = sessionStorage.getItem("username");
    const welcomeMsg = document.getElementById("welcome-msg");
    const authContainer = document.getElementById("auth-container");
    const logoutBtn = document.getElementById("logout-btn");

    let menuData = []; // Sparar hämtade rätter för att underlätta redigering

    if (!token) {
        // Ej inloggad: visa inloggningsformulär, dölj admin-innehåll och utloggningsknapp
        if (authContainer) authContainer.style.display = "block";
        protectedContent.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "none";
    } else {
        // Inloggad: dölj formulär, visa admin-innehåll och utloggningsknapp
        if (authContainer) authContainer.style.display = "none";
        protectedContent.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "inline";
        if (welcomeMsg) welcomeMsg.textContent = `Välkommen ${username || 'Admin'}! Du är inloggad.`;
        getMenu();
    }

    // Funktion för att hämta och visa menyn
    async function getMenu() {
        const menuList = document.getElementById("menu-list");
        if (!menuList) return;

        const errorEl = document.getElementById("error-message");

        try {
            const response = await fetch(`${API_URL}/api/menu`);
            const menu = await response.json();

            if (response.ok) {
                menuData = menu; // Spara till lokal array
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
                                <button type="button" onclick="prepareEdit(${item.id})" style="background-color: #2563eb; color: white; padding: 0.3rem 0.6rem; font-size: 0.85rem; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">Ändra</button>
                                <button type="button" onclick="deleteMenuItem(${item.id})" style="background-color: #dc2626; color: white; padding: 0.3rem 0.6rem; font-size: 0.85rem; border: none; border-radius: 4px; cursor: pointer;">Radera</button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                if (errorEl) {
                    errorEl.textContent = "Kunde inte hämta menyn.";
                    errorEl.style.display = "block";
                }
            }
        } catch (err) {
            if (errorEl) {
                errorEl.textContent = "Fel vid hämtning av meny.";
                errorEl.style.display = "block";
            }
        }
    }

    // Förbered formuläret för att redigera en befintlig rätt
    window.prepareEdit = function(id) {
        const item = menuData.find(m => m.id === id);
        if (!item) return;

        document.getElementById("edit-id").value = item.id;
        document.getElementById("title").value = item.title;
        document.getElementById("description").value = item.description || "";
        document.getElementById("price").value = item.price;

        document.getElementById("form-title").textContent = "Redigera menyobjekt";
        document.getElementById("submit-btn").textContent = "Spara ändringar";
        document.getElementById("cancel-edit-btn").style.display = "inline-block";

        document.querySelector(".add-menu-section").scrollIntoView({ behavior: 'smooth' });
    };

    // Hantera avbryt-knapp vid redigering
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", () => {
            resetFormState();
        });
    }

    function resetFormState() {
        document.getElementById("edit-id").value = "";
        document.getElementById("add-menu-form").reset();
        document.getElementById("form-title").textContent = "Lägg till ny rätt i menyn";
        document.getElementById("submit-btn").textContent = "Lägg till i menyn";
        document.getElementById("cancel-edit-btn").style.display = "none";
    }

    // Lägg till ny rätt eller uppdatera befintlig rätt
    const addMenuForm = document.getElementById("add-menu-form");
    if (addMenuForm) {
        addMenuForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const editId = document.getElementById("edit-id").value;
            const title = document.getElementById("title").value.trim();
            const description = document.getElementById("description").value.trim();
            const price = document.getElementById("price").value.trim();
            const errorEl = document.getElementById("error-message");
            const successEl = document.getElementById("success-message");

            // Välj URL och metod beroende på om vi redigerar eller skapar nytt
            const url = editId ? `${API_URL}/api/menu/${editId}` : `${API_URL}/api/menu`;
            const method = editId ? "PUT" : "POST";

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, description, price: Number(price) })
                });

                const data = await response.json();

                if (response.ok) {
                    successEl.textContent = editId ? "Rätten har uppdaterats!" : "Rätten har lagts till i menyn!";
                    successEl.style.display = "block";
                    errorEl.textContent = "";
                    errorEl.style.display = "none";
                    
                    resetFormState();
                    getMenu(); // Uppdatera listan direkt
                } else {
                    errorEl.textContent = data.error || "Kunde inte spara rätten.";
                    errorEl.style.display = "block";
                    successEl.textContent = "";
                    successEl.style.display = "none";
                }
            } catch (err) {
                errorEl.textContent = "Fel vid anslutning till servern.";
                errorEl.style.display = "block";
                successEl.textContent = "";
                successEl.style.display = "none";
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
                successEl.style.display = "block";
                errorEl.textContent = "";
                errorEl.style.display = "none";
                getMenu(); // Uppdatera listan
            } else {
                errorEl.textContent = data.error || "Kunde inte radera rätten.";
                errorEl.style.display = "block";
                successEl.textContent = "";
                successEl.style.display = "none";
            }
        } catch (err) {
            errorEl.textContent = "Fel vid anslutning till servern.";
            errorEl.style.display = "block";
            successEl.textContent = "";
            successEl.style.display = "none";
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
        window.location.href = "admin.html";
    });
}