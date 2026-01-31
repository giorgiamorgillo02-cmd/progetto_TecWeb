// Admin Dashboard JavaScript

let currentUser = null;
let allProducts = [];
let allUsers = [];
let allCategories = [];
let productToDeleteId = null; //per eliminare prodotto
let userToBlockId = null; //per bloccare utente
let blockStatus = null;
let userToToggleRoleId = null; //per cambiare ruolo
let roleTarget = null;

// Funzione di inizializzazione principale
async function initAdminPage() {
  console.log("🔧 Inizializzazione Admin Dashboard...");

  // Ottieni dati utente dallo store
  const user = store.getUser();

  // Verifica che l'utente sia autenticato
  if (!user || !store.isAuthenticated()) {
    console.error("❌ Utente non autenticato");
    if (typeof router !== "undefined") {
      const redirectUrl = encodeURIComponent("/admin");
      router.navigate(`/login?redirect=${redirectUrl}`);
    } else {
      window.location.href =
        "login.html?redirect=" + encodeURIComponent("/admin");
    }
    return;
  }

  // Verifica che l'utente sia admin
  if (!store.isAdmin()) {
    console.error("❌ Accesso negato: utente non è admin");
    if (typeof showToast !== "undefined") {
      showToast("Accesso negato: solo gli amministratori possono accedere");
    }
    if (typeof router !== "undefined") {
      router.navigate("/home");
    } else {
      window.location.href = "index.html";
    }
    return;
  }

  console.log("👤 Admin:", user.nome, user.cognome);
  currentUser = user;

  await loadCategories();
  await loadDashboardData();
  setupNavigation();
  setupProductForm();
  setupDeleteModal();
  setupBlockUserModal();
  setupAdminRoleModal();
}

// Esponi globalmente per la SPA
window.initAdminPage = initAdminPage;

// Inizializzazione per compatibilità con vecchio modo
document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("admin-dashboard")) {
    await initAdminPage();
  }
});

// Carica categorie
async function loadCategories() {
  try {
    const response = await fetch("api/catalogo/categorie.php");
    const data = await response.json();
    if (data.success) {
      allCategories = data.data; // Corretto da data.categorie a data.data
      populateCategorySelect();
    }
  } catch (error) {
    console.error("Errore caricamento categorie:", error);
  }
}

function populateCategorySelect() {
  const select = document.getElementById("product-categoria");
  if (!select) {
    console.warn("⚠️ Select categoria non trovato");
    return;
  }
  select.innerHTML = '<option value="">-- Seleziona una categoria --</option>';

  if (allCategories.length === 0) {
    select.innerHTML =
      '<option value="">Nessuna categoria disponibile</option>';
    select.disabled = true;
    return;
  }

  select.disabled = false;
  allCategories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.nome;
    select.appendChild(option);
  });
}

// Carica dati dashboard
async function loadDashboardData() {
  await Promise.all([loadProducts(), loadUsers()]);
  updateDashboardStats();
}

function updateDashboardStats() {
  const totalProducts = document.getElementById("total-products");
  const totalUsers = document.getElementById("total-users");
  const totalAdmins = document.getElementById("total-admins");
  const totalBlocked = document.getElementById("total-blocked");

  if (totalProducts) totalProducts.textContent = allProducts.length;
  if (totalUsers) totalUsers.textContent = allUsers.length;
  if (totalAdmins)
    totalAdmins.textContent = allUsers.filter((u) => u.ruolo == 1).length;
  if (totalBlocked)
    totalBlocked.textContent = allUsers.filter((u) => u.blocked == 1).length;
}

// ===== GESTIONE PRODOTTI =====

async function loadProducts() {
  try {
    const response = await fetch("api/admin/prodotti.php");
    const data = await response.json();

    if (data.success) {
      allProducts = data.prodotti;
      displayProducts();
    } else {
      showError("Errore caricamento prodotti");
    }
  } catch (error) {
    console.error("Errore:", error);
    showError("Errore caricamento prodotti");
  }
}

