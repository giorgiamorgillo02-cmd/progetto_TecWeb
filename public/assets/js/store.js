/**
 * ============================================================================
 * STORE GLOBALE - Gestione centralizzata dello stato dell'applicazione
 * ============================================================================
 *
 * ARCHITETTURA:
 * -------------
 * Store basato sul pattern Singleton con state management centralizzato.
 *
 * STATO GESTITO:
 * --------------
 * 1. user: Dati utente autenticato (nome, cognome, email, is_admin, etc.)
 * 2. cart: Carrello con prodotti e quantità
 * 3. preferiti: Lista prodotti preferiti dell'utente
 * 4. isAuthenticated: Boolean dello stato di autenticazione
 *
 * PERSISTENZA DATI:
 * -----------------
 * - localStorage: Salva SOLO il carrello (supporta guest checkout)
 * - Database: I preferiti sono salvati nel database e caricati via API
 * - Session: user e isAuthenticated (validati dal server ad ogni refresh)
 *
 * CHIAVI LOCALSTORAGE:
 * --------------------
 * - artly_cart: Array di prodotti con quantità (unica chiave usata)
 *
 * GESTIONE PREFERITI:
 * -------------------
 * - Fonte di verità: Database backend (tabella preferiti)
 * - API per sincronizzazione: /api/user/preferiti.php e /api/user/manage_preferiti.php
 * - Store mantiene copia locale solo per performance UI
 * - NON usa localStorage per evitare inconsistenze con DB
 *
 * REATTIVITÀ:
 * -----------
 * - Ogni cambio stato notifica automaticamente i listener sottoscritti
 * - Componenti UI si aggiornano automaticamente via subscribe()
 * - Header, carrello, preferiti reagiscono ai cambiamenti in tempo reale
 *
 * UTILIZZO:
 * ---------
 * store.addToCart(product)          // Aggiungi al carrello
 * store.subscribe(callback)         // Ascolta cambiamenti
 * store.setUser(userData)           // Imposta utente autenticato
 * store.getCartTotal()              // Calcola totale carrello
 * store.setPreferiti(array)         // Carica preferiti da database
 *
 * ============================================================================
 */

/**
 * Classe Store - State Manager centralizzato dell'applicazione
 */
class Store {
  /**
   * COSTRUTTORE
   * -----------
   * Inizializza lo stato e carica dati persistiti da localStorage.
   * LISTENERS:
   * - Array di funzioni callback da notificare ad ogni cambio stato
   */
  constructor() {
    this.state = {
      user: null,
      cart: [],
      preferiti: [],
      isAuthenticated: false,
    };
    this.listeners = [];
    this.loadFromLocalStorage();
    this.cleanupOldLocalStorage(); // Rimuove vecchi dati non più usati
  }

  /**
   * ============================================================================
   * SEZIONE: GESTIONE STATO E PERSISTENZA
   * ============================================================================
   */

  /**
   * METODO: cleanupOldLocalStorage()
   * --------------------------------
   * Rimuove dati obsoleti da localStorage che non vengono più usati.
   *
   * DATI RIMOSSI:
   * - artly_preferiti: I preferiti ora sono gestiti solo dal database
   *
   * QUANDO VIENE CHIAMATO:
   * - All'avvio dell'applicazione (nel costruttore)
   * - Una sola volta per utente dopo l'aggiornamento
   *
   * PERCHÉ:
   * - Pulisce localStorage da dati legacy non più utilizzati
   * - Evita confusione tra vecchi dati locali e nuovi dati da database
   * - Libera spazio in localStorage
   */
  cleanupOldLocalStorage() {
    try {
      // Rimuove array preferiti legacy se esiste
      if (localStorage.getItem("artly_preferiti")) {
        localStorage.removeItem("artly_preferiti");
        console.log("🧹 Pulito localStorage legacy: artly_preferiti rimosso");
      }
    } catch (error) {
      console.error("Errore pulizia localStorage:", error);
    }
  }

