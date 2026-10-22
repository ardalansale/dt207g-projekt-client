const API_URL = "https://dt207g-projekt-api-xqcb.onrender.com";

// 1. Hämta och visa menyn (Publik)
async function loadPublicMenu() {
    const container = document.getElementById("public-menu-list");
    if (!container) return;
    try {
        const res = await fetch(`${API_URL}/api/menu`);
        const menu = await res.json();
        container.innerHTML = res.ok && menu.length ? menu.map(item => `
            <div class="menu-item">
                <h3>${item.title}</h3>
                <p>${item.description || ""}</p>
                <p class="price">${item.price} kr</p>
            </div>
        `).join('') : '<p class="loading-text">Inga rätter i menyn.</p>';
    } catch {
        container.innerHTML = '<p class="loading-text">Kunde inte ladda menyn.</p>';
    }
}

// 2. Skicka bordsbokning (Publik)
const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const successEl = document.getElementById("booking-success");
        const errorEl = document.getElementById("booking-error");
        successEl.style.display = errorEl.style.display = "none";

        const data = {
            name: document.getElementById("book-name").value,
            email: document.getElementById("book-email").value,
            phone: document.getElementById("book-phone").value,
            date: document.getElementById("book-date").value,
            time: document.getElementById("book-time").value,
            guests: Number(document.getElementById("book-guests").value),
            message: document.getElementById("book-message").value
        };

        try {
            const res = await fetch(`${API_URL}/api/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Kunde inte skicka bokning.");
            successEl.textContent = "Tack för din bokning! Vi har tagit emot din reservation.";
            successEl.style.display = "block";
            bookingForm.reset();
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = "block";
        }
    });
}

// 3. Logga in (Admin)
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        const errorEl = document.getElementById("error-message");

        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("username", username);
                window.location.href = "admin.html";
            } else {
                errorEl.textContent = data.error || "Felaktiga uppgifter.";
                errorEl.style.display = "block";
            }
        } catch {
            errorEl.textContent = "Kunde inte ansluta till servern.";
            errorEl.style.display = "block";
        }
    });
}

// 4. Utloggning
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = "admin.html";
    });
}

// 5. Adminpanel & Meny-CRUD
const protectedContent = document.getElementById("protected-content");
if (protectedContent) {
    const token = sessionStorage.getItem("token");
    const authContainer = document.getElementById("auth-container");
    let menuData = [];

    if (!token) {
        if (authContainer) authContainer.style.display = "block";
        protectedContent.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "none";
    } else {
        if (authContainer) authContainer.style.display = "none";
        protectedContent.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "inline";
        fetchAdminMenu();
    }

    async function fetchAdminMenu() {
        const list = document.getElementById("menu-list");
        if (!list) return;
        try {
            const res = await fetch(`${API_URL}/api/menu`);
            const menu = await res.json();
            if (res.ok) {
                menuData = menu;
                list.innerHTML = menu.length ? menu.map((item, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td><strong>${item.title}</strong></td>
                        <td>${item.description || "-"}</td>
                        <td>${item.price} kr</td>
                        <td>
                            <button onclick="prepareEdit(${item.id})" class="table-btn edit-btn">Ändra</button>
                            <button onclick="deleteMenuItem(${item.id})" class="table-btn delete-btn">Radera</button>
                        </td>
                    </tr>
                `).join('') : '<tr><td colspan="5" style="text-align:center;">Inga rätter i menyn.</td></tr>';
            }
        } catch {
            showError("Kunde inte hämta menyn.");
        }
    }

    window.prepareEdit = (id) => {
        const item = menuData.find(m => m.id === id);
        if (!item) return;
        document.getElementById("edit-id").value = item.id;
        document.getElementById("title").value = item.title;
        document.getElementById("description").value = item.description || "";
        document.getElementById("price").value = item.price;
        document.getElementById("form-title").textContent = "Redigera menyobjekt";
        document.getElementById("submit-btn").textContent = "Spara ändringar";
        document.getElementById("cancel-edit-btn").style.display = "inline-block";
    };

    document.getElementById("cancel-edit-btn")?.addEventListener("click", resetForm);

    function resetForm() {
        document.getElementById("edit-id").value = "";
        document.getElementById("add-menu-form").reset();
        document.getElementById("form-title").textContent = "Lägg till ny rätt";
        document.getElementById("submit-btn").textContent = "Lägg till i menyn";
        document.getElementById("cancel-edit-btn").style.display = "none";
    }

    document.getElementById("add-menu-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const editId = document.getElementById("edit-id").value;
        const body = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            price: Number(document.getElementById("price").value)
        };

        const url = editId ? `${API_URL}/api/menu/${editId}` : `${API_URL}/api/menu`;
        const method = editId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                showSuccess(editId ? "Rätten har uppdaterats!" : "Rätten har lagts till!");
                resetForm();
                fetchAdminMenu();
            }
        } catch {
            showError("Kunde inte spara rätten.");
        }
    });

    window.deleteMenuItem = async (id) => {
        if (!confirm("Är du säker på att du vill radera denna rätt?")) return;
        try {
            const res = await fetch(`${API_URL}/api/menu/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                showSuccess("Rätten har raderats!");
                fetchAdminMenu();
            }
        } catch {
            showError("Kunde inte radera rätten.");
        }
    };

    function showSuccess(msg) {
        const el = document.getElementById("success-message");
        el.textContent = msg;
        el.style.display = "block";
        document.getElementById("error-message").style.display = "none";
    }

    function showError(msg) {
        const el = document.getElementById("error-message");
        el.textContent = msg;
        el.style.display = "block";
        document.getElementById("success-message").style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", loadPublicMenu);