// Componente Header - Riutilizzabile in tutta l'applicazione
class HeaderComponent {
  constructor() {
    this.element = null;
  }

  // Render del componente header
  render() {
    const user = store.getUser();
    const cartCount = store.getCartCount();
    const isAuthenticated = store.isAuthenticated();

    return `
      <header class="header">
        <div class="container header-inner">
          <div class="logo">
            <a href="/home" data-link>
              <img src="public/assets/img/logo.png" alt="Artly Logo" class="logo-img" /
            </a>
          </div>

          <nav class="nav">
            <ul class="nav-list">
              <li><a href="/home" data-link>Home</a></li>
              <li><a href="/prodotti" data-link>Prodotti</a></li>
              <li><a href="/home" data-link data-scroll="how-it-works">Come funziona</a></li>
              <li><a href="/home" data-link data-scroll="about">Su di noi</a></li>
            </ul>
          </nav>

          <div class="header-actions">
            <button class="icon-btn" id="searchBtn" aria-label="Cerca">🔍</button>
            <a href="/carrello" data-link class="icon-btn cart-btn" aria-label="Carrello">
              🛒
              <span class="cart-count" id="cartCount">${cartCount}</span>
            </a>
            ${this.renderAuthButton(isAuthenticated, user)}
            <button class="menu-toggle" id="menuToggle" aria-label="Menu">☰</button>
          </div>
        </div>

        <!-- Mobile nav -->
        <nav class="nav-mobile" id="mobileNav">
          <ul>
            <li><a href="/home" data-link>Home</a></li>
            <li><a href="/prodotti" data-link>Prodotti</a></li>
            <li><a href="/home" data-link data-scroll="how-it-works">Come funziona</a></li>
            <li><a href="/home" data-link data-scroll="about">Su di noi</a></li>
          </ul>
        </nav>
      </header>
    `;
  }

  // Render del pulsante di autenticazione
  renderAuthButton(isAuthenticated, user) {
    if (isAuthenticated && user) {
      const iniziali =
        `${user.nome.charAt(0)}${user.cognome.charAt(0)}`.toUpperCase();
      const adminMenuItem = user.is_admin
        ? `
        <div class="user-dropdown-item" data-action="navigate" data-path="/admin">
          <span>⚙️ Dashboard Admin</span>
        </div>
      `
        : "";

      return `
        <div class="user-profile-wrapper">
          <div class="user-profile-circle" id="userProfileCircle" title="${user.nome} ${user.cognome}">
            ${iniziali}
          </div>
          <div class="user-dropdown" id="userDropdown">
            <div class="user-dropdown-header">
              <strong>${user.nome} ${user.cognome}</strong>
              <span>${user.email}</span>
            </div>
            ${adminMenuItem}
            <div class="user-dropdown-item" data-action="navigate" data-path="/profilo">
              <span>Il mio profilo</span>
            </div>
            <div class="user-dropdown-item" data-action="navigate" data-path="/preferiti">
              <span>❤️ I miei preferiti</span>
            </div>
            <div class="user-dropdown-item" data-action="logout">
              <span>Logout</span>
            </div>
          </div>
        </div>
      `;
    } else {
      return `<a href="/login" data-link class="btn btn-outline">Accedi</a>`;
    }
  }