function displayProducts() {
  const container = document.getElementById("prodotti-list");

  if (!container) {
    console.warn("⚠️ Container prodotti-list non trovato");
    return;
  }

  if (allProducts.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><p>Nessun prodotto trovato</p></div>';
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Titolo</th>
                    <th>Categoria</th>
                    <th>Prezzo</th>
                    <th>Autore</th>
                    <th>Azioni</th>
                </tr>
            </thead>
            <tbody>
    `;

  allProducts.forEach((product) => {
    const categoriaBadge = product.categoria_nome
      ? `<span class="badge-category">${product.categoria_nome}</span>`
      : '<span class="badge-category no-category">Senza categoria</span>';

    html += `
            <tr>
                <td>${product.id}</td>
                <td>${product.titolo}</td>
                <td>${categoriaBadge}</td>
                <td>€${parseFloat(product.prezzo).toFixed(2)}</td>
                <td>${product.autore}</td>
                <td>
                    <button class="btn btn-edit" onclick="openEditProductModal(${product.id})">Modifica</button>
                    <button class="btn btn-delete" onclick="deleteProduct(${product.id})">Elimina</button>
                </td>
            </tr>
        `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function openAddProductModal() {
  document.getElementById("productModalTitle").textContent =
    "Aggiungi Prodotto";
  document.getElementById("product-id").value = "";
  document.getElementById("productForm").reset();
  document.getElementById("product-autore").value = "sconosciuto";

  // Ripopola le categorie per essere sicuri che siano aggiornate
  populateCategorySelect();

  document.getElementById("productModal").style.display = "block";
}

function openEditProductModal(productId) {
  const product = allProducts.find((p) => p.id == productId);
  if (!product) return;

  document.getElementById("productModalTitle").textContent =
    "Modifica Prodotto";
  document.getElementById("product-id").value = product.id;
  document.getElementById("product-titolo").value = product.titolo;
  document.getElementById("product-descrizione").value = product.descrizione;
  document.getElementById("product-autore").value = product.autore;
  document.getElementById("product-prezzo").value = product.prezzo;
  document.getElementById("product-image").value = product.image_path;

  // Ripopola le categorie per essere sicuri che siano aggiornate
  populateCategorySelect();

  // Imposta la categoria selezionata
  document.getElementById("product-categoria").value =
    product.id_categoria || "";

  document.getElementById("productModal").style.display = "block";
}

function closeProductModal() {
  document.getElementById("productModal").style.display = "none";
}

function setupProductForm() {
  const productForm = document.getElementById("productForm");
  if (!productForm) {
    console.warn("⚠️ Product form non trovato");
    return;
  }

  // Funzioni di validazione
  function validateRequired(value, fieldName) {
    if (!value || value.trim() === "") {
      return `${fieldName} è obbligatorio`;
    }
    return "";
  }

  function validatePrezzo(value) {
    if (!value) return "Il prezzo è obbligatorio";
    const prezzo = parseFloat(value);
    if (isNaN(prezzo) || prezzo <= 0) {
      return "Inserisci un prezzo valido maggiore di 0";
    }
    return "";
  }

  function showFieldError(input, errorSpan, message) {
    if (!input || !errorSpan) return;

    if (message) {
      input.classList.add("input-error");
      input.classList.remove("input-success");
      errorSpan.textContent = message;
      errorSpan.style.display = "block";
    } else {
      input.classList.remove("input-error");
      input.classList.add("input-success");
      errorSpan.textContent = "";
      errorSpan.style.display = "none";
    }
  }

  // Gestisci eventi del form
  function attachFormValidation() {
    // Elementi del form
    const titoloInput = document.getElementById("product-titolo");
    const descrizioneInput = document.getElementById("product-descrizione");
    const autoreInput = document.getElementById("product-autore");
    const prezzoInput = document.getElementById("product-prezzo");
    const imageInput = document.getElementById("product-image");
    const categoriaInput = document.getElementById("product-categoria");

    const titoloError = document.getElementById("productTitoloError");
    const descrizioneError = document.getElementById("productDescrizioneError");
    const autoreError = document.getElementById("productAutoreError");
    const prezzoError = document.getElementById("productPrezzoError");
    const imageError = document.getElementById("productImageError");
    const categoriaError = document.getElementById("productCategoriaError");

    if (
      !titoloInput ||
      !descrizioneInput ||
      !autoreInput ||
      !prezzoInput ||
      !imageInput ||
      !categoriaInput
    ) {
      console.warn("⚠️ Alcuni campi del form non sono stati trovati");
      return;
    }

    // Validazione in tempo reale per tutti i campi
    titoloInput.addEventListener("blur", () => {
      const error = validateRequired(titoloInput.value, "Il titolo");
      showFieldError(titoloInput, titoloError, error);
    });

    titoloInput.addEventListener("input", () => {
      if (titoloInput.classList.contains("input-error")) {
        const error = validateRequired(titoloInput.value, "Il titolo");
        showFieldError(titoloInput, titoloError, error);
      }
    });

    descrizioneInput.addEventListener("blur", () => {
      const error = validateRequired(descrizioneInput.value, "La descrizione");
      showFieldError(descrizioneInput, descrizioneError, error);
    });

    descrizioneInput.addEventListener("input", () => {
      if (descrizioneInput.classList.contains("input-error")) {
        const error = validateRequired(
          descrizioneInput.value,
          "La descrizione",
        );
        showFieldError(descrizioneInput, descrizioneError, error);
      }
    });

    autoreInput.addEventListener("blur", () => {
      const error = validateRequired(autoreInput.value, "L'autore");
      showFieldError(autoreInput, autoreError, error);
    });

    autoreInput.addEventListener("input", () => {
      if (autoreInput.classList.contains("input-error")) {
        const error = validateRequired(autoreInput.value, "L'autore");
        showFieldError(autoreInput, autoreError, error);
      }
    });

    prezzoInput.addEventListener("blur", () => {
      const error = validatePrezzo(prezzoInput.value);
      showFieldError(prezzoInput, prezzoError, error);
    });

    prezzoInput.addEventListener("input", () => {
      if (prezzoInput.classList.contains("input-error")) {
        const error = validatePrezzo(prezzoInput.value);
        showFieldError(prezzoInput, prezzoError, error);
      }
    });

    // Validazione in tempo reale per immagine
    imageInput.addEventListener("blur", () => {
      const error = validateRequired(imageInput.value, "Il percorso immagine");
      showFieldError(imageInput, imageError, error);
    });

    imageInput.addEventListener("input", () => {
      if (imageInput.classList.contains("input-error")) {
        const error = validateRequired(
          imageInput.value,
          "Il percorso immagine",
        );
        showFieldError(imageInput, imageError, error);
      }
    });

    // Validazione in tempo reale per categoria
    categoriaInput.addEventListener("blur", () => {
      const error = validateRequired(categoriaInput.value, "La categoria");
      showFieldError(categoriaInput, categoriaError, error);
    });

    categoriaInput.addEventListener("change", () => {
      const error = validateRequired(categoriaInput.value, "La categoria");
      showFieldError(categoriaInput, categoriaError, error);
    });
  }

  // Attacca i listener inizialmente
  attachFormValidation();

  // Gestione submit del form
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productId = document.getElementById("product-id").value;
    const titolo = document.getElementById("product-titolo").value.trim();
    const descrizione = document
      .getElementById("product-descrizione")
      .value.trim();
    const autore = document.getElementById("product-autore").value.trim();
    const prezzo = document.getElementById("product-prezzo").value;
    const imagePath = document.getElementById("product-image").value.trim();
    const idCategoria = document.getElementById("product-categoria").value;

    // Validazione finale
    const titoloErr = validateRequired(titolo, "Il titolo");
    const descrizioneErr = validateRequired(descrizione, "La descrizione");
    const autoreErr = validateRequired(autore, "L'autore");
    const prezzoErr = validatePrezzo(prezzo);
    const imageErr = validateRequired(imagePath, "Il percorso immagine");
    const categoriaErr = validateRequired(idCategoria, "La categoria");

    showFieldError(
      document.getElementById("product-titolo"),
      document.getElementById("productTitoloError"),
      titoloErr,
    );
    showFieldError(
      document.getElementById("product-descrizione"),
      document.getElementById("productDescrizioneError"),
      descrizioneErr,
    );
    showFieldError(
      document.getElementById("product-autore"),
      document.getElementById("productAutoreError"),
      autoreErr,
    );
    showFieldError(
      document.getElementById("product-prezzo"),
      document.getElementById("productPrezzoError"),
      prezzoErr,
    );
    showFieldError(
      document.getElementById("product-image"),
      document.getElementById("productImageError"),
      imageErr,
    );
    showFieldError(
      document.getElementById("product-categoria"),
      document.getElementById("productCategoriaError"),
      categoriaErr,
    );

    if (
      titoloErr ||
      descrizioneErr ||
      autoreErr ||
      prezzoErr ||
      imageErr ||
      categoriaErr
    ) {
      showToast("Correggi gli errori nel form", "error");
      return;
    }

    const productData = {
      titolo: titolo,
      descrizione: descrizione,
      autore: autore,
      prezzo: prezzo,
      image_path: imagePath,
      id_categoria: idCategoria || null,
    };

    try {
      let response;
      if (productId) {
        //modifica (PATCH)
        productData.id = productId;
        response = await fetch("api/admin/prodotti.php", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      } else {
        //creazione (POST)
        response = await fetch("api/admin/prodotti.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }

      const data = await response.json();

      if (data.success) {
        closeProductModal();
        await loadProducts();
        showToast(data.message || "Prodotto salvato con successo!", "success");
      } else {
        showError("Errore: " + data.message, "error");
      }
    } catch (error) {
      console.error("Errore:", error);
      showError("Errore di connessione durante il salvataggio", "error");
    }
  });
}

//ELIMINA PRODOTTO
//funzione per eliminare prodotto
async function deleteProduct(productId) {
  //salva id dentro variabile dichiarata all'inizio
  productToDeleteId = productId;

  //apre modale
  const modal = document.getElementById("deleteConfirmModal");
  modal.classList.add("show"); // Opzionale se usi classi per animazioni
  modal.style.display = "flex"; //per centrarla bene
}

//modale di conferma per eliminare prodotto
function setupDeleteModal() {
  const modal = document.getElementById("deleteConfirmModal");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");

  //se schiacci conferma dentro la modale
  confirmBtn.addEventListener("click", async () => {
    if (productToDeleteId) {
      //chiama la API per eliminare
      try {
        const response = await fetch("api/admin/prodotti.php", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: productToDeleteId }),
        });
        const data = await response.json();

        if (data.success) {
          showToast("Prodotto eliminato con successo!", "success");
          closeDeleteModal(); // Chiudi modale
          await loadProducts(); // Ricarica tabella
        } else {
          showError("Errore: " + data.message);
        }
      } catch (error) {
        showError("Errore durante l'eliminazione");
      }
    }
  });

  //se schiacci annulla dentrro la modale
  cancelBtn.addEventListener("click", closeDeleteModal);

  //chiude se clicchi fuori dalla modale
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeDeleteModal();
  });
}

function closeDeleteModal() {
  document.getElementById("deleteConfirmModal").style.display = "none";
  productToDeleteId = null; // Resetta l'ID
}

// ===== GESTIONE UTENTI =====

async function loadUsers() {
  try {
    const response = await fetch("api/admin/utenti.php");
    const data = await response.json();

    if (data.success) {
      allUsers = data.utenti;
      displayUsers();
    } else {
      showError("Errore caricamento utenti");
    }
  } catch (error) {
    console.error("Errore:", error);
    showError("Errore caricamento utenti");
  }
}

function displayUsers() {
  const container = document.getElementById("utenti-list");

  if (!container) {
    console.warn("⚠️ Container utenti-list non trovato");
    return;
  }

  if (allUsers.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><p>Nessun utente trovato</p></div>';
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Ruolo</th>
                    <th>Stato</th>
                    <th>Ordini</th>
                    <th>Azioni</th>
                </tr>
            </thead>
            <tbody>
    `;
  allUsers.forEach((user) => {
    const isCurrentUser = currentUser && user.id == currentUser.id_utente;
    const roleBadge =
      user.ruolo == 1
        ? '<span class="badge badge-admin">Admin</span>'
        : '<span class="badge badge-user">Utente</span>';
    const isBlocked = user.blocked == 1;
    const statusBadge = isBlocked
      ? '<span class="badge badge-blocked">Bloccato</span>'
      : '<span class="badge badge-active">Attivo</span>';

    html += `
            <tr ${isBlocked ? 'class="blocked-user"' : ""}>
                <td>${user.id}</td>
                <td>${user.nome} ${user.cognome}</td>
                <td>${user.mail}</td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>${user.num_ordini || 0}</td>
                <td class="actions-cell">
                    ${
                      !isCurrentUser
                        ? `
                        ${
                          user.ruolo == 1
                            ? `<button class="btn btn-small btn-secondary" onclick="toggleAdminRole(${user.id}, 0)">Rimuovi Admin</button>`
                            : `<button class="btn btn-small btn-success" onclick="toggleAdminRole(${user.id}, 1)">Rendi Admin</button>`
                        }
                        ${
                          isBlocked
                            ? `<button class="btn btn-small btn-success" onclick="toggleBlockUser(${user.id}, 0)">Sblocca</button>`
                            : `<button class="btn btn-small btn-danger" onclick="toggleBlockUser(${user.id}, 1)">Blocca</button>`
                        }
                    `
                        : '<span class="current-user-badge">Tu</span>'
                    }
                </td>
            </tr>
        `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

async function viewUserDetail(userId) {
  try {
    const response = await fetch(`api/admin/utenti.php?id=${userId}`);
    const data = await response.json();

    if (data.success) {
      displayUserDetail(data.utente, data.ordini);
    } else {
      alert("Errore: " + data.message);
    }
  } catch (error) {
    console.error("Errore:", error);
    alert("Errore durante il caricamento dei dettagli utente");
  }
}

function displayUserDetail(user, ordini) {
  const roleBadge =
    user.ruolo == 1
      ? '<span class="badge badge-admin">Admin</span>'
      : '<span class="badge badge-user">Utente</span>';
  const statusBadge = '<span class="badge badge-active">Attivo</span>';

  let html = `
        <div class="user-detail">
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Nome Completo</strong>
                    <span>${user.nome} ${user.cognome}</span>
                </div>
                <div class="detail-item">
                    <strong>Email</strong>
                    <span>${user.mail}</span>
                </div>
                <div class="detail-item">
                    <strong>Telefono</strong>
                    <span>${user.telefono || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Città</strong>
                    <span>${user.citta || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Provincia</strong>
                    <span>${user.provincia || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>CAP</strong>
                    <span>${user.cap || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Via</strong>
                    <span>${user.via || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Ruolo</strong>
                    ${roleBadge}
                </div>
                <div class="detail-item">
                    <strong>Stato</strong>
                    ${statusBadge}
                </div>
                <div class="detail-item">
                    <strong>Totale Ordini</strong>
                    <span>${user.num_ordini || 0}</span>
                </div>
            </div>
            
            <div class="orders-list">
                <h4>Storico Ordini</h4>
    `;

  if (ordini.length === 0) {
    html += '<p style="color: var(--text-soft);">Nessun ordine effettuato</p>';
  } else {
    html += `
            <table>
                <thead>
                    <tr>
                        <th>ID Ordine</th>
                        <th>Data</th>
                        <th>Totale</th>
                        <th>N° Prodotti</th>
                    </tr>
                </thead>
                <tbody>
        `;

    ordini.forEach((ordine) => {
      const data = new Date(ordine.data).toLocaleDateString("it-IT");
      html += `
                <tr>
                    <td>#${ordine.id}</td>
                    <td>${data}</td>
                    <td>€${parseFloat(ordine.totale).toFixed(2)}</td>
                    <td>${ordine.num_prodotti}</td>
                </tr>
            `;
    });

    html += "</tbody></table>";
  }

  html += "</div></div>";

  document.getElementById("userDetail").innerHTML = html;
  document.getElementById("userModal").style.display = "block";
}

function closeUserModal() {
  document.getElementById("userModal").style.display = "none";
}

// BLOCCO UTENTE
//funzione per bloccare
async function toggleBlockUser(userId, blocked) {
  // salva dati nelle variabili globali
  userToBlockId = userId;
  blockStatus = blocked;

  //interfaccia modale
  const modal = document.getElementById("blockUserConfirmModal");
  const title = document.getElementById("blockModalTitle");
  const msg = document.getElementById("blockModalMessage");
  const btn = document.getElementById("confirmBlockBtn");

  if (blocked == 1) {
    // se blocca
    title.textContent = "Blocca Utente";
    msg.textContent = "L'utente non potrà più accedere al sito. Sei sicuro?";
    btn.textContent = "Blocca";
    btn.className = "btn btn-danger"; // Rosso
  } else {
    // se sblocca
    title.textContent = "Sblocca Utente";
    msg.textContent = "L'utente potrà nuovamente accedere al sito. Sei sicuro?";
    btn.textContent = "Sblocca";
    btn.className = "btn btn-success"; // Verde (assicurati di avere questa classe nel CSS, o usa btn-primary)
  }

  // mostra modale
  modal.style.display = "flex";
}

//modale per conferma blocco utente
function setupBlockUserModal() {
  const modal = document.getElementById("blockUserConfirmModal");
  const confirmBtn = document.getElementById("confirmBlockBtn");
  const cancelBtn = document.getElementById("cancelBlockBtn");

  //se schiacci conferma dentro la modale
  confirmBtn.addEventListener("click", async () => {
    if (userToBlockId !== null && blockStatus !== null) {
      try {
        const response = await fetch("api/admin/utenti.php", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userToBlockId, blocked: blockStatus }),
        });

        const data = await response.json();

        if (data.success) {
          showToast(data.message, "success");
          closeBlockModal(); // Chiudi modale
          await loadUsers(); // Ricarica tabella utenti
          updateDashboardStats(); // Aggiorna i contatori in alto
        } else {
          showError("Errore: " + data.message);
        }
      } catch (error) {
        console.error("Errore:", error);
        showError("Errore durante l'operazione");
      }
    }
  });

  //se clicchi annulla
  cancelBtn.addEventListener("click", closeBlockModal);

  //chiude cliccando fuori
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeBlockModal();
  });
}

