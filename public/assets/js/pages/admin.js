/**
 * ========================================
 * ADMIN DASHBOARD - JavaScript Controller
 * ========================================
 *
 * Questo file gestisce l'intera dashboard di amministrazione del sito,
 * permettendo agli admin di gestire prodotti e utenti attraverso un'interfaccia intuitiva.
 *
 * FUNZIONALITÀ PRINCIPALI:
 * - Gestione Prodotti: CRUD completo (Create, Read, Update, Delete)
 * - Gestione Utenti: visualizzazione, blocco/sblocco, cambio ruoli
 * - Statistiche Dashboard: contatori prodotti, utenti, admin
 * - Navigazione tabs: switch tra sezione prodotti e utenti
 * - Modali di conferma: per azioni critiche (eliminazione, blocco)
 * - Validazione form: real-time validation per campi prodotto
 *
 * ARCHITETTURA:
 * - Pattern MVC: questo file è il Controller che gestisce le interazioni
 * - State Management: variabili globali per cache dei dati
 * - API REST: comunicazione asincrona con backend PHP
 * - Event-driven: listener su form, bottoni, modali
 *
 * SICUREZZA:
 * - Controllo autenticazione: verifica login all'avvio
 * - Controllo autorizzazione: verifica ruolo admin
 * - Protezione utente corrente: impedisce auto-modifica
 * - Conferme modali: per azioni distruttive
 */

// ========================================
// STATO GLOBALE DELL'APPLICAZIONE
// ========================================
// Queste variabili mantengono lo stato corrente della dashboard
// e vengono utilizzate da tutte le funzioni per condividere dati

let currentUser = null; // Oggetto utente loggato (da store), contiene id, nome, cognome, ruolo
let allProducts = []; // Array di tutti i prodotti caricati dal backend
let allUsers = []; // Array di tutti gli utenti caricati dal backend
let allCategories = []; // Array di tutte le categorie disponibili per i prodotti

// Variabili temporanee per gestire le operazioni sui modali
let productToDeleteId = null; // ID del prodotto in attesa di conferma eliminazione
let userToBlockId = null; // ID dell'utente in attesa di conferma blocco/sblocco
let blockStatus = null; // Stato target del blocco (1=blocca, 0=sblocca)
let userToToggleRoleId = null; // ID dell'utente in attesa di cambio ruolo
let roleTarget = null; // Ruolo target (1=admin, 0=utente normale)

// ========================================
// INIZIALIZZAZIONE PAGINA
// ========================================

/**
 * Funzione principale di inizializzazione della dashboard admin
 * FLUSSO OPERATIVO:
 * 1. Verifica autenticazione utente (se non loggato → redirect a login)
 * 2. Verifica autorizzazione admin (se non admin → redirect a home)
 * 3. Carica dati iniziali (categorie, prodotti, utenti)
 * 4. Inizializza componenti UI (form, modali, tabs)
 * @async - È asincrona perché deve attendere il caricamento dei dati dal backend
 * @returns {void}
 */
async function initAdminPage() {
  // STEP 1: Ottieni dati utente corrente dallo store (localStorage)
  const user = store.getUser();

  // STEP 2: SECURITY CHECK - Verifica autenticazione
  // Se l'utente non è loggato, reindirizza alla pagina di login
  if (!user || !store.isAuthenticated()) {
    // Prova a usare il router SPA se disponibile, altrimenti fallback a redirect classico
    if (typeof router !== "undefined") {
      const redirectUrl = encodeURIComponent("/admin"); // Salva l'URL di destinazione
      router.navigate(`/login?redirect=${redirectUrl}`); // Passa URL come parametro GET
    } else {
      // Fallback per compatibilità con vecchia navigazione multi-page,
      window.location.href =
        "login.html?redirect=" + encodeURIComponent("/admin");
    }
    return; // GUARD CLAUSE: esci immediatamente
  }

  // STEP 3: AUTHORIZATION CHECK - Verifica ruolo admin
  // Solo gli admin (ruolo === 1) possono accedere a questa pagina
  if (!store.isAdmin()) {
    // Mostra messaggio di errore se la funzione toast è disponibile
    if (typeof showToast !== "undefined") {
      showToast("Accesso negato: solo gli amministratori possono accedere");
    }

    // Reindirizza alla home page
    if (typeof router !== "undefined") {
      router.navigate("/home");
    } else {
      window.location.href = "index.html";
    }
    return; // GUARD CLAUSE: esci immediatamente
  }

  // STEP 4: Controlli superati! Salva utente corrente e procedi
  currentUser = user; // Salva in variabile globale per uso in altre funzioni

  // STEP 5: Carica tutti i dati necessari
  await loadCategories(); // Carica categorie per select nel form prodotto
  await loadDashboardData(); // Carica prodotti e utenti, aggiorna statistiche

  // STEP 6: Inizializza tutti i componenti dell'interfaccia
  setupNavigation(); // Gestione tabs (prodotti/utenti)
  setupProductForm(); // Form di creazione/modifica prodotto + validazione
  setupDeleteModal(); // Modale conferma eliminazione prodotto
  setupBlockUserModal(); // Modale conferma blocco/sblocco utente
  setupAdminRoleModal(); // Modale conferma cambio ruolo utente
  setupErrorModal(); // Modale per messaggi di errore
}

