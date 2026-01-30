// Verifica autenticazione e carica preferiti
function initPreferitiPage() {
  checkAuthAndLoadFavorites();
}

window.initPreferitiPage = initPreferitiPage;

function checkAuthAndLoadFavorites() {
  fetch("api/me.php")
    .then((response) => response.json())
    .then((data) => {
      if (!data.authenticated) {
        const redirectUrl = encodeURIComponent("/preferiti");
        window.location.href = `login.html?redirect=${redirectUrl}`;
        return;
      }
      loadFavorites();
    })
    .catch((error) => {
      console.error("Errore verifica autenticazione:", error);
      const redirectUrl = encodeURIComponent("/preferiti");
      window.location.href = `login.html?redirect=${redirectUrl}`;
    });
}

function loadFavorites() {
  fetch("api/user/preferiti.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayFavorites(data.preferiti);
      } else {
        showError(data.message);
      }
    })
    .catch((error) => {
      console.error("Errore caricamento preferiti:", error);
      showError("Errore nel caricamento dei preferiti");
    });
}

function displayFavorites(preferiti) {
  const container = document.getElementById("favoritesContainer");

  if (preferiti.length === 0) {
    container.innerHTML = `
      <div class="empty-favorites">
        <div class="empty-favorites-icon">💔</div>
        <h2>Nessun preferito ancora</h2>
        <p>Inizia ad aggiungere i tuoi poster preferiti per trovarli facilmente qui!</p>
        <a href="prodotti.html" class="btn btn-primary">Scopri i prodotti</a>
      </div>
    `;
    return;
  }

  let html = '<div class="favorites-grid">';

  preferiti.forEach((product) => {
    // Gestisce immagine
    let imageStyle = "";

    if (product.image_path && product.image_path.trim() !== "") {
      // 1. Percorso base globale
      const basePath = window.image_path || "/progetto_TecWeb/img/";

      // 3. Percorso completo
      const fullPath = image_path + product.image_path;

      // 4. Stile con gradiente scuro (per leggere meglio il testo bianco) + immagine
      imageStyle = `background-image: linear-gradient(135deg, rgba(5, 8, 22, 0.4), transparent), url('${fullPath}'); background-size: cover; background-position: center;`;
    } else {
      // Fallback se non c'è immagine
      imageStyle =
        "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);";
    }

    html += `
      <div class="favorite-card">
        <div class="favorite-card-image" style="${imageStyle}" onclick="window.location.href='dettaglio-prodotto.html?id=${product.id}'">
          ${
            !product.image_path || product.image_path.includes("pinterest.com")
              ? '<div class="product-image-overlay"><span>🖼️</span></div>'
              : ""
          }
        </div>
        <div class="favorite-card-body">
          <h3 onclick="window.location.href='dettaglio-prodotto.html?id=${product.id}'" style="cursor: pointer;">${product.titolo}</h3>
          <p class="favorite-card-author">${product.autore}</p>
          <div class="favorite-card-meta">
            <span class="tag">${product.categoria_nome || "Generale"}</span>
            <span class="favorite-card-price">€${parseFloat(product.prezzo).toFixed(2)}</span>
          </div>
          <div class="favorite-card-actions">
            <button class="btn btn-sm btn-primary" onclick="addToCart(${product.id}, '${product.titolo}', '${product.autore}', ${product.prezzo}, '${product.image_path || ""}')">
              🛒 Aggiungi al carrello
            </button>
            <button class="btn-icon-remove" onclick="removeFavorite(${product.id})" title="Rimuovi dai preferiti">
              ❤️
            </button>
          </div>
        </div>
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;
}
// CAMBIATA: ora manda JSON (non FormData) a api/user/manage_preferiti.php
function removeFavorite(productId) {
  fetch("api/user/manage_preferiti.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_poster: productId,
      action: "remove",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast("Rimosso dai preferiti");
        loadFavorites(); // Ricarica la lista
      } else {
        showToast("Errore: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Errore:", error);
      showToast("Errore nella rimozione");
    });
}

function addToCart(id, titolo, autore, prezzo, imagePath) {
  let cart = [];
  const savedCart = localStorage.getItem("artly_cart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }

  const existingIndex = cart.findIndex((item) => item.id === id);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
  } else {
    cart.push({
      id: id,
      titolo: titolo,
      autore: autore,
      prezzo: prezzo,
      image_path: imagePath,
      quantity: 1,
    });
  }

  localStorage.setItem("artly_cart", JSON.stringify(cart));

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
  }

  showToast("Prodotto aggiunto al carrello!");
}

function showError(message) {
  const container = document.getElementById("favoritesContainer");
  container.innerHTML = `
    <div class="error-message-box">
      <h2>❌ ${message}</h2>
      <a href="prodotti.html" class="btn btn-primary">Vai ai prodotti</a>
    </div>
  `;
}