function closeBlockModal() {
  document.getElementById("blockUserConfirmModal").style.display = "none";
  userToBlockId = null;
  blockStatus = null;
}

// ADMIN UTENTE
//funzione
async function toggleAdminRole(userId, ruolo) {
  //recupera dati utente da array
  const user = allUsers.find((u) => u.id == userId);

  //controllo: impossibile rendere admin un utente bloccato
  if (ruolo == 1 && user && user.blocked == 1) {
    showError(
      "Impossibile rendere Amministratore un utente bloccato. Devi prima sbloccarlo.",
    );
    return;
  }

  // salva dati nelle variabili globali
  userToToggleRoleId = userId;
  roleTarget = ruolo;

  //interfaccia modale
  const modal = document.getElementById("adminRoleConfirmModal");
  const title = document.getElementById("adminRoleModalTitle");
  const msg = document.getElementById("adminRoleModalMessage");
  const btn = document.getElementById("confirmAdminRoleBtn");

  if (ruolo == 1) {
    // promuove a admin
    title.textContent = "Promuovi ad Admin";
    msg.textContent =
      "Questo utente avrà accesso completo alla dashboard di amministrazione.";
    btn.textContent = "Promuovi";
    btn.className = "btn btn-success";
  } else {
    // rimuove da admin
    title.textContent = "Rimuovi Admin";
    msg.textContent =
      "L'utente perderà l'accesso alla dashboard di amministrazione.";
    btn.textContent = "Rimuovi";
    btn.className = "btn btn-danger";
  }

  //mostra modale
  modal.style.display = "flex";
}