  // Inizializza gli event listener del componente
  attachEvents() {
    // Mobile menu toggle
    const menuToggle = document.getElementById("menuToggle");
    const mobileNav = document.getElementById("mobileNav");

    if (menuToggle && mobileNav) {
      // Toggle menu mobile
      menuToggle.addEventListener("click", () => {
        const isOpen = mobileNav.classList.contains("is-open");
        if (isOpen) {
          mobileNav.classList.remove("is-open");
          menuToggle.innerHTML = "☰";
        } else {
          mobileNav.classList.add("is-open");
          menuToggle.innerHTML = "✕";
        }
      });

      // Chiudi menu quando si clicca su un link
      mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          mobileNav.classList.remove("is-open");
          menuToggle.innerHTML = "☰";
        });
      });

      // Reset menu quando si ridimensiona la finestra
      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (window.innerWidth > 768) {
            mobileNav.classList.remove("is-open");
            mobileNav.style.display = "none";
            menuToggle.innerHTML = "☰";
          } else {
            mobileNav.style.display = "";
          }
        }, 250);
      });
    }

    // User dropdown toggle
    const userProfileCircle = document.getElementById("userProfileCircle");
    const userDropdown = document.getElementById("userDropdown");

    if (userProfileCircle && userDropdown) {
      userProfileCircle.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
      });

      // Chiudi dropdown cliccando fuori
      document.addEventListener("click", () => {
        userDropdown.classList.remove("show");
      });

      // Gestisci click sugli item del dropdown
      userDropdown.querySelectorAll(".user-dropdown-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const action = item.getAttribute("data-action");
          console.log("🖱️ Click dropdown item, action:", action);

          if (action === "logout") {
            this.handleLogout();
          } else if (action === "navigate") {
            const path = item.getAttribute("data-path");
            console.log("🔀 Navigate to:", path);
            userDropdown.classList.remove("show");
            router.navigate(path);
          }
        });
      });
    }

    // Search button
    this.initSearchComponent();
  }

  // Inizializza componente di ricerca
  initSearchComponent() {
    const searchBtn = document.getElementById("searchBtn");
    if (!searchBtn) return;

    // Crea wrapper e dropdown se non esistono
    if (
      !searchBtn.parentElement.classList.contains("search-dropdown-wrapper")
    ) {
      const wrapper = document.createElement("div");
      wrapper.className = "search-dropdown-wrapper";
      searchBtn.parentNode.insertBefore(wrapper, searchBtn);
      wrapper.appendChild(searchBtn);

      wrapper.insertAdjacentHTML(
        "beforeend",
        `
        <div class="search-dropdown" id="searchDropdown">
          <input 
            type="text" 
            id="globalSearchInput" 
            placeholder="Cerca prodotti..." 
            class="search-dropdown-input"
          />
          <div class="search-results" id="searchResults">
            <p class="search-placeholder">Inizia a digitare per cercare...</p>
          </div>
        </div>
      `,
      );
    }

    const searchDropdown = document.getElementById("searchDropdown");
    const searchInput = document.getElementById("globalSearchInput");
    const searchResults = document.getElementById("searchResults");

    // Toggle dropdown
    searchBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = searchDropdown.classList.contains("show");

      if (isOpen) {
        searchDropdown.classList.remove("show");
        searchInput.value = "";
        searchResults.innerHTML =
          '<p class="search-placeholder">Inizia a digitare per cercare...</p>';
      } else {
        searchDropdown.classList.add("show");
        setTimeout(() => searchInput.focus(), 100);
      }
    });

    // Chiudi dropdown cliccando fuori
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-dropdown-wrapper")) {
        searchDropdown.classList.remove("show");
      }
    });

    // Ricerca in tempo reale
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length < 2) {
        searchResults.innerHTML =
          '<p class="search-placeholder">Digita almeno 2 caratteri...</p>';
        return;
      }

      searchResults.innerHTML =
        '<p class="search-placeholder">Ricerca in corso...</p>';

      searchTimeout = setTimeout(() => {
        this.performSearch(query, searchResults);
      }, 300);
    });
  }

  // Esegui ricerca prodotti
  async performSearch(query, resultsContainer) {
    try {
      const response = await fetch("api/prodotti.php");
      const data = await response.json();

      if (data.success && data.data) {
        const results = data.data.filter((product) => {
          const searchText =
            `${product.titolo} ${product.descrizione} ${product.autore} ${product.categoria_nome}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        });

        this.displaySearchResults(results, query, resultsContainer);
      }
    } catch (error) {
      console.error("Errore ricerca:", error);
      resultsContainer.innerHTML =
        '<p class="search-error">Errore nella ricerca</p>';
    }
  }

  // Mostra risultati ricerca
  displaySearchResults(results, query, container) {
    if (results.length === 0) {
      container.innerHTML = `<p class="search-no-results">Nessun risultato per "<strong>${query}</strong>"</p>`;
      return;
    }

    let html = `<p class="search-count">${results.length} risultat${results.length > 1 ? "i" : "o"} per "<strong>${query}</strong>"</p>`;
    html += '<div class="search-results-list">';

    results.slice(0, 5).forEach((product) => {
      let imageStyle = "";

      if (product.image_path && product.image_path.trim() !== "") {
        // 1. Percorso base globale
        const basePath = window.image_path || "/progetto_TecWeb/img/";

        // 2. Pulisce il nome file (rimuove slash iniziale se presente)
        const imgName = product.image_path.startsWith("/")
          ? product.image_path.substring(1)
          : product.image_path;

        // 3. Percorso completo
        const fullPath = basePath + imgName;

        // 4. Stile CSS
        imageStyle = `background-image: url('${fullPath}'); background-size: cover; background-position: center;`;
      } else {
        // Fallback standard (gradiente viola/blu)
        imageStyle =
          "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);";
      }

      html += `
        <a href="/dettaglio-prodotto?id=${product.id}" data-link class="search-result-item">
          <div class="search-result-image" style="${imageStyle}"></div>
          <div class="search-result-info">
            <h4>${product.titolo}</h4>
            <p class="search-result-author">${product.autore}</p>
            <p class="search-result-price">€${parseFloat(product.prezzo).toFixed(2)}</p>
          </div>
        </a>
      `;
    });

    html += "</div>"; // Chiudo il div della lista
    container.innerHTML = html;
  }

  // Gestisce il logout
  async handleLogout() {
    try {
      const response = await fetch("api/auth/logout.php");
      const data = await response.json();

      if (data.success) {
        store.logout();
        showToast("Logout effettuato ✓");
        setTimeout(() => router.navigate("/home"), 1000);
      }
    } catch (error) {
      console.error("Errore logout:", error);
    }
  }

  // Aggiorna il componente
  update() {
    const headerContainer = document.getElementById("header-container");
    if (headerContainer) {
      headerContainer.innerHTML = this.render();
      // Attendi che il DOM sia aggiornato prima di attaccare gli eventi
      setTimeout(() => this.attachEvents(), 0);
    }
  }
}

// Esporta istanza singleton
const headerComponent = new HeaderComponent();
