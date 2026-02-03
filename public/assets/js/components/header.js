/**
 * ============================================================================
 * HEADER COMPONENT - Componente di navigazione globale dell'applicazione
 * ============================================================================
 *
 * FUNZIONALITÀ PRINCIPALI:
 * ------------------------
 * 1. Navigazione principale dell'applicazione (Home, Prodotti, etc.)
 * 2. Gestione autenticazione utente con dropdown profilo
 * 3. Carrello con contatore articoli real-time
 * 4. Ricerca globale prodotti con risultati live
 * 5. Menu mobile responsive con hamburger toggle
 * 6. Dashboard admin per utenti amministratori
 * ============================================================================
 */

/**
 * Componente Header - Singleton per la navigazione globale dell'applicazione
 * Gestisce rendering, eventi e stato del menu principale
 */
class HeaderComponent {
  constructor() {
    this.element = null; // Riferimento DOM al contenitore header (opzionale)
  }

  /**
   * METODO: render()
   * ----------------
   * Genera l'HTML completo dell'header in base allo stato corrente dell'utente.
   *
   * FUNZIONALITÀ:
   * - Recupera dati utente e conteggio carrello dallo store
   * - Costruisce markup HTML con navigazione, azioni, carrello
   * - Renderizza pulsante login o dropdown profilo utente
   * - Include menu mobile responsive
   * @returns {string} HTML completo dell'header
   */
  render() {
    const user = store.getUser();
    const cartCount = store.getCartCount();
    const isAuthenticated = store.isAuthenticated();

    return `
      <header class="header">
        <div class="container header-inner">
          <div class="logo">
            <a href="/home" data-link>
              <img src="public/assets/img/logo.png" alt="Artly Logo" class="logo-img" /
            </a>
          </div>

          <nav class="nav">
            <ul class="nav-list">
              <li><a href="/home" data-link>Home</a></li>
              <li><a href="/prodotti" data-link>Prodotti</a></li>
              <li><a href="/home" data-link data-scroll="how-it-works">Come funziona</a></li>
              <li><a href="/home" data-link data-scroll="about">Su di noi</a></li>
            </ul>
          </nav>

          <div class="header-actions">
            <button class="icon-btn" id="searchBtn" aria-label="Cerca">🔍</button>
            <a href="/carrello" data-link class="icon-btn cart-btn" aria-label="Carrello">
              🛒
              <span class="cart-count" id="cartCount">${cartCount}</span>
            </a>
            ${this.renderAuthButton(isAuthenticated, user)}
            <button class="menu-toggle" id="menuToggle" aria-label="Menu">☰</button>
          </div>
        </div>

        <!-- Mobile nav -->
        <nav class="nav-mobile" id="mobileNav">
          <ul>
            <li><a href="/home" data-link>Home</a></li>
            <li><a href="/prodotti" data-link>Prodotti</a></li>
            <li><a href="/home" data-link data-scroll="how-it-works">Come funziona</a></li>
            <li><a href="/home" data-link data-scroll="about">Su di noi</a></li>
          </ul>
        </nav>
      </header>
    `;
  }

