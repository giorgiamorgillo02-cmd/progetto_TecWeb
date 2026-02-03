//INIZIALIZZA PAGINA PREFERITI (chiama la funzione di verifica autenticazione + caricamento preferiti)
function initPreferitiPage() {
  checkAuthAndLoadFavorites();
}

//VERIFICA SE UTENTE È AUTENTICATO E CARICA PREFERITI
function checkAuthAndLoadFavorites() {
  fetch("api/me.php") //verifica autenticazione (chiama funzione in api/me.php)
    .then((response) => response.json())
    .then((data) => {
      //se non autenticato -> reindirizza a login con redirect a preferiti
      if (!data.authenticated) {
        const redirectUrl = encodeURIComponent("/preferiti");
        window.location.href = `login.html?redirect=${redirectUrl}`;
        return;
      }
      //se autenticato -> carica preferiti
      loadFavorites();
    })
    //caso di errore (se server non risponde) -> reindirizza a login con redirect a preferiti
    .catch((error) => {
      console.error("Errore verifica autenticazione:", error);
      const redirectUrl = encodeURIComponent("/preferiti");
      window.location.href = `login.html?redirect=${redirectUrl}`;
    });
}

//FUNZIONE PER CARICARE I PREFERITI DELL'UTENTE
function loadFavorites() {
  fetch("api/user/preferiti.php") //per ottenere preriti (chiamata funzione in api/user/preferiti.php)
    .then((response) => response.json())
    .then((data) => {
      //se successo -> visualizza preferiti
      if (data.success) {
        displayFavorites(data.preferiti);
      }
      //se errore -> mostra messaggio di errore
      else {
        showError(data.message);
      }
    })
    //caso di errore (se server non risponde) -> mostra messaggio di errore
    .catch((error) => {
      console.error("Errore caricamento preferiti:", error);
      showError("Errore nel caricamento dei preferiti");
    });
}

//FUNZIONE PER VISUALIZZARE PREFERITI NELLA PAGINA
function displayFavorites(preferiti) {
  const container = document.getElementById("favoritesContainer");
  //se non ci sono preferiti -> mostra messaggio vuoto
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
  //se ci sono preferiti -> costruisci griglia di preferiti
  let html = '<div class="favorites-grid">';

  // Cicla sui preferiti e crea le card
  preferiti.forEach((product) => {
    let imageStyle = ""; // per gestire immagine di sfondo

    if (product.image_path && product.image_path.trim() !== "") {
      const basePath = window.image_path || "assets/img/"; //percorso base immagini
      const fullPath = basePath + product.image_path; //percorso completo immagine
      //applica stile di sfondo con immagine
      imageStyle = `background-image: linear-gradient(135deg, rgba(5, 8, 22, 0.4), transparent), url('${fullPath}'); background-size: cover; background-position: center;`;
    } else {
      // se non c'è immagine -> applica sfondo gradiente di default
      imageStyle =
        "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);";
    }

    //html della card del prodotto
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
              Aggiungi al carrello
            </button>
            <button class="btn-icon-remove" onclick="removeFavorite(${product.id})" title="Rimuovi dai preferiti">
              ❤️
            </button>
          </div>
        </div>
      </div>
    `;
  });

  html += "</div>"; //chiudi griglia
  container.innerHTML = html; //inserisci html nella pagina
}

//FUNZIONE PER RIMUOVERE PREFERITO
function removeFavorite(productId) {
  fetch("api/user/preferiti.php", {
    //chiamata api
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_poster: productId, //id del prodotto da rimuovere
      action: "remove", //azione di rimozione
    }),
  })
    //risposta in formato json
    .then((response) => response.json())
    .then((data) => {
      //se successo -> mostra messaggio di conferma e ricarica lista preferiti
      if (data.success) {
        showToast("Rimosso dai preferiti");
        loadFavorites();
      }
      //se errore -> mostra messaggio di errore
      else {
        showToast("Errore: " + data.message);
      }
    })
    //caso di errore (se server non risponde) -> mostra messaggio di errore
    .catch((error) => {
      console.error("Errore:", error);
      showToast("Errore nella rimozione");
    });
}

//FUNZIONE PER AGGIUNGERE PRODOTTO AL CARRELLO
function addToCart(id, titolo, autore, prezzo, imagePath) {
  let cart = []; //inizializza carrello vuoto
  //carica carrello salvato da localStorage
  const savedCart = localStorage.getItem("artly_cart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart); //stringa json in array
    } catch (e) {
      cart = [];
    }
  }

  //verifica se prodotto è già nel carrello (atttraverso id)
  const existingIndex = cart.findIndex((item) => item.id === id);

  //se esiste già -> incrementa quantità
  if (existingIndex >= 0) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
  }
  //se non esiste -> aggiungi nuovo prodotto al carrello
  else {
    cart.push({
      id: id,
      titolo: titolo,
      autore: autore,
      prezzo: prezzo,
      image_path: imagePath,
      quantity: 1,
    });
  }

  //salva carrello aggiornato in localStorage
  localStorage.setItem("artly_cart", JSON.stringify(cart));

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0); //calcola numero totale articoli nel carrello
  //aggiorna contatore carrello nell'interfaccia
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
  }
  //mostra messaggio di conferma
  showToast("Prodotto aggiunto al carrello!");
}

//FUNZIONE PER MOSTRARE MESSAGGIO DI ERRORE NELLA PAGINA
function showError(message) {
  const container = document.getElementById("favoritesContainer"); //seleziona contenitore preferiti
  //mostra messaggio di errore con link ai prodotti
  container.innerHTML = `
    <div class="error-message-box">
      <h2>❌ ${message}</h2>
      <a href="prodotti.html" class="btn btn-primary">Vai ai prodotti</a>
    </div>
  `;
}

//ESPORTA LA FUNZIONE PER VISIONE GLOBALE
window.initPreferitiPage = initPreferitiPage;