//modale
function setupAdminRoleModal() {
  const modal = document.getElementById("adminRoleConfirmModal");
  const confirmBtn = document.getElementById("confirmAdminRoleBtn");
  const cancelBtn = document.getElementById("cancelAdminRoleBtn");

  //se schiaccia conferma
  confirmBtn.addEventListener("click", async () => {
    if (userToToggleRoleId !== null && roleTarget !== null) {
      try {
        const response = await fetch("api/admin/utenti.php", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userToToggleRoleId, ruolo: roleTarget }),
        });

        const data = await response.json();

        if (data.success) {
          if (typeof showToast === "function")
            showToast(data.message, "success");
          closeAdminRoleModal();
          await loadUsers(); // Ricarica la tabella
          updateDashboardStats(); // Aggiorna i contatori
        } else {
          showError("Errore: " + data.message);
        }
      } catch (error) {
        console.error("Errore:", error);
        showError("Errore durante l'operazione");
      }
    }
  });

  // se schiaccia annulla
  cancelBtn.addEventListener("click", closeAdminRoleModal);

  // chiude se click fuori da finestra
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeAdminRoleModal();
  });
}

function closeAdminRoleModal() {
  document.getElementById("adminRoleConfirmModal").style.display = "none";
  userToToggleRoleId = null;
  roleTarget = null;
}

