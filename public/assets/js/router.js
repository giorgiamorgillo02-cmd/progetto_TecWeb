/**
 * ============================================================================
 * ROUTER SPA - Gestione navigazione client-side senza reload pagina
 * ============================================================================
 *
 * ARCHITETTURA:
 * -------------
 * Router basato su History API per Single Page Application (SPA).
 * Intercetta click su link e gestisce navigazione senza ricaricare la pagina.
 *
 * FUNZIONALITÀ PRINCIPALI:
 * ------------------------
 * 1. Registrazione rotte con handler dedicati
 * 2. Navigazione programmatica via navigate(path)
 * 3. Intercettazione click su link con attributo [data-link]
 * 4. Gestione browser back/forward (popstate)
 * 5. Parsing automatico query string per parametri
 * 6. Hook before/after per validazioni e side-effects
 * 7. Scroll automatico a sezioni specifiche (data-scroll)
 * 8. Scroll to top dopo cambio pagina
 *
 * ROUTING PATTERN:
 * ----------------
 * - Definizione: router.addRoute('/path', async (params) => {...})
 * - Navigazione: router.navigate('/path?id=123')
 * - Link HTML: <a href="/path" data-link>Vai</a>
 * - Scroll section: <a href="/home" data-link data-scroll="about">Su di noi</a>
 *
 * GESTIONE URL:
 * -------------
 * - Base path: /progetto_TecWeb (rimosso automaticamente)
 * - Route: /home, /prodotti, /dettaglio-prodotto, etc.
 * - Query string: Parsata automaticamente in oggetto params
 * - Redirect: Root (/) → /home
 *
 * HISTORY API:
 * ------------
 * - pushState: Aggiunge entry alla cronologia browser
 * - popstate: Gestisce pulsanti back/forward
 * - State object: Mantiene riferimento al path per ripristino
 *
 * PROTEZIONE ROUTE:
 * -----------------
 * - beforeRouteChange: Hook per validare accesso (es: check autenticazione)
 * - Può bloccare navigazione ritornando false
 * - Usato per proteggere route admin, checkout, profilo
 *
 * LIFECYCLE HOOKS:
 * ----------------
 * 1. beforeRouteChange(oldRoute, newRoute) → bool
 * 2. Route handler(params) → void
 * 3. afterRouteChange(route, params) → void
 *
 * ============================================================================
 */

/**
 * Classe Router - Gestisce la navigazione SPA con History API
 */
