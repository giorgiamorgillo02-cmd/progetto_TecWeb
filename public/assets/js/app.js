// app.js - Entry point dell'applicazione SPA
// Inizializza l'applicazione quando il DOM è caricato
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Inizializzazione SPA Artly...");

  // Migra il carrello da localStorage a sessionStorage (se necessario)
  migrateCartStorage();

  // Verifica autenticazione utente
  await checkUserAuth();

  // Sottoscrivi agli aggiornamenti dello store
  store.subscribe((state) => {
    // Aggiorna il contatore del carrello
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      cartCount.textContent = state.cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0,
      );
    }
  });

  // Registra tutte le rotte dell'applicazione
  registerRoutes();

  // Hook prima del cambio rotta
  router.onBeforeRouteChange((from, to) => {
    // Chiudi eventuali dropdown o modal aperti
    const dropdowns = document.querySelectorAll(".show");
    dropdowns.forEach((el) => el.classList.remove("show"));

    // Chiudi mobile menu
    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav) mobileNav.style.display = "none";

    return true;
  });

  // Hook dopo il cambio rotta
  router.onAfterRouteChange((route, params) => {
    console.log("📍 Navigato a:", route, params);

    // Aggiorna header e footer
    headerComponent.update();

    // Gestisci gli anchor links (es. #hero, #collections)
    if (window.location.hash) {
      setTimeout(() => {
        const element = document.getElementById(
          window.location.hash.substring(1),
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  });

  // Inizializza il router
  router.init();

  console.log("✅ SPA inizializzata con successo");
});

// Registra tutte le rotte dell'applicazione
function registerRoutes() {
  // Home page
  router.addRoute("/home", async () => {
    await loadView("home");
  });

  // Prodotti
  router.addRoute("/prodotti", async () => {
    await loadView("prodotti");
  });

  // Dettaglio prodotto
  router.addRoute("/dettaglio-prodotto", async (params) => {
    await loadView("dettaglio-prodotto", params);
  });

  // Carrello
  router.addRoute("/carrello", async () => {
    await loadView("carrello");
  });

  // Checkout
  router.addRoute("/checkout", async () => {
    // Verifica che l'utente sia autenticato
    if (!store.isAuthenticated()) {
      showToast("Effettua il login per procedere");
      router.navigate("/login?redirect=/checkout");
      return;
    }

    // Verifica che il carrello non sia vuoto
    if (store.getCart().length === 0) {
      showToast("Il carrello è vuoto");
      router.navigate("/carrello");
      return;
    }

    await loadView("checkout");
  });

  // Login
  router.addRoute("/login", async (params) => {
    // Se già autenticato, reindirizza alla home
    if (store.isAuthenticated()) {
      router.navigate("/home");
      return;
    }
    await loadView("login", params);
  });

  // Registrazione
  router.addRoute("/registrazione", async () => {
    // Se già autenticato, reindirizza alla home
    if (store.isAuthenticated()) {
      router.navigate("/home");
      return;
    }
    await loadView("registrazione");
  });

  // Profilo
  router.addRoute("/profilo", async () => {
    // Verifica autenticazione
    if (!store.isAuthenticated()) {
      showToast("Effettua il login per accedere al profilo");
      router.navigate("/login?redirect=/profilo");
      return;
    }
    await loadView("profilo");
  });

  // Preferiti
  router.addRoute("/preferiti", async () => {
    // Verifica autenticazione
    if (!store.isAuthenticated()) {
      showToast("Effettua il login per vedere i preferiti");
      router.navigate("/login?redirect=/preferiti");
      return;
    }
    await loadView("preferiti");
  });

  // Admin
  router.addRoute("/admin", async () => {
    // Verifica autenticazione
    if (!store.isAuthenticated()) {
      showToast("Effettua il login per accedere");
      router.navigate("/login?redirect=/admin");
      return;
    }

    // Verifica se l'utente è admin
    if (!store.isAdmin()) {
      showToast("Accesso negato: solo gli amministratori possono accedere");
      router.navigate("/home");
      return;
    }

    await loadView("admin");
  });

  // Order success
  router.addRoute("/order-success", async () => {
    await loadView("order-success");
  });

  // 404 - Pagina non trovata
  router.addRoute("/404", async () => {
    await loadView("404");
  });

  // Rotta di default (redirect alla home)
  router.addRoute("/", async () => {
    router.navigate("/home", false);
  });
}

// Carica una view dinamicamente
async function loadView(viewName, params = {}) {
  const appContainer = document.getElementById("app");

  if (!appContainer) {
    console.error("Container #app non trovato");
    return;
  }

  try {
    // Mostra loader
    appContainer.innerHTML = '<div class="page-loader">Caricamento...</div>';

    // Carica il template HTML della view
    const response = await fetch(`views/${viewName}.html`);

    if (!response.ok) {
      throw new Error(`View non trovata: ${viewName}`);
    }

    const html = await response.text();

    console.log("📄 HTML caricato, lunghezza:", html.length, "caratteri");
    console.log("🔍 Contiene orderItems?", html.includes("orderItems"));

    // Costruisci il contenuto completo PRIMA di inserirlo
    const fullHTML =
      '<div id="header-container"></div>' +
      '<main id="main-content">' +
      html +
      "</main>" +
      '<div id="footer-container">' +
      footerComponent.render() +
      "</div>" +
      '<div class="toast" id="toast"></div>';

    // Inserisci tutto in una volta
    appContainer.innerHTML = fullHTML;

    // Render header
    const headerContainer = document.getElementById("header-container");
    headerContainer.innerHTML = headerComponent.render();
    headerComponent.attachEvents();

    // IMPORTANTE: Aspetta 2 frame del browser per assicurarsi che il DOM sia renderizzato
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );

    // Carica e inizializza il controller della view
    await initViewController(viewName, params);
  } catch (error) {
    console.error("Errore caricamento view:", error);
    appContainer.innerHTML = `
      <div class="error-page">
        <h1>😕 Errore</h1>
        <p>Impossibile caricare la pagina richiesta.</p>
        <a href="/home" data-link class="btn">Torna alla home</a>
      </div>
    `;
  }
}

// Inizializza il controller della view
async function initViewController(viewName, params) {
  // Mapping tra view e controller
  const controllers = {
    home: initHomeView,
    prodotti: initProdottiView,
    "dettaglio-prodotto": initDettaglioProdottoView,
    carrello: initCarrelloView,
    checkout: initCheckoutView,
    login: initLoginView,
    registrazione: initRegistrazioneView,
    profilo: initProfiloView,
    preferiti: initPreferitiView,
    admin: initAdminView,
    "order-success": initOrderSuccessView,
  };

  const controller = controllers[viewName];

  if (controller) {
    try {
      await controller(params);
    } catch (error) {
      console.error(`Errore inizializzazione controller ${viewName}:`, error);
    }
  }
}

// ==================== VIEW CONTROLLERS ====================

// Controller per la home
function initHomeView() {
  // Newsletter form
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterEmail = document.getElementById("newsletterEmail");
  const newsletterEmailError = document.getElementById("newsletterEmailError");

  if (newsletterForm && newsletterEmail) {
    // Validazione email
    function validateEmail(email) {
      if (!email) return "L'email è obbligatoria";
      if (!email.includes("@") || !email.includes(".")) {
        return "Inserisci un'email valida";
      }
      return "";
    }

    function showFieldError(input, errorSpan, message) {
      if (message) {
        input.classList.add("error");
        input.classList.remove("success");
        errorSpan.textContent = message;
      } else {
        input.classList.remove("error");
        input.classList.add("success");
        errorSpan.textContent = "";
      }
    }

    newsletterEmail.addEventListener("blur", () => {
      const error = validateEmail(newsletterEmail.value.trim());
      showFieldError(newsletterEmail, newsletterEmailError, error);
    });

    newsletterEmail.addEventListener("input", () => {
      if (newsletterEmail.classList.contains("error")) {
        const error = validateEmail(newsletterEmail.value.trim());
        showFieldError(newsletterEmail, newsletterEmailError, error);
      }
    });

    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();
      const error = validateEmail(email);

      showFieldError(newsletterEmail, newsletterEmailError, error);

      if (error) return;

      showToast("Grazie! Controlla la tua email 📩");
      newsletterEmail.value = "";
      newsletterEmail.classList.remove("success");
    });
  }

  // Upload button (simulazione)
  const uploadBtn = document.getElementById("uploadBtn");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => {
      showToast("Funzione upload in arrivo 😉");
    });
  }

  // Search bar nella home
  const searchInput = document.getElementById("searchInput");
  const searchSubmit = document.getElementById("searchSubmit");

  if (searchSubmit && searchInput) {
    searchSubmit.addEventListener("click", () => {
      const q = searchInput.value.trim();
      if (!q) {
        showToast("Inserisci una parola chiave per cercare 🔎");
        return;
      }
      // Naviga alla pagina prodotti
      router.navigate("/prodotti");
    });
  }
}

