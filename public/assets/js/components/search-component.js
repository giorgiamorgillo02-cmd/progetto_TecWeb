// Componente Header riutilizzabile
function createSearchDropdown() {
  return `
    <div class="search-dropdown-wrapper">
      <button class="icon-btn" id="searchBtn" aria-label="Cerca">🔍</button>
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
    </div>
  `;
}

// Inizializza il dropdown di ricerca se non esiste già
function initSearchDropdownComponent() {
  // Trova tutti i pulsanti di ricerca che non hanno ancora il dropdown
  const searchButtons = document.querySelectorAll(
    '.icon-btn[aria-label="Cerca"]',
  );

  searchButtons.forEach((btn) => {
    // Se il pulsante è già dentro un wrapper, salta
    if (btn.parentElement.classList.contains("search-dropdown-wrapper")) {
      return;
    }

    // Crea un wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "search-dropdown-wrapper";

    // Sostituisci il pulsante con il wrapper che contiene il pulsante e il dropdown
    btn.parentNode.insertBefore(wrapper, btn);
    wrapper.appendChild(btn);

    // Aggiungi il dropdown HTML
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
  });
}

// Inizializza all'avvio
document.addEventListener("DOMContentLoaded", () => {
  initSearchDropdownComponent();
});
