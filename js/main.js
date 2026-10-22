const API_URL = "https://dt207g-projekt-api-xqcb.onrender.com";

// 1. PUBLIK SIDA: MENY & BOKNING

// Hämta och visa menyn på publika sidan
async function loadPublicMenu() {
    const menuContainer = document.getElementById("public-menu-list");
    if (!menuContainer) return;

    try {
        const response = await fetch(`${API_URL}/api/menu`);
        const menu = await response.json();

        if (response.ok) {
            menuContainer.innerHTML = "";
            if (menu.length === 0) {
                menuContainer.innerHTML = "<p class=\"loading-text\">Inga rätter i menyn för tillfället.</p>";
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
            menuContainer.innerHTML = "<p class=\"loading-text\">Kunde inte ladda menyn.</p>";
        }
    } catch (err) {
        menuContainer.innerHTML = "<p class=\"loading-text\">Fel vid anslutning till servern.</p>";
    }
}

// Hantera inskick av bordsbokning (Publika sidan)
const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const successDiv = document.getElementById("booking-success");
        const errorDiv = document.getElementById("booking-error");
        successDiv.style.display = "none";
        errorDiv.style.display = "none";

        const bookingData = {
            name: document.getElementById("book-name").value.trim(),
            email: document.getElementById("book-email").value.trim(),
            phone: document.getElementById("book-phone").value.trim(),
            date: document.getElementById("book-date").value,
            time: document.getElementById("book-time").value,
            guests: parseInt(document.getElementById("book-guests").value),
            message: document.getElementById("book-message").value.trim()
        };

        try {
            const response = await fetch(`${API_URL}/api/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Kunde inte skicka bokning.");

            successDiv.textContent = "Tack för din bokning! Vi har tagit emot din reservation.";
            successDiv.style.display = "block";
            bookingForm.reset();
        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.style.display = "block";
        }
    });
}

// Kör publika funktioner när DOM laddas
document.addEventListener("DOMContentLoaded", () => {
    loadPublicMenu();
});

// 2. INLOGGNING & UTLOGGNING

// Logga in (Endast personal)
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value.trim();
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
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("username", username);
                window.location.href = "admin.html";
            } else {
                errorEl.textContent = data.error || "Felaktiga inloggningsuppgifter.";
                errorEl.style.display = "block";
                if (successEl) successEl.style.display = "none";
            }
        } catch (err) {
            errorEl.textContent = "Kunde inte ansluta till servern.";
            errorEl.style.display = "block";
            if (successEl) successEl.style.display = "none";
        }
    });
}

// Utloggning
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        window.location.href = "admin.html";
    });
}

// 3. ADMINPANELEN (Skyddat innehåll)

const protectedContent = document.getElementById("protected-content");
if (protectedContent) {
    const token = sessionStorage.getItem("token");
    const authContainer = document.getElementById("auth-container");

    let menuData = []; // Sparar hämtade rätter för redigering

    if (!token) {
        if (authContainer) authContainer.style.display = "block";
        protectedContent.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "none";
    } else {
        if (authContainer) authContainer.style.display = "none";
        protectedContent.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "inline";
        
        // Hämta data till adminpanelen
        getMenu();
        fetchAdminBookings();
    }

    // --- MENY-HANTERING I ADMIN ---

    async function getMenu() {
        const menuList = document.getElementById("menu-list");
        if (!menuList) return;

        const errorEl = document.getElementById("error-message");

        try {
            const response = await fetch(`${API_URL}/api/menu`);
            const menu = await response.json();

            if (response.ok) {
                menuData = menu;
                menuList.innerHTML = "";
                if (menu.length === 0) {
                    menuList.innerHTML = `<tr><td colspan="5" style="text-align: center;">Inga rätter i menyn ännu.</td></tr>`;
                    return;
                }

                menu.forEach((item, index) => {
                    menuList.innerHTML += `
                        <tr>
                            <td>${index + 1}</td>
                            <td><strong>${item.title}</strong></td>
                            <td>${item.description || "-"}</td>
                            <td style="white-space: nowrap;">${item.price} kr</td>
                            <td style="white-space: nowrap;">
                                <button type="button" onclick="prepareEdit(${item.id})" class="table-btn edit-btn">Ändra</button>
                                <button type="button" onclick="deleteMenuItem(${item.id})" class="table-btn delete-btn">Radera</button>
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

        document.getElementById("add-menu-form").scrollIntoView({ behavior: "smooth" });
    };

    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", () => {
            resetFormState();
        });
    }

    function resetFormState() {
        document.getElementById("edit-id").value = "";
        document.getElementById("add-menu-form").reset();
        document.getElementById("form-title").textContent = "Lägg till ny rätt";
        document.getElementById("submit-btn").textContent = "Lägg till i menyn";
        document.getElementById("cancel-edit-btn").style.display = "none";
    }

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
                    errorEl.style.display = "none";
                    
                    resetFormState();
                    getMenu();
                } else {
                    errorEl.textContent = data.error || "Kunde inte spara rätten.";
                    errorEl.style.display = "block";
                    successEl.style.display = "none";
                }
            } catch (err) {
                errorEl.textContent = "Fel vid anslutning till servern.";
                errorEl.style.display = "block";
                successEl.style.display = "none";
            }
        });
    }

    window.deleteMenuItem = async function(id) {
        if (!confirm("Är du säker på att du vill radera denna rätt?")) return;

        const errorEl = document.getElementById("error-message");
        const successEl = document.getElementById("success-message");

        try {
            const response = await fetch(`${API_URL}/api/menu/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                successEl.textContent = "Rätten har raderats!";
                successEl.style.display = "block";
                errorEl.style.display = "none";
                getMenu();
            } else {
                errorEl.textContent = data.error || "Kunde inte radera rätten.";
                errorEl.style.display = "block";
                successEl.style.display = "none";
            }
        } catch (err) {
            errorEl.textContent = "Fel vid anslutning till servern.";
            errorEl.style.display = "block";
            successEl.style.display = "none";
        }
    };


    // --- BOKNINGS-HANTERING I ADMIN ---

    async function fetchAdminBookings() {
        const bookingsList = document.getElementById("admin-bookings-list");
        if (!bookingsList) return;

        try {
            const response = await fetch(`${API_URL}/api/bookings`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const bookings = await response.json();
            
            if (!response.ok) throw new Error("Kunde inte hämta bokningar.");

            bookingsList.innerHTML = "";
            if (bookings.length === 0) {
                bookingsList.innerHTML = `<tr><td colspan="7" style="text-align: center;">Inga bokningar hittades.</td></tr>`;
                return;
            }

            bookings.forEach((booking, index) => {
                bookingsList.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${booking.name}</strong></td>
                        <td>${booking.email}<br>${booking.phone}</td>
                        <td style="white-space: nowrap;">${booking.date} kl ${booking.time}</td>
                        <td>${booking.guests} st</td>
                        <td>${booking.message || "-"}</td>
                        <td style="white-space: nowrap;">
                            <button type="button" onclick="deleteBooking(${booking.id})" class="table-btn delete-btn">Radera</button>
                        </td>
                    </tr>
                `;
            });
        } catch (err) {
            console.error(err);
        }
    }

    window.deleteBooking = async function(id) {
        if (!confirm("Är du säker på att du vill radera denna bokning?")) return;

        try {
            const response = await fetch(`${API_URL}/api/bookings/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Kunde inte radera bokningen.");

            fetchAdminBookings();
        } catch (err) {
            alert(err.message);
        }
    };
}