  /**
   * METODO: loadFromLocalStorage()
   * -------------------------------
   * Carica dati persistiti da localStorage all'avvio dell'applicazione.
   *
   * DATI CARICATI:
   * - artly_cart: Carrello con prodotti e quantità (guest + utenti loggati)
   *
   * DATI NON CARICATI:
   * - preferiti: Gestiti esclusivamente dal database via API
   * - user: Validato dal server ad ogni refresh
   * - isAuthenticated: Validato dal server ad ogni refresh
   *
   * NOTA PREFERITI:
   * - I preferiti sono caricati da /api/user/preferiti.php quando l'utente è loggato
   * - Questo evita inconsistenze tra localStorage e database
   * - Fonte unica di verità: database backend
   */
  loadFromLocalStorage() {
    try {
      const savedCart = localStorage.getItem("artly_cart");
      if (savedCart) {
        this.state.cart = JSON.parse(savedCart);
      }
      // I preferiti NON vengono caricati da localStorage
      // Sono caricati dal database via API /api/user/preferiti.php
    } catch (error) {
      console.error("Errore caricamento localStorage:", error);
    }
  }

  /**
   * METODO: getState()
   * ------------------
   * Restituisce una copia dello stato corrente.
   * @returns {Object} Copia dello stato con user, cart, preferiti, isAuthenticated
   */
  getState() {
    return { ...this.state };
  }