// Controller per la pagina prodotti
async function initProdottiView() {
  console.log("🎯 initProdottiView chiamato");

  // Carica lo script se non è già caricato
  if (!window.initProdottiPage) {
    console.log(
      "📥 window.initProdottiPage non trovato, caricamento script...",
    );
    // Aggiungi timestamp per evitare cache
    await loadScript("assets/js/pages/prodotti.js?v=" + Date.now());
    console.log(
      "📜 Script caricato, window.initProdottiPage =",
      typeof window.initProdottiPage,
    );
  } else {
    console.log("✅ window.initProdottiPage già disponibile");
  }

  // Aspetta che il DOM sia renderizzato prima di inizializzare
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Esegui l'inizializzazione
  if (window.initProdottiPage) {
    console.log("🚀 Chiamata a window.initProdottiPage()");
    window.initProdottiPage();
  } else {
    console.error("❌ window.initProdottiPage non è una funzione!");
  }
}

// Controller per il dettaglio prodotto
async function initDettaglioProdottoView(params) {
  const productId = params.id;

  if (!productId) {
    showToast("Prodotto non trovato");
    router.navigate("/prodotti");
    return;
  }

  if (!window.initDettaglioProdottoPage) {
    await loadScript("assets/js/pages/dettaglio-prodotto.js");
  }

  if (window.initDettaglioProdottoPage) {
    window.initDettaglioProdottoPage(productId);
  }
}

