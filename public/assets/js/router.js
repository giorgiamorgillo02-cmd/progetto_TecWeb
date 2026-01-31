// Router SPA - Gestisce la navigazione client-side
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.beforeRouteChange = null;
    this.afterRouteChange = null;
  }

  // Registra una nuova rotta
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  // Registra hook prima del cambio rotta
  onBeforeRouteChange(callback) {
    this.beforeRouteChange = callback;
  }

  // Registra hook dopo il cambio rotta
  onAfterRouteChange(callback) {
    this.afterRouteChange = callback;
  }

  // Naviga a una rotta specifica
  async navigate(path, addToHistory = true) {
    console.log("🧭 Router.navigate() chiamato con path:", path);

    // Hook prima del cambio rotta
    if (this.beforeRouteChange) {
      const shouldContinue = await this.beforeRouteChange(
        this.currentRoute,
        path,
      );
      if (shouldContinue === false) return;
    }

    // Estrai parametri dalla query string
    const [pathname, search] = path.split("?");
    const params = this.parseQueryString(search);

    console.log("📍 Pathname estratto:", pathname);
    console.log("📦 Rotte disponibili:", Object.keys(this.routes));

    // Trova la rotta corrispondente
    const route = this.routes[pathname] || this.routes["/404"];

    if (!route) {
      console.error("Rotta non trovata:", pathname);
      return;
    }

    // Aggiorna la history API
    if (addToHistory) {
      const fullPath = "/progetto_TecWeb" + path;
      window.history.pushState({ path }, "", fullPath);
    }

    // Esegui l'handler della rotta
    try {
      await route(params);
      this.currentRoute = pathname;

      // Hook dopo il cambio rotta
      if (this.afterRouteChange) {
        this.afterRouteChange(pathname, params);
      }

      // Scroll to top dopo il cambio pagina
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Errore durante la navigazione:", error);
    }
  }

  // Parsing della query string
  parseQueryString(search) {
    if (!search) return {};

    const params = {};
    const pairs = search.split("&");

    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      params[decodeURIComponent(key)] = decodeURIComponent(value || "");
    });

    return params;
  }

  // Inizializza il router
  init() {
    // Gestisce il click sui link
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-link]");
      if (link) {
        e.preventDefault();
        const href = link.getAttribute("href");
        const scrollTo = link.getAttribute("data-scroll");

        // Se c'è un attributo data-scroll, naviga e poi scrolla
        if (scrollTo) {
          this.navigate(href).then(() => {
            setTimeout(() => {
              const element = document.getElementById(scrollTo);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
          });
        } else {
          this.navigate(href);
        }
      }
    });

    // Gestisce i pulsanti back/forward del browser
    window.addEventListener("popstate", (e) => {
      let path = e.state?.path || window.location.pathname;

      // Rimuovi /progetto_TecWeb/ dal path
      if (path.startsWith("/progetto_TecWeb")) {
        path = path.replace("/progetto_TecWeb", "");
      }

      if (!path || path === "/") {
        path = "/home";
      }

      this.navigate(path, false);
    });

    // Carica la rotta iniziale
    let initialPath = window.location.pathname;

    // Rimuovi /progetto_TecWeb/ dal path se presente
    if (initialPath.startsWith("/progetto_TecWeb")) {
      initialPath = initialPath.replace("/progetto_TecWeb", "");
    }

    // Se è la root o index.php, vai alla home
    if (
      initialPath === "/" ||
      initialPath === "" ||
      initialPath === "/index.php" ||
      initialPath === "/index.html"
    ) {
      initialPath = "/home";
    }

    // Rimuovi .html se presente
    initialPath = initialPath.replace(".html", "");

    const search = window.location.search.substring(1);
    const fullPath = search ? `${initialPath}?${search}` : initialPath;

    this.navigate(fullPath, false);
  }

  // Ottiene la rotta corrente
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Esporta un'istanza singleton del router
const router = new Router();
window.router = router; // Rende il router accessibile globalmente
