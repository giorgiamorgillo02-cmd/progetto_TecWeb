// Gestione pagina checkout
function initCheckoutPage() {
  console.log("🛒 Inizializzazione checkout page");

  const checkoutForm = document.getElementById("checkoutForm");
  const orderItems = document.getElementById("orderItems");
  const orderSubtotal = document.getElementById("orderSubtotal");
  const orderShipping = document.getElementById("orderShipping");
  const orderTotal = document.getElementById("orderTotal");
  const submitBtn = document.getElementById("submitOrder");

  console.log("📦 Elementi trovati:", {
    checkoutForm: !!checkoutForm,
    orderItems: !!orderItems,
    orderSubtotal: !!orderSubtotal,
    orderShipping: !!orderShipping,
    orderTotal: !!orderTotal,
    submitBtn: !!submitBtn,
  });

  if (
    !checkoutForm ||
    !orderItems ||
    !orderSubtotal ||
    !orderShipping ||
    !orderTotal ||
    !submitBtn
  ) {
    console.error("❌ Elementi del checkout non trovati nel DOM");
    // Mostra tutti gli ID presenti nel DOM
    const allIds = Array.from(document.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    console.log("🔍 ID presenti nel DOM:", allIds);
    return;
  }

  let cart = [];
  const FREE_SHIPPING_THRESHOLD = 50;

  // Funzioni di validazione
  function validateRequired(value, fieldName) {
    if (!value || value.trim() === "") {
      return `${fieldName} è obbligatorio`;
    }
    return "";
  }

  function validateEmail(email) {
    if (!email || email.trim() === "") return "L'email è obbligatoria";
    if (!email.includes("@") || !email.includes(".")) {
      return "Inserisci un'email valida";
    }
    return "";
  }

  function validateTelefono(telefono) {
    if (!telefono || telefono.trim() === "")
      return "Il telefono è obbligatorio";
    const cleaned = telefono.replace(/\s/g, "");
    if (cleaned.length < 9 || cleaned.length > 15) {
      return "Inserisci un numero di telefono valido";
    }
    return "";
  }

  function validateProvincia(provincia) {
    if (!provincia || provincia.trim() === "")
      return "La provincia è obbligatoria";
    if (provincia.length !== 2) {
      return "La provincia deve essere di 2 caratteri (es. MI)";
    }
    return "";
  }

  function validateCap(cap) {
    if (!cap || cap.trim() === "") return "Il CAP è obbligatorio";
    if (cap.length !== 5 || isNaN(cap)) {
      return "Il CAP deve essere di 5 cifre";
    }
    return "";
  }

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

  // Elementi del form
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

  // Validazione in tempo reale
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

  // Carica il carrello
  function loadCart() {
    // Usa lo store invece di localStorage direttamente
    cart = store.getCart();

    console.log("🛍️ Carrello caricato:", cart);

    if (cart.length === 0) {
      showToast("Il carrello è vuoto");
      router.navigate("/carrello");
      return;
    }

    displayOrderSummary();
    loadUserData();
  }

  // Carica i dati utente se loggato
  function loadUserData() {
    console.log("👤 Caricamento dati utente...");
    fetch("api/me.php")
      .then((response) => response.json())
      .then((data) => {
        console.log("📥 Dati utente ricevuti:", data);
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
          console.log("✅ Campi pre-compilati con successo");
        } else {
          console.log("⚠️ Utente non autenticato");
        }
      })
      .catch((error) => {
        console.error("❌ Errore caricamento dati utente:", error);
      });
  }

  // Visualizza il riepilogo ordine
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

  // Aggiorna i totali
  function updateTotals() {
    const subtotal = cart.reduce(
      (sum, item) => sum + parseFloat(item.prezzo) * (item.quantity || 1),
      0,
    );
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 4.9;
    const total = subtotal + shipping;

    orderSubtotal.textContent = `€${subtotal.toFixed(2).replace(".", ",")}`;
    orderShipping.textContent =
      shipping === 0 ? "Gratis" : `€${shipping.toFixed(2).replace(".", ",")}`;
    orderTotal.textContent = `€${total.toFixed(2).replace(".", ",")}`;

    console.log("💰 Totali aggiornati:", { subtotal, shipping, total });
  }

  // Submit dell'ordine
  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validazione finale di tutti i campi
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

    // Se ci sono errori, ferma il submit
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
      return;
    }

    // Calcola totale
    const subtotal = cart.reduce(
      (sum, item) => sum + parseFloat(item.prezzo) * (item.quantity || 1),
      0,
    );
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 4.9;
    const total = subtotal + shipping;

    // Prepara i dati dell'ordine
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

    // Disabilita il bottone
    submitBtn.textContent = "Elaborazione ordine...";
    submitBtn.disabled = true;

    // Invia l'ordine
    fetch("process_order.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(orderData),
    })
      .then(async (response) => {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(text); // qui dentro trovi l'HTML dell'errore PHP
        }
      })
      .then((data) => {
        if (data.success) {
          store.clearCart();

          localStorage.setItem(
            "order_confirmation",
            JSON.stringify({
              orderId: data.orderId,
              totale: total,
              data: new Date().toISOString(),
            }),
          );

          router.navigate("/order-success");
        } else {
          showToast(data.message || "Errore durante la creazione dell'ordine");
          submitBtn.textContent = "Completa l'ordine";
          submitBtn.disabled = false;
        }
      })
      .catch((error) => {
        console.error("Errore:", error);
        showToast("Errore di connessione. Riprova.");
        submitBtn.textContent = "Completa l'ordine";
        submitBtn.disabled = false;
      });
  });

  // Inizializza
  loadCart();
}

window.initCheckoutPage = initCheckoutPage;