// Controller per il carrello
async function initCarrelloView() {
  if (!window.initCarrelloPage) {
    await loadScript("assets/js/pages/carrello.js");
  }

  await new Promise((resolve) => setTimeout(resolve, 10));

  if (window.initCarrelloPage) {
    window.initCarrelloPage();
  }
}

// Controller per il checkout
async function initCheckoutView() {
  console.log("🔧 initCheckoutView chiamato");

  if (!window.initCheckoutPage) {
    console.log("📥 Caricamento checkout.js...");
    await loadScript("assets/js/pages/checkout.js");
  }

  // Aspetta che il DOM sia completamente renderizzato
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (window.initCheckoutPage) {
    console.log("✅ Chiamata a initCheckoutPage()");
    window.initCheckoutPage();
  } else {
    console.error("❌ initCheckoutPage non trovata!");
  }
}

// Controller per il login
function initLoginView(params) {
  initPasswordToggles();
  setupForgotPasswordModal();

  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  const loginBtn = document.querySelector("#loginForm .auth-btn");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const emailError = document.getElementById("loginEmailError");
  const passwordError = document.getElementById("loginPasswordError");

  // Validazione in tempo reale per email
  loginEmail.addEventListener("blur", () => {
    const error = validateEmail(loginEmail.value);
    showFieldError(loginEmail, emailError, error);
  });

  loginEmail.addEventListener("input", () => {
    if (loginEmail.classList.contains("input-error")) {
      const error = validateEmail(loginEmail.value);
      showFieldError(loginEmail, emailError, error);
    }
  });

  // Validazione in tempo reale per password
  loginPassword.addEventListener("blur", () => {
    const error = validateRequired(loginPassword.value, "La password");
    showFieldError(loginPassword, passwordError, error);
  });

  loginPassword.addEventListener("input", () => {
    if (loginPassword.classList.contains("input-error")) {
      const error = validateRequired(loginPassword.value, "La password");
      showFieldError(loginPassword, passwordError, error);
    }
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    // Validazione completa
    const emailErr = validateEmail(email);
    const passwordErr = validateRequired(password, "La password");

    showFieldError(loginEmail, emailError, emailErr);
    showFieldError(loginPassword, passwordError, passwordErr);

    if (emailErr || passwordErr) {
      showMessage("Compila correttamente tutti i campi", "error");
      return;
    }

    loginBtn.textContent = "Accesso...";
    loginBtn.disabled = true;

    try {
      const response = await fetch("api/auth/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage(data.message, "success");

        // Aggiorna lo store con i dati utente
        await checkUserAuth();

        setTimeout(() => {
          // Reindirizza alla pagina originale se presente il parametro redirect
          let redirectTo = params.redirect || "/home";

          // Se il redirect contiene caratteri codificati (come %3F per ?), decodificali
          redirectTo = decodeURIComponent(redirectTo);

          // Verifica se l'utente è admin e sta cercando di accedere all'admin
          if (redirectTo === "/admin" && !store.isAdmin()) {
            showToast("Accesso negato: non hai i permessi di amministratore");
            redirectTo = "/home";
          }

          router.navigate(redirectTo);
        }, 1000);
      } else {
        showMessage(data.message, "error");
      }
    } catch (error) {
      console.error("Errore:", error);
      showMessage("Errore connessione. Riprova.", "error");
    } finally {
      loginBtn.textContent = "Accedi";
      loginBtn.disabled = false;
    }
  });
}

