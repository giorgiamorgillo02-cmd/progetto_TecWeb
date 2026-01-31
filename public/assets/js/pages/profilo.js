// Verifica autenticazione all'avvio
let currentUserData = null;

function initProfiloPage() {
  checkAuthAndLoadProfile();
  setupEditProfileModal();
  setupChangePasswordModal();
}

window.initProfiloPage = initProfiloPage;

function checkAuthAndLoadProfile() {
  fetch("api/me.php")
    .then((response) => response.json())
    .then((data) => {
      if (!data.authenticated) {
        // Se non è loggato, reindirizza al login
        const redirectUrl = encodeURIComponent("/profilo");
        window.location.href = `login.html?redirect=${redirectUrl}`;
        return;
      }
      // Salva i dati utente
      currentUserData = data;
      // Carica i dati del profilo
      loadUserProfile(data);
      loadUserOrders();
    })
    .catch((error) => {
      console.error("Errore verifica autenticazione:", error);
      const redirectUrl = encodeURIComponent("/profilo");
      window.location.href = `login.html?redirect=${redirectUrl}`;
    });
}

// Carica i dati personali dell'utente
function loadUserProfile(userData) {
  document.getElementById("userNome").textContent = userData.nome || "-";
  document.getElementById("userCognome").textContent = userData.cognome || "-";
  document.getElementById("userEmail").textContent = userData.email || "-";
  document.getElementById("userTelefono").textContent =
    userData.telefono || "-";
  document.getElementById("userIndirizzo").textContent = userData.via || "-";
  document.getElementById("userCitta").textContent = userData.citta || "-";
  document.getElementById("userProvincia").textContent =
    userData.provincia || "-";
  document.getElementById("userCap").textContent = userData.cap || "-";
}

// Setup modale di modifica profilo
function setupEditProfileModal() {
  const editBtn = document.getElementById("editProfileBtn");
  const modal = document.getElementById("editProfileModal");
  const closeBtn = document.getElementById("closeEditModal");
  const cancelBtn = document.getElementById("cancelEditBtn");
  const form = document.getElementById("editProfileForm");

  // Elementi del form
  const nomeInput = document.getElementById("editNome");
  const cognomeInput = document.getElementById("editCognome");
  const emailInput = document.getElementById("editEmail");
  const telefonoInput = document.getElementById("editTelefono");
  const viaInput = document.getElementById("editVia");
  const cittaInput = document.getElementById("editCitta");
  const provinciaInput = document.getElementById("editProvincia");
  const capInput = document.getElementById("editCap");

  const nomeError = document.getElementById("editNomeError");
  const cognomeError = document.getElementById("editCognomeError");
  const emailError = document.getElementById("editEmailError");
  const telefonoError = document.getElementById("editTelefonoError");
  const viaError = document.getElementById("editViaError");
  const cittaError = document.getElementById("editCittaError");
  const provinciaError = document.getElementById("editProvinciaError");
  const capError = document.getElementById("editCapError");

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
      return "Inserisci un numero di telefono valido (9-15 cifre)";
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

  // Validazione in tempo reale - Via
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

  // Validazione in tempo reale - Città
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

  // Apri modale
  editBtn.addEventListener("click", () => {
    openEditModal();
  });

  // Chiudi modale
  closeBtn.addEventListener("click", closeEditModal);
  cancelBtn.addEventListener("click", closeEditModal);

  // Chiudi cliccando fuori dalla modale
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeEditModal();
    }
  });

  // Submit form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorMsg = document.getElementById("editErrorMessage");
    const successMsg = document.getElementById("editSuccessMessage");
    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    // Raccogli i dati dal form
    const nome = nomeInput.value.trim();
    const cognome = cognomeInput.value.trim();
    const mail = emailInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const via = viaInput.value.trim();
    const citta = cittaInput.value.trim();
    const provincia = provinciaInput.value.trim().toUpperCase();
    const cap = capInput.value.trim();

    // Validazione finale
    const nomeErr = validateRequired(nome, "Il nome");
    const cognomeErr = validateRequired(cognome, "Il cognome");
    const emailErr = validateEmail(mail);
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
      errorMsg.textContent = "Correggi gli errori nel form";
      errorMsg.style.display = "block";
      return;
    }

    const formData = {
      nome,
      cognome,
      mail,
      telefono,
      via,
      citta,
      provincia,
      cap,
    };

    try {
      const response = await fetch("api/me.php", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        successMsg.textContent = "Profilo aggiornato con successo!";
        successMsg.style.display = "block";

        // Ricarica i dati del profilo
        setTimeout(() => {
          closeEditModal();
          checkAuthAndLoadProfile();
        }, 1500);
      } else {
        errorMsg.textContent = data.message || "Errore durante l'aggiornamento";
        errorMsg.style.display = "block";
      }
    } catch (error) {
      console.error("Errore:", error);
      errorMsg.textContent = "Errore di connessione al server";
      errorMsg.style.display = "block";
    }
  });
}

