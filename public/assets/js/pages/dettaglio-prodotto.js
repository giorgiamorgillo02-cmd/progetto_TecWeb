// Funzione di inizializzazione per SPA
function initDettaglioProdottoPage(productId) {
  if (!productId) {
    // Se non c'è ID, reindirizza alla pagina prodotti
    window.router.navigate("/prodotti");
    return;
  }

  loadProductDetail(productId);
}

window.initDettaglioProdottoPage = initDettaglioProdottoPage;

// Per compatibilità con vecchio modo (se aperto direttamente)
// if (window.location.search) {
//   const urlParams = new URLSearchParams(window.location.search);
//   const productId = urlParams.get("id");
//   if (productId) {
//     initDettaglioProdottoPage(productId);
//   }
// }

// Carica i dettagli del prodotto
function loadProductDetail(id) {
  fetch(`api/prodotti.php?id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.data) {
        displayProductDetail(data.data);
      } else {
        showError("Prodotto non trovato");
      }
    })
    .catch((error) => {
      console.error("Errore caricamento prodotto:", error);
      showError("Errore nel caricamento del prodotto");
    });
}

// Mostra i dettagli del prodotto
function displayProductDetail(product) {
  const container = document.getElementById("productDetailContainer");

  // Gestisce immagine
  let imageHtml = "";
  // Se c'è un'immagine, costruisci il percorso corretto
  if (product.image_path && product.image_path.trim() !== "") {
    // Usa window.image_path definito in utils.js
    const basePath = window.image_path || "assets/img/";
    const fullPath = basePath + product.image_path;
    // Assegna l'URL
    imageHtml = `<div class="product-detail-image" style="background-image: url('${fullPath}');"></div>`;
  } else {
    // Fallback se manca l'immagine
    imageHtml = `<div class="product-detail-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="product-image-placeholder">🖼️</div>
    </div>`;
  }

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

  // Event listeners per quantità
  setupQuantityControls();

  // Event listener per aggiunta al carrello
  document.getElementById("addToCartBtn").addEventListener("click", () => {
    addToCart(product);
  });

  // Event listener per preferiti
  const favoriteBtn = document.getElementById("favoriteBtn");
  if (favoriteBtn) {
    checkIfFavorite(product.id);
    favoriteBtn.addEventListener("click", () => {
      toggleFavorite(product.id);
    });
  }
}

// Gestisce i controlli della quantità
function setupQuantityControls() {
  const decreaseBtn = document.getElementById("decreaseQty");
  const increaseBtn = document.getElementById("increaseQty");
  const quantityInput = document.getElementById("quantityInput");

  decreaseBtn.addEventListener("click", () => {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });

  increaseBtn.addEventListener("click", () => {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue < 99) {
      quantityInput.value = currentValue + 1;
    }
  });
}

// Aggiunge il prodotto al carrello
function addToCart(product) {
  const quantity = parseInt(document.getElementById("quantityInput").value);

  // Aggiungi il prodotto al carrello usando lo store
  // Aggiungi più volte in base alla quantità selezionata
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

  // Mostra il modale del carrello
  showCartModal(product, store.getCart());
}

// Mostra messaggio di errore
function showError(message) {
  const container = document.getElementById("productDetailContainer");
  container.innerHTML = `
    <div class="error-message-box">
      <h2>❌ ${message}</h2>
      <a href="prodotti.html" class="btn btn-primary">Torna ai prodotti</a>
    </div>
  `;
}

// Funzioni per il modale del carrello
function showCartModal(product, cart) {
  const cartModal = document.getElementById("cartModal");
  const cartModalProductsList = document.getElementById(
    "cartModalProductsList",
  );

  if (!cartModal || !cartModalProductsList) return;

  const totals = calculateCartTotals(cart);

  // Genera HTML per tutti i prodotti nel carrello
  let productsHTML = "";
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

  if (cartModalItems) cartModalItems.textContent = totals.itemsCount;
  if (cartModalSubtotal)
    cartModalSubtotal.textContent = formatPrice(totals.subtotal);
  if (cartModalShipping) {
    cartModalShipping.textContent =
      totals.shipping === 0 ? "Gratis" : formatPrice(totals.shipping);
  }
  if (cartModalTotal) cartModalTotal.textContent = formatPrice(totals.total);

  cartModal.classList.add("is-open");
  cartModal.style.display = "block";
  cartModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeCartModal() {
  const cartModal = document.getElementById("cartModal");
  if (!cartModal) return;
  cartModal.classList.remove("is-open");
  cartModal.style.display = "none";
  cartModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function createCartProductHTML(item) {
  let bgStyle = "";

  if (item.image_path && item.image_path.trim() !== "") {
    // Usa window.image_path globale
    const basePath = window.image_path || "assets/img/";
    const imgName = item.image_path.startsWith("/")
      ? item.image_path.substring(1)
      : item.image_path;
    const fullPath = basePath + imgName;

    // Costruisce lo stile corretto
    bgStyle = `background-image: url('${fullPath}'); background-size: cover; background-position: center;`;
  } else {
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

function calculateCartTotals(cart) {
  const subtotal = cart.reduce((sum, item) => {
    return sum + parseFloat(item.prezzo) * (item.quantity || 1);
  }, 0);
  const itemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;
  return { subtotal, shipping, total, itemsCount };
}

function formatPrice(price) {
  return `€${price.toFixed(2).replace(".", ",")}`;
}

// Event listeners per chiudere il modale
const cartModal = document.getElementById("cartModal");
if (cartModal) {
  cartModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.dataset && target.dataset.close === "true") {
      closeCartModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartModal.classList.contains("is-open")) {
      closeCartModal();
    }
  });
}

// Funzioni per gestire i preferiti
function checkIfFavorite(productId) {
  fetch("api/user/preferiti.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_poster: productId,
      action: "check",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.isFavorite) {
        updateFavoriteButton(true);
      }
    })
    .catch((error) => {
      console.log("Errore controllo preferiti:", error);
    });
}

function toggleFavorite(productId) {
  const favoriteBtn = document.getElementById("favoriteBtn");
  const heartIcon = favoriteBtn.querySelector(".heart-icon");
  const isFavorite = heartIcon.textContent === "❤️";

  fetch("api/user/preferiti.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_poster: productId,
      action: isFavorite ? "remove" : "add",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateFavoriteButton(data.isFavorite);
        showToast(data.message);
      } else {
        if (data.message === "Non autenticato") {
          showToast("Effettua il login per aggiungere ai preferiti");
          setTimeout(() => {
            // Codifica l'URL di redirect per gestire correttamente i parametri
            const redirectUrl = encodeURIComponent(
              `/dettaglio-prodotto?id=${productId}`,
            );
            window.location.href = `login.html?redirect=${redirectUrl}`;
          }, 1500);
        } else {
          showToast(data.message);
        }
      }
    })
    .catch((error) => {
      console.error("Errore:", error);
      showToast("Errore nella gestione dei preferiti");
    });
}

function updateFavoriteButton(isFavorite) {
  const favoriteBtn = document.getElementById("favoriteBtn");
  const heartIcon = favoriteBtn.querySelector(".heart-icon");
  if (isFavorite) {
    heartIcon.textContent = "❤️";
    favoriteBtn.classList.add("is-favorite");
    favoriteBtn.title = "Rimuovi dai preferiti";
  } else {
    heartIcon.textContent = "🤍";
    favoriteBtn.classList.remove("is-favorite");
    favoriteBtn.title = "Aggiungi ai preferiti";
  }
}