  /**
   * METODO: renderAuthButton()
   * --------------------------
   * Renderizza dinamicamente il pulsante/dropdown di autenticazione.
   *
   * SE AUTENTICATO:
   * - Mostra cerchio con iniziali utente (es: "GM" per Giovanni Mancini)
   * - Crea dropdown con: nome completo, email, link al profilo, preferiti, logout
   * - Se admin: aggiunge voce "Dashboard Admin" al dropdown
   *
   * SE NON AUTENTICATO:
   * - Mostra pulsante "Accedi" che naviga a /login
   *
   * LOGICA INIZIALI:
   * - Prende prima lettera di nome e cognome
   * - Converte in maiuscolo (es: "mario rossi" → "MR")
   *
   * MENU ADMIN:
   * - Visibile solo se user.is_admin === true
   * - Naviga a /admin con data-path attribute
   *
   * @param {boolean} isAuthenticated - Stato di autenticazione dell'utente
   * @param {Object|null} user - Oggetto utente con nome, cognome, email, is_admin
   * @returns {string} HTML del pulsante/dropdown di autenticazione
   */
  renderAuthButton(isAuthenticated, user) {
    if (isAuthenticated && user) {
      const iniziali =
        `${user.nome.charAt(0)}${user.cognome.charAt(0)}`.toUpperCase();
      const adminMenuItem = user.is_admin
        ? `
        <div class="user-dropdown-item" data-action="navigate" data-path="/admin">
          <span>⚙️ Dashboard Admin</span>
        </div>
      `
        : "";

      return `
        <div class="user-profile-wrapper">
          <div class="user-profile-circle" id="userProfileCircle" title="${user.nome} ${user.cognome}">
            ${iniziali}
          </div>
          <div class="user-dropdown" id="userDropdown">
            <div class="user-dropdown-header">
              <strong>${user.nome} ${user.cognome}</strong>
              <span>${user.email}</span>
            </div>
            ${adminMenuItem}
            <div class="user-dropdown-item" data-action="navigate" data-path="/profilo">
              <span>Il mio profilo</span>
            </div>
            <div class="user-dropdown-item" data-action="navigate" data-path="/preferiti">
              <span>❤️ I miei preferiti</span>
            </div>
            <div class="user-dropdown-item" data-action="logout">
              <span>Logout</span>
            </div>
          </div>
        </div>
      `;
    } else {
      return `<a href="/login" data-link class="btn btn-outline">Accedi</a>`;
    }
  }

  /**
   * ============================================================================
   * SEZIONE: EVENT LISTENERS E INTERAZIONI
   * ============================================================================
   */

