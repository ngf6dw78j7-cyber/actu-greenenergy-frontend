const API_BASE = window.API_BASE || "http://localhost:8000";

const demoNews = [
 {title:"Le Sénégal accélère le développement de son énergie solaire",category:"Solaire",region:"Sénégal",emoji:"☀️",published_at:null,original_url:"#"},
 {title:"L'Afrique augmente ses investissements dans les énergies renouvelables",category:"Solaire",region:"Afrique",emoji:"🌍",published_at:null,original_url:"#"},
 {title:"Le stockage par batteries transforme les réseaux électriques",category:"Stockage",region:"Monde",emoji:"🔋",published_at:null,original_url:"#"},
 {title:"De nouveaux projets éoliens émergent en Afrique",category:"Éolien",region:"Afrique",emoji:"🌬️",published_at:null,original_url:"#"},
 {title:"L'hydroélectricité reste un pilier de la transition énergétique",category:"Hydro",region:"Monde",emoji:"💧",published_at:null,original_url:"#"},
 {title:"La biomasse gagne du terrain dans les applications industrielles",category:"Biomasse",region:"Monde",emoji:"🌱",published_at:null,original_url:"#"},
 {title:"L'hydrogène vert attire de nouveaux investissements",category:"Hydrogène",region:"Monde",emoji:"⚡",published_at:null,original_url:"#"},
 {title:"Des solutions solaires pour renforcer l'accès à l'électricité en Afrique",category:"Solaire",region:"Afrique",emoji:"☀️",published_at:null,original_url:"#"},
 {title:"Innovation énergétique : solaire et stockage pour les zones rurales",category:"Stockage",region:"Sénégal",emoji:"🔋",published_at:null,original_url:"#"}
];

const CATEGORY_EMOJI = {
  "Solaire": "☀️", "Éolien": "🌬️", "Hydro": "💧",
  "Biomasse": "🌱", "Stockage": "🔋", "Hydrogène": "⚡"
};

let news = [];
let current = [];
let activeCategory = "Toutes";
let activeRegion = null;

function formatDate(iso) {
  if (!iso) return "Source à connecter";
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3600000);
  if (h < 1) return "À l'instant";
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Hier" : `Il y a ${d} j`;
}

function render(items) {
  const grid = document.getElementById("newsGrid");
  if (!items.length) {
    grid.innerHTML = `<p class="empty">Aucune actualité ne correspond à ces critères.</p>`;
  } else {
    grid.innerHTML = items.map(n => `<a class="news-card" href="${n.original_url || '#'}" target="_self" rel="noopener">
      <div class="thumb">${n.emoji || CATEGORY_EMOJI[n.category] || "🌿"}</div>
      <div class="news-body">
       <span class="tag">${n.category || "Actualité"}</span>
       <h3>${n.title}</h3>
       <div class="meta">${n.region || "Monde"} · ${formatDate(n.published_at)}${n.source ? " · " + n.source : ""}</div>
      </div>
    </a>`).join("");
  }
  document.getElementById("resultCount").textContent = `${items.length} actualité(s)`;
}

async function fetchNews(params = {}) {
  const grid = document.getElementById("newsGrid");
  grid.innerHTML = `<p class="loading">Chargement des actualités…</p>`;

  const query = new URLSearchParams(params).toString();
  try {
    const res = await fetch(`${API_BASE}/api/news${query ? "?" + query : ""}`);
    if (!res.ok) throw new Error("API indisponible");
    const data = await res.json();
    news = data;
    current = data;
    render(current);
  } catch (err) {
    console.warn("API injoignable, utilisation des données de démonstration.", err);
    news = demoNews;
    current = applyLocalFilters(demoNews);
    render(current);
  }
}

function applyLocalFilters(items) {
  let result = items;
  if (activeCategory !== "Toutes") {
    result = result.filter(n => n.category === activeCategory);
  }
  if (activeRegion) {
    result = result.filter(n => n.region === activeRegion);
  }
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  if (q) {
    result = result.filter(n => (n.title + " " + n.category + " " + n.region).toLowerCase().includes(q));
  }
  return result;
}

function filterCategory(cat, btn) {
  document.querySelectorAll(".filters button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  activeCategory = cat;
  fetchNews({ category: cat, region: activeRegion || undefined });
}

function filterRegion(region) {
  activeRegion = region === "Monde" ? null : region;
  fetchNews({ category: activeCategory, region: activeRegion || undefined });
  document.getElementById("news").scrollIntoView({ behavior: "smooth" });
}

function searchNews() {
  const q = document.getElementById("searchInput").value;
  fetchNews({ category: activeCategory, region: activeRegion || undefined, search: q || undefined });
  document.getElementById("news").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") searchNews();
});

fetchNews();