// Controller per la registrazione
function initRegistrazioneView() {
  initPasswordToggles();

  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  // Elementi del form
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const registerEmail = document.getElementById("registerEmail");
  const telefono = document.getElementById("telefono");
  const via = document.getElementById("via");
  const citta = document.getElementById("citta");
  const provincia = document.getElementById("provincia");
  const cap = document.getElementById("cap");
  const registerPassword = document.getElementById("registerPassword");
  const registerPasswordConfirm = document.getElementById(
    "registerPasswordConfirm",
  );

  // Span errori
  const firstNameError = document.getElementById("firstNameError");
  const lastNameError = document.getElementById("lastNameError");
  const emailError = document.getElementById("registerEmailError");
  const telefonoError = document.getElementById("telefonoError");
  const viaError = document.getElementById("viaError");
  const cittaError = document.getElementById("cittaError");
  const provinciaError = document.getElementById("provinciaError");
  const capError = document.getElementById("capError");
  const passwordError = document.getElementById("registerPasswordError");
  const passwordConfirmError = document.getElementById(
    "registerPasswordConfirmError",
  );

  let emailCheckTimeout;

  // Validazione in tempo reale - Nome
  firstName.addEventListener("blur", () => {
    const error = validateRequired(firstName.value, "Il nome");
    showFieldError(firstName, firstNameError, error);
  });

  firstName.addEventListener("input", () => {
    if (firstName.classList.contains("input-error")) {
      const error = validateRequired(firstName.value, "Il nome");
      showFieldError(firstName, firstNameError, error);
    }
  });

  // Validazione in tempo reale - Cognome
  lastName.addEventListener("blur", () => {
    const error = validateRequired(lastName.value, "Il cognome");
    showFieldError(lastName, lastNameError, error);
  });

  lastName.addEventListener("input", () => {
    if (lastName.classList.contains("input-error")) {
      const error = validateRequired(lastName.value, "Il cognome");
      showFieldError(lastName, lastNameError, error);
    }
  });

  // Validazione in tempo reale - Email con controllo esistenza
  registerEmail.addEventListener("blur", async () => {
    const email = registerEmail.value.trim();
    const error = validateEmail(email);

    showFieldError(registerEmail, emailError, error);

    if (!error) {
      // Se il formato è valido, verifica se l'email esiste già
      const exists = await checkEmailExists(email);
      if (exists) {
        showFieldError(
          registerEmail,
          emailError,
          "Questa email è già registrata",
        );
      }
    }
  });

  registerEmail.addEventListener("input", () => {
    clearTimeout(emailCheckTimeout);

    if (registerEmail.classList.contains("input-error")) {
      emailCheckTimeout = setTimeout(async () => {
        const email = registerEmail.value.trim();
        const error = validateEmail(email);

        showFieldError(registerEmail, emailError, error);

        if (!error) {
          // Se il formato è valido, verifica se l'email esiste già
          const exists = await checkEmailExists(email);
          if (exists) {
            showFieldError(
              registerEmail,
              emailError,
              "Questa email è già registrata",
            );
          }
        }
      }, 500);
    }
  });

  // Validazione in tempo reale - Telefono
  telefono.addEventListener("blur", () => {
    const error = validateTelefono(telefono.value);
    showFieldError(telefono, telefonoError, error);
  });

  telefono.addEventListener("input", () => {
    if (telefono.classList.contains("input-error")) {
      const error = validateTelefono(telefono.value);
      showFieldError(telefono, telefonoError, error);
    }
  });

  // Validazione in tempo reale - Via
  via.addEventListener("blur", () => {
    const error = validateRequired(via.value, "L'indirizzo");
    showFieldError(via, viaError, error);
  });

  via.addEventListener("input", () => {
    if (via.classList.contains("input-error")) {
      const error = validateRequired(via.value, "L'indirizzo");
      showFieldError(via, viaError, error);
    }
  });

  // Validazione in tempo reale - Città
  citta.addEventListener("blur", () => {
    const error = validateRequired(citta.value, "La città");
    showFieldError(citta, cittaError, error);
  });

  citta.addEventListener("input", () => {
    if (citta.classList.contains("input-error")) {
      const error = validateRequired(citta.value, "La città");
      showFieldError(citta, cittaError, error);
    }
  });

  // Validazione in tempo reale - Provincia
  provincia.addEventListener("blur", () => {
    const error = validateProvincia(provincia.value);
    showFieldError(provincia, provinciaError, error);
  });

  provincia.addEventListener("input", () => {
    provincia.value = provincia.value.toUpperCase();
    if (provincia.classList.contains("input-error")) {
      const error = validateProvincia(provincia.value);
      showFieldError(provincia, provinciaError, error);
    }
  });

  // Validazione in tempo reale - CAP
  cap.addEventListener("blur", () => {
    const error = validateCap(cap.value);
    showFieldError(cap, capError, error);
  });

  cap.addEventListener("input", () => {
    if (cap.classList.contains("input-error")) {
      const error = validateCap(cap.value);
      showFieldError(cap, capError, error);
    }
  });

  // Validazione in tempo reale - Password
  registerPassword.addEventListener("blur", () => {
    const error = validatePassword(registerPassword.value);
    showFieldError(registerPassword, passwordError, error);
  });

  registerPassword.addEventListener("input", () => {
    if (registerPassword.classList.contains("input-error")) {
      const error = validatePassword(registerPassword.value);
      showFieldError(registerPassword, passwordError, error);
    }
    // Rivalidare conferma password se già compilata
    if (registerPasswordConfirm.value) {
      const confirmError = validatePasswordConfirm(
        registerPassword.value,
        registerPasswordConfirm.value,
      );
      showFieldError(
        registerPasswordConfirm,
        passwordConfirmError,
        confirmError,
      );
    }
  });

  // Validazione in tempo reale - Conferma Password
  registerPasswordConfirm.addEventListener("blur", () => {
    const error = validatePasswordConfirm(
      registerPassword.value,
      registerPasswordConfirm.value,
    );
    showFieldError(registerPasswordConfirm, passwordConfirmError, error);
  });

  registerPasswordConfirm.addEventListener("input", () => {
    if (registerPasswordConfirm.classList.contains("input-error")) {
      const error = validatePasswordConfirm(
        registerPassword.value,
        registerPasswordConfirm.value,
      );
      showFieldError(registerPasswordConfirm, passwordConfirmError, error);
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = firstName.value.trim();
    const cognome = lastName.value.trim();
    const mail = registerEmail.value.trim();
    const tel = telefono.value.trim();
    const viaVal = via.value.trim();
    const cittaVal = citta.value.trim();
    const provinciaVal = provincia.value.trim().toUpperCase();
    const capVal = cap.value.trim();
    const password = registerPassword.value;
    const passwordConfirm = registerPasswordConfirm.value;
    const terms = document.getElementById("terms").checked;

    const registerBtn = document.querySelector("#registerForm .auth-btn");

    // Validazione completa
    const nomeErr = validateRequired(nome, "Il nome");
    const cognomeErr = validateRequired(cognome, "Il cognome");
    const emailErr = validateEmail(mail);
    const telefonoErr = validateTelefono(tel);
    const viaErr = validateRequired(viaVal, "L'indirizzo");
    const cittaErr = validateRequired(cittaVal, "La città");
    const provinciaErr = validateProvincia(provinciaVal);
    const capErr = validateCap(capVal);
    const passwordErr = validatePassword(password);
    const passwordConfirmErr = validatePasswordConfirm(
      password,
      passwordConfirm,
    );

    showFieldError(firstName, firstNameError, nomeErr);
    showFieldError(lastName, lastNameError, cognomeErr);
    showFieldError(registerEmail, emailError, emailErr);
    showFieldError(telefono, telefonoError, telefonoErr);
    showFieldError(via, viaError, viaErr);
    showFieldError(citta, cittaError, cittaErr);
    showFieldError(provincia, provinciaError, provinciaErr);
    showFieldError(cap, capError, capErr);
    showFieldError(registerPassword, passwordError, passwordErr);
    showFieldError(
      registerPasswordConfirm,
      passwordConfirmError,
      passwordConfirmErr,
    );

    if (
      nomeErr ||
      cognomeErr ||
      emailErr ||
      telefonoErr ||
      viaErr ||
      cittaErr ||
      provinciaErr ||
      capErr ||
      passwordErr ||
      passwordConfirmErr
    ) {
      showMessage("Correggi gli errori nel form", "error");
      return;
    }

    if (!terms) {
      showMessage("Accetta i termini e condizioni", "error");
      return;
    }

    // Verifica finale che l'email non sia già registrata
    const emailExists = await checkEmailExists(mail);
    if (emailExists) {
      showFieldError(
        registerEmail,
        emailError,
        "Questa email è già registrata",
      );
      showMessage("Questa email è già registrata", "error");
      return;
    }

    registerBtn.textContent = "Registrazione...";
    registerBtn.disabled = true;

    try {
      const response = await fetch("api/auth/registrazione.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          nome: nome,
          cognome: cognome,
          mail: mail,
          telefono: tel,
          via: viaVal,
          citta: cittaVal,
          provincia: provinciaVal,
          cap: capVal,
          password: password,
          password_confirm: passwordConfirm,
        }),
      });

      const data = await response.json();
      showMessage(data.message, data.success ? "success" : "error");

      if (data.success) {
        // Aggiorna lo store con i dati utente
        await checkUserAuth();

        setTimeout(() => {
          router.navigate("/home");
        }, 1500);
      }
    } catch (error) {
      console.error("Errore:", error);
      showMessage("Errore connessione", "error");
    } finally {
      registerBtn.textContent = "Crea account";
      registerBtn.disabled = false;
    }
  });
}