  /**
   * METODO: attachEvents()
   * ----------------------
   * Inizializza tutti gli event listener del componente dopo il rendering.
   * Deve essere chiamato DOPO che l'HTML è stato inserito nel DOM.
   *
   * EVENTI GESTITI:
   * 1. Mobile menu toggle (hamburger icon)
   * 2. Chiusura menu mobile su click link
   * 3. Reset menu su resize window (desktop/mobile)
   * 4. Toggle dropdown profilo utente
   * 5. Chiusura dropdown cliccando fuori
   * 6. Click su voci dropdown (logout, navigazione)
   * 7. Inizializzazione componente ricerca
   */
  attachEvents() {
    // ========================================
    // MOBILE MENU TOGGLE
    // ========================================
    const menuToggle = document.getElementById("menuToggle");
    const mobileNav = document.getElementById("mobileNav");

    if (menuToggle && mobileNav) {
      // Toggle menu mobile: apri/chiudi con icona hamburger/X
      menuToggle.addEventListener("click", () => {
        const isOpen = mobileNav.classList.contains("is-open");
        if (isOpen) {
          mobileNav.classList.remove("is-open");
          menuToggle.innerHTML = "☰"; // Icona hamburger
        } else {
          mobileNav.classList.add("is-open");
          menuToggle.innerHTML = "✕"; // Icona chiusura
        }
      });

      // Chiudi menu automaticamente quando si clicca su un link di navigazione
      // UX: L'utente si aspetta che il menu si chiuda dopo aver selezionato una voce
      mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          mobileNav.classList.remove("is-open");
          menuToggle.innerHTML = "☰";
        });
      });

      // Reset menu quando si ridimensiona la finestra
      // Debounced per performance: attende 250ms dopo l'ultimo resize
      // Se la finestra diventa desktop (>768px), nascondi il menu mobile
      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (window.innerWidth > 768) {
            mobileNav.classList.remove("is-open");
            mobileNav.style.display = "none"; // Forza nascosto su desktop
            menuToggle.innerHTML = "☰";
          } else {
            mobileNav.style.display = ""; // Ripristina display CSS su mobile
          }
        }, 250);
      });
    }

    // ========================================
    // USER DROPDOWN TOGGLE
    // ========================================
    const userProfileCircle = document.getElementById("userProfileCircle");
    const userDropdown = document.getElementById("userDropdown");

    if (userProfileCircle && userDropdown) {
      // Toggle dropdown profilo: click sul cerchio con iniziali
      userProfileCircle.addEventListener("click", (e) => {
        e.stopPropagation(); // Evita che l'evento chiuda immediatamente il dropdown
        userDropdown.classList.toggle("show");
      });

      // Chiudi dropdown cliccando ovunque fuori da esso
      // Pattern: Click-outside detection
      document.addEventListener("click", () => {
        userDropdown.classList.remove("show");
      });

      // Gestisci click sugli item del dropdown (Profilo, Preferiti, Admin, Logout)
      userDropdown.querySelectorAll(".user-dropdown-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault(); // Previeni comportamento default
          e.stopPropagation(); // Evita propagazione click

          const action = item.getAttribute("data-action");
          console.log("🖱️ Click dropdown item, action:", action);

          if (action === "logout") {
            // Azione: Logout (chiama API backend)
            this.handleLogout();
          } else if (action === "navigate") {
            // Azione: Navigazione (profilo, admin, preferiti)
            const path = item.getAttribute("data-path");
            console.log("🔀 Navigate to:", path);
            userDropdown.classList.remove("show"); // Chiudi dropdown prima di navigare
            router.navigate(path); // Usa router SPA per navigazione
          }
        });
      });
    }

    // Inizializza componente di ricerca globale
    this.initSearchComponent();
  }

  /**
   * ============================================================================
   * SEZIONE: RICERCA GLOBALE PRODOTTI
   * ============================================================================
   */

  /**
   * METODO: initSearchComponent()
   * -----------------------------
   * Inizializza il componente di ricerca globale nell'header.
   *
   * FUNZIONALITÀ:
   * 1. Crea dinamicamente il dropdown di ricerca se non esiste
   * 2. Toggle apertura/chiusura dropdown ricerca
   * 3. Chiusura click-outside
   * 4. Ricerca live con debounce di 300ms
   * 5. Validazione minimo 2 caratteri
   *
   * STRUTTURA CREATA:
   * - search-dropdown-wrapper: Container del componente
   * - search-dropdown: Dropdown con input e risultati
   * - globalSearchInput: Campo di input per la query
   * - searchResults: Container risultati dinamici
   */
  initSearchComponent() {
    const searchBtn = document.getElementById("searchBtn");
    if (!searchBtn) return;

    // Crea wrapper e dropdown se non esistono già nel DOM
    // Questo codice viene eseguito solo la prima volta
    if (
      !searchBtn.parentElement.classList.contains("search-dropdown-wrapper")
    ) {
      const wrapper = document.createElement("div");
      wrapper.className = "search-dropdown-wrapper";
      searchBtn.parentNode.insertBefore(wrapper, searchBtn);
      wrapper.appendChild(searchBtn);

      // Inserisci HTML del dropdown di ricerca
      wrapper.insertAdjacentHTML(
        "beforeend",
        `
        <div class="search-dropdown" id="searchDropdown">
          <input 
            type="text" 
            id="globalSearchInput" 
            placeholder="Cerca prodotti..." 
            class="search-dropdown-input"
          />
          <div class="search-results" id="searchResults">
            <p class="search-placeholder">Inizia a digitare per cercare...</p>
          </div>
        </div>
      `,
      );
    }

    const searchDropdown = document.getElementById("searchDropdown");
    const searchInput = document.getElementById("globalSearchInput");
    const searchResults = document.getElementById("searchResults");

    // Toggle dropdown: apri/chiudi con click sul pulsante 🔍
    searchBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = searchDropdown.classList.contains("show");

      if (isOpen) {
        // Chiudi: rimuovi classe show e resetta contenuto
        searchDropdown.classList.remove("show");
        searchInput.value = "";
        searchResults.innerHTML =
          '<p class="search-placeholder">Inizia a digitare per cercare...</p>';
      } else {
        // Apri: aggiungi classe show e metti focus sull'input
        searchDropdown.classList.add("show");
        setTimeout(() => searchInput.focus(), 100); // Delay per animazione CSS
      }
    });

    // Chiudi dropdown cliccando fuori dal componente
    // Pattern: Click-outside detection
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-dropdown-wrapper")) {
        searchDropdown.classList.remove("show");
      }
    });

    // Ricerca in tempo reale con debounce
    // PATTERN: Debouncing per ridurre chiamate API
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout); // Annulla timer precedente
      const query = e.target.value.trim();

      // Validazione: minimo 2 caratteri
      if (query.length < 2) {
        searchResults.innerHTML =
          '<p class="search-placeholder">Digita almeno 2 caratteri...</p>';
        return;
      }

      // Feedback immediato: mostra stato loading
      searchResults.innerHTML =
        '<p class="search-placeholder">Ricerca in corso...</p>';

      // Debounce: esegui ricerca dopo 300ms di inattività
      searchTimeout = setTimeout(() => {
        this.performSearch(query, searchResults);
      }, 300);
    });
  }

  /**
   * METODO: performSearch()
   * -----------------------
   * Esegue la ricerca prodotti chiamando l'API e filtrando i risultati localmente.
   *
   * LOGICA DI RICERCA:
   * 1. Fetch tutti i prodotti da api/prodotti.php
   * 2. Filtra localmente per query su: titolo, descrizione, autore, categoria
   * 3. Ricerca case-insensitive
   * 4. Mostra risultati filtrati
   *
   * PERCHÉ FETCH COMPLETO + FILTRO LOCALE:
   * - API non supporta parametri di ricerca
   * - I dati sono cachati dal browser dopo la prima chiamata
   * - Performance accettabili per cataloghi medio-piccoli
   *
   * GESTIONE ERRORI:
   * - Errori fetch: Mostra messaggio "Errore nella ricerca"
   * - Logging in console per debug
   *
   * @param {string} query - Query di ricerca dell'utente
   * @param {HTMLElement} resultsContainer - Elemento DOM dove inserire i risultati
   */
  async performSearch(query, resultsContainer) {
    try {
      // Fetch tutti i prodotti dall'API
      const response = await fetch("api/prodotti.php");
      const data = await response.json();

      if (data.success && data.data) {
        // Filtra prodotti in base alla query
        // Ricerca su: titolo, descrizione, autore, categoria
        const results = data.data.filter((product) => {
          const searchText =
            `${product.titolo} ${product.descrizione} ${product.autore} ${product.categoria_nome}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        });

        // Mostra risultati filtrati
        this.displaySearchResults(results, query, resultsContainer);
      }
    } catch (error) {
      // Gestione errore: mostra messaggio user-friendly
      console.error("Errore ricerca:", error);
      resultsContainer.innerHTML =
        '<p class="search-error">Errore nella ricerca</p>';
    }
  }

  /**
   * METODO: displaySearchResults()
   * ------------------------------
   * Renderizza i risultati della ricerca nel dropdown.
   *
   * CASI GESTITI:
   * 1. Nessun risultato: Mostra "Nessun risultato per <query>"
   * 2. Risultati trovati: Mostra max 5 prodotti più rilevanti
   *
   * RENDERING PRODOTTO:
   * - Immagine prodotto (con fallback gradiente se mancante)
   * - Titolo prodotto
   * - Autore
   * - Prezzo formattato (2 decimali)
   * - Link a dettaglio prodotto con data-link per SPA
   * LIMIT RISULTATI:
   * - Max 5 prodotti mostrati (slice(0, 5))
   * - Evita dropdown troppo lungo
   * - Performance migliori con pochi elementi
   *
   * @param {Array} results - Array di prodotti filtrati dalla ricerca
   * @param {string} query - Query di ricerca originale (per mostrare nel feedback)
   * @param {HTMLElement} container - Elemento DOM dove inserire i risultati
   */
  displaySearchResults(results, query, container) {
    // Caso: Nessun risultato trovato
    if (results.length === 0) {
      container.innerHTML = `<p class="search-no-results">Nessun risultato per "<strong>${query}</strong>"</p>`;
      return;
    }

    // Header: Conteggio risultati trovati
    let html = `<p class="search-count">${results.length} risultat${results.length > 1 ? "i" : "o"} per "<strong>${query}</strong>"</p>`;
    html += '<div class="search-results-list">';

    // Itera sui primi 5 risultati e crea card prodotto
    results.slice(0, 5).forEach((product) => {
      let imageStyle = "";

      // Gestione immagine prodotto
      if (product.image_path && product.image_path.trim() !== "") {
        // 1. Percorso base globale (configurabile da window.image_path)
        const basePath = window.image_path || "/progetto_TecWeb/img/";

        // 2. Pulisce il nome file: rimuove slash iniziale se presente
        const imgName = product.image_path.startsWith("/")
          ? product.image_path.substring(1)
          : product.image_path;

        // 3. Costruisce percorso completo
        const fullPath = basePath + imgName;

        // 4. Stile CSS: background-image con cover per adattamento
        imageStyle = `background-image: url('${fullPath}'); background-size: cover; background-position: center;`;
      } else {
        // Fallback: Gradiente viola/blu standard quando immagine mancante
        imageStyle =
          "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);";
      }

      // Crea HTML card risultato con link a dettaglio prodotto
      html += `
        <a href="/dettaglio-prodotto?id=${product.id}" data-link class="search-result-item">
          <div class="search-result-image" style="${imageStyle}"></div>
          <div class="search-result-info">
            <h4>${product.titolo}</h4>
            <p class="search-result-author">${product.autore}</p>
            <p class="search-result-price">€${parseFloat(product.prezzo).toFixed(2)}</p>
          </div>
        </a>
      `;
    });

    html += "</div>"; // Chiude search-results-list
    container.innerHTML = html;
  }

  /**
   * ============================================================================
   * SEZIONE: AUTENTICAZIONE E LOGOUT
   * ============================================================================
   */

  /**
   * METODO: handleLogout()
   * ----------------------
   * Gestisce il logout dell'utente con chiamata API backend.
   *
   * FLUSSO DI LOGOUT:
   * 1. Chiama API api/auth/logout.php per distruggere sessione server
   * 2. Se successo: Pulisce store lato client (localStorage + stato app)
   * 3. Mostra toast di conferma
   * 4. Redirect a /home dopo 1 secondo
   *
   * SICUREZZA:
   * - Logout lato server: Distrugge sessione PHP
   * - Logout lato client: Rimuove token/dati da localStorage
   * - Doppio layer per sicurezza completa
   */
  async handleLogout() {
    try {
      // Chiama API di logout per distruggere sessione server
      const response = await fetch("api/auth/logout.php");
      const data = await response.json();

      if (data.success) {
        // Logout lato client: pulisce localStorage e stato app
        store.logout();

        // Feedback utente
        showToast("Logout effettuato ✓");

        // Redirect a home dopo 1 secondo
        setTimeout(() => router.navigate("/home"), 1000);
      }
    } catch (error) {
      // Silent failure: logged ma non mostrato all'utente
      console.error("Errore logout:", error);
    }
  }

  /**
   * ============================================================================
   * SEZIONE: AGGIORNAMENTO COMPONENTE
   * ============================================================================
   */

  /**
   * METODO: update()
   * ----------------
   * Ri-renderizza completamente il componente header.
   *
   * QUANDO USARE:
   * - Dopo login/logout per aggiornare stato autenticazione
   * - Dopo modifica profilo utente (nome, email, etc.)
   * - Quando cambia il conteggio carrello
   *
   * FLUSSO:
   * 1. Trova container header nel DOM (#header-container)
   * 2. Renderizza nuovo HTML con render()
   * 3. Aspetta che DOM sia aggiornato (setTimeout 0ms)
   * 4. Riattacca event listeners con attachEvents()
   *
   */
  update() {
    const headerContainer = document.getElementById("header-container");
    if (headerContainer) {
      // Ri-renderizza HTML completo
      headerContainer.innerHTML = this.render();

      // Attendi che il DOM sia aggiornato prima di attaccare gli eventi
      // setTimeout 0ms assicura che il browser abbia completato il paint
      setTimeout(() => this.attachEvents(), 0);
    }
  }
}

/**
 * ============================================================================
 * ESPORTAZIONE SINGLETON
 * ============================================================================
 *
 * Il componente header viene esportato come istanza singleton.
 *
 * VANTAGGI DEL SINGLETON:
 * - Una sola istanza condivisa in tutta l'applicazione
 * - Stato centralizzato (nessuna duplicazione)
 * - Facile accesso globale: headerComponent.update()
 * - Previene problemi di sincronizzazione tra istanze multiple
 *
 * UTILIZZO:
 * - router.js: Chiama headerComponent.update() dopo navigazione
 * - store.js: Chiama headerComponent.update() dopo cambio stato (login, cart)
 * - Qualsiasi modulo può accedere e aggiornare l'header
 */
const headerComponent = new HeaderComponent();