// Espone la funzione globalmente per permettere al router SPA di chiamarla
// Questo permette la navigazione senza ricaricare la pagina
window.initAdminPage = initAdminPage;

// ========================================
// GESTIONE CATEGORIE
// ========================================
/**
 * Carica tutte le categorie disponibili dal backend
 * API ENDPOINT: GET /api/catalogo/categorie.php
 * RISPOSTA ATTESA: { success: true, data: [{id, nome}, ...] }
 * @async
 * @returns {Promise<void>}
 */
async function loadCategories() {
  try {
    const response = await fetch("api/catalogo/categorie.php");
    const data = await response.json();

    if (data.success) {
      allCategories = data.data; // La risposta API contiene l'array in data.data
      populateCategorySelect(); // Popola immediatamente la select nel form
    }
  } catch (error) {
    console.error("Errore caricamento categorie:", error);
    // Non blocca l'esecuzione: il form funzionerà comunque, solo senza categorie
  }
}

/**
 * Popola la select delle categorie nel form prodotto
 *
 * Questa funzione costruisce dinamicamente le opzioni della select HTML
 * utilizzando l'array allCategories caricato dal backend.
 *
 * @returns {void}
 */
function populateCategorySelect() {
  const select = document.getElementById("product-categoria");

  // GUARD: Verifica che l'elemento esista nel DOM
  if (!select) {
    return;
  }

  // Reset: Pulisce eventuali opzioni precedenti e aggiunge opzione placeholder
  select.innerHTML = '<option value="">-- Seleziona una categoria --</option>';

  // CASO 1: Nessuna categoria disponibile
  if (allCategories.length === 0) {
    select.innerHTML =
      '<option value="">Nessuna categoria disponibile</option>';
    select.disabled = true; // Disabilita la select per evitare confusione
    return;
  }

  // CASO 2: Categorie disponibili - costruisci opzioni dinamicamente
  select.disabled = false; // Riabilita la select (potrebbe essere stata disabilitata prima)

  // Itera su tutte le categorie e crea un'opzione per ciascuna
  allCategories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id; // Valore inviato al backend
    option.textContent = cat.nome; // Testo visibile all'utente
    select.appendChild(option); // Aggiunge l'opzione alla select
  });
}

// ========================================
// CARICAMENTO DATI E STATISTICHE DASHBOARD
// ========================================

/**
 * Carica tutti i dati necessari per la dashboard e aggiorna le statistiche
 * Questa è una funzione che coordina il caricamento di prodotti e utenti in parallelo, poi aggiorna i contatori nella UI.
 * FLUSSO:
 * 1. Lancia loadProducts() e loadUsers() in parallelo
 * 2. Attende che entrambe finiscano
 * 3. Calcola e mostra le statistiche nei badge in alto
 *
 * @async
 * @returns {Promise<void>}
 */
async function loadDashboardData() {
  // Carica prodotti e utenti in parallelo per ottimizzare i tempi
  await Promise.all([loadProducts(), loadUsers()]);

  // Una volta caricati i dati, aggiorna i contatori visualizzati
  updateDashboardStats();
}

/**
 * Aggiorna i badge con le statistiche della dashboard
 *
 * Calcola e mostra in tempo reale:
 * - Numero totale di prodotti
 * - Numero totale di utenti
 * - Numero di amministratori
 * - Numero di utenti bloccati
 *
 * QUANDO VIENE CHIAMATA:
 * - All'inizializzazione della pagina (dopo loadDashboardData)
 * - Dopo operazioni che modificano utenti (blocco, cambio ruolo)
 * - Dopo operazioni che modificano prodotti (aggiunta, eliminazione)
 * @returns {void}
 */
function updateDashboardStats() {
  // Ottieni riferimenti agli elementi HTML dei contatori
  const totalProducts = document.getElementById("total-products");
  const totalUsers = document.getElementById("total-users");
  const totalAdmins = document.getElementById("total-admins");
  const totalBlocked = document.getElementById("total-blocked");

  // Aggiorna ogni contatore solo se l'elemento esiste nel DOM
  if (totalProducts) totalProducts.textContent = allProducts.length;
  if (totalUsers) totalUsers.textContent = allUsers.length;

  // Filtra array per contare solo admin (ruolo === 1)
  if (totalAdmins)
    totalAdmins.textContent = allUsers.filter((u) => u.ruolo == 1).length;

  // Filtra array per contare solo utenti bloccati (blocked === 1)
  if (totalBlocked)
    totalBlocked.textContent = allUsers.filter((u) => u.blocked == 1).length;
}

// ========================================
// GESTIONE PRODOTTI - CRUD COMPLETO
// ========================================
// Questa sezione gestisce tutte le operazioni sui prodotti:
// Create (POST), Read (GET), Update (PATCH), Delete (DELETE)

/**
 * Carica tutti i prodotti dal backend tramite API
 *
 * Recupera l'elenco completo dei prodotti con tutte le informazioni
 * necessarie per la visualizzazione nella tabella admin.
 * @async
 * @returns {Promise<void>}
 */
async function loadProducts() {
  try {
    const response = await fetch("api/admin/prodotti.php");
    const data = await response.json();

    if (data.success) {
      allProducts = data.prodotti; // Salva in cache globale
      displayProducts(); // Renderizza immediatamente la tabella
    } else {
      // Errore lato server (es. database non raggiungibile)
      showError("Errore caricamento prodotti");
    }
  } catch (error) {
    // Errore di rete o parsing JSON
    console.error("Errore:", error);
    showError("Errore caricamento prodotti");
  }
}

