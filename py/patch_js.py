import os
import re

# Resolve paths relative to the script's parent directory (project root)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js_path = os.path.join(BASE_DIR, "js", "main.js")

with open(js_path, "r") as f:
    content = f.read()

# Replace CATEGORIES
new_categories = """const CATEGORIES = {
    'food-cheap': { label: { en: 'Warteg & Warung', id: 'Warteg & Warung' }, icon: 'utensils' },
    'food-restaurant': { label: { en: 'Restaurants & Cafes', id: 'Restoran & Kafe' }, icon: 'chef-hat' },
    'food-cafe-wifi': { label: { en: 'Study Cafes', id: 'Kafe Tugas' }, icon: 'coffee' },
    'food-drinks': { label: { en: 'Drinks & Snacks', id: 'Minuman & Jajanan' }, icon: 'cup-soda' },
    'printing': { label: { en: 'Printing & Photocopy', id: 'Fotokopi & Print' }, icon: 'printer' },
    'stationery': { label: { en: 'Stationery & Supplies', id: 'Alat Tulis (ATK)' }, icon: 'pencil' },
    'daily-needs': { label: { en: 'Daily Needs', id: 'Kebutuhan Harian' }, icon: 'shopping-basket' },
    'services': { label: { en: 'Services', id: 'Servis' }, icon: 'wrench' }
};"""
content = re.sub(r"const CATEGORIES = \{.*?\};", new_categories, content, flags=re.DOTALL)

# Remove old state
old_state_pattern = r"let allPlaces = \[\];.*?function isPlaceOpenNow\(place\) \{"
content = re.sub(old_state_pattern, "let allPlaces = [];\n\nfunction isPlaceOpenNow(place) {", content, flags=re.DOTALL)

# Remove updateClearFiltersVisibility
content = re.sub(r"function updateClearFiltersVisibility\(\) \{.*?\n\}\n", "", content, flags=re.DOTALL)

# Remove renderCategoryPills
content = re.sub(r"function renderCategoryPills\(\) \{.*?\n\}\n", "", content, flags=re.DOTALL)

# Remove getPriceLabel
content = re.sub(r"function getPriceLabel\(priceRange\) \{.*?\n\}\n", "", content, flags=re.DOTALL)

# Remove renderPriceFilters
content = re.sub(r"function renderPriceFilters\(\) \{.*?\n\}\n", "", content, flags=re.DOTALL)


# Inside DOMContentLoaded
# Remove everything related to custom dropdown, search KBD shortcut, clear filters logic, tactile drag, and replace with Alpine init

