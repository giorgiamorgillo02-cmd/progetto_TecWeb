// GESTIONE PAGINA PRODOTTI

console.log("📦 prodotti.js: Inizio file");

//INIZIALIZZA PAGINA PRODOTTI
function initProdottiPage() {
  console.log("🛍️ Inizializzazione pagina prodotti...");

  //verifica esistenza elemento griglia prodotti (se non c'è-> esce)
  const productsGrid = document.getElementById("productsGrid");
  if (!productsGrid) {
    console.error("❌ Elemento productsGrid non trovato!");
    return;
  }

  console.log("✅ productsGrid trovato, caricamento in corso...");

  //elementi DOM salvati in variabili per gestire pagina
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const emptyMessage = document.getElementById("emptyMessage");
  const productsCount = document.getElementById("productsCount");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");
  const productSearch = document.getElementById("productSearch");
  // elementi modale carrello
  const cartModal = document.getElementById("cartModal");
  const cartModalProductsList = document.getElementById(
    "cartModalProductsList",
  );
  const cartModalItems = document.getElementById("cartModalItems");
  const cartModalSubtotal = document.getElementById("cartModalSubtotal");
  const cartModalShipping = document.getElementById("cartModalShipping");
  const cartModalTotal = document.getElementById("cartModalTotal");

  let allProducts = [];
  let filteredProducts = [];

  //path immagini (definito globalmente)
  const image_path = window.image_path || "assets/img/";

  // CARICA CATEGORIE DAL DATABASE
  function loadCategories() {
    fetch("api/catalogo/categorie.php") //chiamata API per ottenere categorie
      .then((response) => response.json())
      .then((data) => {
        //se dati validi -> popola filtro categorie (funzione sotto)
        if (data.success && data.data && data.data.length > 0) {
          populateCategoryFilter(data.data);
        }
      })
      //se errore -> messaggio errore
      .catch((error) => {
        console.error("Errore nel caricamento delle categorie:", error);
      });
  }

  //POPOLA FILTRO CATEGORIE
  function populateCategoryFilter(categories) {
    categoryFilter.innerHTML = '<option value="">Tutte</option>'; //opzione default "Tutte"
    //aggiunge opzioni per ogni categoria
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.nome;
      categoryFilter.appendChild(option); //aggiunge opzione al select
    });
  }

  //CARICA PRODOTTI DAL DATABASE
  function loadProducts() {
    fetch("api/prodotti.php")
      .then((response) => response.json())
      .then((data) => {
        loadingMessage.style.display = "none"; //nasconde messaggio caricamento

        //se dati validi -> salva prodotti + li mostra + aggiorna contatore
        if (data.success && data.data && data.data.length > 0) {
          allProducts = data.data;
          filteredProducts = [...allProducts];
          displayProducts(filteredProducts);
          updateProductsCount(filteredProducts.length);
        }
        //se nessun prodotto -> mostra messaggio vuoto + aggiorna contatore a 0
        else {
          productsGrid.innerHTML = "";
          emptyMessage.style.display = "block";
          updateProductsCount(0);
        }
      })
      //se errore -> mostra messaggio errore
      .catch((error) => {
        console.error("Errore:", error);
        loadingMessage.style.display = "none";
        errorMessage.style.display = "block";
        productsGrid.innerHTML = "";
      });
  }

  //MOSTRA PRODOTTI NELLA GRIGLIA
  function displayProducts(products) {
    productsGrid.innerHTML = "";
    emptyMessage.style.display = "none";
    errorMessage.style.display = "none";

    //se nessun prodotto -> mostra messaggio vuoto
    if (products.length === 0) {
      emptyMessage.style.display = "block";
      return;
    }

    //se prodotti presenti -> crea e aggiunge card per ogni prodotto
    products.forEach((product) => {
      const card = createProductCard(product);
      productsGrid.appendChild(card);
    });
  }

  //CREA CARD SINGOLO PRODOTTO
  function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.cursor = "pointer";

    // Rende l'intera card cliccabile
    card.addEventListener("click", (e) => {
      if (e.target.closest(".add-to-cart")) return;

      //usa router per navigare alla pagina dettaglio prodotto
      if (window.router) {
        window.router.navigate(`/dettaglio-prodotto?id=${product.id}`); //
      } else {
        //se router non trovato -> errore
        console.error("Router non trovato!");
      }
    });

    // ------------IMMAGINE  ------------
    const imageDiv = document.createElement("div");
    imageDiv.className = "product-image";

    // variabile per gestione stile dell'immagine
    let finalImageStyle;

    // Se nel DB c'è il nome del file
    if (product.image_path && product.image_path.trim() !== "") {
      //variabile del percorso completo
      const fullPath = image_path + product.image_path;
      //assegna l'immagine
      finalImageStyle = `linear-gradient(135deg, rgba(5, 8, 22, 0.4), transparent), url('${fullPath}')`;
    } else {
      // FALLBACK: Se non c'è immagine nel DB, usa i colori random
      finalImageStyle = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
    //aplica l'immagine
    imageDiv.style.backgroundImage = finalImageStyle;

    // ----------BODY PRODOTTO ------------
    const bodyDiv = document.createElement("div");
    bodyDiv.className = "product-body";

    // Titolo
    const title = document.createElement("h3");
    title.textContent = product.titolo;

    // Descrizione
    const desc = document.createElement("p");
    desc.className = "product-desc";
    desc.textContent = product.descrizione;

    // Meta (categoria e prezzo)
    const metaDiv = document.createElement("div");
    metaDiv.className = "product-meta";

    // Tag categoria
    const categoryTag = document.createElement("span");
    categoryTag.className = "tag";
    categoryTag.textContent = product.categoria_nome || "Generale";

    // Autore
    const author = document.createElement("p");
    author.className = "product-author";
    author.textContent = `by ${product.autore}`;

    metaDiv.appendChild(categoryTag);

    // Prezzo
    const priceDiv = document.createElement("div");
    priceDiv.className = "product-price-container";

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = `€${parseFloat(product.prezzo).toFixed(2)}`;

    priceDiv.appendChild(price);

    // Bottone
    const addButton = document.createElement("button");
    addButton.className = "btn btn-sm add-to-cart";
    addButton.textContent = "Aggiungi";
    addButton.setAttribute("data-id", product.id);

    // Aggiungi tutto al body
    bodyDiv.appendChild(title);
    bodyDiv.appendChild(desc);
    bodyDiv.appendChild(author);
    bodyDiv.appendChild(metaDiv);
    bodyDiv.appendChild(priceDiv);
    bodyDiv.appendChild(addButton);

    // Assembla la card
    card.appendChild(imageDiv);
    card.appendChild(bodyDiv);

    return card;
  }

  //AGGIORNA CONTATORE PRODOTTI
  function updateProductsCount(count) {
    //se contatore esiste -> aggiorna testo
    if (productsCount) {
      productsCount.textContent = `${count} prodott${count !== 1 ? "i" : "o"} disponibil${count !== 1 ? "i" : "e"}`; //gestione del plurale
    }
  }

  //FILTRA E ORDINA PRODOTTI
  function filterAndSortProducts() {
    let result = [...allProducts]; //copia array prodotti completo

    // Filtro per categoria
    const selectedCategory = categoryFilter.value;
    //se categoria selezionata -> filtra prodotti
    if (selectedCategory) {
      result = result.filter(
        (p) => p.id_categoria === parseInt(selectedCategory),
      );
    }

    // Filtro per ricerca testuale
    const searchTerm = productSearch.value.toLowerCase().trim();
    //se termine di ricerca -> filtra prodotti (titolo, descrizione, autore)
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.titolo.toLowerCase().includes(searchTerm) ||
          (p.descrizione && p.descrizione.toLowerCase().includes(searchTerm)) ||
          (p.autore && p.autore.toLowerCase().includes(searchTerm)),
      );
    }

    // Ordinamento
    const sortValue = sortFilter.value;
    //applica ordinamento selezionato
    if (sortValue === "prezzo-asc") {
      result.sort((a, b) => parseFloat(a.prezzo) - parseFloat(b.prezzo)); //prezzo crescente
    } else if (sortValue === "prezzo-desc") {
      result.sort((a, b) => parseFloat(b.prezzo) - parseFloat(a.prezzo)); //prezzo decrescente
    } else if (sortValue === "nome") {
      result.sort((a, b) => a.titolo.localeCompare(b.titolo)); //ordine alfabetico
    }

    filteredProducts = result; //aggiorna array prodotti filtrati

    //mostra prodotti filtrati + aggiorna contatore
    displayProducts(filteredProducts);
    updateProductsCount(filteredProducts.length);
  }

  //EVENT LISTENERS PER FILTRI E RICERCA
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterAndSortProducts);
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", filterAndSortProducts);
  }

  if (productSearch) {
    productSearch.addEventListener("input", filterAndSortProducts);
  }

  // EVENT LISTENER PER BOTTONE AGGIUNGI AL CARRELLO
  productsGrid.addEventListener("click", function (e) {
    const button = e.target.closest(".add-to-cart");
    if (!button) return;
    const productId = button.getAttribute("data-id");
    addToCart(productId);
  });

  //AGGIUNGE PRODOTTO AL CARRELLO
  function addToCart(productId) {
    const product = allProducts.find((p) => p.id == productId);
    //se prodotto non trovato -> esce
    if (!product) return;

    //se prodotto trovato -> aggiungi al carrello usando lo store
    const newCount = store.addToCart(product); //nuovo numero pezzi nel carrello
    updateCartCountDisplay(store.getCart()); // Aggiorna il contatore del carrello nell'header
    showCartModal(product, store.getCart()); // Mostra modale riepilogo

    //mostra messaggio di conferma (toast notification)
    showToast(`"${product.titolo}" aggiunto al carrello ✅`);
  }

  //FORMATTA PREZZO (euro con 2 decimali e virgola)
  function formatPrice(value) {
    return `€${value.toFixed(2).replace(".", ",")}`;
  }

  //CREA HTML SINGOLO PRODOTTO NEL MODALE CARRELLO
  function createCartProductHTML(product) {
    const qty = product.quantity || 1;
    let imageHTML = "";

    //immagine prodotto
    let imgPath = "";
    //se esiste immagine nel db -> usa immagine
    if (product.image_path && product.image_path.trim() !== "") {
      const imagePath = product.image_path;
      imgPath = image_path + imagePath;
      imageHTML = `<div class="cart-modal-image" style="background-image: url('${imgPath}'); background-size: cover; background-position: center;"></div>`;
    }
    //se non esiste immagine -> usa sfondo colorato
    else {
      imageHTML = `<div class="cart-modal-image" style="background: #667eea;"></div>`;
    }

    return `
      <div class="cart-modal-product">
        ${imageHTML}
        <div class="cart-modal-info">
          <p class="cart-modal-title">${product.titolo}</p>
          <p class="cart-modal-author">by ${product.autore || "Artly"}</p>
          <div class="cart-modal-meta">
            <span>${formatPrice(parseFloat(product.prezzo))}</span>
            <span>Qtà: ${qty}</span>
          </div>
        </div>
      </div>
    `;
  }

  //CALCOLA TOTALI CARRELLO (items, subtotal, spedizione, totale)
  function calculateCartTotals(cart) {
    //numero pezzi totale (considera quantità)
    const itemsCount = cart.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );
    //subtotale (prezzo * quantità)
    const subtotal = cart.reduce(
      (sum, item) => sum + parseFloat(item.prezzo) * (item.quantity || 1),
      0,
    );
    //calcolo spedizione (gratis sopra 50)
    const shipping = subtotal >= 50 ? 0 : cart.length > 0 ? 4.9 : 0;
    //totale (subtotal + spedizione)
    const total = subtotal + shipping;

    return { itemsCount, subtotal, shipping, total };
  }

  //MOSTRA MODALE RIEPILOGO CARRELLO
  function showCartModal(product, cart) {
    //se modale o lista prodotti non trovati -> esce
    if (!cartModal || !cartModalProductsList) return;

    console.log("Prodotti nel carrello:", cart.length); //debug
    console.log("Carrello completo:", cart); //debug

    const totals = calculateCartTotals(cart); //calcola totali carrello

    // Genera HTML per tutti i prodotti nel carrello
    let productsHTML = "";
    cart.forEach((item) => {
      productsHTML += createCartProductHTML(item);
    });

    // Inserisci i prodotti nella lista
    cartModalProductsList.innerHTML = productsHTML;

    // Aggiorna i totali
    if (cartModalItems) cartModalItems.textContent = totals.itemsCount;
    if (cartModalSubtotal)
      cartModalSubtotal.textContent = formatPrice(totals.subtotal);
    if (cartModalShipping) {
      cartModalShipping.textContent =
        totals.shipping === 0 ? "Gratis" : formatPrice(totals.shipping);
    }
    if (cartModalTotal) cartModalTotal.textContent = formatPrice(totals.total);

    cartModal.classList.add("is-open"); //apre il modale
    cartModal.style.display = "block"; // mostra il modale
    cartModal.setAttribute("aria-hidden", "false"); //imposta attributo aria
    document.body.classList.add("modal-open"); //disabilita scroll body
  }

  //CHIUDI MODALE CARRELLO
  function closeCartModal() {
    //se modale non trovato -> esce
    if (!cartModal) return;
    //se modale aperto -> chiudi
    cartModal.classList.remove("is-open");
    cartModal.style.display = "none";
    cartModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  //EVENT LISTENER PER CHIUSURA MODALE CARRELLO
  if (cartModal) {
    cartModal.addEventListener("click", (event) => {
      const target = event.target; //elemento cliccato

      // Chiude modale se si clicca sul pulsante close o sull'overlay
      if (target && target.dataset && target.dataset.close === "true") {
        closeCartModal();
      }

      // Chiudi modale se si clicca su un link (es. "Vai al carrello")
      if (target && target.hasAttribute && target.hasAttribute("data-link")) {
        closeCartModal();
      }
    });
    // Chiudi modale se si preme il tasto Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && cartModal.classList.contains("is-open")) {
        closeCartModal();
      }
    });
  }

  //AGGIORNA CONTATORE CARRELLO NELL'HEADER
  function updateCartCountDisplay(cart) {
    const cartCountEl = document.getElementById("cartCount");

    // calcolo totale pezzi usando lo store
    const totalItems = store.getCartCount();

    // aggiorna il numero a schermo
    if (cartCountEl) {
      cartCountEl.textContent = totalItems;
    }
  }

  // INIZIALIZZA CONTATORE CARRELLO ALL'AVVIO
  function initCartCount() {
    try {
      const savedCart = localStorage.getItem("artly_cart"); // carica carrello da localStorage
      // se esiste -> usa carrello salvato
      if (savedCart) {
        const cart = JSON.parse(savedCart); // stringa json -> array
        updateCartCountDisplay(cart);
      }
      //se non esiste -> usa carrello nello store
      else {
        updateCartCountDisplay(store.getCart());
      }
    } catch (e) {
      //se errore -> usa carrello nello store
      updateCartCountDisplay(store.getCart());
    }
  }

  // Carica categorie e prodotti all'avvio
  loadCategories();
  loadProducts();
  initCartCount();
}

console.log("📦 prodotti.js: Fine definizione funzione initProdottiPage"); //debug