/**
 * Renderizza la tabella dei prodotti nell'interfaccia admin
 *
 * Costruisce dinamicamente una tabella HTML con tutti i prodotti caricati,
 * includendo le azioni di modifica ed eliminazione per ogni riga.
 *
 * @returns {void}
 */
function displayProducts() {
  const container = document.getElementById("prodotti-list");

  // GUARD: Verifica esistenza container nel DOM
  if (!container) {
    return;
  }

  // CASO 1: Nessun prodotto - mostra empty state
  if (allProducts.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><p>Nessun prodotto trovato</p></div>';
    return;
  }

  // CASO 2: Costruisci tabella HTML dinamicamente
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

  // Itera su ogni prodotto e crea una riga
  allProducts.forEach((product) => {
    // Determina il badge categoria: se esiste mostra nome, altrimenti "Senza categoria"
    const categoriaBadge = product.categoria_nome
      ? `<span class="badge-category">${product.categoria_nome}</span>`
      : '<span class="badge-category no-category">Senza categoria</span>';

    // Costruisci riga tabella con dati prodotto e bottoni azione
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
  container.innerHTML = html; // Inietta HTML nel DOM
}

/**
 * Apre il modale per aggiungere un nuovo prodotto
 *
 * Inizializza il form in modalità "creazione":
 *
 * CHIAMATA DA:
 * - Click sul bottone "Aggiungi Prodotto" nella sezione prodotti
 *
 * @returns {void}
 */
function openAddProductModal() {
  // Imposta titolo modale per indicare modalità creazione
  document.getElementById("productModalTitle").textContent =
    "Aggiungi Prodotto";

  // Svuota campo ID nascosto (indica che è un nuovo prodotto)
  document.getElementById("product-id").value = "";

  // Reset completo del form (cancella tutti i valori)
  document.getElementById("productForm").reset();

  // Imposta valore default per autore
  document.getElementById("product-autore").value = "sconosciuto";

  // Ripopola le categorie per garantire che siano aggiornate
  populateCategorySelect();

  // Mostra il modale
  document.getElementById("productModal").style.display = "block";
}

/**
 * Apre il modale per modificare un prodotto esistente
 *
 * Inizializza il form in modalità "modifica":
 *
 * @param {number} productId - ID del prodotto da modificare
 * @returns {void}
 */
function openEditProductModal(productId) {
  // Cerca il prodotto nell'array caricato
  const product = allProducts.find((p) => p.id == productId);

  // GUARD: Se prodotto non trovato, esce
  if (!product) return;

  // Imposta titolo modale per indicare modalità modifica
  document.getElementById("productModalTitle").textContent =
    "Modifica Prodotto";

  // Compila tutti i campi con i dati del prodotto
  document.getElementById("product-id").value = product.id;
  document.getElementById("product-titolo").value = product.titolo;
  document.getElementById("product-descrizione").value = product.descrizione;
  document.getElementById("product-autore").value = product.autore;
  document.getElementById("product-prezzo").value = product.prezzo;
  document.getElementById("product-image").value = product.image_path;

  // Ripopola categorie per garantire sincronizzazione
  populateCategorySelect();

  // Imposta la categoria selezionata (o vuoto se non ha categoria)
  document.getElementById("product-categoria").value =
    product.id_categoria || "";

  // Mostra il modale
  document.getElementById("productModal").style.display = "block";
}

/**
 * Chiude il modale prodotto
 *
 * Nasconde semplicemente il modale senza fare altre operazioni.
 * @returns {void}
 */
function closeProductModal() {
  document.getElementById("productModal").style.display = "none";
}

/**
 * Inizializza il form prodotto con validazione real-time e gestione submit
 *
 * Questa è una delle funzioni più complesse del file. Gestisce:
 * 1. Validazione in tempo reale di tutti i campi
 * 2. Feedback visivo immediato (bordi rossi/verdi, messaggi errore)
 * 3. Submit del form (CREATE o UPDATE)
 * 4. Comunicazione con API backend
 *
 * VALIDAZIONE REAL-TIME:
 * - Evento "blur": quando l'utente esce da un campo
 * - Evento "input": mentre l'utente digita (solo se già in errore)
 * Questo evita di mostrare errori troppo presto, migliorando UX
 *
 * SUBMIT FLOW:
 * 1. Intercetta evento submit (preventDefault)
 * 2. Valida tutti i campi
 * 3. Se errori: mostra messaggi e blocca submit
 * 4. Se OK: determina se CREATE (POST) o UPDATE (PATCH)
 * 5. Invia dati al backend
 * 6. Gestisce risposta: successo → chiude modale, errore → mostra alert
 *
 * @returns {void}
 */
function setupProductForm() {
  const productForm = document.getElementById("productForm");

  // GUARD: Verifica che il form esista nel DOM
  if (!productForm) {
    return;
  }

  // ========================================
  // FUNZIONI DI VALIDAZIONE
  // ========================================
  // Queste funzioni contengono la logica di validazione per ogni tipo di campo

  /**
   * Valida campi obbligatori
   * @param {string} value - Valore del campo
   * @param {string} fieldName - Nome descrittivo del campo per messaggio errore
   * @returns {string} Messaggio di errore o stringa vuota se valido
   */
  function validateRequired(value, fieldName) {
    if (!value || value.trim() === "") {
      return `${fieldName} è obbligatorio`;
    }
    return ""; // Vuoto = nessun errore
  }

  /**
   * Valida il campo prezzo
   * Deve essere un numero positivo maggiore di 0
   * @param {string} value - Valore del campo prezzo
   * @returns {string} Messaggio di errore o stringa vuota se valido
   */
  function validatePrezzo(value) {
    if (!value) return "Il prezzo è obbligatorio";

    const prezzo = parseFloat(value);

    // Controlla che sia un numero valido e maggiore di 0
    if (isNaN(prezzo) || prezzo <= 0) {
      return "Inserisci un prezzo valido maggiore di 0";
    }

    return ""; // Valido
  }

  /**
   * Mostra feedback visivo per un campo del form
   *
   * Gestisce 3 stati visivi:
   * 1. Errore: bordo rosso + messaggio errore visibile
   * 2. Successo: bordo verde + messaggio nascosto
   * 3. Neutro: nessun bordo speciale
   *
   * @param {HTMLElement} input - Elemento input da modificare
   * @param {HTMLElement} errorSpan - Span dove mostrare messaggio errore
   * @param {string} message - Messaggio di errore (vuoto se nessun errore)
   */
  function showFieldError(input, errorSpan, message) {
    // GUARD: Se elementi non esistono, esce silenziosamente
    if (!input || !errorSpan) return;

    if (message) {
      // STATO ERRORE
      input.classList.add("input-error"); // Aggiunge bordo rosso
      input.classList.remove("input-success"); // Rimuove bordo verde
      errorSpan.textContent = message; // Mostra messaggio errore
      errorSpan.style.display = "block"; // Rende visibile lo span
    } else {
      // STATO SUCCESSO
      input.classList.remove("input-error"); // Rimuove bordo rosso
      input.classList.add("input-success"); // Aggiunge bordo verde
      errorSpan.textContent = ""; // Nasconde messaggio errore
      errorSpan.style.display = "none"; // Nasconde lo span
    }
  }

  // ========================================
  // ATTACCO EVENT LISTENERS PER VALIDAZIONE REAL-TIME
  // ========================================
  /**
   * Configura i listener per validazione in tempo reale su tutti i campi
   */
  function attachFormValidation() {
    // Ottieni riferimenti a tutti gli input del form
    const titoloInput = document.getElementById("product-titolo");
    const descrizioneInput = document.getElementById("product-descrizione");
    const autoreInput = document.getElementById("product-autore");
    const prezzoInput = document.getElementById("product-prezzo");
    const imageInput = document.getElementById("product-image");
    const categoriaInput = document.getElementById("product-categoria");

    // Ottieni riferimenti a tutti gli span per messaggi errore
    const titoloError = document.getElementById("productTitoloError");
    const descrizioneError = document.getElementById("productDescrizioneError");
    const autoreError = document.getElementById("productAutoreError");
    const prezzoError = document.getElementById("productPrezzoError");
    const imageError = document.getElementById("productImageError");
    const categoriaError = document.getElementById("productCategoriaError");

    // GUARD: Verifica che tutti gli elementi necessari esistano
    if (
      !titoloInput ||
      !descrizioneInput ||
      !autoreInput ||
      !prezzoInput ||
      !imageInput ||
      !categoriaInput
    ) {
      return;
    }

    // ========================================
    // VALIDAZIONE TITOLO
    // ========================================
    // Evento blur: valida quando l'utente esce dal campo
    titoloInput.addEventListener("blur", () => {
      const error = validateRequired(titoloInput.value, "Il titolo");
      showFieldError(titoloInput, titoloError, error);
    });

    // Evento input: valida solo se il campo è già in stato errore
    // Questo fornisce feedback immediato durante la correzione
    titoloInput.addEventListener("input", () => {
      if (titoloInput.classList.contains("input-error")) {
        const error = validateRequired(titoloInput.value, "Il titolo");
        showFieldError(titoloInput, titoloError, error);
      }
    });

    // ========================================
    // VALIDAZIONE DESCRIZIONE
    // ========================================
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

    // ========================================
    // VALIDAZIONE AUTORE
    // ========================================
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

    // ========================================
    // VALIDAZIONE PREZZO
    // ========================================
    // Usa validatePrezzo() che controlla sia obbligatorietà che formato
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

    // ========================================
    // VALIDAZIONE IMMAGINE
    // ========================================
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

    // ========================================
    // VALIDAZIONE CATEGORIA
    // ========================================
    // Usa "change" invece di "input" perché è una select
    categoriaInput.addEventListener("blur", () => {
      const error = validateRequired(categoriaInput.value, "La categoria");
      showFieldError(categoriaInput, categoriaError, error);
    });

    categoriaInput.addEventListener("change", () => {
      const error = validateRequired(categoriaInput.value, "La categoria");
      showFieldError(categoriaInput, categoriaError, error);
    });
  }

  // Attiva i listener di validazione al caricamento
  attachFormValidation();

  // ========================================
  // GESTIONE SUBMIT FORM
  // ========================================
  /**
   * Handler per il submit del form prodotto
   *
   * Gestisce sia la creazione che la modifica di prodotti,
   * determinando automaticamente quale operazione eseguire
   * in base alla presenza o meno dell'ID prodotto.
   *
   *
   * API ENDPOINTS:
   * - POST /api/admin/prodotti.php → crea nuovo
   * - PATCH /api/admin/prodotti.php → modifica esistente
   *
   * RISPOSTA ATTESA: { success: true/false, message: "..." }
   */
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Blocca submit HTML standard

    // ========================================
    // STEP 1: RACCOLTA VALORI DAI CAMPI
    // ========================================
    const productId = document.getElementById("product-id").value;
    const titolo = document.getElementById("product-titolo").value.trim();
    const descrizione = document
      .getElementById("product-descrizione")
      .value.trim();
    const autore = document.getElementById("product-autore").value.trim();
    const prezzo = document.getElementById("product-prezzo").value;
    const imagePath = document.getElementById("product-image").value.trim();
    const idCategoria = document.getElementById("product-categoria").value;

    // ========================================
    // STEP 2: VALIDAZIONE FINALE
    // ========================================
    // Valida tutti i campi prima di inviare
    const titoloErr = validateRequired(titolo, "Il titolo");
    const descrizioneErr = validateRequired(descrizione, "La descrizione");
    const autoreErr = validateRequired(autore, "L'autore");
    const prezzoErr = validatePrezzo(prezzo);
    const imageErr = validateRequired(imagePath, "Il percorso immagine");
    const categoriaErr = validateRequired(idCategoria, "La categoria");

    // Mostra feedback visivo per tutti i campi
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

    // Se c'è almeno un errore, blocca il submit
    if (
      titoloErr ||
      descrizioneErr ||
      autoreErr ||
      prezzoErr ||
      imageErr ||
      categoriaErr
    ) {
      showToast("Correggi gli errori nel form", "error");
      return; // BLOCCA INVIO
    }

    // ========================================
    // STEP 3: PREPARAZIONE DATI
    // ========================================
    // Costruisci oggetto con i dati da inviare al backend
    const productData = {
      titolo: titolo,
      descrizione: descrizione,
      autore: autore,
      prezzo: prezzo,
      image_path: imagePath,
      id_categoria: idCategoria || null, // null se non selezionata
    };

    // ========================================
    // STEP 4: INVIO AL BACKEND
    // ========================================
    try {
      let response;

      if (productId) {
        // ===== MODIFICA PRODOTTO ESISTENTE =====
        // Aggiungi ID ai dati per identificare quale prodotto modificare
        productData.id = productId;

        // Invia richiesta PATCH per aggiornare
        response = await fetch("api/admin/prodotti.php", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json", // Indica che il body è JSON
          },
          body: JSON.stringify(productData),
        });
      } else {
        // ===== CREAZIONE NUOVO PRODOTTO =====
        // Invia richiesta POST per creare
        response = await fetch("api/admin/prodotti.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }

      // ========================================
      // STEP 5: GESTIONE RISPOSTA
      // ========================================
      const data = await response.json();

      if (data.success) {
        // SUCCESSO: chiudi modale, ricarica tabella, mostra conferma
        closeProductModal();
        await loadProducts(); // Ricarica lista prodotti aggiornata
        showToast(data.message || "Prodotto salvato con successo!", "success");
      } else {
        // ERRORE BACKEND: mostra messaggio dal server
        showError("Errore: " + data.message, "error");
      }
    } catch (error) {
      // ERRORE DI RETE: connessione fallita o parsing JSON fallito
      console.error("Errore:", error);
      showError("Errore di connessione durante il salvataggio", "error");
    }
  });
}