alpine_init = """
document.addEventListener('alpine:init', () => {
    Alpine.data('filterSystem', () => ({
        categories: CATEGORIES,
        zones: ['Ciseke', 'GKPN', 'Jalan Sayang', 'Jatos', 'Hegarmanah'],
        facilitiesList: [
            { id: 'stopkontak', label: { id: 'Banyak Stopkontak', en: 'Plentiful Outlets' }, icon: 'plug' },
            { id: 'wifi', label: { id: 'Wi-Fi Kencang', en: 'Fast Wi-Fi' }, icon: 'wifi' },
            { id: 'smoking', label: { id: 'Area Smoking', en: 'Smoking Area' }, icon: 'cigarette' },
            { id: 'mushola', label: { id: 'Ada Mushola', en: 'Prayer Room' }, icon: 'moon' }
        ],
        searchQuery: '',
        selectedCategories: [],
        selectedBudget: null,
        isOpenNow: false,
        is24Hours: false,
        selectedZone: null,
        selectedFacilities: [],
        sortBy: 'nearest',
        limit: 12,
        fuse: null,
        
        init() {
            // Setup Fuse
            const options = {
                keys: ['name', 'tags', 'category', 'description'],
                threshold: 0.3
            };
            this.fuse = new Fuse(allPlaces, options);
            
            // Watch for changes to update lucide icons
            this.$watch('selectedCategories', () => this.refreshIcons());
            this.$watch('selectedBudget', () => this.refreshIcons());
            this.$watch('isOpenNow', () => this.refreshIcons());
            this.$watch('is24Hours', () => this.refreshIcons());
            this.$watch('selectedZone', () => this.refreshIcons());
            this.$watch('selectedFacilities', () => this.refreshIcons());
            this.$watch('sortBy', () => this.refreshIcons());
            this.$watch('limit', () => this.refreshIcons());
            this.$watch('searchQuery', () => this.refreshIcons());

            setTimeout(() => {
                this.initDragScroll();
            }, 100);
        },

        refreshIcons() {
            setTimeout(() => {
                if (window.lucide) lucide.createIcons();
            }, 10);
        },
        
        get isFacilityFilterVisible() {
            return this.selectedCategories.includes('food-restaurant') || this.selectedCategories.includes('food-cafe-wifi');
        },
        
        get hasActiveFilters() {
            return this.searchQuery.trim().length > 0 || 
                   this.selectedCategories.length > 0 || 
                   this.selectedBudget !== null || 
                   this.isOpenNow || 
                   this.is24Hours || 
                   this.selectedZone !== null || 
                   this.selectedFacilities.length > 0;
        },
        
        get filteredPlaces() {
            let results = allPlaces;
            
            if (this.searchQuery.trim().length > 0) {
                results = this.fuse.search(this.searchQuery).map(res => res.item);
            }
            
            results = results.filter(place => {
                if (this.selectedCategories.length > 0 && !this.selectedCategories.includes(place.category)) return false;
                if (this.selectedBudget !== null && place.price_range !== this.selectedBudget) return false;
                if (this.isOpenNow && !isPlaceOpenNow(place)) return false;
                if (this.is24Hours && !(place.hours && (place.hours.toLowerCase().includes('24 jam') || place.hours.toLowerCase().includes('setiap hari 00.00–24.00')))) return false;
                if (this.selectedZone !== null && place.zone !== this.selectedZone) return false;
                if (this.selectedFacilities.length > 0) {
                    if (!place.facilities) return false;
                    for (const fac of this.selectedFacilities) {
                        if (!place.facilities.includes(fac)) return false;
                    }
                }
                return true;
            });
            
            if (this.sortBy === 'cheapest') {
                results.sort((a, b) => (a.price_range || 3) - (b.price_range || 3));
            } else if (this.sortBy === 'highest_rated') {
                results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            }
            
            if (this.limit !== 'all') {
                results = results.slice(0, this.limit);
            }
            
            return results;
        },
        
        toggleCategory(key) {
            if (this.selectedCategories.includes(key)) {
                this.selectedCategories = this.selectedCategories.filter(k => k !== key);
            } else {
                this.selectedCategories.push(key);
            }
        },
        
        toggleFacility(id) {
            if (this.selectedFacilities.includes(id)) {
                this.selectedFacilities = this.selectedFacilities.filter(f => f !== id);
            } else {
                this.selectedFacilities.push(id);
            }
        },
        
        clearFilters() {
            this.searchQuery = '';
            this.selectedCategories = [];
            this.selectedBudget = null;
            this.isOpenNow = false;
            this.is24Hours = false;
            this.selectedZone = null;
            this.selectedFacilities = [];
        },

        getSearchPlaceholder() {
            const placeholders = TRANSLATIONS[currentLang].search_placeholders;
            // Static placeholder for simplicity, rotating placeholder logic can be added later
            return placeholders[0];
        },
        
        getPriceLabel(priceRange) {
            switch (priceRange) {
                case 1: return '< 15k';
                case 2: return '15–35k';
                case 3: return '> 35k';
                default: return '';
            }
        },
        
        getSortLabel(sortValue) {
            if (currentLang === 'id') {
                if (sortValue === 'nearest') return 'Terdekat';
                if (sortValue === 'cheapest') return 'Termurah';
                if (sortValue === 'highest_rated') return 'Rating Tertinggi';
            } else {
                if (sortValue === 'nearest') return 'Nearest';
                if (sortValue === 'cheapest') return 'Cheapest';
                if (sortValue === 'highest_rated') return 'Highest Rated';
            }
            return '';
        },

        initDragScroll() {
            const slider = document.getElementById('category-pills');
            if (slider) {
                let isDown = false;
                let startX;
                let scrollLeft;

                slider.addEventListener('mousedown', (e) => {
                    isDown = true;
                    slider.style.cursor = 'grabbing';
                    startX = e.pageX - slider.offsetLeft;
                    scrollLeft = slider.scrollLeft;
                });
                slider.addEventListener('mouseleave', () => {
                    isDown = false;
                    slider.style.cursor = 'grab';
                });
                slider.addEventListener('mouseup', () => {
                    isDown = false;
                    slider.style.cursor = 'grab';
                });
                slider.addEventListener('mousemove', (e) => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - slider.offsetLeft;
                    const walk = (x - startX) * 2;
                    slider.scrollLeft = scrollLeft - walk;
                });

                const updateScrollMask = () => {
                    const { scrollLeft, scrollWidth, clientWidth } = slider;
                    const canScrollLeft = scrollLeft > 0;
                    const canScrollRight = Math.ceil(scrollLeft + clientWidth) < scrollWidth;

                    const wrapper = slider.parentElement;
                    wrapper.classList.toggle('mask-left', canScrollLeft && !canScrollRight);
                    wrapper.classList.toggle('mask-right', !canScrollLeft && canScrollRight);
                    wrapper.classList.toggle('mask-both', canScrollLeft && canScrollRight);
                };

                slider.addEventListener('scroll', updateScrollMask);
                window.addEventListener('resize', updateScrollMask);
                updateScrollMask();
                
                const isMobile = window.innerWidth <= 640;
                if (typeof Lenis !== 'undefined' && !isMobile) {
                    const content = document.getElementById('category-pills-inner');
                    if (content) {
                        const lenis = new Lenis({
                            wrapper: slider,
                            content: content,
                            orientation: 'horizontal',
                            gestureOrientation: 'both',
                            smoothWheel: true,
                            wheelMultiplier: 1.2
                        });
                        function raf(time) {
                            lenis.raf(time);
                            requestAnimationFrame(raf);
                        }
                        requestAnimationFrame(raf);
                    }
                }
            }
        }
    }));
});
"""

# replace DOMContentLoaded internals
dom_ready_pattern = r"document.addEventListener\('DOMContentLoaded', \(\) => \{.*?\n\}\);"
new_dom_ready = """document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setLanguage(currentLang);

    // Fetch places
    fetch('data/places.json')
        .then(res => res.json())
        .then(data => {
            allPlaces = data;
            populateHeroStats();
            
            // Dispatch custom event if Alpine is already loaded, or wait for it
            document.dispatchEvent(new CustomEvent('places-loaded'));

            if (window.lucide) {
                lucide.createIcons();
            }
        })
        .catch(err => {
            console.error('Error fetching places:', err);
        });
});

// Search KBD shortcut global
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        const searchInput = document.getElementById('search-input');
        if (searchInput && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    }
});
"""

content = re.sub(dom_ready_pattern, new_dom_ready, content, flags=re.DOTALL)
content += "\n" + alpine_init

with open(js_path, "w") as f:
    f.write(content)

print("js/main.js patched")