// Controller per il profilo
async function initProfiloView() {
  if (!window.initProfiloPage) {
    await loadScript("assets/js/pages/profilo.js");
  }

  await new Promise((resolve) => setTimeout(resolve, 10));

  if (window.initProfiloPage) {
    window.initProfiloPage();
  }
}

// Controller per i preferiti
async function initPreferitiView() {
  if (!window.initPreferitiPage) {
    await loadScript("assets/js/pages/preferiti.js");
  }

  await new Promise((resolve) => setTimeout(resolve, 10));

  if (window.initPreferitiPage) {
    window.initPreferitiPage();
  }
}

// Controller per l'admin
async function initAdminView() {
  if (!window.initAdminPage) {
    await loadScript("assets/js/pages/admin.js");
  }

  // Aspetta che gli elementi DOM siano presenti
  let attempts = 0;
  while (!document.getElementById("prodotti-list") && attempts < 20) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    attempts++;
  }

  if (!document.getElementById("prodotti-list")) {
    console.error(
      "❌ ERRORE: Elementi admin non trovati nel DOM dopo 1 secondo!",
    );
    console.log(
      "📋 Contenuto #main-content:",
      document.getElementById("main-content")?.innerHTML.substring(0, 200),
    );
    return;
  }

  console.log("✅ Elementi DOM trovati, inizializzo admin...");

  if (window.initAdminPage) {
    window.initAdminPage();
  }
}