// Apri modale e popola i campi
function openEditModal() {
  const modal = document.getElementById("editProfileModal");

  // Popola i campi con i dati attuali
  if (currentUserData) {
    document.getElementById("editNome").value = currentUserData.nome || "";
    document.getElementById("editCognome").value =
      currentUserData.cognome || "";
    document.getElementById("editEmail").value = currentUserData.email || "";
    document.getElementById("editTelefono").value =
      currentUserData.telefono || "";
    document.getElementById("editVia").value = currentUserData.via || "";
    document.getElementById("editCitta").value = currentUserData.citta || "";
    document.getElementById("editProvincia").value =
      currentUserData.provincia || "";
    document.getElementById("editCap").value = currentUserData.cap || "";
  }

  // Rimuovi classi di errore/successo
  [
    document.getElementById("editNome"),
    document.getElementById("editCognome"),
    document.getElementById("editEmail"),
    document.getElementById("editTelefono"),
    document.getElementById("editVia"),
    document.getElementById("editCitta"),
    document.getElementById("editProvincia"),
    document.getElementById("editCap"),
  ].forEach((input) => {
    input.classList.remove("input-error", "input-success");
  });

  // Pulisci messaggi di errore
  [
    document.getElementById("editNomeError"),
    document.getElementById("editCognomeError"),
    document.getElementById("editEmailError"),
    document.getElementById("editTelefonoError"),
    document.getElementById("editViaError"),
    document.getElementById("editCittaError"),
    document.getElementById("editProvinciaError"),
    document.getElementById("editCapError"),
  ].forEach((span) => {
    span.textContent = "";
    span.style.display = "none";
  });

  // Reset messaggi
  document.getElementById("editErrorMessage").style.display = "none";
  document.getElementById("editSuccessMessage").style.display = "none";

  modal.style.display = "flex";
}

// Chiudi modale
function closeEditModal() {
  const modal = document.getElementById("editProfileModal");
  modal.style.display = "none";
}

// Gestisci aggiornamento profilo

// Carica lo storico ordini
function loadUserOrders() {
  fetch("api/user/ordini.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayOrders(data.ordini);
      } else {
        document.getElementById("ordersContainer").innerHTML =
          '<p class="no-orders">Nessun ordine trovato.</p>';
      }
    })
    .catch((error) => {
      console.error("Errore caricamento ordini:", error);
      document.getElementById("ordersContainer").innerHTML =
        '<p class="error-message">Errore nel caricamento degli ordini.</p>';
    });
}

