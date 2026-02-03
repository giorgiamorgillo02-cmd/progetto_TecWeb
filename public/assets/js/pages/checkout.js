/**
 * ========================================
 * CHECKOUT PAGE - Controller
 * ========================================
 *
 * Gestisce l'intera pagina di checkout, dal caricamento del carrello
 * alla validazione del form e invio dell'ordine al backend.
 * FLUSSO OPERATIVO:
 * 1. Verifica presenza elementi DOM necessari
 * 2. Carica carrello dallo store
 * 3. Se carrello vuoto → redirect a pagina carrello
 * 4. Carica dati utente (se loggato) per pre-compilazione
 * 5. Visualizza riepilogo ordine
 * 6. Configura validazione real-time
 * 7. Gestisce submit ordine
 *
 * @returns {void}
 */
function initCheckoutPage() {
  // ========================================
  // STEP 1: RIFERIMENTI ELEMENTI DOM
  // ========================================
  const checkoutForm = document.getElementById("checkoutForm");
  const orderItems = document.getElementById("orderItems"); // Container lista prodotti
  const orderSubtotal = document.getElementById("orderSubtotal"); // Subtotale prodotti
  const orderShipping = document.getElementById("orderShipping"); // Costo spedizione
  const orderTotal = document.getElementById("orderTotal"); // Totale ordine
  const submitBtn = document.getElementById("submitOrder"); // Bottone conferma

  console.log("📦 Elementi trovati:", {
    checkoutForm: !!checkoutForm,
    orderItems: !!orderItems,
    orderSubtotal: !!orderSubtotal,
    orderShipping: !!orderShipping,
    orderTotal: !!orderTotal,
    submitBtn: !!submitBtn,
  });

  // GUARD: Verifica che tutti gli elementi necessari esistano
  if (
    !checkoutForm ||
    !orderItems ||
    !orderSubtotal ||
    !orderShipping ||
    !orderTotal ||
    !submitBtn
  ) {
    const allIds = Array.from(document.querySelectorAll("[id]")).map(
      (el) => el.id,
    ); // Elenco di tutti gli ID presenti nel DOM
    return; // Blocca inizializzazione se mancano elementi critici
  }

  // ========================================
  // VARIABILI DI STATO
  // ========================================
  let cart = []; // Array prodotti nel carrello
  const FREE_SHIPPING_THRESHOLD = 50; // Soglia spedizione gratuita in €

  // Funzioni di validazione
  function validateRequired(value, fieldName) {
    if (!value || value.trim() === "") {
      return `${fieldName} è obbligatorio`;
    }
    return "";
  }

  /**
   * Valida formato email
   * Controllo semplice ma efficace: presenza di @ e .
   * @param {string} email - Email da validare
   * @returns {string} Messaggio di errore o stringa vuota se valido
   */
  function validateEmail(email) {
    if (!email || email.trim() === "") return "L'email è obbligatoria";
    if (!email.includes("@") || !email.includes(".")) {
      return "Inserisci un'email valida";
    }
    return "";
  }

  /**
   * Valida numero di telefono
   * Accetta formati con o senza spazi, lunghezza tra 9 e 15 caratteri
   * @param {string} telefono - Numero di telefono da validare
   * @returns {string} Messaggio di errore o stringa vuota se valido
   */
  function validateTelefono(telefono) {
    if (!telefono || telefono.trim() === "")
      return "Il telefono è obbligatorio";
    const cleaned = telefono.replace(/\s/g, "");
    if (cleaned.length < 9 || cleaned.length > 15) {
      return "Inserisci un numero di telefono valido";
    }
    return "";
  }

  /**
   * Valida sigla provincia italiana
   * Deve essere esattamente 2 caratteri (es. MI, RM, TO)
   * @param {string} provincia - Sigla provincia da validare
   * @returns {string} Messaggio di errore o stringa vuota se valido
   */
  function validateProvincia(provincia) {
    if (!provincia || provincia.trim() === "")
      return "La provincia è obbligatoria";
    if (provincia.length !== 2) {
      return "La provincia deve essere di 2 caratteri (es. MI)";
    }
    return "";
  }

  /**
   * Valida CAP italiano
   * Deve essere esattamente 5 cifre numeriche
   * @param {string} cap - CAP da validare
   * @returns {string} Messaggio di errore o stringa vuota se valido
   */
  function validateCap(cap) {
    if (!cap || cap.trim() === "") return "Il CAP è obbligatorio";
    if (cap.length !== 5 || isNaN(cap)) {
      return "Il CAP deve essere di 5 cifre";
    }
    return "";
  }

  /**
   * Mostra feedback visivo di validazione per un campo
   *
   * Gestisce 3 stati visivi:
   * 1. Errore: bordo rosso + messaggio errore
   * 2. Successo: bordo verde + messaggio nascosto
   * 3. Neutro: nessun bordo speciale
   *
   * @param {HTMLElement} input - Campo input da modificare
   * @param {HTMLElement} errorSpan - Span per messaggio errore
   * @param {string} message - Messaggio (vuoto = nessun errore)
   * @returns {void}
   */
  function showFieldError(input, errorSpan, message) {
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

  // ========================================
  // RIFERIMENTI CAMPI FORM E SPAN ERRORI
  // ========================================
  // Elementi input del form
  const nomeInput = document.getElementById("nome");
  const cognomeInput = document.getElementById("cognome");
  const emailInput = document.getElementById("email");
  const telefonoInput = document.getElementById("telefono");
  const viaInput = document.getElementById("via");
  const cittaInput = document.getElementById("citta");
  const provinciaInput = document.getElementById("provincia");
  const capInput = document.getElementById("cap");

  const nomeError = document.getElementById("nomeError");
  const cognomeError = document.getElementById("cognomeError");
  const emailError = document.getElementById("emailError");
  const telefonoError = document.getElementById("telefonoError");
  const viaError = document.getElementById("viaError");
  const cittaError = document.getElementById("cittaError");
  const provinciaError = document.getElementById("provinciaError");
  const capError = document.getElementById("capError");

  // ========================================
  // CONFIGURAZIONE VALIDAZIONE REAL-TIME
  // ========================================
  /**
   * STRATEGIA UX:
   * - "blur": valida quando l'utente esce dal campo
   * - "input": valida solo se campo già in errore (per correzione immediata)
   * Questo evita di mostrare errori troppo presto, migliorando l'esperienza
   */

  // VALIDAZIONE NOME
  nomeInput.addEventListener("blur", () => {
    const error = validateRequired(nomeInput.value, "Il nome");
    showFieldError(nomeInput, nomeError, error);
  });

  nomeInput.addEventListener("input", () => {
    if (nomeInput.classList.contains("input-error")) {
      const error = validateRequired(nomeInput.value, "Il nome");
      showFieldError(nomeInput, nomeError, error);
    }
  });

  cognomeInput.addEventListener("blur", () => {
    const error = validateRequired(cognomeInput.value, "Il cognome");
    showFieldError(cognomeInput, cognomeError, error);
  });

  cognomeInput.addEventListener("input", () => {
    if (cognomeInput.classList.contains("input-error")) {
      const error = validateRequired(cognomeInput.value, "Il cognome");
      showFieldError(cognomeInput, cognomeError, error);
    }
  });

  emailInput.addEventListener("blur", () => {
    const error = validateEmail(emailInput.value);
    showFieldError(emailInput, emailError, error);
  });

  emailInput.addEventListener("input", () => {
    if (emailInput.classList.contains("input-error")) {
      const error = validateEmail(emailInput.value);
      showFieldError(emailInput, emailError, error);
    }
  });

  telefonoInput.addEventListener("blur", () => {
    const error = validateTelefono(telefonoInput.value);
    showFieldError(telefonoInput, telefonoError, error);
  });

  telefonoInput.addEventListener("input", () => {
    if (telefonoInput.classList.contains("input-error")) {
      const error = validateTelefono(telefonoInput.value);
      showFieldError(telefonoInput, telefonoError, error);
    }
  });

  viaInput.addEventListener("blur", () => {
    const error = validateRequired(viaInput.value, "L'indirizzo");
    showFieldError(viaInput, viaError, error);
  });

  viaInput.addEventListener("input", () => {
    if (viaInput.classList.contains("input-error")) {
      const error = validateRequired(viaInput.value, "L'indirizzo");
      showFieldError(viaInput, viaError, error);
    }
  });

  cittaInput.addEventListener("blur", () => {
    const error = validateRequired(cittaInput.value, "La città");
    showFieldError(cittaInput, cittaError, error);
  });

  cittaInput.addEventListener("input", () => {
    if (cittaInput.classList.contains("input-error")) {
      const error = validateRequired(cittaInput.value, "La città");
      showFieldError(cittaInput, cittaError, error);
    }
  });

  provinciaInput.addEventListener("blur", () => {
    const error = validateProvincia(provinciaInput.value.toUpperCase());
    showFieldError(provinciaInput, provinciaError, error);
  });

  provinciaInput.addEventListener("input", () => {
    // Auto uppercase
    provinciaInput.value = provinciaInput.value.toUpperCase();
    if (provinciaInput.classList.contains("input-error")) {
      const error = validateProvincia(provinciaInput.value);
      showFieldError(provinciaInput, provinciaError, error);
    }
  });

  capInput.addEventListener("blur", () => {
    const error = validateCap(capInput.value);
    showFieldError(capInput, capError, error);
  });

  capInput.addEventListener("input", () => {
    if (capInput.classList.contains("input-error")) {
      const error = validateCap(capInput.value);
      showFieldError(capInput, capError, error);
    }
  });

  // ========================================
  // CARICAMENTO DATI
  // ========================================

  /**
   * Carica il carrello dallo store e inizializza la pagina
   *
   * FLUSSO:
   * 1. Recupera carrello dallo store globale
   * 2. Se vuoto → redirect a pagina carrello
   * 3. Visualizza riepilogo ordine
   * 4. Carica dati utente (se autenticato)
   *
   * @returns {void}
   */
  function loadCart() {
    // Usa lo store invece di localStorage direttamente
    cart = store.getCart();

    // GUARD: Se carrello vuoto, redirect
    if (cart.length === 0) {
      showToast("Il carrello è vuoto");
      router.navigate("/carrello");
      return;
    }

    displayOrderSummary();
    loadUserData();
  }

  /**
   * Carica i dati utente autenticato per pre-compilare il form
   *
   * API: GET /api/me.php
   * RISPOSTA: { authenticated, nome, cognome, email, telefono, via, citta, provincia, cap }
   *
   * Se l'utente è loggato, i suoi dati vengono automaticamente
   * inseriti nel form per velocizzare il checkout.
   *
   * @returns {void}
   */
  function loadUserData() {
    console.log("👤 Caricamento dati utente...");
    fetch("api/me.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.authenticated) {
          // Pre-compila i campi con i dati utente
          if (data.nome) document.getElementById("nome").value = data.nome;
          if (data.cognome)
            document.getElementById("cognome").value = data.cognome;
          if (data.email) document.getElementById("email").value = data.email;
          if (data.telefono)
            document.getElementById("telefono").value = data.telefono;
          if (data.via) document.getElementById("via").value = data.via;
          if (data.citta) document.getElementById("citta").value = data.citta;
          if (data.provincia)
            document.getElementById("provincia").value = data.provincia;
          if (data.cap) document.getElementById("cap").value = data.cap;
        }
      });
  }

  /**
   * Visualizza il riepilogo dell'ordine con lista prodotti
   *
   * Costruisce dinamicamente la lista HTML dei prodotti nel carrello,
   * mostrando titolo, quantità e prezzo totale per ogni articolo.
   *
   * CHIAMATA DA: loadCart()
   * CHIAMATE: updateTotals() per calcolare subtotale e spedizione
   *
   * @returns {void}
   */
  function displayOrderSummary() {
    console.log("📋 Visualizzazione riepilogo ordine...");
    orderItems.innerHTML = "";

    cart.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "order-item";

      const qty = item.quantity || 1;
      const itemTotal = parseFloat(item.prezzo) * qty;

      itemDiv.innerHTML = `
        <div class="order-item-info">
          <p class="order-item-title">${item.titolo}</p>
          <p class="order-item-meta">Quantità: ${qty}</p>
        </div>
        <p class="order-item-price">€${itemTotal.toFixed(2).replace(".", ",")}</p>
      `;

      orderItems.appendChild(itemDiv);
    });

    console.log("✅ Articoli visualizzati:", cart.length);
    updateTotals();
  }

  /**
   * Calcola e aggiorna i totali dell'ordine
   *
   * CALCOLI:
   * - Subtotale: somma (prezzo * quantità) di tutti i prodotti
   * - Spedizione: €4.90 o GRATIS se subtotale >= €50
   * - Totale: subtotale + spedizione
   *
   * FORMAT: Prezzi formattati con virgola (es. €12,50)
   *
   * @returns {void}
   */
  function updateTotals() {
    const subtotal = cart.reduce(
      (sum, item) => sum + parseFloat(item.prezzo) * (item.quantity || 1),
      0,
    );
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 4.9; // Spedizione gratuita sopra soglia
    const total = subtotal + shipping; // Totale ordine

    orderSubtotal.textContent = `€${subtotal.toFixed(2).replace(".", ",")}`;
    orderShipping.textContent =
      shipping === 0 ? "Gratis" : `€${shipping.toFixed(2).replace(".", ",")}`;
    orderTotal.textContent = `€${total.toFixed(2).replace(".", ",")}`;

    console.log("💰 Totali aggiornati:", { subtotal, shipping, total });
  }

  // ========================================
  // SUBMIT ORDINE
  // ========================================

  /**
   * Handler submit del form checkout
   * API: POST /api/catalogo/process-order.php
   * BODY: { nome, cognome, email, telefono, via, citta, provincia, cap,
   *         paymentMethod, note, prodotti: [{id_poster, quantita}] }
   * RISPOSTA: { success, orderId?, message }
   */
  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // ========================================
    // STEP 1: RACCOLTA VALORI DAI CAMPI
    // ========================================
    const nome = nomeInput.value.trim();
    const cognome = cognomeInput.value.trim();
    const email = emailInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const via = viaInput.value.trim();
    const citta = cittaInput.value.trim();
    const provincia = provinciaInput.value.trim().toUpperCase();
    const cap = capInput.value.trim();
    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked',
    ).value;
    const note = document.getElementById("note").value.trim();

    // ========================================
    // STEP 2: VALIDAZIONE FINALE
    // ========================================
    // Esegui tutte le validazioni
    const nomeErr = validateRequired(nome, "Il nome");
    const cognomeErr = validateRequired(cognome, "Il cognome");
    const emailErr = validateEmail(email);
    const telefonoErr = validateTelefono(telefono);
    const viaErr = validateRequired(via, "L'indirizzo");
    const cittaErr = validateRequired(citta, "La città");
    const provinciaErr = validateProvincia(provincia);
    const capErr = validateCap(cap);

    showFieldError(nomeInput, nomeError, nomeErr);
    showFieldError(cognomeInput, cognomeError, cognomeErr);
    showFieldError(emailInput, emailError, emailErr);
    showFieldError(telefonoInput, telefonoError, telefonoErr);
    showFieldError(viaInput, viaError, viaErr);
    showFieldError(cittaInput, cittaError, cittaErr);
    showFieldError(provinciaInput, provinciaError, provinciaErr);
    showFieldError(capInput, capError, capErr);

    // Mostra feedback visivo per tutti i campi validati

    // ========================================
    // STEP 3: VERIFICA ERRORI
    // ========================================
    // Se c'è almeno un errore, blocca il submit
    if (
      nomeErr ||
      cognomeErr ||
      emailErr ||
      telefonoErr ||
      viaErr ||
      cittaErr ||
      provinciaErr ||
      capErr
    ) {
      showToast("Correggi gli errori nel form");
      return; // BLOCCA INVIO
    }

    // ========================================
    // STEP 4: CALCOLO TOTALE
    // ========================================
    const subtotal = cart.reduce(
      (sum, item) => sum + parseFloat(item.prezzo) * (item.quantity || 1),
      0,
    );
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 4.9;
    const total = subtotal + shipping;

    // ========================================
    // STEP 5: PREPARAZIONE DATI ORDINE
    // ========================================
    const orderData = {
      nome,
      cognome,
      email,
      telefono,
      via,
      citta,
      provincia,
      cap,
      paymentMethod,
      note,
      prodotti: cart.map((item) => ({
        id_poster: item.id,
        quantita: item.quantity || 1,
      })),
    };

    // ========================================
    // STEP 6: UI FEEDBACK DURANTE INVIO
    // ========================================
    // Disabilita il bottone per evitare doppi click
    submitBtn.textContent = "Elaborazione ordine...";
    submitBtn.disabled = true;

    // ========================================
    // STEP 7: INVIO ORDINE AL BACKEND
    // ========================================
    fetch("api/catalogo/process-order.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin", // Invia cookie di sessione
      body: JSON.stringify(orderData),
    })
      .then(async (response) => {
        // Parse risposta: gestisce sia JSON che errori PHP HTML
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(text); // Se non è JSON, è un errore PHP
        }
      })
      .then((data) => {
        // ========================================
        // STEP 8: GESTIONE RISPOSTA SUCCESSO
        // ========================================
        if (data.success) {
          // Svuota il carrello nello store
          store.clearCart();

          // Salva dati conferma per pagina order-success
          localStorage.setItem(
            "order_confirmation",
            JSON.stringify({
              orderId: data.orderId,
              totale: total,
              data: new Date().toISOString(),
            }),
          );

          // Redirect alla pagina di conferma
          router.navigate("/order-success");
        } else {
          // ========================================
          // STEP 9: GESTIONE ERRORE BACKEND
          // ========================================
          showToast(data.message || "Errore durante la creazione dell'ordine");
          // Riabilita il bottone per permettere un nuovo tentativo
          submitBtn.textContent = "Completa l'ordine";
          submitBtn.disabled = false;
        }
      })
      .catch((error) => {
        // ========================================
        // STEP 10: GESTIONE ERRORE DI RETE
        // ========================================
        console.error("Errore:", error);
        showToast("Errore di connessione. Riprova.");
        // Riabilita il bottone
        submitBtn.textContent = "Completa l'ordine";
        submitBtn.disabled = false;
      });
  });

  // ========================================
  // INIZIALIZZAZIONE
  // ========================================
  // Avvia il caricamento del carrello al caricamento della pagina
  loadCart();
}

// Espone la funzione globalmente per permettere al router SPA di chiamarla
window.initCheckoutPage = initCheckoutPage;