// ========================================
// ELIMINAZIONE PRODOTTO
// ========================================

/**
 * Avvia il processo di eliminazione di un prodotto
 *
 * Non elimina immediatamente, ma apre un modale di conferma
 * per evitare eliminazioni accidentali (azione distruttiva).
 * @param {number} productId - ID del prodotto da eliminare
 * @returns {void}
 */
async function deleteProduct(productId) {
  // Salva ID in variabile globale per usarlo nella conferma
  productToDeleteId = productId;

  // Apre modale di conferma
  const modal = document.getElementById("deleteConfirmModal");
  modal.classList.add("show"); // Classe opzionale per animazioni CSS
  modal.style.display = "flex"; // Display flex per centratura verticale/orizzontale
}

/**
 * Configura il modale di conferma eliminazione prodotto
 * API: DELETE /api/admin/prodotti.php
 * Body: { id: productId }
 * CHIAMATA DA: initAdminPage() durante inizializzazione
 *
 * @returns {void}
 */
function setupDeleteModal() {
  const modal = document.getElementById("deleteConfirmModal");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");

  // ===== CONFERMA ELIMINAZIONE =====
  confirmBtn.addEventListener("click", async () => {
    // Verifica che ci sia un ID salvato
    if (productToDeleteId) {
      try {
        // Invia richiesta DELETE al backend
        const response = await fetch("api/admin/prodotti.php", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: productToDeleteId }),
        });

        const data = await response.json();

        if (data.success) {
          // Successo: feedback positivo e aggiorna UI
          showToast("Prodotto eliminato con successo!", "success");
          closeDeleteModal(); // Chiudi modale
          await loadProducts(); // Ricarica tabella aggiornata
        } else {
          // Errore backend: mostra messaggio
          showError("Errore: " + data.message);
        }
      } catch (error) {
        // Errore rete
        showError("Errore durante l'eliminazione");
      }
    }
  });

  // ===== ANNULLA ELIMINAZIONE =====
  cancelBtn.addEventListener("click", closeDeleteModal);

  // ===== CHIUDI CLICCANDO FUORI =====
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeDeleteModal();
  });
}

