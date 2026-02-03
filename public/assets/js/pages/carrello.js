// GESTIONE PAGINA CARRELLO
function initCarrelloPage() {
  // Verifica se siamo sulla pagina carrello
  const cartItemsList = document.getElementById("cartItemsList");
  if (!cartItemsList) return; // Esci se non siamo nella pagina carrello

  // Elementi DOM salvate in variabili per gestire il carrello
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
  const FREE_SHIPPING_THRESHOLD = 50; // Soglia per spedizione gratuita

  // CARICA CARRELLO DA LOCALSTORAGE
  function loadCart() {
    const savedCart = localStorage.getItem("artly_cart"); // Recupera il carrello salvato
    if (savedCart) {
      // Se esiste un carrello salvato
      try {
        cart = JSON.parse(savedCart); //trasforma la stringa in oggetto

        // Filtra prodotti invalidi (senza prezzo o titolo)
        const validCart = cart.filter((item) => item.prezzo && item.titolo);

        // Consolida prodotti duplicati (stesso ID)
        const consolidatedCart = [];
        validCart.forEach((item) => {
          //per ogni prodotto valido
          const existingIndex = consolidatedCart.findIndex(
            //cerca se esiste gia un prodotto confrontando id
            (p) => p.id === item.id,
          );
          // Somma le quantità dei duplicati
          if (existingIndex !== -1) {
            //
            consolidatedCart[existingIndex].quantity =
              (consolidatedCart[existingIndex].quantity || 1) + //aumenta la quantità se esiste gia
              (item.quantity || 1);
            console.log(
              `🔗 Consolidato duplicato: ${item.titolo} (quantità totale: ${consolidatedCart[existingIndex].quantity})`,
            );
          } else {
            // Aggiungi nuovo prodotto se non esiste
            consolidatedCart.push({ ...item }); //clona il prodotto e lo mette nell'array (per mantenere l'integrità dell'originale)
          }
        });

        // Se ci sono prodotti invalidi o duplicati -> aggiorna il carrello. altirmenti nessuna modifica e usa il carrello valido
        if (
          validCart.length !== cart.length || // controlla prodotti invalidi
          consolidatedCart.length !== validCart.length // controlla duplicati
        ) {
          if (validCart.length !== cart.length) {
            console.warn(
              `⚠️ Rimossi ${cart.length - validCart.length} prodotti non validi dal carrello`,
            );
          }
          if (consolidatedCart.length !== validCart.length) {
            console.warn(
              `⚠️ Consolidati ${validCart.length - consolidatedCart.length} prodotti duplicati`,
            );
          }
          cart = consolidatedCart; //aggiorna il carrello
          store.setState({ cart: consolidatedCart }); //aggiorna lo store globale
        } else {
          cart = validCart;
        }
      } catch (e) {
        // In caso di errore, resetta il carrello
        cart = [];
      }
    }
    //funzioni per aggiornare l'interfaccia
    renderCart(); // renderizza il carrello
    updateCartCount(); // aggiorna il contatore nell'header
    setupClearCartModal(); // configura la modale per svuotare il carrello
  }

  // SALVA CARRELLO IN LOCALSTORAGE
  function saveCart() {
    localStorage.setItem("artly_cart", JSON.stringify(cart));
  }

  // VISUALIZZA IL CARRELLO (basato sul contenuto dell'array cart)
  function renderCart() {
    // Se il carrello è vuoto (se corrisponde a 0)
    if (cart.length === 0) {
      cartItemsList.innerHTML = "";
      cartEmpty.style.display = "flex";
      cartItemsCount.textContent = "0";

      //aggiorna i totali e prodotti consigliati
      updateTotals();
      loadRecommendedProducts();
      return;
    }

    cartEmpty.style.display = "none"; //nasconde il messaggio carrello vuoto
    cartItemsList.innerHTML = ""; //pulisce la lista degli articoli nel carrello

    //se ci sono articoli, somma le quantità
    const totalItems = cart.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );
    cartItemsCount.textContent = totalItems; //aggiorna il contatore degli articoli

    cart.forEach((item, index) => {
      const cartItem = createCartItemElement(item, index); //crea l'elemento HTML per ogni prodotto
      cartItemsList.appendChild(cartItem); //aggiunge l'elemento alla lista nel DOM
    });

    //aggiorna i totali e prodotti consigliati
    updateTotals();
    loadRecommendedProducts();
  }

  // CREA ELEMENTO HTML PER OGNI PRODOTTO NEL CARRELLO
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
      //Recupera il percorso base
      const basePath = window.image_path || "assets/img/";
      //Crea il percorso completo
      const fullPath = basePath + item.image_path;
      //Imposta l'immagine di sfondo
      imageDiv.style.backgroundImage = `url('${fullPath}')`;
    } else {
      // Gradiente se non c'è immagine
      imageDiv.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }

    //----------------Info prodotto----------------
    //Info
    const infoDiv = document.createElement("div");
    infoDiv.className = "cart-item-info";

    // Titolo
    const title = document.createElement("h4");
    title.textContent = item.titolo;

    // Autore (se presente)
    const author = document.createElement("p");
    author.className = "cart-item-author";
    //se autore non vuoto, mostra "by autore", altrimenti stringa vuota
    author.textContent = item.autore ? `by ${item.autore}` : "";

    // Categoria (se presente)
    const category = document.createElement("span");
    category.className = "tag";
    //se categoria non vuota -> mostra il nome. Altrimenti "Generale"
    category.textContent = item.categoria_nome || "Generale";

    //inserisci elementi creati nel div info
    infoDiv.appendChild(title);
    infoDiv.appendChild(author);
    infoDiv.appendChild(category);

    // ----------------Controlli quantità----------------

    const quantityDiv = document.createElement("div");
    quantityDiv.className = "cart-item-quantity"; //contentitore per i bottoni e la quantità

    // bottone che decrementa
    const minusBtn = document.createElement("button");
    minusBtn.className = "quantity-btn";
    minusBtn.textContent = "-";
    minusBtn.onclick = () => updateQuantity(index, -1); //al click chiama la funzione per aggiornare la quantità (decrementa di 1)

    // span che mostra la quantità attuale
    const quantitySpan = document.createElement("span");
    quantitySpan.className = "quantity-value";
    quantitySpan.textContent = item.quantity || 1;

    // bottone che incrementa
    const plusBtn = document.createElement("button");
    plusBtn.className = "quantity-btn";
    plusBtn.textContent = "+";
    plusBtn.onclick = () => updateQuantity(index, 1); //al click chiama la funzione per aggiornare la quantità (incrementa di 1)

    //aggiungi i bottoni e la quantità al div
    quantityDiv.appendChild(minusBtn);
    quantityDiv.appendChild(quantitySpan);
    quantityDiv.appendChild(plusBtn);

    // Prezzo
    const priceDiv = document.createElement("div");
    priceDiv.className = "cart-item-price";
    // Calcola il prezzo totale per la quantità: converte stringa in numero -> moltiplica per la quantità -> fissa a 2 decimali
    const itemTotal = (parseFloat(item.prezzo) * (item.quantity || 1)).toFixed(
      2,
    );
    priceDiv.textContent = `€${itemTotal}`; // mostra il prezzo totale

    // Bottone rimuovi
    const removeBtn = document.createElement("button");
    removeBtn.className = "cart-item-remove";
    removeBtn.innerHTML = "🗑️";
    removeBtn.setAttribute("aria-label", "Rimuovi dal carrello"); //accessibilita (screen reader)
    removeBtn.onclick = () => removeFromCart(index); //al click chiama la funzione per rimuovere il prodotto

    // Assembla l'item
    itemDiv.appendChild(imageDiv);
    itemDiv.appendChild(infoDiv);
    itemDiv.appendChild(quantityDiv);
    itemDiv.appendChild(priceDiv);
    itemDiv.appendChild(removeBtn);

    return itemDiv;
  }

  // AGGIORNA LA QUANTITÀ DI UN PRODOTTO NEL CARRELLO
  function updateQuantity(index, change) {
    if (!cart[index]) return; //se l'indice non esiste -> esci

    const newQuantity = (cart[index].quantity || 1) + change; //calcola la nuova quantità

    // Se la nuova quantità è minore o uguale a 0 -> rimuovi il prodotto
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    // se valida (maggiore di 0) -> aggiorna la quantità -> salva e reindirizza il carrello + aggiorna il contatore
    cart[index].quantity = newQuantity;
    saveCart();
    renderCart();
    updateCartCount();
  }

  // RIMUOVE UN PRODOTTO DAL CARRELLO
  function removeFromCart(index) {
    const item = cart[index]; //prende il prodotto dall'array
    cart.splice(index, 1); //rimuove il prodotto dall'array attraverso splice (individua l'indice e rimuove 1 elemento)
    //salva e aggiorna l'interfaccia
    saveCart();
    renderCart();
    updateCartCount();

    //feedback utente con notifican toast se la funzione esiste
    if (typeof showToast === "function") {
      showToast(`"${item.titolo}" rimosso dal carrello`);
    }
  }

  // SVUOTA IL CARRELLO
  function clearCart() {
    // se carrello vuoto: non fa niente
    if (cart.length === 0) return;
    //se carrello almeno 1 articolo-> modale di confera
    const modal = document.getElementById("clearCartConfirmModal");
    modal.style.display = "flex";
  }

  // LISTENER MODALE SVUOTA CARRELLO
  function setupClearCartModal() {
    // Prende gli elementi della modale (contenitore, conferma, annulla)
    const modal = document.getElementById("clearCartConfirmModal");
    const confirmBtn = document.getElementById("confirmClearCartBtn");
    const cancelBtn = document.getElementById("cancelClearCartBtn");

    // clona bottone (rimuove vecchi listener per evitare doppi click se ricarichi la pagina) e sostituisce il bottone con quello clonato
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    //----se conferma----
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

    //----se annulla----
    cancelBtn.addEventListener("click", closeClearCartModal);

    //----se clicca fuori----
    window.addEventListener("click", (e) => {
      if (e.target === modal) closeClearCartModal();
    });
  }

  // CHIUDE LA MODALE SVUOTA CARRELLO
  function closeClearCartModal() {
    const modal = document.getElementById("clearCartConfirmModal"); //prende la modale
    if (modal) modal.style.display = "none"; //nasconde la modale
  }

  // AGGIORNA I TOTALI DEL CARRELLO
  function updateTotals() {
    let subtotal = 0; //inizializza il subtotale

    console.log("🧮 Calcolo totali carrello:");
    cart.forEach((item, idx) => {
      // Salta item invalidi (senza prezzo o titolo)
      if (!item.prezzo || !item.titolo) {
        console.warn("⚠️ Prodotto invalido nel carrello:", item);
        return;
      }
      // Calcola il totale per ogni prodotto (prezzo * quantità)
      const itemPrice = parseFloat(item.prezzo);
      const itemQty = item.quantity || 1;
      const itemTotal = itemPrice * itemQty;
      console.log(
        `  [${idx}] ${item.titolo}: €${itemPrice} x ${itemQty} = €${itemTotal.toFixed(2)}`,
      );
      // Aggiungi al subtotale il totale calcolato prima
      subtotal += itemTotal;
    });

    console.log(`📊 Subtotale: €${subtotal.toFixed(2)}`); //mostra il subtotale fissando 2 numeri decimali

    // Spedizione gratuita sopra una certa soglia
    let shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingCost;

    // Calcola il totale finale (subtotale + spedizione - sconto)
    const total = subtotal + shipping - discountAmount;

    // Aggiorna il subtotale nell'interfaccia
    if (subtotalEl) {
      subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    }

    // Aggiorna l'elemento spedizione nell'interfaccia (se è gratuita mostra gratis colorato, altrimenti mostra il costo)
    if (shipping === 0 && subtotal > 0) {
      shippingEl.innerHTML = '<span style="color: var(--accent)">GRATIS</span>';
    } else {
      shippingEl.textContent = `€${shipping.toFixed(2)}`;
    }

    // Aggiorna il totale nell'interfaccia
    if (totalEl) {
      totalEl.textContent = `€${total.toFixed(2)}`;
    }
  }

  // AGGIORNA CONTATORE CARRELLO NELL'HEADER
  function updateCartCount() {
    // Calcola il numero totale di articoli nel carrello
    const totalItems = cart.reduce(
      //somma le quantità del singolo prodotto (reduce-> trasforma array in un singolo valore)
      (sum, item) => sum + (item.quantity || 1),
      0,
    );

    // Aggiorna il contatore nell'header
    const cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) {
      // Se l'elemento esiste
      cartCountEl.textContent = totalItems; //aggiorna il testo con il numero totale di articoli
    }

    // Aggiorna anche store globale per mantenere la sincronizzazione
    store.setState({ cart: [...cart] });
  }

  // PROCEDE AL CHECKOUT
  function proceedToCheckout() {
    //se carrello vuoto -> mostra messaggio di errore
    if (cart.length === 0) {
      if (typeof showMessage === "function") {
        showMessage("Il carrello è vuoto", "error");
      }
      return;
    }

    //se carrello non vuoto -> porta al checkout / mostra messaggio di funzionalità in arrivo
    if (typeof showMessage === "function") {
      showMessage("Funzione checkout in arrivo! 🚀", "success");
    }
  }

  // CARICA PRODOTTI CONSIGLIATI (esclude quelli già nel carrello)
  function loadRecommendedProducts() {
    fetch("/progetto_TecWeb/api/prodotti.php") //chiede al server la lista di prodotti (chiamata API)
      .then((response) => response.json()) //trasforma la risposta in JSON
      .then((data) => {
        //gestisce i dati ricevuti
        // Se la risposta ha successo E contiene dati
        if (data.success && data.data) {
          const cartIds = cart.map((item) => item.id); //prende gli ID dei prodotti già nel carrello
          const recommended = data.data
            .filter((p) => !cartIds.includes(p.id)) //filtra i prodotti escludendo quelli già nel carrello
            .slice(0, 4); //prende solo i primi 4 prodotti consigliati

          displayRecommendedProducts(recommended); //mostra i prodotti consigliati nell'interfaccia
        }
      })
      //se la chiamata fallisce -> mostra errore
      .catch((error) => {
        console.error(
          "Errore nel caricamento dei prodotti consigliati:",
          error,
        );
      });
  }

  // MOSTRA I PRODOTTI CONSIGLIATI NELL'INTERFACCIA
  function displayRecommendedProducts(products) {
    //se l'elemento non esiste (tutti i prodotti sono nel carrello) -> esci
    if (!recommendedProducts) return;
    recommendedProducts.innerHTML = ""; //per avere area pulita

    //per ogni prodotto -> crea la card e la aggiunge al contenitore
    products.forEach((product) => {
      const card = createRecommendedProductCard(product);
      recommendedProducts.appendChild(card);
    });
  }

  // CREA LA CARD HTML PER UN PRODOTTO CONSIGLIATO
  function createRecommendedProductCard(product) {
    const card = document.createElement("div"); //contenitore card
    card.className = "product-card";
    card.style.cursor = "pointer";

    // Click sulla card per andare al dettaglio
    card.addEventListener("click", (e) => {
      // se si clicca sul bottone aggiungi -> non naviga
      if (e.target.tagName === "BUTTON") return;

      // Previene comportamento di default
      e.preventDefault();
      e.stopPropagation();

      // Usa il router globale per andare alla pagina dettaglio prodotto
      if (typeof router !== "undefined" && router.navigate) {
        router.navigate(`/dettaglio-prodotto?id=${product.id}`);
      } else {
        // se non c'è il router -> cambia manualmente la URL
        const path = `/dettaglio-prodotto?id=${product.id}`;
        history.pushState(null, "", path); //aggiorna la URL senza ricaricare la pagina

        //forza il router ad aggiornare la vista -> simula evento popstate (navigazione indietro/avanti)
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    });

    // ----------------IMMAGINE----------------
    const imageDiv = document.createElement("div");
    imageDiv.className = "product-image";

    // Forza le dimensioni nel caso il CSS non carichi subito
    imageDiv.style.height = "280px";
    imageDiv.style.backgroundSize = "cover";
    imageDiv.style.backgroundPosition = "center";

    if (product.image_path && product.image_path.trim() !== "") {
      const basePath = window.image_path || "assets/img/";
      const imgName = product.image_path;
      const fullPath = basePath + imgName;

      imageDiv.style.backgroundImage = `linear-gradient(135deg, rgba(5, 8, 22, 0.4), transparent), url('${fullPath}')`;
    } else {
      imageDiv.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }

    // ----------------CORPO CARD----------------
    const bodyDiv = document.createElement("div");
    bodyDiv.className = "product-body";

    // Titolo
    const title = document.createElement("h3");
    title.textContent = product.titolo;

    // Prezzo
    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = `€${parseFloat(product.prezzo).toFixed(2)}`;

    // Bottone Aggiungi al carrello
    const addButton = document.createElement("button");
    addButton.className = "btn btn-sm";
    addButton.textContent = "Aggiungi";
    addButton.onclick = (e) => {
      e.stopPropagation(); // Previene la navigazione quando clicco sul bottone
      addRecommendedToCart(product);
    };

    // Assembla la card
    bodyDiv.appendChild(title);
    bodyDiv.appendChild(price);
    bodyDiv.appendChild(addButton);
    card.appendChild(imageDiv);
    card.appendChild(bodyDiv);

    return card;
  }

  // AGGIUNGE UN PRODOTTO CONSIGLIATO AL CARRELLO
  function addRecommendedToCart(product) {
    const existingIndex = cart.findIndex((item) => item.id === product.id); //controlla se il prodotto è già nel carrello

    // Se esiste già -> incrementa la quantità. Altrimenti aggiungi clone del prodotto con quantità 1
    if (existingIndex >= 0) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    //salva e aggiorna l'interfaccia
    saveCart();
    renderCart();
    updateCartCount();

    //se funzione esiste -> mostra notifica toast a utente
    if (typeof showToast === "function") {
      showToast(`"${product.titolo}" aggiunto al carrello ✅`);
    }
  }

  // EVENT LISTENER (bottone svuota carrello e checkout)
  //se esiste il bottone -> svuota carrello
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", clearCart);
  }

  //se esiste il bottone -> procede al checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", proceedToCheckout);
  }

  // INIZIALIZZA IL CARRELLO AL CARICAMENTO DELLA PAGINA
  loadCart();
}

//ESPORTA LA FUNZIONE DI INIZIALIZZAZIONE
window.initCarrelloPage = initCarrelloPage;
