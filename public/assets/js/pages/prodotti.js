// Gestione pagina prodotti
console.log("📦 prodotti.js: Inizio file");

function initProdottiPage() {
  console.log("🛍️ Inizializzazione pagina prodotti...");

  // Verifica se siamo sulla pagina prodotti
  const productsGrid = document.getElementById("productsGrid");
  if (!productsGrid) {
    console.error("❌ Elemento productsGrid non trovato!");
    return;
  }

  console.log("✅ productsGrid trovato, caricamento in corso...");

  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const emptyMessage = document.getElementById("emptyMessage");
  const productsCount = document.getElementById("productsCount");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");
  const productSearch = document.getElementById("productSearch");
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

  //questa riga serve per il path delle immagini
  const image_path = window.image_path || "assets/img/";

  // Carica le categorie dal database
  function loadCategories() {
    fetch("api/catalogo/categorie.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          populateCategoryFilter(data.data);
        }
      })
      .catch((error) => {
        console.error("Errore nel caricamento delle categorie:", error);
      });
  }

  // Popola il filtro delle categorie
  function populateCategoryFilter(categories) {
    categoryFilter.innerHTML = '<option value="">Tutte</option>';
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.nome;
      categoryFilter.appendChild(option);
    });
  }

  // Carica i prodotti dal database
  function loadProducts() {
    fetch("api/prodotti.php")
      .then((response) => response.json())
      .then((data) => {
        loadingMessage.style.display = "none";

        if (data.success && data.data && data.data.length > 0) {
          allProducts = data.data;
          filteredProducts = [...allProducts];
          displayProducts(filteredProducts);
          updateProductsCount(filteredProducts.length);
        } else {
          productsGrid.innerHTML = "";
          emptyMessage.style.display = "block";
          updateProductsCount(0);
        }
      })
      .catch((error) => {
        console.error("Errore:", error);
        loadingMessage.style.display = "none";
        errorMessage.style.display = "block";
        productsGrid.innerHTML = "";
      });
  }

  // Mostra i prodotti nella griglia
  function displayProducts(products) {
    productsGrid.innerHTML = "";
    emptyMessage.style.display = "none";
    errorMessage.style.display = "none";

    if (products.length === 0) {
      emptyMessage.style.display = "block";
      return;
    }

    products.forEach((product) => {
      const card = createProductCard(product);
      productsGrid.appendChild(card);
    });
  }

  // Crea una card prodotto
  function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.cursor = "pointer";

    // Rendi l'intera card cliccabile
    card.addEventListener("click", (e) => {
      if (e.target.closest(".add-to-cart")) return;

      // usa il  router
      if (window.router) {
        window.router.navigate(`/dettaglio-prodotto?id=${product.id}`);
      } else {
        // Fallback se il router non fosse globale
        console.error("Router non trovato!");
      }
    });

    // Immagine del prodotto
    const imageDiv = document.createElement("div");
    imageDiv.className = "product-image";

    // variabile per gestione dell'immagine
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

    // Body della card
    const bodyDiv = document.createElement("div");
    bodyDiv.className = "product-body";

    // Titolo
    const title = document.createElement("h3");
    title.textContent = product.titolo;

    // Descrizione
    const desc = document.createElement("p");
    desc.className = "product-desc";
    desc.textContent = product.descrizione || "Stampa digitale di alta qualità";

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

  // Aggiorna il contatore dei prodotti
  function updateProductsCount(count) {
    if (productsCount) {
      productsCount.textContent = `${count} prodott${count !== 1 ? "i" : "o"} disponibil${count !== 1 ? "i" : "e"}`;
    }
  }

  // Filtra e ordina i prodotti
  function filterAndSortProducts() {
    let result = [...allProducts];

    // Filtro per categoria
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
      result = result.filter(
        (p) => p.id_categoria === parseInt(selectedCategory),
      );
    }

    // Filtro per ricerca testuale
    const searchTerm = productSearch.value.toLowerCase().trim();
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
    if (sortValue === "prezzo-asc") {
      result.sort((a, b) => parseFloat(a.prezzo) - parseFloat(b.prezzo));
    } else if (sortValue === "prezzo-desc") {
      result.sort((a, b) => parseFloat(b.prezzo) - parseFloat(a.prezzo));
    } else if (sortValue === "nome") {
      result.sort((a, b) => a.titolo.localeCompare(b.titolo));
    }

    filteredProducts = result;
    displayProducts(filteredProducts);
    updateProductsCount(filteredProducts.length);
  }

  // Event listeners per i filtri
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterAndSortProducts);
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", filterAndSortProducts);
  }

  if (productSearch) {
    productSearch.addEventListener("input", filterAndSortProducts);
  }

  // Event delegation per i bottoni "Aggiungi al carrello"
  productsGrid.addEventListener("click", function (e) {
    const button = e.target.closest(".add-to-cart");
    if (!button) return;
    const productId = button.getAttribute("data-id");
    addToCart(productId);
  });

  // Funzione per aggiungere al carrello
  function addToCart(productId) {
    const product = allProducts.find((p) => p.id == productId);
    if (!product) return;

    // Usa lo store globale per gestire il carrello
    const newCount = store.addToCart(product);

    // Aggiorna il contatore del carrello nell'header
    updateCartCountDisplay(store.getCart());

    // Mostra modale riepilogo
    showCartModal(product, store.getCart());

    // Mostra notifica
    if (typeof showToast === "function") {
      showToast(`"${product.titolo}" aggiunto al carrello ✅`);
    } else if (typeof showMessage === "function") {
      showMessage(`"${product.titolo}" aggiunto al carrello`, "success");
    }
  }

  function formatPrice(value) {
    return `€${value.toFixed(2).replace(".", ",")}`;
  }

  function createCartProductHTML(product) {
    const qty = product.quantity || 1;
    let imageHTML = "";

    // Usa la costante globale definita sopra
    const basePath = window.image_path || "assets/img/";

    // Pulizia path
    let imgPath = "";
    if (product.image_path && product.image_path.trim() !== "") {
      const cleanPath = product.image_path.startsWith("/")
        ? product.image_path.substring(1)
        : product.image_path;
      imgPath = basePath + cleanPath;

      imageHTML = `<div class="cart-modal-image" style="background-image: url('${imgPath}'); background-size: cover; background-position: center;"></div>`;
    } else {
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

  function calculateCartTotals(cart) {
    const itemsCount = cart.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );
    const subtotal = cart.reduce(
      (sum, item) => sum + parseFloat(item.prezzo) * (item.quantity || 1),
      0,
    );
    const shipping = subtotal >= 50 ? 0 : cart.length > 0 ? 4.9 : 0;
    const total = subtotal + shipping;

    return { itemsCount, subtotal, shipping, total };
  }

  function showCartModal(product, cart) {
    if (!cartModal || !cartModalProductsList) return;

    console.log("Prodotti nel carrello:", cart.length);
    console.log("Carrello completo:", cart);

    const totals = calculateCartTotals(cart);

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

    cartModal.classList.add("is-open");
    cartModal.style.display = "block";
    cartModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeCartModal() {
    if (!cartModal) return;
    cartModal.classList.remove("is-open");
    cartModal.style.display = "none";
    cartModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  if (cartModal) {
    cartModal.addEventListener("click", (event) => {
      const target = event.target;

      // Chiudi il modal se si clicca sul pulsante close o sull'overlay
      if (target && target.dataset && target.dataset.close === "true") {
        closeCartModal();
      }

      // Chiudi il modal se si clicca su un link (es. "Vai al carrello")
      if (target && target.hasAttribute && target.hasAttribute("data-link")) {
        closeCartModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && cartModal.classList.contains("is-open")) {
        closeCartModal();
      }
    });
  }

  // Aggiorna il contatore del carrello nell'header
  function updateCartCountDisplay(cart) {
    const cartCountEl = document.getElementById("cartCount");

    // calcolo totale pezzi usando lo store
    const totalItems = store.getCartCount();

    // aggiorna il numero a schermo
    if (cartCountEl) {
      cartCountEl.textContent = totalItems;
    }
  }

  // Inizializza il contatore del carrello all'avvio
  function initCartCount() {
    const savedCart = localStorage.getItem("artly_cart");
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        updateCartCountDisplay(cart);
      } catch (e) {
        // Inizializza il contatore del carrello all'avvio
        function initCartCount() {
          // Lo store ha già caricato il carrello dal localStorage
          // Basta aggiornare la visualizzazione
          updateCartCountDisplay(store.getCart());
        }
        sole.log("📦 prodotti.js: Fine definizione funzione initProdottiPage");

        // Esponi la funzione globalmente per la SPA
        window.initProdottiPage = initProdottiPage;
        console.log(
          "✅ prodotti.js: window.initProdottiPage esposta =",
          typeof window.initProdottiPage,
        );
      }
    }
  }

  // Carica categorie e prodotti all'avvio
  loadCategories();
  loadProducts();
  initCartCount();
}
console.log("📦 prodotti.js: Fine definizione funzione initProdottiPage");