// ===== NAVIGAZIONE =====

function setupNavigation() {
  const tabs = document.querySelectorAll(".admin-tab");
  const sections = document.querySelectorAll(".admin-section-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();

      // Rimuovi active da tutti
      tabs.forEach((t) => t.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      // Aggiungi active al tab cliccato
      tab.classList.add("active");

      // Mostra la sezione corrispondente
      const tabName = tab.dataset.tab;
      const sectionId = tabName + "-section";
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.add("active");
      }
    });
  });

  // Event listener per pulsante Aggiungi Prodotto
  const addProductBtn = document.getElementById("addProductBtn");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      openAddProductModal();
    });
  }

  // Event listener per chiusura modal prodotto
  const closeProductModalBtn = document.getElementById("closeProductModal");
  if (closeProductModalBtn) {
    closeProductModalBtn.addEventListener("click", closeProductModal);
  }

  const cancelProductBtn = document.getElementById("cancelProductBtn");
  if (cancelProductBtn) {
    cancelProductBtn.addEventListener("click", closeProductModal);
  }

  // Event listener per chiusura modal utente
  const closeUserModalBtn = document.getElementById("closeUserModal");
  if (closeUserModalBtn) {
    closeUserModalBtn.addEventListener("click", closeUserModal);
  }
}

// ===== UTILITY =====

function showError(message) {
  alert(message);
}

function logout() {
  if (confirm("Sei sicuro di voler uscire?")) {
    // Usa il metodo di logout dell'header component
    fetch("api/auth/logout.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          store.logout();
          router.navigate("/home");
        }
      })
      .catch((error) => {
        console.error("Errore logout:", error);
      });
  }
}

// Chiudi modal cliccando fuori
window.onclick = function (event) {
  const productModal = document.getElementById("productModal");
  const userModal = document.getElementById("userModal");

  if (event.target == productModal) {
    closeProductModal();
  }
  if (event.target == userModal) {
    closeUserModal();
  }
};