// Controller per order success
function initOrderSuccessView() {
  // Mostra messaggio di successo
  setTimeout(() => {
    showToast("Ordine completato con successo! 🎉");
  }, 100);
}

// Migra il carrello e pulisce vecchi storage
function migrateCartStorage() {
  try {
    // Rimuovi eventuali dati del carrello da sessionStorage (vecchia implementazione)
    const sessionCart = sessionStorage.getItem("artly_cart");
    if (sessionCart) {
      console.log("🔄 Rimozione carrello da sessionStorage...");
      sessionStorage.removeItem("artly_cart");
      console.log("✅ Carrello rimosso da sessionStorage");
    }

    // Il carrello ora è sempre in localStorage
    console.log("✅ Storage configurato correttamente");
  } catch (error) {
    console.error("❌ Errore durante la pulizia dello storage:", error);
  }
}

// Setup modal recupero password
function setupForgotPasswordModal() {
  const forgotLink = document.getElementById("forgotPasswordLink");
  const modal = document.getElementById("forgotPasswordModal");
  const closeBtn = document.getElementById("closeForgotPasswordModal");
  const cancelBtn = document.getElementById("cancelResetBtn");
  const form = document.getElementById("forgotPasswordForm");

  if (!forgotLink || !modal) return;

  const resetEmail = document.getElementById("resetEmail");
  const resetNewPassword = document.getElementById("resetNewPassword");
  const resetConfirmPassword = document.getElementById("resetConfirmPassword");
  const resetEmailError = document.getElementById("resetEmailError");
  const resetNewPasswordError = document.getElementById(
    "resetNewPasswordError",
  );
  const resetConfirmPasswordError = document.getElementById(
    "resetConfirmPasswordError",
  );

  // Funzioni di validazione
  function validateEmail(email) {
    if (!email) return "L'email è obbligatoria";
    if (!email.includes("@") || !email.includes(".")) {
      return "Inserisci un'email valida";
    }
    return "";
  }

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
  resetNewPassword.addEventListener("blur", () => {
    const error = validatePassword(resetNewPassword.value);
    showFieldError(resetNewPassword, resetNewPasswordError, error);
  });

  resetNewPassword.addEventListener("input", () => {
    if (resetNewPassword.classList.contains("input-error")) {
      const error = validatePassword(resetNewPassword.value);
      showFieldError(resetNewPassword, resetNewPasswordError, error);
    }
    // Ricontrolla la conferma se già validata
    if (
      resetConfirmPassword.value &&
      resetConfirmPassword.classList.contains("input-error")
    ) {
      const error = validatePasswordConfirm(
        resetNewPassword.value,
        resetConfirmPassword.value,
      );
      showFieldError(resetConfirmPassword, resetConfirmPasswordError, error);
    }
  });

  resetConfirmPassword.addEventListener("blur", () => {
    const error = validatePasswordConfirm(
      resetNewPassword.value,
      resetConfirmPassword.value,
    );
    showFieldError(resetConfirmPassword, resetConfirmPasswordError, error);
  });

  resetConfirmPassword.addEventListener("input", () => {
    if (resetConfirmPassword.classList.contains("input-error")) {
      const error = validatePasswordConfirm(
        resetNewPassword.value,
        resetConfirmPassword.value,
      );
      showFieldError(resetConfirmPassword, resetConfirmPasswordError, error);
    }
  });

  // Apri modal e precompila email
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();

    // Precompila l'email se presente nel form di login
    const loginEmail = document.getElementById("loginEmail");
    if (loginEmail && resetEmail && loginEmail.value.trim()) {
      resetEmail.value = loginEmail.value.trim();
    }

    modal.style.display = "flex";
  });

  // Chiudi modal
  const closeModal = () => {
    modal.style.display = "none";
    form.reset();
    // Rimuovi classi di errore/successo
    [resetEmail, resetNewPassword, resetConfirmPassword].forEach((input) => {
      input.classList.remove("input-error", "input-success");
    });
    // Pulisci messaggi di errore
    [resetEmailError, resetNewPasswordError, resetConfirmPasswordError].forEach(
      (span) => {
        span.textContent = "";
        span.style.display = "none";
      },
    );
    document.getElementById("resetErrorMessage").style.display = "none";
    document.getElementById("resetSuccessMessage").style.display = "none";
  };

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Submit form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorMsg = document.getElementById("resetErrorMessage");
    const successMsg = document.getElementById("resetSuccessMessage");
    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    const email = resetEmail.value.trim();
    const newPassword = resetNewPassword.value;
    const confirmPassword = resetConfirmPassword.value;

    // Validazione finale
    const emailError = validateEmail(email);
    const passwordError = validatePassword(newPassword);
    const confirmError = validatePasswordConfirm(newPassword, confirmPassword);

    showFieldError(resetEmail, resetEmailError, emailError);
    showFieldError(resetNewPassword, resetNewPasswordError, passwordError);
    showFieldError(
      resetConfirmPassword,
      resetConfirmPasswordError,
      confirmError,
    );

    if (emailError || passwordError || confirmError) {
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
        successMsg.textContent =
          "Password modificata con successo! Puoi effettuare il login.";
        successMsg.style.display = "block";

        // Chiudi modal dopo 2 secondi
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        errorMsg.textContent =
          data.message || "Errore durante il reset della password";
        errorMsg.style.display = "block";
      }
    } catch (error) {
      console.error("Errore:", error);
      errorMsg.textContent = "Errore di connessione al server";
      errorMsg.style.display = "block";
    }
  });
}