// Mostra gli ordini
function displayOrders(ordini) {
  const container = document.getElementById("ordersContainer");

  const basePath = window.image_path || "assets/img/";

  if (ordini.length === 0) {
    container.innerHTML = '<p class="no-orders">Nessun ordine trovato.</p>';
    return;
  }

  let html = "";

  ordini.forEach((ordine) => {
    const dataOrdine = new Date(ordine.data).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    html += `
      <div class="order-card">
        <div class="order-card-header">
          <div class="order-card-info">
            <span class="order-id">Ordine #${ordine.id}</span>
            <span class="order-date">${dataOrdine}</span>
          </div>
          <span class="order-total">€${parseFloat(ordine.totale).toFixed(2)}</span>
        </div>
        <div class="order-card-body">
          <div class="order-products">
            ${ordine.prodotti
              .map((prodotto) => {
                const fullImagePath = basePath + prodotto.image_path;
                return ` 
              <div class="order-product-item">
                <img src="${fullImagePath}" alt="${prodotto.titolo}" class="order-product-img" />
                <div class="order-product-info">
                  <h4>${prodotto.titolo}</h4>
                  <p class="order-product-author">${prodotto.autore}</p>
                  <p class="order-product-price">€${parseFloat(prodotto.prezzo).toFixed(2)}</p>
                </div>
              </div>
            `;
              })
              .join("")}
          </div>
        </div>
        <div class="order-card-footer">
          <button class="btn btn-outline btn-reorder" onclick="reorderItems(${ordine.id})">
            🔄 Riordina
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}
// Funzione per riordinare (aggiunge tutti i prodotti dell'ordine al carrello)
function reorderItems(orderId) {
  fetch("api/user/ordini.php")
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        showToast("Errore nel recupero dell'ordine");
        return;
      }

      // Trova l'ordine specifico
      const ordine = data.ordini.find((o) => o.id === orderId);
      if (!ordine) {
        showToast("Ordine non trovato");
        return;
      }

      // Ottieni il carrello attuale
      let cart = [];
      const savedCart = localStorage.getItem("artly_cart");
      if (savedCart) {
        try {
          cart = JSON.parse(savedCart);
        } catch (e) {
          cart = [];
        }
      }

      // Aggiungi tutti i prodotti dell'ordine al carrello
      ordine.prodotti.forEach((prodotto) => {
        const existingIndex = cart.findIndex((item) => item.id === prodotto.id);
        if (existingIndex !== -1) {
          // Prodotto già nel carrello, incrementa quantità
          cart[existingIndex].quantity =
            (cart[existingIndex].quantity || 1) + 1;
        } else {
          // Aggiungi nuovo prodotto al carrello
          cart.push({
            id: prodotto.id,
            titolo: prodotto.titolo,
            autore: prodotto.autore,
            prezzo: prodotto.prezzo,
            image_path: prodotto.image_path,
            quantity: 1,
          });
        }
      });

      // Salva il carrello aggiornato
      localStorage.setItem("artly_cart", JSON.stringify(cart));

      // Aggiorna il contatore del carrello
      const totalItems = cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0,
      );
      const cartCountEl = document.getElementById("cartCount");
      if (cartCountEl) {
        cartCountEl.textContent = totalItems;
      }

      showToast(
        `${ordine.prodotti.length} prodott${ordine.prodotti.length > 1 ? "i aggiunti" : "o aggiunto"} al carrello!`,
      );

      // Dopo 1.5 secondi reindirizza al carrello
      setTimeout(() => {
        window.location.href = "carrello.html";
      }, 1500);
    })
    .catch((error) => {
      console.error("Errore nel riordino:", error);
      showToast("Errore nel riordino");
    });
}

// Setup modale cambio password
function setupChangePasswordModal() {
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const modal = document.getElementById("changePasswordModal");
  const closeBtn = document.getElementById("closeChangePasswordModal");
  const cancelBtn = document.getElementById("cancelChangePasswordBtn");
  const form = document.getElementById("changePasswordForm");

  // Elementi del form
  const newPasswordInput = document.getElementById("changePasswordNew");
  const confirmPasswordInput = document.getElementById("changePasswordConfirm");
  const newPasswordError = document.getElementById("changePasswordNewError");
  const confirmPasswordError = document.getElementById(
    "changePasswordConfirmError",
  );

  // Funzioni di validazione
  function validatePassword(password) {
    if (!password) return "La password è obbligatoria";
    if (password.length < 6) {
      return "La password deve essere di almeno 6 caratteri";
    }
    return "";
  }

  function validatePasswordConfirm(password, passwordConfirm) {
    if (!passwordConfirm) return "Conferma la password";
    if (password !== passwordConfirm) {
      return "Le password non coincidono";
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

  // Validazione in tempo reale
  newPasswordInput.addEventListener("blur", () => {
    const error = validatePassword(newPasswordInput.value);
    showFieldError(newPasswordInput, newPasswordError, error);
  });

  newPasswordInput.addEventListener("input", () => {
    if (newPasswordInput.classList.contains("input-error")) {
      const error = validatePassword(newPasswordInput.value);
      showFieldError(newPasswordInput, newPasswordError, error);
    }
    // Ricontrolla la conferma se già validata
    if (
      confirmPasswordInput.value &&
      confirmPasswordInput.classList.contains("input-error")
    ) {
      const error = validatePasswordConfirm(
        newPasswordInput.value,
        confirmPasswordInput.value,
      );
      showFieldError(confirmPasswordInput, confirmPasswordError, error);
    }
  });

  confirmPasswordInput.addEventListener("blur", () => {
    const error = validatePasswordConfirm(
      newPasswordInput.value,
      confirmPasswordInput.value,
    );
    showFieldError(confirmPasswordInput, confirmPasswordError, error);
  });

  confirmPasswordInput.addEventListener("input", () => {
    if (confirmPasswordInput.classList.contains("input-error")) {
      const error = validatePasswordConfirm(
        newPasswordInput.value,
        confirmPasswordInput.value,
      );
      showFieldError(confirmPasswordInput, confirmPasswordError, error);
    }
  });

  // Apri modale
  changePasswordBtn.addEventListener("click", () => {
    openChangePasswordModal();
  });

  // Chiudi modale
  closeBtn.addEventListener("click", closeChangePasswordModal);
  cancelBtn.addEventListener("click", closeChangePasswordModal);

  // Chiudi cliccando fuori dalla modale
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeChangePasswordModal();
    }
  });

  // Submit form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorMsg = document.getElementById("changePasswordError");
    const successMsg = document.getElementById("changePasswordSuccess");
    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    const email = document.getElementById("changePasswordEmail").value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validazione finale
    const passwordErr = validatePassword(newPassword);
    const confirmErr = validatePasswordConfirm(newPassword, confirmPassword);

    showFieldError(newPasswordInput, newPasswordError, passwordErr);
    showFieldError(confirmPasswordInput, confirmPasswordError, confirmErr);

    if (passwordErr || confirmErr) {
      return;
    }

    try {
      const response = await fetch("reset_password.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        successMsg.textContent = "Password modificata con successo!";
        successMsg.style.display = "block";

        // Reset form e chiudi modale dopo 2 secondi
        setTimeout(() => {
          closeChangePasswordModal();
        }, 2000);
      } else {
        errorMsg.textContent =
          data.message || "Errore durante il cambio password";
        errorMsg.style.display = "block";
      }
    } catch (error) {
      console.error("Errore:", error);
      errorMsg.textContent = "Errore di connessione al server";
      errorMsg.style.display = "block";
    }
  });
}

// Apri modale cambio password
function openChangePasswordModal() {
  const modal = document.getElementById("changePasswordModal");

  // Precompila email con i dati dell'utente
  if (currentUserData && currentUserData.email) {
    document.getElementById("changePasswordEmail").value =
      currentUserData.email;
  }

  // Reset campi password
  document.getElementById("changePasswordNew").value = "";
  document.getElementById("changePasswordConfirm").value = "";

  // Rimuovi classi di errore/successo
  [
    document.getElementById("changePasswordNew"),
    document.getElementById("changePasswordConfirm"),
  ].forEach((input) => {
    input.classList.remove("input-error", "input-success");
  });

  // Pulisci messaggi di errore
  [
    document.getElementById("changePasswordNewError"),
    document.getElementById("changePasswordConfirmError"),
  ].forEach((span) => {
    span.textContent = "";
    span.style.display = "none";
  });

  // Reset messaggi
  document.getElementById("changePasswordError").style.display = "none";
  document.getElementById("changePasswordSuccess").style.display = "none";

  // Inizializza i toggle delle password
  if (typeof initPasswordToggles === "function") {
    initPasswordToggles();
  }

  modal.style.display = "flex";
}

// Chiudi modale cambio password
function closeChangePasswordModal() {
  const modal = document.getElementById("changePasswordModal");
  modal.style.display = "none";
}

// Gestisci cambio password