/**
 * Chiude il modale di conferma eliminazione
 * Resetta anche la variabile globale productToDeleteId
 *
 * @returns {void}
 */
function closeDeleteModal() {
  document.getElementById("deleteConfirmModal").style.display = "none";
  productToDeleteId = null; // Pulisci variabile globale
}

// ========================================
// GESTIONE UTENTI
// ========================================
// Gli admin possono visualizzare tutti gli utenti e gestire:
// - Blocco/Sblocco account
// - Promozione/Rimozione ruolo admin
// Non possono modificare se stessi per sicurezza

/**
 * Carica tutti gli utenti dal backend tramite API
 *
 * API ENDPOINT: GET /api/admin/utenti.php
 *
 * @async
 * @returns {Promise<void>}
 */
async function loadUsers() {
  try {
    const response = await fetch("api/admin/utenti.php");
    const data = await response.json();

    if (data.success) {
      allUsers = data.utenti; // Salva in cache globale
      displayUsers(); // Renderizza immediatamente la tabella
    } else {
      showError("Errore caricamento utenti");
    }
  } catch (error) {
    console.error("Errore:", error);
    showError("Errore caricamento utenti");
  }
}

/**
 * Renderizza la tabella degli utenti nell'interfaccia admin
 *
 * Costruisce dinamicamente una tabella HTML con tutti gli utenti,
 * mostrando stato, ruolo e azioni disponibili per ciascuno.
 *
 * @returns {void}
 */
