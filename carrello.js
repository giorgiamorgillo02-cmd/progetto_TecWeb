// Gestione Carrello
function initCarrelloPage() {
  // Verifica se siamo sulla pagina carrello
  const cartItemsList = document.getElementById("cartItemsList");
  if (!cartItemsList) return;

  const cartEmpty = document.getElementById("cartEmpty");
  const cartItemsCount = document.getElementById("cartItemsCount");
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("total");
  const discountRow = document.getElementById("discountRow");
  const discountEl = document.getElementById("discount");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const applyPromoBtn = document.getElementById("applyPromoBtn");
  const promoInput = document.getElementById("promoInput");
  const recommendedProducts = document.getElementById("recommendedProducts");

  let cart = [];
  let shippingCost = 4.9;
  let discountAmount = 0;
  const FREE_SHIPPING_THRESHOLD = 50;

  // Carica il carrello dal localStorage
  function loadCart() {
    const savedCart = localStorage.getItem("artly_cart");
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart);

        // Filtra prodotti invalidi (senza prezzo o titolo)
        const validCart = cart.filter(
          (item) => item.prezzo && item.titolo && item.id,
        );

        // Consolida prodotti duplicati (stesso ID)
        const consolidatedCart = [];
        validCart.forEach((item) => {
          const existingIndex = consolidatedCart.findIndex(
            (p) => p.id === item.id,
          );
          if (existingIndex !== -1) {
            // Somma le quantità dei duplicati
            consolidatedCart[existingIndex].quantity =
              (consolidatedCart[existingIndex].quantity || 1) +
              (item.quantity || 1);
            console.log(
              `🔗 Consolidato duplicato: ${item.titolo} (quantità totale: ${consolidatedCart[existingIndex].quantity})`,
            );
          } else {
            // Aggiungi nuovo prodotto
            consolidatedCart.push({ ...item });
          }
        });

        // Se ci sono prodotti invalidi o duplicati, aggiorna
        if (
          validCart.length !== cart.length ||
          consolidatedCart.length !== validCart.length
        ) {
          if (validCart.length !== cart.length) {
            console.warn(
              `⚠️ Rimossi ${cart.length - validCart.length} prodotti invalidi dal carrello`,
            );
          }
          if (consolidatedCart.length !== validCart.length) {
            console.warn(
              `⚠️ Consolidati ${validCart.length - consolidatedCart.length} prodotti duplicati`,
            );
          }
          cart = consolidatedCart;
          store.setState({ cart: consolidatedCart });
        } else {
          cart = validCart;
        }
      } catch (e) {
        cart = [];
      }
    }
    renderCart();
    updateCartCount();
    setupClearCartModal();
  }

  // Salva il carrello nel localStorage
  function saveCart() {
    localStorage.setItem("artly_cart", JSON.stringify(cart));
  }

  // Renderizza il carrello
  function renderCart() {
    if (cart.length === 0) {
      cartItemsList.innerHTML = "";
      cartEmpty.style.display = "flex";
      cartItemsCount.textContent = "0";
      updateTotals();
      loadRecommendedProducts();
      return;
    }

    cartEmpty.style.display = "none";
    cartItemsList.innerHTML = "";
    const totalItems = cart.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );
    cartItemsCount.textContent = totalItems;

    cart.forEach((item, index) => {
      const cartItem = createCartItemElement(item, index);
      cartItemsList.appendChild(cartItem);
    });

    updateTotals();
    loadRecommendedProducts();
  }

  // Crea l'elemento HTML per un prodotto nel carrello
  function createCartItemElement(item, index) {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    // ----------------IMMAGINE----------------
    const imageDiv = document.createElement("div");
    imageDiv.className = "cart-item-image";

    // Stili essenziali per assicurare che l'immagine si veda
    imageDiv.style.backgroundSize = "cover";
    imageDiv.style.backgroundPosition = "center";
    imageDiv.style.backgroundRepeat = "no-repeat";

    // Se nel DB c'è il nome del file
    if (item.image_path && item.image_path.trim() !== "") {
      // 1. Recupera il percorso base (da utils.js o fallback)
      const basePath = window.image_path || "/progetto_TecWeb/img/";

      // 2. Pulisce il nome file (rimuove lo slash iniziale se presente per evitare doppi slash)
      const imgName = item.image_path.startsWith("/")
        ? item.image_path.substring(1)
        : item.image_path;

      // 3. Crea il percorso completo
      const fullPath = basePath + imgName;

      // DEBUG CORRETTO: Uso 'item.titolo' (prima era 'product.titolo' e rompeva tutto!)
      console.log(`🖼️ Caricamento img carrello: ${item.titolo} -> ${fullPath}`);

      imageDiv.style.backgroundImage = `url('${fullPath}')`;
    } else {
      // FALLBACK: Gradiente se non c'è immagine
      imageDiv.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }

    //----------------Info prodotto----------------
    const infoDiv = document.createElement("div");
    infoDiv.className = "cart-item-info";

    const title = document.createElement("h4");
    title.textContent = item.titolo;

    const author = document.createElement("p");
    author.className = "cart-item-author";
    author.textContent = item.autore ? `by ${item.autore}` : "";

    const category = document.createElement("span");
    category.className = "tag";
    category.textContent = item.categoria_nome || "Generale";

    infoDiv.appendChild(title);
    infoDiv.appendChild(author);
    infoDiv.appendChild(category);

    // ----------------Controlli quantità----------------
    const quantityDiv = document.createElement("div");
    quantityDiv.className = "cart-item-quantity";

    const minusBtn = document.createElement("button");
    minusBtn.className = "quantity-btn";
    minusBtn.textContent = "-";
    minusBtn.onclick = () => updateQuantity(index, -1);

    const quantitySpan = document.createElement("span");
    quantitySpan.className = "quantity-value";
    quantitySpan.textContent = item.quantity || 1;

    const plusBtn = document.createElement("button");
    plusBtn.className = "quantity-btn";
    plusBtn.textContent = "+";
    plusBtn.onclick = () => updateQuantity(index, 1);

    quantityDiv.appendChild(minusBtn);
    quantityDiv.appendChild(quantitySpan);
    quantityDiv.appendChild(plusBtn);

    // Prezzo
    const priceDiv = document.createElement("div");
    priceDiv.className = "cart-item-price";
    const itemTotal = (parseFloat(item.prezzo) * (item.quantity || 1)).toFixed(
      2,
    );
    priceDiv.textContent = `€${itemTotal}`;

    // Bottone rimuovi
    const removeBtn = document.createElement("button");
    removeBtn.className = "cart-item-remove";
    removeBtn.innerHTML = "🗑️";
    removeBtn.setAttribute("aria-label", "Rimuovi dal carrello");
    removeBtn.onclick = () => removeFromCart(index);

    // Assembla l'item
    itemDiv.appendChild(imageDiv);
    itemDiv.appendChild(infoDiv);
    itemDiv.appendChild(quantityDiv);
    itemDiv.appendChild(priceDiv);
    itemDiv.appendChild(removeBtn);

    return itemDiv;
  }

  // Aggiorna la quantità di un prodotto
  function updateQuantity(index, change) {
    if (!cart[index]) return;

    const newQuantity = (cart[index].quantity || 1) + change;

    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    cart[index].quantity = newQuantity;
    saveCart();
    renderCart();
    updateCartCount();
  }

  // Rimuovi prodotto dal carrello
  function removeFromCart(index) {
    const item = cart[index];
    cart.splice(index, 1);
    saveCart();
    renderCart();
    updateCartCount();

    if (typeof showToast === "function") {
      showToast(`"${item.titolo}" rimosso dal carrello`);
    }
  }

  // Svuota il carrello
  // Svuota il carrello
  function clearCart() {
    // se carrello vuoto: non fa niente
    if (cart.length === 0) return;
    //se carrello almeno 1 articolo-> modale di confera
    const modal = document.getElementById("clearCartConfirmModal");
    modal.style.display = "flex";
  }

  // Configura i listener per la modale di svuotamento
  function setupClearCartModal() {
    const modal = document.getElementById("clearCartConfirmModal");
    const confirmBtn = document.getElementById("confirmClearCartBtn");
    const cancelBtn = document.getElementById("cancelClearCartBtn");

    // clona bottone (rimuove vecchi listener per evitare doppi click se ricarichi la pagina)
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    //se conferma
    newConfirmBtn.addEventListener("click", () => {
      //svuota l'array
      cart = [];
      //salva e aggiorna l'interfaccia
      saveCart();
      renderCart();
      updateCartCount();
      //feedback utente
      if (typeof showToast === "function") {
        showToast("Carrello svuotato con successo");
      }
      //chiude modale
      closeClearCartModal();
    });

    //se annulla
    cancelBtn.addEventListener("click", closeClearCartModal);

    //se clicca fuori
    window.addEventListener("click", (e) => {
      if (e.target === modal) closeClearCartModal();
    });
  }

  // Funzione per chiudere la modale
  function closeClearCartModal() {
    const modal = document.getElementById("clearCartConfirmModal");
    if (modal) modal.style.display = "none";
  }

  // Aggiorna i totali
  function updateTotals() {
    let subtotal = 0;

    console.log("🧮 Calcolo totali carrello:");
    cart.forEach((item, idx) => {
      // Salta item invalidi (senza prezzo o titolo)
      if (!item.prezzo || !item.titolo) {
        console.warn("⚠️ Prodotto invalido nel carrello:", item);
        return;
      }
      const itemPrice = parseFloat(item.prezzo);
      const itemQty = item.quantity || 1;
      const itemTotal = itemPrice * itemQty;
      console.log(
        `  [${idx}] ${item.titolo}: €${itemPrice} x ${itemQty} = €${itemTotal.toFixed(2)}`,
      );
      subtotal += itemTotal;
    });

    console.log(`📊 Subtotale: €${subtotal.toFixed(2)}`);

    // Spedizione gratuita sopra una certa soglia
    let shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingCost;

    if (shipping === 0 && subtotal > 0) {
      shippingEl.innerHTML = '<span style="color: var(--accent)">GRATIS</span>';
    } else {
      shippingEl.textContent = `€${shipping.toFixed(2)}`;
    }

    // Applica sconto
    let total = subtotal + shipping - discountAmount;
    if (total < 0) total = 0;

    console.log(`🚚 Spedizione: €${shipping.toFixed(2)}`);
    console.log(`💰 Totale finale: €${total.toFixed(2)}`);

    subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    totalEl.textContent = `€${total.toFixed(2)}`;

    if (discountAmount > 0) {
      discountRow.style.display = "flex";
      discountEl.textContent = `-€${discountAmount.toFixed(2)}`;
    } else {
      discountRow.style.display = "none";
    }
  }

  // Applica codice sconto
  function applyPromoCode() {
    const code = promoInput.value.trim().toUpperCase();

    if (!code) {
      if (typeof showMessage === "function") {
        showMessage("Inserisci un codice sconto", "error");
      }
      return;
    }

    // Codici sconto di esempio
    const promoCodes = {
      ARTLY10: 10,
      BENVENUTO: 5,
      SCONTO20: 20,
    };

    if (promoCodes[code]) {
      discountAmount = promoCodes[code];
      updateTotals();

      if (typeof showMessage === "function") {
        showMessage(`Sconto di €${discountAmount} applicato!`, "success");
      }
      promoInput.value = "";
      promoInput.disabled = true;
      applyPromoBtn.textContent = "Applicato ✓";
      applyPromoBtn.disabled = true;
    } else {
      if (typeof showMessage === "function") {
        showMessage("Codice sconto non valido", "error");
      }
    }
  }

  // Aggiorna il contatore carrello nell'header
  function updateCartCount() {
    const totalItems = cart.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );

    // Aggiorna il contatore nell'header
    const cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) {
      cartCountEl.textContent = totalItems;
    }

    // Aggiorna anche lo store globale per mantenere la sincronizzazione
    store.setState({ cart: [...cart] });
  }

  // Procedi al checkout
  function proceedToCheckout() {
    if (cart.length === 0) {
      if (typeof showMessage === "function") {
        showMessage("Il carrello è vuoto", "error");
      }
      return;
    }

    // Qui puoi implementare la logica per procedere al checkout
    if (typeof showMessage === "function") {
      showMessage("Funzione checkout in arrivo! 🚀", "success");
    }

    // Esempio: reindirizza a una pagina di checkout
    // window.location.href = 'checkout.html';
  }

  // Carica prodotti consigliati (ultimi 4 prodotti diversi da quelli nel carrello)
  function loadRecommendedProducts() {
    fetch("/progetto_TecWeb/api/prodotti.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.data) {
          const cartIds = cart.map((item) => item.id);
          const recommended = data.data
            .filter((p) => !cartIds.includes(p.id))
            .slice(0, 4);

          displayRecommendedProducts(recommended);
        }
      })
      .catch((error) => {
        console.error(
          "Errore nel caricamento dei prodotti consigliati:",
          error,
        );
      });
  }

  // Mostra prodotti consigliati
  function displayRecommendedProducts(products) {
    if (!recommendedProducts) return;
    recommendedProducts.innerHTML = "";

    products.forEach((product) => {
      const card = createRecommendedProductCard(product);
      recommendedProducts.appendChild(card);
    });
  }

  // Crea card prodotto consigliato
  function createRecommendedProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.cursor = "pointer";

    // Click sulla card per andare al dettaglio
    card.addEventListener("click", (e) => {
      // Se clicco sul bottone "Aggiungi", non navigo
      if (e.target.tagName === "BUTTON") return;

      // Previeni comportamento di default
      e.preventDefault();
      e.stopPropagation();

      // Usa il router globale
      if (typeof router !== "undefined" && router.navigate) {
        router.navigate(`/dettaglio-prodotto?id=${product.id}`);
      } else {
        // Fallback: usa history API
        const path = `/dettaglio-prodotto?id=${product.id}`;
        history.pushState(null, "", path);
        // Triggera evento popstate per far reagire il router
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    });

    const imageDiv = document.createElement("div");
    imageDiv.className = "product-image";
    // Forza le dimensioni nel caso il CSS non carichi subito
    imageDiv.style.height = "280px";
    imageDiv.style.backgroundSize = "cover";
    imageDiv.style.backgroundPosition = "center";

    if (product.image_path && product.image_path.trim() !== "") {
      // Logica percorso unificata
      const basePath = window.image_path || "/progetto_TecWeb/img/";
      const imgName = product.image_path.startsWith("/")
        ? product.image_path.substring(1)
        : product.image_path;
      const fullPath = basePath + imgName;

      imageDiv.style.backgroundImage = `linear-gradient(135deg, rgba(5, 8, 22, 0.4), transparent), url('${fullPath}')`;
    } else {
      imageDiv.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "product-body";

    const title = document.createElement("h3");
    title.textContent = product.titolo;

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = `€${parseFloat(product.prezzo).toFixed(2)}`;

    const addButton = document.createElement("button");
    addButton.className = "btn btn-sm";
    addButton.textContent = "Aggiungi";
    addButton.onclick = (e) => {
      e.stopPropagation(); // Previene la navigazione quando clicco sul bottone
      addRecommendedToCart(product);
    };

    bodyDiv.appendChild(title);
    bodyDiv.appendChild(price);
    bodyDiv.appendChild(addButton);

    card.appendChild(imageDiv);
    card.appendChild(bodyDiv);

    return card;
  }

  // Aggiungi prodotto consigliato al carrello
  function addRecommendedToCart(product) {
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    renderCart();
    updateCartCount();

    if (typeof showToast === "function") {
      showToast(`"${product.titolo}" aggiunto al carrello ✅`);
    }
  }

  // Event listeners
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", clearCart);
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", proceedToCheckout);
  }

  if (applyPromoBtn) {
    applyPromoBtn.addEventListener("click", applyPromoCode);
  }

  if (promoInput) {
    promoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        applyPromoCode();
      }
    });
  }

  // Inizializza
  loadCart();
}

window.initCarrelloPage = initCarrelloPage;