  /**
   * METODO: setState()
   * ------------------
   * Aggiorna lo stato con nuovi valori e notifica i listener.
   *
   * FLUSSO:
   * 1. Merge nuovo stato con stato esistente (spread operator)
   * 2. Notifica tutti i listener sottoscritti
   * 3. Salva su localStorage per persistenza
   *
   * IMMUTABILITY:
   * - Crea nuovo oggetto stato invece di mutare quello esistente
   * - Garantisce che i listener ricevano sempre stato aggiornato
   *
   * REATTIVITÀ:
   * - Trigger automatico di notifyListeners()
   * - Header, carrello, preferiti si aggiornano automaticamente
   *
   * @param {Object} updates - Oggetto con proprietà da aggiornare
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
    this.saveToLocalStorage();
  }

  /**
   * METODO: subscribe()
   * -------------------
   * Registra un listener per ricevere notifiche sui cambiamenti dello stato.
   *
   * PATTERN: Observer Pattern
   * - Componenti sottoscrivono per reagire ai cambiamenti
   * - Disaccoppiamento: componenti non conoscono altri componenti
   *
   * UTILIZZO TIPICO:
   * const unsubscribe = store.subscribe((state) => {
   *   console.log('Nuovo stato:', state);
   * });
   * // Poi per annullare:
   * unsubscribe();
   *
   * @param {Function} listener - Callback da chiamare ad ogni cambio stato
   * @returns {Function} Funzione per annullare la sottoscrizione
   */
  subscribe(listener) {
    this.listeners.push(listener);
    // Ritorna una funzione per annullare la sottoscrizione
    // Pattern: Cleanup function per evitare memory leaks
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * METODO: notifyListeners()
   * -------------------------
   * Notifica tutti i listener sottoscritti passando lo stato corrente.
   *
   * CHIAMATO AUTOMATICAMENTE:
   * - Ogni volta che setState() viene invocato
   * - Propaga cambiamenti a tutti i componenti interessati
   *
   * PATTERN: Broadcast
   * - Tutti i listener ricevono lo stesso stato
   * - Listener decidono autonomamente se reagire o ignorare
   */
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * METODO: saveToLocalStorage()
   * ----------------------------
   * Persiste solo il carrello su localStorage.
   *
   * DATI SALVATI:
   * - artly_cart: Serializzato come JSON (supporta guest checkout)
   *
   * DATI NON SALVATI:
   * - preferiti: Gestiti esclusivamente dal database via API
   * - user: Gestito via sessione server
   * - isAuthenticated: Validato ad ogni refresh
   *
   * PERCHÉ CARRELLO SÌ E PREFERITI NO:
   * - Carrello: Serve per guest checkout, temporaneo, locale
   * - Preferiti: Persistenti, legati all'account, fonte di verità è il database
   *
   * SICUREZZA:
   * - Try/catch per gestire quote exceeded o localStorage disabilitato
   * - Silent failure per non interrompere UX
   *
   * CHIAMATO AUTOMATICAMENTE:
   * - Ogni volta che setState() viene invocato
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem("artly_cart", JSON.stringify(this.state.cart));
      // I preferiti NON vengono salvati su localStorage
      // Sono gestiti esclusivamente dal database per evitare inconsistenze
    } catch (error) {
      console.error("Errore salvataggio localStorage:", error);
    }
  }

  /**
   * ============================================================================
   * SEZIONE: GESTIONE CARRELLO
   * ============================================================================
   */

  /**
   * METODO: addToCart()
   * -------------------
   * Aggiunge un prodotto al carrello o incrementa la quantità se già presente.
   *
   * LOGICA:
   * 1. Cerca prodotto esistente per ID
   * 2. Se esiste: Incrementa quantità
   * 3. Se non esiste: Aggiungi con quantità 1
   * 4. Salva stato e notifica listener
   *
   * IMMUTABILITY:
   * - Usa spread operator {...product} per evitare mutazioni esterne
   * - Modifica array esistente (accettabile perché seguito da setState)
   *
   * REATTIVITÀ:
   * - setState() notifica automaticamente i listener
   * - Header aggiorna contatore carrello
   * - Icona carrello mostra nuovo count
   *
   * @param {Object} product - Prodotto da aggiungere con almeno id e prezzo
   * @returns {number} Nuovo conteggio totale articoli nel carrello
   */
  addToCart(product) {
    const existingIndex = this.state.cart.findIndex(
      (item) => item.id === product.id,
    );

    if (existingIndex !== -1) {
      // Aumenta la quantità se esiste già
      this.state.cart[existingIndex].quantity =
        (this.state.cart[existingIndex].quantity || 1) + 1;
    } else {
      // Aggiungi nuovo prodotto
      this.state.cart.push({ ...product, quantity: 1 });
    }

    this.setState({ cart: this.state.cart });
    return this.getCartCount();
  }

  /**
   * METODO: removeFromCart()
   * ------------------------
   * Rimuove completamente un prodotto dal carrello.
   *
   * UTILIZZO:
   * - Pulsante "Rimuovi" nella pagina carrello
   * - Elimina prodotto indipendentemente dalla quantità
   *
   * LOGICA:
   * - Filtra array carrello escludendo il prodotto con ID specificato
   * - setState() notifica listener e salva su localStorage
   *
   * @param {number|string} productId - ID del prodotto da rimuovere
   */
  removeFromCart(productId) {
    this.state.cart = this.state.cart.filter((item) => item.id !== productId);
    this.setState({ cart: this.state.cart });
  }

  /**
   * METODO: updateCartQuantity()
   * ----------------------------
   * Modifica la quantità di un prodotto già nel carrello.
   *
   * UTILIZZO:
   * - Input quantità nella pagina carrello
   * - Pulsanti +/- per incrementare/decrementare
   *
   * LOGICA:
   * - Se quantity <= 0: Rimuovi completamente prodotto
   * - Se quantity > 0: Aggiorna quantità del prodotto
   *
   * VALIDAZIONE:
   * - Controlla che il prodotto esista nel carrello
   * - Guard clause: se non trovato, non fa nulla
   *
   * @param {number|string} productId - ID del prodotto
   * @param {number} quantity - Nuova quantità (se <= 0 rimuove prodotto)
   */
  updateCartQuantity(productId, quantity) {
    const item = this.state.cart.find((item) => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.setState({ cart: this.state.cart });
      }
    }
  }

  /**
   * METODO: clearCart()
   * -------------------
   * Svuota completamente il carrello.
   *
   * UTILIZZO:
   * - Dopo ordine completato con successo
   * - Al logout per sicurezza
   * - Pulsante "Svuota carrello" (se implementato)
   *
   * EFFETTI:
   * - Rimuove tutti i prodotti
   * - Notifica listener (header aggiorna contatore a 0)
   * - Salva stato vuoto su localStorage
   */
  clearCart() {
    this.setState({ cart: [] });
  }

  /**
   * METODO: getCart()
   * -----------------
   * Restituisce una copia dell'array carrello.
   *
   * IMMUTABILITY:
   * - Usa spread operator per creare copia shallow
   * - Previene mutazioni accidentali dell'array originale
   *
   * UTILIZZO:
   * - Pagina carrello per mostrare lista prodotti
   * - Checkout per riepilogo ordine
   *
   * @returns {Array} Copia array prodotti nel carrello con quantità
   */
  getCart() {
    return [...this.state.cart];
  }

  /**
   * METODO: getCartCount()
   * ----------------------
   * Calcola il numero totale di articoli nel carrello.
   *
   * LOGICA:
   * - Somma le quantità di tutti i prodotti
   * - Esempio: 2 prodotti con quantità 3 e 2 = 5 articoli totali
   *
   * UTILIZZO:
   * - Badge contatore nell'header (icona carrello)
   * - Feedback "Hai X articoli nel carrello"
   *
   * FALLBACK:
   * - Se quantity mancante, assume 1
   *
   * @returns {number} Numero totale articoli nel carrello
   */
  getCartCount() {
    return this.state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  /**
   * METODO: getCartTotal()
   * ----------------------
   * Calcola il totale in euro del carrello (senza spese di spedizione).
   *
   * LOGICA:
   * - Moltiplica prezzo per quantità per ogni prodotto
   * - Somma tutti i subtotali
   *
   * UTILIZZO:
   * - Pagina carrello per mostrare subtotale
   * - Checkout per calcolare totale ordine
   *
   * SICUREZZA:
   * - parseFloat per gestire prezzi come stringhe
   * - Fallback a 0 se prezzo non valido
   * - Fallback a 1 se quantità mancante
   *
   * NOTA:
   * - NON include spese di spedizione
   * - Calcolo spedizione fatto in checkout (basato su soglia)
   *
   * @returns {number} Totale carrello in euro (subtotale prodotti)
   */
  getCartTotal() {
    return this.state.cart.reduce((sum, item) => {
      const price = parseFloat(item.prezzo) || 0;
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0);
  }

  /**
   * ============================================================================
   * SEZIONE: GESTIONE PREFERITI
   * ============================================================================
   */

  /**
   * METODO: addToPreferiti()
   * ------------------------
   * Aggiunge un prodotto alla lista preferiti locale (stato UI).
   *
   * IMPORTANTE:
   * - Questo metodo aggiorna SOLO lo stato locale per l'UI
   * - NON salva sul database: deve essere fatto dalla pagina/componente
   * - NON salva su localStorage: i preferiti vivono solo nel database
   *
   * LOGICA:
   * 1. Controlla se prodotto già nei preferiti (via isInPreferiti)
   * 2. Se non presente: Aggiungi all'array stato
   * 3. Se già presente: Non fa nulla (evita duplicati)
   *
   * FLUSSO COMPLETO:
   * 1. UI chiama addToPreferiti() per aggiornare stato locale
   * 2. UI chiama API /api/user/manage_preferiti.php per salvare su DB
   * 3. Se API fallisce, UI deve rimuovere da stato locale
   *
   * UTILIZZO:
   * - Pulsante cuore nelle card prodotto
   * - Toggle on: Aggiungi a preferiti
   *
   * @param {Object} product - Prodotto da aggiungere ai preferiti
   */
  addToPreferiti(product) {
    if (!this.isInPreferiti(product.id)) {
      this.state.preferiti.push(product); // Aggiungi prodotto ai preferiti
      this.setState({ preferiti: this.state.preferiti });
    }
  }

  /**
   * METODO: removeFromPreferiti()
   * -----------------------------
   * Rimuove un prodotto dalla lista preferiti locale (stato UI).
   *
   * IMPORTANTE:
   * - Questo metodo aggiorna SOLO lo stato locale per l'UI
   * - NON rimuove dal database: deve essere fatto dalla pagina/componente
   * - NON tocca localStorage: i preferiti sono gestiti solo dal database
   *
   * UTILIZZO:
   * - Pulsante cuore pieno: Toggle off
   * - Pulsante "Rimuovi" in pagina preferiti
   *
   * FLUSSO COMPLETO:
   * 1. UI chiama removeFromPreferiti() per aggiornare stato locale
   * 2. UI chiama API /api/user/manage_preferiti.php per rimuovere da DB
   * 3. Se API fallisce, UI deve ri-aggiungere a stato locale
   *
   * LOGICA:
   * - Filtra array escludendo prodotto con ID specificato
   * - setState() notifica listener (ma NON salva su localStorage)
   *
   * @param {number|string} productId - ID del prodotto da rimuovere
   */
  removeFromPreferiti(productId) {
    this.state.preferiti = this.state.preferiti.filter(
      (item) => item.id !== productId, // Rimuovi prodotto dai preferiti
    );
    this.setState({ preferiti: this.state.preferiti });
  }

  /**
   * METODO: isInPreferiti()
   * -----------------------
   * Verifica se un prodotto è già nei preferiti.
   *
   * UTILIZZO:
   * - Determinare stato pulsante cuore (pieno/vuoto)
   * - Prevenire duplicati in addToPreferiti()
   *
   * @param {number|string} productId - ID del prodotto da verificare
   * @returns {boolean} true se il prodotto è nei preferiti, false altrimenti
   */
  isInPreferiti(productId) {
    return this.state.preferiti.some((item) => item.id === productId);
  }

  /**
   * METODO: getPreferiti()
   * ----------------------
   * Restituisce una copia dell'array preferiti.
   *
   * IMMUTABILITY:
   * - Spread operator per copia shallow
   * - Previene mutazioni accidentali
   *
   * UTILIZZO:
   * - Pagina preferiti per mostrare lista prodotti
   *
   * @returns {Array} Copia array prodotti preferiti
   */
  getPreferiti() {
    return [...this.state.preferiti];
  }

  /**
   * METODO: setPreferiti()
   * ----------------------
   * Imposta l'array preferiti caricato dal database.
   *
   * UTILIZZO:
   * - Chiamato dopo fetch da /api/user/preferiti.php
   * - Inizializzazione preferiti al login o refresh pagina
   *
   * FLUSSO TIPICO:
   * 1. User fa login o app fa refresh
   * 2. API /api/user/preferiti.php ritorna lista preferiti da DB
   * 3. Chiamata a store.setPreferiti(preferiti) per aggiornare stato
   * 4. UI si aggiorna automaticamente tramite listener
   *
   * IMPORTANTE:
   * - Questo è l'UNICO modo corretto per inizializzare i preferiti
   * - NON vengono caricati da localStorage
   * - Fonte di verità: sempre il database
   *
   * @param {Array} preferiti - Array di prodotti preferiti dal database
   */
  setPreferiti(preferiti) {
    this.setState({ preferiti: preferiti || [] });
  }

  /**
   * ============================================================================
   * SEZIONE: GESTIONE UTENTE E AUTENTICAZIONE
   * ============================================================================
   */

  /**
   * METODO: setUser()
   * -----------------
   * Imposta i dati dell'utente autenticato.
   *
   * CHIAMATO DA:
   * - app.js dopo fetch /api/me.php al caricamento
   * - login.js dopo login con successo
   *
   * LOGICA:
   * - Salva dati utente nello stato
   * - Imposta isAuthenticated a true se userData presente, false altrimenti
   * - !! double negation per convertire a boolean
   *
   * EFFETTI:
   * - Notifica listener (header si aggiorna con dropdown profilo)
   * - Route protette diventano accessibili
   *
   * @param {Object|null} userData - Oggetto utente con nome, cognome, email, is_admin
   */
  setUser(userData) {
    this.setState({
      user: userData,
      isAuthenticated: !!userData, // !! trasforma in booleano
    });
  }

  /**
   * METODO: getUser()
   * -----------------
   * Restituisce i dati dell'utente autenticato.
   *
   * @returns {Object|null} Oggetto utente o null se non autenticato
   */
  getUser() {
    return this.state.user;
  }

  /**
   * METODO: isAuthenticated()
   * -------------------------
   * Verifica se l'utente è attualmente autenticato.
   *
   * UTILIZZO:
   * - Router per proteggere route (profilo, checkout, admin)
   * - Header per mostrare pulsante login o dropdown profilo
   * - Condizionali per funzionalità riservate agli utenti loggati
   *
   * @returns {boolean} true se autenticato, false altrimenti
   */
  isAuthenticated() {
    return this.state.isAuthenticated;
  }

  /**
   * METODO: isAdmin()
   * -----------------
   * Verifica se l'utente autenticato ha privilegi di amministratore.
   *
   * LOGICA:
   * - Controlla se user esiste
   * - Verifica ruolo === "admin" OPPURE is_admin === true
   * - Doppio controllo per compatibilità con diversi formati dati
   *
   * UTILIZZO:
   * - Router per proteggere route /admin
   * - Header per mostrare voce "Dashboard Admin"
   * - Pagine per nascondere funzionalità admin
   *
   * SICUREZZA:
   * - Controllo lato client per UX
   * - DEVE essere validato anche lato server per sicurezza reale
   *
   * @returns {boolean} true se admin, false altrimenti
   */
  isAdmin() {
    return (
      this.state.user &&
      (this.state.user.ruolo === "admin" || this.state.user.is_admin === true)
    );
  }

  /**
   * METODO: logout()
   * ----------------
   * Logout volontario dell'utente - pulisce stato, carrello e preferiti.
   *
   * UTILIZZO:
   * - Click su "Logout" nel dropdown header
   * - Chiamato da header.js handleLogout()
   *
   * COMPORTAMENTO:
   * 1. Svuota carrello per sicurezza (clearCart)
   * 2. Svuota preferiti (dati specifici dell'utente)
   * 3. Rimuove dati utente dallo stato
   * 4. Imposta isAuthenticated a false
   *
   * PERCHÉ SVUOTA CARRELLO:
   * - Sicurezza: Evita che altro utente veda carrello precedente
   * - Privacy: Non lascia dati sensibili dopo logout
   * - UX: Carrello è legato alla sessione utente
   *
   * PERCHÉ SVUOTA PREFERITI:
   * - I preferiti sono specifici dell'account utente
   * - Non devono essere visibili dopo logout
   * - Verranno ricaricati dal DB al prossimo login
   *
   * NOTA:
   * - Sessione server distrutta da api/auth/logout.php
   * - localStorage viene pulito solo per carrello
   */
  logout() {
    // Svuota il carrello al logout per sicurezza
    this.clearCart();
    this.setState({
      user: null,
      preferiti: [], // Svuota preferiti: sono legati all'utente
      isAuthenticated: false,
    });
  }

  /**
   * METODO: clearUser()
   * -------------------
   * Pulisce dati utente e preferiti SENZA toccare il carrello.
   *
   * UTILIZZO:
   * - Quando l'utente non è autenticato (refresh pagina, sessione scaduta)
   * - app.js quando /api/me.php fallisce o ritorna null
   *
   * DIFFERENZA DA logout():
   * - logout(): Azione volontaria, svuota carrello e preferiti
   * - clearUser(): Azione automatica, preserva carrello, svuota preferiti
   *
   * PERCHÉ SVUOTA PREFERITI MA NON CARRELLO:
   * - Preferiti: Specifici dell'utente loggato, non hanno senso per guest
   * - Carrello: Può essere usato da guest per procedere con ordine
   *
   * CASO D'USO:
   * - User naviga sito come guest, aggiunge prodotti al carrello
   * - Refresh pagina: clearUser() mantiene carrello intatto
   * - Se poi fa login, può procedere con ordine
   * - Preferiti vengono ricaricati dal DB dopo login
   *
   * SICUREZZA:
   * - Non espone dati sensibili (solo pulisce riferimenti)
   * - Carrello guest è locale, non associato ad account
   */
  clearUser() {
    this.setState({
      user: null,
      preferiti: [], // Svuota preferiti: sono legati all'utente loggato
      isAuthenticated: false,
    });
  }
}

/**
 * ============================================================================
 * ESPORTAZIONE SINGLETON
 * ============================================================================
 *
 * Lo store viene esportato come istanza singleton.
 *
 * VANTAGGI:
 * - Stato centralizzato unico in tutta l'app
 * - Nessuna confusione tra istanze multiple
 * - Facile accesso globale da qualsiasi modulo
 * - Consistenza garantita dei dati
 *
 * UTILIZZO:
 * import './store.js' o <script src="store.js">
 * store.addToCart(product)
 * store.subscribe(callback)
 *
 * PATTERN:
 * - Single Source of Truth per stato applicazione
 * - Tutti i componenti leggono e scrivono dallo stesso store
 */
const store = new Store();
