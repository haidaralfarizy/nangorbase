/* --------------------------------------------------------------------------
   Translations
   -------------------------------------------------------------------------- */
const TRANSLATIONS = {
    id: {
        "hero_title": "Jatinangor Guide",
        "hero_tagline": "Apapun yang kamu butuhkan di Jatinangor, dari mahasiswa, untuk mahasiswa.",
        "hero_subtitle": "Panduan tempat-tempat penting di sekitar kampus ITB Jatinangor dan Unpad.",
        "hero_stat_listings": "Lokasi",
        "hero_stat_categories": "Kategori",
        "hero_stat_updated": "Terakhir Diperbarui",
    },
    en: {
        "hero_title": "Jatinangor Guide",
        "hero_tagline": "Everything you need in Jatinangor, by students, for students.",
        "hero_subtitle": "A comprehensive guide to essential places around ITB Jatinangor and Unpad campuses.",
        "hero_stat_listings": "Places",
        "hero_stat_categories": "Categories",
        "hero_stat_updated": "Last Updated",
    }
};

/* --------------------------------------------------------------------------
   State
   -------------------------------------------------------------------------- */
let currentLang = localStorage.getItem('lang') || 'id';
let allPlaces = [];

/* --------------------------------------------------------------------------
   Languages
   -------------------------------------------------------------------------- */
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    const dict = TRANSLATIONS[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });

    document.getElementById('lang-id').classList.toggle('active', lang === 'id');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');

    if (allPlaces.length > 0) {
        populateHeroStats();
    }
}

/* --------------------------------------------------------------------------
   Theme
   -------------------------------------------------------------------------- */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    updateThemeIcon();
}

function toggleTheme() {
    const isDark = document.documentElement.hasAttribute('data-theme');
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    const isDark = document.documentElement.hasAttribute('data-theme');

    // Create a new i tag to replace the svg
    const newIcon = document.createElement('i');
    newIcon.id = 'theme-icon';
    newIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    newIcon.className = 'icon-sm';

    icon.parentNode.replaceChild(newIcon, icon);

    if (window.lucide) {
        lucide.createIcons();
    }
}

/* --------------------------------------------------------------------------
   Hero Data Population
   -------------------------------------------------------------------------- */
function populateHeroStats() {
    const listingCountEl = document.getElementById('hero-listing-count');
    const categoryCountEl = document.getElementById('hero-category-count');
    const lastUpdatedEl = document.getElementById('hero-last-updated');

    if (!listingCountEl || !categoryCountEl || !lastUpdatedEl) return;

    listingCountEl.textContent = allPlaces.length;

    const uniqueCategories = new Set(allPlaces.map(p => p.category));
    categoryCountEl.textContent = uniqueCategories.size;

    const dateTimestamps = allPlaces.map(p => new Date(p.last_updated || 0).getTime());
    const latestTime = Math.max(...dateTimestamps.filter(t => !isNaN(t)));
    const latestDate = new Date(latestTime);
    
    const options = { year: 'numeric', month: 'short' };
    lastUpdatedEl.textContent = latestDate.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', options);
}

/* ============================================================
   INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setLanguage(currentLang);

    // Fetch places
    fetch('data/places.json')
        .then(res => res.json())
        .then(data => {
            allPlaces = data;
            populateHeroStats();
        })
        .catch(err => {
            console.error('Error fetching places:', err);
        });

    if (window.lucide) {
        lucide.createIcons();
    }
});