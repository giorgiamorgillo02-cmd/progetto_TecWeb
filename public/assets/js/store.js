// Store globale - Gestisce lo stato dell'applicazione
class Store {
  constructor() {
    this.state = {
      user: null,
      cart: [],
      preferiti: [],
      isAuthenticated: false,
    };
    this.listeners = [];
    this.loadFromLocalStorage();
  }

  // Carica i dati dal localStorage
  loadFromLocalStorage() {
    try {
      const savedCart = localStorage.getItem("artly_cart");
      if (savedCart) {
        this.state.cart = JSON.parse(savedCart);
      }

      const savedPreferiti = localStorage.getItem("artly_preferiti");
      if (savedPreferiti) {
        this.state.preferiti = JSON.parse(savedPreferiti);
      }
    } catch (error) {
      console.error("Errore caricamento localStorage:", error);
    }
  }

  // Ottiene lo stato
  getState() {
    return { ...this.state };
  }

  // Aggiorna lo stato e notifica i listener
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
    this.saveToLocalStorage();
  }

  // Sottoscrivi ai cambiamenti dello stato
  subscribe(listener) {
    this.listeners.push(listener);
    // Ritorna una funzione per annullare la sottoscrizione
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notifica tutti i listener
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Salva nel localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem("artly_cart", JSON.stringify(this.state.cart));
      localStorage.setItem(
        "artly_preferiti",
        JSON.stringify(this.state.preferiti),
      );
    } catch (error) {
      console.error("Errore salvataggio localStorage:", error);
    }
  }

  // --- METODI CARRELLO ---
  addToCart(product) {
    const existingIndex = this.state.cart.findIndex(
      (item) => item.id === product.id,
    );

    if (existingIndex !== -1) {
      // Aumenta la quantità se esiste già
      this.state.cart[existingIndex].quantity =
        (this.state.cart[existingIndex].quantity || 1) + 1;
    } else {
      // Aggiungi nuovo prodotto
      this.state.cart.push({ ...product, quantity: 1 });
    }

    this.setState({ cart: this.state.cart });
    return this.getCartCount();
  }

  removeFromCart(productId) {
    this.state.cart = this.state.cart.filter((item) => item.id !== productId);
    this.setState({ cart: this.state.cart });
  }

  updateCartQuantity(productId, quantity) {
    const item = this.state.cart.find((item) => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.setState({ cart: this.state.cart });
      }
    }
  }

  clearCart() {
    this.setState({ cart: [] });
  }

  getCart() {
    return [...this.state.cart];
  }

  getCartCount() {
    return this.state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  getCartTotal() {
    return this.state.cart.reduce((sum, item) => {
      const price = parseFloat(item.prezzo) || 0;
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0);
  }

  // --- METODI PREFERITI ---
  addToPreferiti(product) {
    if (!this.isInPreferiti(product.id)) {
      this.state.preferiti.push(product);
      this.setState({ preferiti: this.state.preferiti });
    }
  }

  removeFromPreferiti(productId) {
    this.state.preferiti = this.state.preferiti.filter(
      (item) => item.id !== productId,
    );
    this.setState({ preferiti: this.state.preferiti });
  }

  isInPreferiti(productId) {
    return this.state.preferiti.some((item) => item.id === productId);
  }

  getPreferiti() {
    return [...this.state.preferiti];
  }

  // --- METODI UTENTE ---
  setUser(userData) {
    this.setState({
      user: userData,
      isAuthenticated: !!userData, // !! trasforma in booleano
    });
  }

  getUser() {
    return this.state.user;
  }

  isAuthenticated() {
    return this.state.isAuthenticated;
  }

  isAdmin() {
    return (
      this.state.user &&
      (this.state.user.ruolo === "admin" || this.state.user.is_admin === true)
    );
  }

  // Logout volontario - svuota il carrello
  logout() {
    // Svuota il carrello al logout per sicurezza
    this.clearCart();
    this.setState({
      user: null,
      isAuthenticated: false,
    });
  }

  // Pulisce solo i dati utente senza toccare il carrello
  // Usato quando l'utente non è autenticato (refresh, sessione scaduta, etc.)
  clearUser() {
    this.setState({
      user: null,
      isAuthenticated: false,
    });
  }
}

// Esporta un'istanza singleton dello store
const store = new Store();
