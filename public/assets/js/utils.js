//UTILS - FUNZIONI DI UTILITA RIUTILIZZABILI

// -----------MESSAGGI E NOTIFICHE-----------
// NOTIFICHE TOAST
let toastTimeout; //variabile esterna per gestire timer scompersa

function showToast(message, type = "normal") {
  const toast = document.getElementById("toast"); //seleziona elemento
  if (!toast) return; //se elemento non esiste -> esce

  toast.textContent = message; //aggiorna contenuto con il messaggio del toast

  // Resetta le classi per evitare che rimanga rosso
  toast.className = "toast";

  // Aggiunge classe specifica se è un errore
  if (type === "error") {
    toast.classList.add("toast--error");
  }

  toast.classList.add("toast--visible"); //rende toast visibile

  clearTimeout(toastTimeout); //pulisce timer precedente (utile se utente clicca tante volte di seguito)
  //imposta scompersa automatica
  toastTimeout = setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, 2200);
}

//MOSTRA MESSAGGI NEI FORM
function showMessage(message, type) {
  const oldMsg = document.querySelector(".form-message"); //cerca se esiste messaggio precedente
  if (oldMsg) oldMsg.remove(); //se esiste -> lo rimuove

  const msgDiv = document.createElement("div"); //crea elemento
  //assegna stile
  msgDiv.className = `form-message ${type}`;
  msgDiv.textContent = message;
  msgDiv.style.cssText = `
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
    font-weight: bold;
    text-align: center;
  `;

  //stili diversi in base al tipo di messaggio
  if (type === "success") {
    msgDiv.style.background = "#d4edda";
    msgDiv.style.color = "#155724";
    msgDiv.style.border = "1px solid #c3e6cb";
  } else {
    msgDiv.style.background = "#f8d7da";
    msgDiv.style.color = "#721c24";
    msgDiv.style.border = "1px solid #f5c6cb";
  }

  const form = document.querySelector(".auth-form");
  if (form) form.insertBefore(msgDiv, form.firstChild); //inserisce messaggio nel primo figlio del form
}

//MOSTRA ERRORE SE NON CARICA DETTAGLIO-PRODOTTO
function showDetailError(
  message,
  containerId = "productDetailContainer",
  returnLink = "prodotti",
) {
  const container = document.getElementById(containerId); //dove mostrare l'errore
  if (!container) return; // se container non esiste -> esce

  container.innerHTML = `
    <div class="error-message-box">
      <h2>❌ ${message}</h2>
      <a href="${returnLink}.html" class="btn btn-primary">Torna ai ${returnLink}</a>
    </div>
  `;
}

// ----------- FUNZIONI DI VALIDAZIONE -----------

// Valida campo obbligatorio (se vuoto -> messaggio dinamico che usa nome del campo)
function validateRequired(value, fieldName) {
  if (!value || value.trim() === "") {
    return `${fieldName} è obbligatorio`;
  }
  return "";
}

// Valida email
function validateEmail(email) {
  if (!email || email.trim() === "") {
    return "L'email è obbligatoria";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //pattern per verificare stuttura email
  if (!emailRegex.test(email.trim())) {
    return "Inserisci un'email valida";
  }
  return "";
}

// Valida password (lunghezza minima)
function validatePassword(password, minLength = 6) {
  if (!password || password.trim() === "") {
    return "La password è obbligatoria";
  }
  if (password.length < minLength) {
    return `La password deve contenere almeno ${minLength} caratteri`;
  }
  return "";
}

// Valida conferma password (uguaglianza )
function validatePasswordConfirm(password, confirmPassword) {
  if (!confirmPassword || confirmPassword.trim() === "") {
    return "Conferma la password";
  }
  //confronto stringhe
  if (password !== confirmPassword) {
    return "Le password non coincidono";
  }
  return "";
}

// Valida telefono (lunghezza e numerico)
function validateTelefono(telefono) {
  if (!telefono || telefono.trim() === "") {
    return "Il telefono è obbligatorio";
  }
  const cleaned = telefono.replace(/\s/g, "");
  if (cleaned.length < 9 || cleaned.length > 15) {
    return "Inserisci un numero di telefono valido (9-15 cifre)";
  }
  if (!/^\d+$/.test(cleaned)) {
    return "Il telefono deve contenere solo numeri";
  }
  return "";
}

// Valida provincia (2 lettere)
function validateProvincia(provincia) {
  if (!provincia || provincia.trim() === "") {
    return "La provincia è obbligatoria";
  }
  if (provincia.length !== 2) {
    return "La provincia deve essere di 2 caratteri (es. MI)";
  }
  if (!/^[A-Z]{2}$/.test(provincia.toUpperCase())) {
    return "La provincia deve contenere solo lettere (es. MI)";
  }
  return "";
}

// Valida CAP (5 cifre)
function validateCap(cap) {
  if (!cap || cap.trim() === "") {
    return "Il CAP è obbligatorio";
  }
  if (cap.length !== 5) {
    return "Il CAP deve essere di 5 cifre";
  }
  if (!/^\d{5}$/.test(cap)) {
    return "Il CAP deve contenere solo numeri";
  }
  return "";
}

// Valida prezzo (per admin e checkout)
function validatePrezzo(prezzo) {
  if (!prezzo || prezzo.toString().trim() === "") {
    return "Il prezzo è obbligatorio";
  }
  const prezzoNum = parseFloat(prezzo);
  if (isNaN(prezzoNum) || prezzoNum <= 0) {
    return "Inserisci un prezzo valido maggiore di 0";
  }
  return "";
}

// Mostra/nascondi errore per un campo
function showFieldError(input, errorSpan, message) {
  if (!input || !errorSpan) return; //se elementi non esistono ->esci

  //applica stile a messaggio se giusto o sbagliato
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

// Pulisce tutti gli errori in un form
function clearFormErrors(formElement) {
  if (!formElement) return;

  //seleziona tutti i campi possibili nel form
  const inputs = formElement.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.classList.remove("input-error", "input-success"); //rimuove tutti i feedback
  });

  //seleziona span dedicati a errori e li resetta
  const errorSpans = formElement.querySelectorAll(".field-error");
  errorSpans.forEach((span) => {
    span.textContent = "";
    span.style.display = "none";
  });
}

