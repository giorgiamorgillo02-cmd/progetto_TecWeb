//INIZIALIZZA PAGINA DETTAGLIO PRODOTTO
function initDettaglioProdottoPage(productId) {
  // Se no ID -> reindirizza alla pagina prodotti
  if (!productId) {
    window.router.navigate("/prodotti");
    return;
  }
  //se id presente -> carica dettaglio prodotto
  loadProductDetail(productId);
}

window.initDettaglioProdottoPage = initDettaglioProdottoPage; //esponi funzione globalmente

// Per compatibilità con vecchio modo (se aperto direttamente)
// if (window.location.search) {
//   const urlParams = new URLSearchParams(window.location.search);
//   const productId = urlParams.get("id");
//   if (productId) {
//     initDettaglioProdottoPage(productId);
//   }
// }

//CARICA I DETTAGLI DEL PRODOTTO
function loadProductDetail(id) {
  fetch(`api/prodotti.php?id=${id}`) //chiamata funzione in base all'id
    .then((response) => response.json())
    .then((data) => {
      //se successo -> visualizza dettaglio prodotto
      if (data.success && data.data) {
        displayProductDetail(data.data);
      }
      //se errore -> mostra messaggio di errore
      else {
        showDetailError("Prodotto non trovato");
      }
    })
    //se errore (se server non risponde) -> mostra messaggio di errore
    .catch((error) => {
      console.error("Errore caricamento prodotto:", error);
      showDetailError("Errore nel caricamento del prodotto");
    });
}