function displayUsers() {
  const container = document.getElementById("utenti-list");

  // GUARD: Verifica esistenza container
  if (!container) {
    return;
  }

  // CASO 1: Nessun utente - mostra empty state
  if (allUsers.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><p>Nessun utente trovato</p></div>';
    return;
  }

  // CASO 2: Costruisci tabella HTML dinamicamente
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

  // Itera su ogni utente e crea una riga
  allUsers.forEach((user) => {
    // Determina se questo utente è l'admin correntemente loggato
    const isCurrentUser = currentUser && user.id == currentUser.id_utente;

    // Crea badge ruolo: admin (arancione) o user (blu)
    const roleBadge =
      user.ruolo == 1
        ? '<span class="badge badge-admin">Admin</span>'
        : '<span class="badge badge-user">Utente</span>';

    // Determina stato blocco
    const isBlocked = user.blocked == 1;

    // Crea badge stato: bloccato (rosso) o attivo (verde)
    const statusBadge = isBlocked
      ? '<span class="badge badge-blocked">Bloccato</span>'
      : '<span class="badge badge-active">Attivo</span>';

    // Costruisci riga con classe condizionale se utente bloccato
    html += `
            <tr ${isBlocked ? 'class="blocked-user"' : ""}>
                <td>${user.id}</td>
                <td>${user.nome} ${user.cognome}</td>
                <td>${user.mail}</td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>${user.num_ordini || 0}</td>
                <td class="actions-cell">
    `;

    // LOGICA AZIONI: Se è l'utente corrente, non mostra bottoni
    if (!isCurrentUser) {
      // BOTTONE CAMBIO RUOLO (condizionale)
      if (user.ruolo == 1) {
        // È admin → mostra "Rimuovi Admin"
        html += `<button class="btn btn-small btn-secondary" onclick="toggleAdminRole(${user.id}, 0)">Rimuovi Admin</button>`;
      } else {
        // È utente normale → mostra "Rendi Admin"
        html += `<button class="btn btn-small btn-success" onclick="toggleAdminRole(${user.id}, 1)">Rendi Admin</button>`;
      }

      // BOTTONE BLOCCO/SBLOCCO (condizionale)
      if (isBlocked) {
        // È bloccato → mostra "Sblocca"
        html += `<button class="btn btn-small btn-success" onclick="toggleBlockUser(${user.id}, 0)">Sblocca</button>`;
      } else {
        // È attivo → mostra "Blocca"
        html += `<button class="btn btn-small btn-danger" onclick="toggleBlockUser(${user.id}, 1)">Blocca</button>`;
      }
    } else {
      // È l'utente corrente → mostra solo badge "Tu"
      html += '<span class="current-user-badge">Tu</span>';
    }

    html += `
                </td>
            </tr>
        `;
  });

  html += "</tbody></table>";
  container.innerHTML = html; // Inietta HTML nel DOM
}

// ========================================
// BLOCCO/SBLOCCO UTENTE
// ========================================

/**
 * Avvia il processo di blocco o sblocco di un utente
 *
 * Non modifica immediatamente, ma apre un modale di conferma
 * con messaggio personalizzato in base all'azione.
 *
 * @param {number} userId - ID dell'utente da bloccare/sbloccare
 * @param {number} blocked - Stato target (1=blocca, 0=sblocca)
 * @returns {void}
 */