class Router {
  /**
   * COSTRUTTORE
   * -----------
   * Inizializza lo stato del router.
   *
   * PROPRIETÀ:
   * - routes: Oggetto mappa {path: handler}
   * - currentRoute: Path della rotta corrente
   * - beforeRouteChange: Hook pre-navigazione (validazione)
   * - afterRouteChange: Hook post-navigazione (analytics, update UI)
   */
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.beforeRouteChange = null;
    this.afterRouteChange = null;
  }

  /**
   * ============================================================================
   * SEZIONE: REGISTRAZIONE ROTTE E HOOKS
   * ============================================================================
   */

  /**
   * METODO: addRoute()
   * ------------------
   * Registra una nuova rotta con il suo handler.
   *
   * HANDLER:
   * - Funzione async che riceve parametri dalla query string
   * - Responsabile di caricare la view e inizializzare la pagina
   *
   * ESEMPIO:
   * router.addRoute('/prodotti', async (params) => {
   *   await loadView('prodotti');
   *   initProdottiPage();
   * });
   *
   * @param {string} path - Path della rotta (es: '/home', '/prodotti')
   * @param {Function} handler - Funzione async da eseguire per questa rotta
   */
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  /**
   * METODO: onBeforeRouteChange()
   * -----------------------------
   * Registra hook eseguito PRIMA del cambio rotta.
   *
   * UTILIZZO:
   * - Validazione accesso (es: check autenticazione)
   * - Conferma uscita da form non salvati
   * - Logging/Analytics
   *
   * CALLBACK:
   * - Riceve (oldRoute, newRoute)
   * - Ritorna true per continuare, false per bloccare navigazione
   *
   * ESEMPIO:
   * router.onBeforeRouteChange((oldRoute, newRoute) => {
   *   if (newRoute === '/admin' && !store.isAdmin()) {
   *     router.navigate('/home');
   *     return false; // Blocca navigazione
   *   }
   *   return true;
   * });
   *
   * @param {Function} callback - Funzione (oldRoute, newRoute) => boolean
   */
  onBeforeRouteChange(callback) {
    this.beforeRouteChange = callback;
  }

  /**
   * METODO: onAfterRouteChange()
   * ----------------------------
   * Registra hook eseguito DOPO il cambio rotta.
   *
   * UTILIZZO:
   * - Aggiornamento UI globale (header, footer)
   * - Analytics tracking
   * - Scroll management
   * - Update breadcrumbs
   *
   * CALLBACK:
   * - Riceve (route, params)
   * - Non può bloccare navigazione (già avvenuta)
   *
   * ESEMPIO:
   * router.onAfterRouteChange((route, params) => {
   *   headerComponent.update();
   *   analytics.trackPageView(route);
   * });
   *
   * @param {Function} callback - Funzione (route, params) => void
   */
  onAfterRouteChange(callback) {
    this.afterRouteChange = callback;
  }

  /**
   * ============================================================================
   * SEZIONE: NAVIGAZIONE
   * ============================================================================
   */

  /**
   * METODO: navigate()
   * ------------------
   * Naviga a una rotta specifica senza ricaricare la pagina.
   *
   * FLUSSO:
   * 1. Esegue beforeRouteChange hook (può bloccare navigazione)
   * 2. Estrae pathname e query string dal path
   * 3. Trova handler della rotta (o fallback a /404)
   * 4. Aggiorna History API con pushState
   * 5. Esegue handler della rotta
   * 6. Esegue afterRouteChange hook
   * 7. Scroll to top automatico
   *
   * PARAMETRI:
   * - path: Può includere query string (es: '/prodotti?categoria=2')
   * - addToHistory: Se true, aggiunge entry alla cronologia browser
   *
   * ESEMPI:
   * router.navigate('/home');                    // Navigazione semplice
   * router.navigate('/prodotti?categoria=2');    // Con parametri
   * router.navigate('/profilo', false);          // Senza history (popstate)
   *
   * GESTIONE ERRORI:
   * - Se rotta non trovata: Usa /404 se registrata
   * - Try/catch per errori nell'handler
   *
   * @param {string} path - Path di destinazione (con o senza query string)
   * @param {boolean} addToHistory - Se aggiungere entry alla cronologia (default: true)
   */
  async navigate(path, addToHistory = true) {
    console.log("🧭 Router.navigate() chiamato con path:", path);

    // Hook prima del cambio rotta - può bloccare navigazione
    if (this.beforeRouteChange) {
      const shouldContinue = await this.beforeRouteChange(
        this.currentRoute,
        path,
      );
      if (shouldContinue === false) return; // Navigazione bloccata
    }

    // Estrai pathname e query string separatamente
    const [pathname, search] = path.split("?");
    const params = this.parseQueryString(search); // Converti query string in oggetto

    console.log("📍 Pathname estratto:", pathname);
    console.log("📦 Rotte disponibili:", Object.keys(this.routes));

    // Trova handler della rotta, fallback a 404 se non trovata
    const route = this.routes[pathname] || this.routes["/404"];

    if (!route) {
      console.error("Rotta non trovata:", pathname);
      return;
    }

    // Aggiorna History API (barra indirizzi browser)
    if (addToHistory) {
      const fullPath = "/progetto_TecWeb" + path; // Aggiungi base path
      window.history.pushState({ path }, "", fullPath);
    }

    // Esegui handler della rotta con try/catch per gestire errori
    try {
      await route(params); // Passa parametri query string all'handler
      this.currentRoute = pathname; // Salva rotta corrente

      // Hook dopo cambio rotta - per side effects (analytics, UI updates)
      if (this.afterRouteChange) {
        this.afterRouteChange(pathname, params);
      }

      // Scroll to top automatico dopo cambio pagina (UX standard)
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Errore durante la navigazione:", error);
    }
  }

  /**
   * ============================================================================
   * SEZIONE: UTILITY
   * ============================================================================
   */

  /**
   * METODO: parseQueryString()
   * --------------------------
   * Converte query string in oggetto JavaScript.
   *
   * INPUT: "id=123&nome=test&categoria=2"
   * OUTPUT: { id: "123", nome: "test", categoria: "2" }
   *
   * CARATTERISTICHE:
   * - Gestisce URL encoding/decoding automaticamente
   * - Gestisce parametri senza valore (key sola)
   * - Ritorna oggetto vuoto se query string assente
   *
   * ESEMPI:
   * parseQueryString("id=123") → { id: "123" }
   * parseQueryString("nome=Mario%20Rossi") → { nome: "Mario Rossi" }
   * parseQueryString(undefined) → {}
   *
   * @param {string} search - Query string senza ? iniziale
   * @returns {Object} Oggetto con coppie chiave-valore
   */
  parseQueryString(search) {
    if (!search) return {}; // Guard clause: nessuna query string

    const params = {};
    const pairs = search.split("&"); // Divide in coppie chiave=valore

    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      // Decodifica URL encoding (es: %20 → spazio)
      params[decodeURIComponent(key)] = decodeURIComponent(value || "");
    });

    return params;
  }

  /**
   * ============================================================================
   * SEZIONE: INIZIALIZZAZIONE E EVENT LISTENERS
   * ============================================================================
   */

  /**
   * METODO: init()
   * --------------
   * Inizializza il router e configura event listeners globali.
   *
   * DEVE ESSERE CHIAMATO UNA VOLTA all'avvio dell'applicazione.
   *
   * FUNZIONALITÀ:
   * 1. Intercetta click su link con [data-link]
   * 2. Gestisce attributo [data-scroll] per scroll a sezioni
   * 3. Gestisce popstate per pulsanti back/forward browser
   * 4. Carica rotta iniziale basata su URL corrente
   * 5. Normalizza path (rimuove base, redirect root → /home)
   *
   * EVENT LISTENERS:
   * - click: Intercetta link SPA
   * - popstate: Gestisce cronologia browser
   *
   * NORMALIZZAZIONE URL:
   * - /progetto_TecWeb/home → /home
   * - / → /home
   * - /index.php → /home
   * - /prodotti.html → /prodotti
   */
  init() {
    // ========================================
    // INTERCETTAZIONE CLICK SU LINK
    // ========================================
    // Gestisce click su link con attributo [data-link] per navigazione SPA
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-link]");
      if (link) {
        e.preventDefault(); // Previene reload pagina
        const href = link.getAttribute("href");
        const scrollTo = link.getAttribute("data-scroll"); // Sezione target (opzionale)

        // Se c'è attributo data-scroll, naviga PRIMA poi scrolla alla sezione
        // Esempio: <a href="/home" data-link data-scroll="about">Su di noi</a>
        if (scrollTo) {
          this.navigate(href).then(() => {
            // Delay per permettere rendering della pagina
            setTimeout(() => {
              const element = document.getElementById(scrollTo);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
          });
        } else {
          // Navigazione standard senza scroll
          this.navigate(href);
        }
      }
    });

    // ========================================
    // GESTIONE BROWSER BACK/FORWARD
    // ========================================
    // Evento popstate: Scatta quando user clicca pulsanti back/forward browser
    window.addEventListener("popstate", (e) => {
      let path = e.state?.path || window.location.pathname;

      // Rimuovi base path /progetto_TecWeb/ se presente
      if (path.startsWith("/progetto_TecWeb")) {
        path = path.replace("/progetto_TecWeb", "");
      }

      // Redirect root a home
      if (!path || path === "/") {
        path = "/home";
      }

      // Navigate senza aggiungere a history (già nella cronologia)
      this.navigate(path, false);
    });

    // ========================================
    // CARICAMENTO ROTTA INIZIALE
    // ========================================
    let initialPath = window.location.pathname;

    // Normalizza path: rimuovi base path
    if (initialPath.startsWith("/progetto_TecWeb")) {
      initialPath = initialPath.replace("/progetto_TecWeb", "");
    }

    // Redirect root/index a home
    if (
      initialPath === "/" ||
      initialPath === "" ||
      initialPath === "/index.php" ||
      initialPath === "/index.html"
    ) {
      initialPath = "/home";
    }

    // Rimuovi estensione .html se presente (legacy URLs)
    initialPath = initialPath.replace(".html", "");

    // Aggiungi query string se presente
    const search = window.location.search.substring(1); // Rimuove ? iniziale
    const fullPath = search ? `${initialPath}?${search}` : initialPath;

    // Naviga alla rotta iniziale senza aggiungere a history
    this.navigate(fullPath, false);
  }

  /**
   * METODO: getCurrentRoute()
   * -------------------------
   * Restituisce il path della rotta corrente.
   *
   * UTILIZZO:
   * - Determinare pagina attiva per UI (highlight nav)
   * - Validazioni condizionali basate su rotta
   * - Debug e logging
   *
   * @returns {string|null} Path corrente (es: '/home', '/prodotti') o null se non inizializzato
   */
  getCurrentRoute() {
    return this.currentRoute;
  }
}

/**
 * ============================================================================
 * ESPORTAZIONE SINGLETON
 * ============================================================================
 *
 * Il router viene esportato come istanza singleton.
 *
 * VANTAGGI:
 * - Stato di navigazione centralizzato
 * - Cronologia condivisa in tutta l'app
 * - Facile accesso globale da qualsiasi modulo
 * - Previene conflitti tra istanze multiple
 *
 * ACCESSO GLOBALE:
 * - Via import/script: router.navigate('/path')
 * - Via window object: window.router.navigate('/path')
 *
 * UTILIZZO:
 * router.addRoute('/home', handler);
 * router.navigate('/prodotti');
 * router.onBeforeRouteChange(callback);
 *
 * PATTERN:
 * - Single Source of Truth per stato navigazione
 * - Tutti i componenti navigano tramite stesso router
 */
const router = new Router();
window.router = router; // Rende il router accessibile globalmente