// Verifica se un'email è già registrata
async function checkEmailExists(email) {
  try {
    const response = await fetch(
      `api/auth/registrazione.php?mail=${encodeURIComponent(email)}`, //pulisce mail da caratteri speciali
    );
    const data = await response.json();
    return data.exists || false; //true se esiste, falso se non esiste
  } catch (error) {
    //se errore -> messaggio errore
    console.error("Errore verifica email:", error);
    return false;
  }
}

// -------- ALTRO --------

// VERIFICA AUTENTICAZIONE UTENTE
async function checkUserAuth() {
  try {
    const response = await fetch("api/me.php"); //chiamata api per leggere sessione
    const data = await response.json();

    //se utente loggato -> crea oggetto con i dati puliti ricevuti dal server
    if (data.authenticated) {
      const userData = {
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
        is_admin: data.is_admin || false,
        ruolo: data.is_admin ? "admin" : "user", // Aggiungi campo ruolo per compatibilità
      };

      //salva dati nello stato globale
      store.setUser(userData);
    }
    //se utente non loggato/bloccato
    else {
      //se bloccato -> messaggio errore + svuota carrello + reinderizza a home
      if (data.blocked) {
        showToast(
          "Il tuo account è stato bloccato dall'amministratore.",
          "error",
        );
        store.logout(); // Svuota carrello e dati utente
        router.navigate("/home");
      }
      //se non bloccato -> mantiene carrello locale
      else {
        // mantiene carrello locale
        store.clearUser();
      }
    }

    return data; //restituisce dati
  } catch (error) {
    // se errore -> messaggio errore
    console.error("Errore verifica autenticazione:", error);
    return { authenticated: false };
  }
}

//FORMATTA PREZZO
function formatPrice(price) {
  return `€${parseFloat(price).toFixed(2)}`;
}

//GENERA STILE IMMAGINE PRODOTTO
function getProductImageStyle(product) {
  //se immagine prodotto esiste -> applica proprieta css a immagine
  if (product.image_path) {
    return `background-image: url('${product.image_path}');`;
  }
  //se immagine non c'è -> applica gradiente
  else {
    const colors = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    ];
    //assegna un gradiente al prodotto (id del prodotto / lunghezza array -> fa si che lo stesso prodotto ha sempre lo stesso colore)
    return `background: ${colors[product.id % colors.length]};`;
  }
}

//DEBOUNCE
function debounce(func, wait) {
  let timeout; //memorizza timer attivo
  //restituisce funzione potenziata (non scatta immediatamente)
  return function executedFunction(...args) {
    //una volta passato tempo di attesa
    const later = () => {
      clearTimeout(timeout); //pulisce timer
      func(...args); //esegue funzone originale
    };

    clearTimeout(timeout); //cancella timer precednete preima che scade
    timeout = setTimeout(later, wait); //fa ripartire timer -> se utente non preme piu nulla viene eseguita la funzione
  };
}

//TOGGLE MOSTRA/NASCONDI PASSWORD
function initPasswordToggles() {
  const passwordToggles = document.querySelectorAll(".password-toggle");

  //cilca su ogni pulsante per aggiungere listener
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const icon = this.querySelector(".eye-icon");

      //cambia immagine in base allo stato di visibilita della password
      if (input.type === "password") {
        input.type = "text"; //permette di vedere la pw
        icon.src = "assets/img/pw_visibile.png";
      } else {
        input.type = "password";
        icon.src = "assets/img/pw_nascosta.png";
      }
    });
  });
}

// CARICAMENTO DINAMICO JS (carica controller pagine solo al bisogno)
function loadScript(src) {
  return new Promise((resolve, reject) => {
    console.log(`📜 Caricamento script: ${src}`);

    // Controlla se lo script è già stato caricato
    const existingScript = document.querySelector(`script[src="${src}"]`);
    // se esiste gia script -> esegue la promessa (senza ricarcarlo)
    if (existingScript) {
      console.log(`✅ Script già caricato: ${src}`);
      resolve();
      return;
    }

    //crea elemento
    const script = document.createElement("script");
    script.src = src;

    //quando browser dfinisce di scaricare e eseguire dile -> esegue la promessa
    script.onload = () => {
      console.log(`✅ Script caricato con successo: ${src}`);
      resolve();
    };
    //se errore -> promessa viene rifiutata
    script.onerror = (error) => {
      console.error(`❌ Errore caricamento script: ${src}`, error);
      reject(error);
    };

    //inserisce nella head della pagina lo script
    document.head.appendChild(script);
  });
}

// Sanitizza HTML per prevenire XSS (tentativi di codice malevolo )
function sanitizeHTML(str) {
  const temp = document.createElement("div"); //crea elemento in memoria
  temp.textContent = str; //browser tratta cio che si scrive dentro a input come testo puro non codice
  return temp.innerHTML; //restituosce versione codificata del testo -> tetso visualizzato correttamene ma non lo esegue come codice
}

// Esponi funzioni/variabili globalmente
window.showToast = showToast;
window.showMessage = showMessage;
window.initPasswordToggles = initPasswordToggles;
window.image_path = "assets/img/"; //definizione del percorso delle immagini