//MOSTRA DETTAGLI PRODOTTO NELLA PAGINA
function displayProductDetail(product) {
  const container = document.getElementById("productDetailContainer");

  //Immagine
  let imageHtml = "";
  // Se immagine nel db -> assegna url immagine
  if (product.image_path && product.image_path.trim() !== "") {
    // Usa window.image_path definito in utils.js
    const basePath = window.image_path || "assets/img/";
    const fullPath = basePath + product.image_path;
    // Assegna l'URL
    imageHtml = `<div class="product-detail-image" style="background-image: url('${fullPath}');"></div>`;
  }
  //se no immagine -> mostra placeholder
  else {
    imageHtml = `<div class="product-detail-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="product-image-placeholder">🖼️</div>
    </div>`;
  }

  // Costruisci l'HTML del dettaglio prodotto
  container.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-detail-left">
        ${imageHtml}
      </div>
      
      <div class="product-detail-right">
        <div class="product-detail-category">${product.categoria_nome || "Arte"}</div>
        <h1 class="product-detail-title">
          ${product.titolo}
          <button class="btn-favorite" id="favoriteBtn" title="Aggiungi ai preferiti">
            <span class="heart-icon">🤍</span>
          </button>
        </h1>
        <p class="product-detail-author">di <span>${product.autore}</span></p>
        
        <div class="product-detail-price">
          <span class="price-value">€${parseFloat(product.prezzo).toFixed(2)}</span>
        </div>
        
        <div class="product-detail-description">
          <h3>Descrizione</h3>
          <p>${product.descrizione || "Stampa digitale di alta qualità, perfetta per decorare qualsiasi ambiente."}</p>
        </div>
        
        <div class="product-detail-features">
          <h3>Caratteristiche</h3>
          <ul>
            <li>📐 <strong>Formato:</strong> Digitale ad alta risoluzione</li>
            <li>🎨 <strong>Stile:</strong> ${product.categoria_nome || "Arte moderna"}</li>
            <li>💾 <strong>Download:</strong> Immediato dopo l'acquisto</li>
            <li>🖨️ <strong>Stampa:</strong> Ottimizzato per stampe fino a 50x70cm</li>
            <li>✨ <strong>Qualità:</strong> File ad alta definizione</li>
          </ul>
        </div>
        
        <div class="product-detail-actions">
          <div class="quantity-selector">
            <button class="quantity-btn" id="decreaseQty" aria-label="Diminuisci quantità">-</button>
            <input type="number" id="quantityInput" value="1" min="1" max="99" readonly />
            <button class="quantity-btn" id="increaseQty" aria-label="Aumenta quantità">+</button>
          </div>
          
          <button class="btn btn-primary btn-add-to-cart" id="addToCartBtn">
            Aggiungi al carrello
          </button>
        </div>
        
        <div class="product-detail-info">
          <p>🚚 <strong>Spedizione gratuita</strong> per ordini superiori a €50</p>
          <p>💳 <strong>Pagamento sicuro</strong> con carte di credito o PayPal</p>
        </div>
      </div>
    </div>
  `;

  //EVENT LISTENER
  //controlli quantita
  setupQuantityControls();

  //aggiungi al carrello
  document.getElementById("addToCartBtn").addEventListener("click", () => {
    addToCart(product);
  });

  //preferiti
  const favoriteBtn = document.getElementById("favoriteBtn");
  if (favoriteBtn) {
    checkIfFavorite(product.id);
    favoriteBtn.addEventListener("click", () => {
      toggleFavorite(product.id);
    });
  }
}

//CONTROLLI QUANTITÀ
function setupQuantityControls() {
  const decreaseBtn = document.getElementById("decreaseQty"); //pulsante diminuisci
  const increaseBtn = document.getElementById("increaseQty"); //pulsante aumenta
  const quantityInput = document.getElementById("quantityInput"); //input quantita

  //event listener per decrementare
  decreaseBtn.addEventListener("click", () => {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });
  //event listener per incrementare
  increaseBtn.addEventListener("click", () => {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue < 99) {
      quantityInput.value = currentValue + 1;
    }
  });
}

//AGGIUNGI PRODOTTO AL CARRELLO
function addToCart(product) {
  const quantity = parseInt(document.getElementById("quantityInput").value);

  // Aggiungi il prodotto al carrello per la quantità specificata
  for (let i = 0; i < quantity; i++) {
    store.addToCart(product);
  }

  // Aggiorna il contatore del carrello
  const totalItems = store.getCartCount();
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
  }

  // Mostra notifica
  showToast(
    `${quantity} ${quantity > 1 ? "prodotti aggiunti" : "prodotto aggiunto"} al carrello!`,
  );

  // Reset quantità
  document.getElementById("quantityInput").value = 1;

  // Mostra modale del carrello
  showCartModal(product, store.getCart());
}

//MOSTRA MODALE CARRELLO
function showCartModal(product, cart) {
  const cartModal = document.getElementById("cartModal");
  const cartModalProductsList = document.getElementById(
    "cartModalProductsList",
  );

  if (!cartModal || !cartModalProductsList) return; //se no modale carrello o lista prodotti -> esce

  const totals = calculateCartTotals(cart); //calcola totali

  // Genera HTML per tutti i prodotti nel carrello
  let productsHTML = "";
  //per ogni card crea card
  cart.forEach((item) => {
    productsHTML += createCartProductHTML(item);
  });

  // Inserisci i prodotti nella lista
  cartModalProductsList.innerHTML = productsHTML;

  // Aggiorna i totali
  const cartModalItems = document.getElementById("cartModalItems");
  const cartModalSubtotal = document.getElementById("cartModalSubtotal");
  const cartModalShipping = document.getElementById("cartModalShipping");
  const cartModalTotal = document.getElementById("cartModalTotal");

  //aggiorna con i valori calcolari
  if (cartModalItems) cartModalItems.textContent = totals.itemsCount;
  if (cartModalSubtotal)
    cartModalSubtotal.textContent = formatPrice(totals.subtotal);
  if (cartModalShipping) {
    cartModalShipping.textContent =
      totals.shipping === 0 ? "Gratis" : formatPrice(totals.shipping);
  }
  if (cartModalTotal) cartModalTotal.textContent = formatPrice(totals.total);

  //mostra modale attraverso classi
  cartModal.classList.add("is-open");
  cartModal.style.display = "block";
  cartModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

//CHIUDI MODALE CARRELLO
function closeCartModal() {
  const cartModal = document.getElementById("cartModal");
  if (!cartModal) return; // se modale carrello non esiste -> esce

  //rimuove classi e nasconde modale
  cartModal.classList.remove("is-open");
  cartModal.style.display = "none";
  cartModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

//CREA CARD PRODOTTO
function createCartProductHTML(item) {
  let bgStyle = "";

  //immagine
  //se esiste nel db -> definisce percorso e applica immagine
  if (item.image_path && item.image_path.trim() !== "") {
    const basePath = window.image_path || "assets/img/";
    const imgName = item.image_path;
    const fullPath = basePath + imgName;

    // Costruisce lo stile corretto
    bgStyle = `background-image: url('${fullPath}'); background-size: cover; background-position: center;`;
  }
  //se non esiste -> gradiente
  else {
    bgStyle = `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`;
  }

  return `
    <div class="cart-modal-product">
      <div class="cart-modal-product-image" style="${bgStyle}"></div>
      <div class="cart-modal-product-info">
        <h4>${item.titolo}</h4>
        <p class="cart-modal-product-author">${item.autore}</p>
        <p class="cart-modal-product-price">€${parseFloat(item.prezzo).toFixed(2)} × ${item.quantity || 1}</p>
      </div>
    </div>
  `;
}

//CALCOLA TOTALE DEL CARRELLO
function calculateCartTotals(cart) {
  //calcolo subtotale (prezzo*quantita)
  const subtotal = cart.reduce((sum, item) => {
    return sum + parseFloat(item.prezzo) * (item.quantity || 1);
  }, 0);
  const itemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0); //numero articoli
  const shipping = subtotal >= 50 ? 0 : 5.99; //spedizione
  const total = subtotal + shipping; //totale
  return { subtotal, shipping, total, itemsCount };
}

//FORMATO DEL PREZZO (euro, decimali e virgola)
function formatPrice(price) {
  return `€${price.toFixed(2).replace(".", ",")}`;
}

//EVENT LISTENER PER CHIUDERE MODALE
const cartModal = document.getElementById("cartModal");
if (cartModal) {
  //chiusura al click su overlay o bottone x
  cartModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.dataset && target.dataset.close === "true") {
      closeCartModal();
    }
  });
  //chiusura con tasto esc
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartModal.classList.contains("is-open")) {
      closeCartModal();
    }
  });
}

//GESTIONE PREFERITI
function checkIfFavorite(productId) {
  fetch("api/user/preferiti.php", {
    //chiamata api
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_poster: productId,
      action: "check", //azione di controllo
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      //se prodotto nei preferiti -> aggiorna bottone
      if (data.success && data.isFavorite) {
        updateFavoriteButton(true);
      }
    })
    //se errore -> messaggio errore
    .catch((error) => {
      console.log("Errore controllo preferiti:", error);
    });
}

//TOGGLE PER AGGIUNGERE/RIMUOVERE PREFERITI
function toggleFavorite(productId) {
  const favoriteBtn = document.getElementById("favoriteBtn");
  const heartIcon = favoriteBtn.querySelector(".heart-icon");
  const isFavorite = heartIcon.textContent === "❤️"; //verifica stato attuale

  fetch("api/user/preferiti.php", {
    //chiamata api
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_poster: productId,
      action: isFavorite ? "remove" : "add", //inverta azione in base a stato attuale
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      //se successo -> aggiorna bvottone + feedback
      if (data.success) {
        updateFavoriteButton(data.isFavorite);
        showToast(data.message);
      }
      //se fallisce
      else {
        //se non autenticato -> messaggio + reindirizza a login
        if (data.message === "Non autenticato") {
          showToast("Effettua il login per aggiungere ai preferiti");
          setTimeout(() => {
            const redirectUrl = encodeURIComponent(
              `/dettaglio-prodotto?id=${productId}`,
            ); // Codifica l'URL di redirect per gestire correttamente i parametri
            window.location.href = `login.html?redirect=${redirectUrl}`;
          }, 1500);
        }
        //se altro errore -> messaggio errore
        else {
          showToast(data.message);
        }
      }
    })
    //se errore server -> messaggio errore
    .catch((error) => {
      console.error("Errore:", error);
      showToast("Errore nella gestione dei preferiti");
    });
}

//AGGIORNA ICONA PREFERITI
function updateFavoriteButton(isFavorite) {
  const favoriteBtn = document.getElementById("favoriteBtn");
  const heartIcon = favoriteBtn.querySelector(".heart-icon");
  // se nei preferiti -> cuore rosso
  if (isFavorite) {
    heartIcon.textContent = "❤️";
    favoriteBtn.classList.add("is-favorite");
    favoriteBtn.title = "Rimuovi dai preferiti";
  }
  //se non nei preferiti -> cuore bianco
  else {
    heartIcon.textContent = "🤍";
    favoriteBtn.classList.remove("is-favorite");
    favoriteBtn.title = "Aggiungi ai preferiti";
  }
}