async function toggleBlockUser(userId, blocked) {
  // Salva dati nelle variabili globali per usarli nella conferma
  userToBlockId = userId;
  blockStatus = blocked;

  // Ottieni riferimenti agli elementi del modale
  const modal = document.getElementById("blockUserConfirmModal");
  const title = document.getElementById("blockModalTitle");
  const msg = document.getElementById("blockModalMessage");
  const btn = document.getElementById("confirmBlockBtn");

  // Configura testi e stili in base all'azione
  if (blocked == 1) {
    // ===== BLOCCO UTENTE =====
    title.textContent = "Blocca Utente";
    msg.textContent = "L'utente non potrà più accedere al sito. Sei sicuro?";
    btn.textContent = "Blocca";
    btn.className = "btn btn-danger"; // Rosso (azione distruttiva)
  } else {
    // ===== SBLOCCO UTENTE =====
    title.textContent = "Sblocca Utente";
    msg.textContent = "L'utente potrà nuovamente accedere al sito. Sei sicuro?";
    btn.textContent = "Sblocca";
    btn.className = "btn btn-success"; // Verde (azione positiva)
  }

  // Mostra il modale
  modal.style.display = "flex";
}

/**
 * Configura il modale di conferma blocco/sblocco utente
 *
 * API: PATCH /api/admin/utenti.php
 * Body: { id: userId, blocked: 1|0 }
 * CHIAMATA DA: initAdminPage() durante inizializzazione
 *
 * @returns {void}
 */
function setupBlockUserModal() {
  const modal = document.getElementById("blockUserConfirmModal");
  const confirmBtn = document.getElementById("confirmBlockBtn");
  const cancelBtn = document.getElementById("cancelBlockBtn");

  // ===== CONFERMA BLOCCO/SBLOCCO =====
  confirmBtn.addEventListener("click", async () => {
    // Verifica che ci siano dati salvati
    if (userToBlockId !== null && blockStatus !== null) {
      try {
        // Invia richiesta PATCH al backend
        const response = await fetch("api/admin/utenti.php", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userToBlockId, blocked: blockStatus }),
        });

        const data = await response.json();

        if (data.success) {
          // Successo: feedback positivo e aggiorna UI
          showToast(data.message, "success");
          closeBlockModal(); // Chiudi modale
          await loadUsers(); // Ricarica tabella utenti
          updateDashboardStats(); // Aggiorna contatore utenti bloccati
        } else {
          // Errore backend
          showError("Errore: " + data.message);
        }
      } catch (error) {
        console.error("Errore:", error);
        showError("Errore durante l'operazione");
      }
    }
  });

  // ===== ANNULLA =====
  cancelBtn.addEventListener("click", closeBlockModal);

  // ===== CHIUDI CLICCANDO FUORI =====
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeBlockModal();
  });
}

/**
 * Chiude il modale di blocco/sblocco e resetta variabili globali
 * @returns {void}
 */
function closeBlockModal() {
  document.getElementById("blockUserConfirmModal").style.display = "none";
  userToBlockId = null; // Pulisci variabili globali
  blockStatus = null;
}

// ========================================
// GESTIONE RUOLO ADMIN
// ========================================

/**
 * Avvia il processo di cambio ruolo per un utente
 *
 * Permette di promuovere un utente normale ad admin o viceversa.
 *
 * @param {number} userId - ID dell'utente da modificare
 * @param {number} ruolo - Ruolo target (1=admin, 0=user)
 * @returns {void}
 */
async function toggleAdminRole(userId, ruolo) {
  // Trova l'utente nell'array caricato
  const user = allUsers.find((u) => u.id == userId);

  // BUSINESS RULE: Utenti bloccati non possono diventare admin
  // GUARD CLAUSE: Verifica e blocca immediatamente se violata
  if (ruolo == 1 && user && user.blocked == 1) {
    showError(
      "Impossibile rendere Amministratore un utente bloccato. Devi prima sbloccarlo.",
    );
    return; // Blocca operazione
  }

  // Salva dati nelle variabili globali per usarli nella conferma
  userToToggleRoleId = userId;
  roleTarget = ruolo;

  // Ottieni riferimenti agli elementi del modale
  const modal = document.getElementById("adminRoleConfirmModal");
  const title = document.getElementById("adminRoleModalTitle");
  const msg = document.getElementById("adminRoleModalMessage");
  const btn = document.getElementById("confirmAdminRoleBtn");

  // Configura testi e stili in base all'azione
  if (ruolo == 1) {
    // ===== PROMOZIONE AD ADMIN =====
    title.textContent = "Promuovi ad Admin";
    msg.textContent =
      "Questo utente avrà accesso completo alla dashboard di amministrazione.";
    btn.textContent = "Promuovi";
    btn.className = "btn btn-success"; // Verde
  } else {
    // ===== RIMOZIONE RUOLO ADMIN =====
    title.textContent = "Rimuovi Admin";
    msg.textContent =
      "L'utente perderà l'accesso alla dashboard di amministrazione.";
    btn.textContent = "Rimuovi";
    btn.className = "btn btn-danger"; // Rosso
  }

  // Mostra il modale
  modal.style.display = "flex";
}

/**
 * Configura il modale di conferma cambio ruolo
 *
 * API: PATCH /api/admin/utenti.php
 * Body: { id: userId, ruolo: 1|0 }
 * CHIAMATA DA: initAdminPage() durante inizializzazione
 *
 * @returns {void}
 */
function setupAdminRoleModal() {
  const modal = document.getElementById("adminRoleConfirmModal");
  const confirmBtn = document.getElementById("confirmAdminRoleBtn");
  const cancelBtn = document.getElementById("cancelAdminRoleBtn");

  // ===== CONFERMA CAMBIO RUOLO =====
  confirmBtn.addEventListener("click", async () => {
    // Verifica che ci siano dati salvati
    if (userToToggleRoleId !== null && roleTarget !== null) {
      try {
        // Invia richiesta PATCH al backend
        const response = await fetch("api/admin/utenti.php", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userToToggleRoleId, ruolo: roleTarget }),
        });

        const data = await response.json();

        if (data.success) {
          // Successo: feedback e aggiorna UI
          if (typeof showToast === "function")
            showToast(data.message, "success");
          closeAdminRoleModal();
          await loadUsers(); // Ricarica tabella utenti
          updateDashboardStats(); // Aggiorna contatore admin
        } else {
          // Errore backend
          showError("Errore: " + data.message);
        }
      } catch (error) {
        console.error("Errore:", error);
        showError("Errore durante l'operazione");
      }
    }
  });

  // ===== ANNULLA =====
  cancelBtn.addEventListener("click", closeAdminRoleModal);

  // ===== CHIUDI CLICCANDO FUORI =====
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeAdminRoleModal();
  });
}

/**
 * Chiude il modale di cambio ruolo e resetta variabili globali
 * @returns {void}
 */
function closeAdminRoleModal() {
  document.getElementById("adminRoleConfirmModal").style.display = "none";
  userToToggleRoleId = null; // Pulisci variabili globali
  roleTarget = null;
}

// ========================================
// NAVIGAZIONE TABS
// ========================================

/**
 * Configura la navigazione tra le tabs della dashboard
 *
 * La dashboard ha due sezioni principali:
 * 1. Gestione Prodotti (products-section)
 * 2. Gestione Utenti (users-section)
 * CHIAMATA DA: initAdminPage() durante inizializzazione
 *
 * @returns {void}
 */
function setupNavigation() {
  // Ottieni tutti i bottoni tab e le sezioni contenuto
  const tabs = document.querySelectorAll(".admin-tab");
  const sections = document.querySelectorAll(".admin-section-content");

  // Configura listener per ogni tab
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault(); // Previeni comportamento link default

      // STEP 1: Rimuovi classe "active" da tutto
      tabs.forEach((t) => t.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      // STEP 2: Aggiungi "active" alla tab cliccata
      tab.classList.add("active");

      // STEP 3: Mostra la sezione corrispondente
      const tabName = tab.dataset.tab; // Es: "products" o "users"
      const sectionId = tabName + "-section"; // Es: "products-section"
      const section = document.getElementById(sectionId);

      if (section) {
        section.classList.add("active"); // Rende visibile la sezione
      }
    });
  });

  // ===== BOTTONE AGGIUNGI PRODOTTO =====
  const addProductBtn = document.getElementById("addProductBtn");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      openAddProductModal(); // Apre modale in modalità creazione
    });
  }

  // ===== LISTENER CHIUSURA MODALI =====
  // Bottone X per chiudere modale prodotto
  const closeProductModalBtn = document.getElementById("closeProductModal");
  if (closeProductModalBtn) {
    closeProductModalBtn.addEventListener("click", closeProductModal);
  }

  // Bottone Annulla nel form prodotto
  const cancelProductBtn = document.getElementById("cancelProductBtn");
  if (cancelProductBtn) {
    cancelProductBtn.addEventListener("click", closeProductModal);
  }
}

// ========================================
// FUNZIONI UTILITY
// ========================================

/**
 * Mostra un messaggio di errore all'utente tramite modale
 *
 * Apre un modale di errore personalizzato invece di usare alert() nativo,
 * per mantenere coerenza con lo stile dell'applicazione.
 *
 * CHIAMATA DA: Tutte le funzioni che gestiscono errori
 *
 * @param {string} message - Messaggio di errore da mostrare
 * @returns {void}
 */
function showError(message) {
  const modal = document.getElementById("errorModal");
  const messageEl = document.getElementById("errorModalMessage");

  if (modal && messageEl) {
    messageEl.textContent = message;
    modal.style.display = "flex";
  } else {
    // Fallback se il modale non esiste
    alert(message);
  }
}

/**
 * Chiude il modale di errore
 * @returns {void}
 */
function closeErrorModal() {
  const modal = document.getElementById("errorModal");
  if (modal) {
    modal.style.display = "none";
  }
}

/**
 * Configura il modale di errore
 * Gestisce il click sul bottone OK e click fuori dal modale
 * @returns {void}
 */
function setupErrorModal() {
  const modal = document.getElementById("errorModal");
  const closeBtn = document.getElementById("closeErrorBtn");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeErrorModal);
  }

  // Chiudi cliccando fuori dal contenuto
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeErrorModal();
    }
  });
}

/**
 * Event listener globale per chiudere modali cliccando fuori
 *
 * PATTERN: Click Outside to Close
 * - Se click avviene sul backdrop del modale (non sul contenuto)
 * - Chiude il modale
 *
 * event.target verifica se il click è esattamente sul modale (backdrop)
 * e non su un elemento figlio (il contenuto interno)
 *
 * @param {MouseEvent} event - Evento click globale
 */
window.onclick = function (event) {
  const productModal = document.getElementById("productModal");

  // Se click è sul backdrop del modale prodotto, chiudilo
  if (event.target == productModal) {
    closeProductModal();
  }
};
