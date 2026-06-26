(function () {
    /* ------------------------------------------------------------
       State
       ------------------------------------------------------------ */
    let currentLang = localStorage.getItem('lang') || 'id';
    let allPlaces = [];

    function isPlaceOpenNow(place) {
        if (!place.hours) return true;
        if (place.hours.is_24_hours) return true;
        if (!place.hours.open || !place.hours.close) return false;

        // Evaluate against Asia/Jakarta (WIB) timezone
        const nowWIB = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
        const currentTimeMinutes = nowWIB.getHours() * 60 + nowWIB.getMinutes();

        const [openH, openM] = place.hours.open.split(':').map(Number);
        const [closeH, closeM] = place.hours.close.split(':').map(Number);

        const startMins = openH * 60 + openM;
        let endMins = closeH * 60 + closeM;

        if (endMins <= startMins) {
            endMins += 24 * 60; // Ends next day
        }

        let adjCurrentMins = currentTimeMinutes;
        if (adjCurrentMins < startMins && endMins > 24 * 60) {
            adjCurrentMins += 24 * 60;
        }

        return adjCurrentMins >= startMins && adjCurrentMins <= endMins;
    }


    /* ============================================================
       Language
       ============================================================ */
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

        const searchInput = document.getElementById('search-input');
        if (searchInput && dict.search_placeholders) {
            searchInput.placeholder = dict.search_placeholders[0];
        }

        if (allPlaces.length > 0) {
            populateHeroStats();
        }
        window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    /* ============================================================
       Theme Building
       ============================================================ */
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
        icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        if (window.lucide) lucide.createIcons();
    }

    /* ============================================================
       Hero Data Population
       ============================================================ */
    function populateHeroStats() {
        const listingCountEl = document.getElementById('hero-listing-count');
        const categoryCountEl = document.getElementById('hero-category-count');
        const lastUpdatedEl = document.getElementById('hero-last-updated');

        const footerListingCountEl = document.getElementById('footer-listing-count');
        const footerCategoryCountEl = document.getElementById('footer-category-count');
        const footerLastUpdatedEl = document.getElementById('footer-last-updated');

        if (listingCountEl) listingCountEl.textContent = allPlaces.length;
        if (footerListingCountEl) footerListingCountEl.textContent = allPlaces.length;

        const uniqueCategories = new Set(allPlaces.map(p => p.category));
        if (categoryCountEl) categoryCountEl.textContent = uniqueCategories.size;
        if (footerCategoryCountEl) footerCategoryCountEl.textContent = uniqueCategories.size;

        const dateTimestamps = allPlaces.map(p => new Date(p.last_updated || 0).getTime());
        const latestTime = Math.max(...dateTimestamps.filter(t => !isNaN(t)));
        if (isNaN(latestTime) || latestTime === -Infinity) {
            if (lastUpdatedEl) lastUpdatedEl.textContent = '—';
            if (footerLastUpdatedEl) footerLastUpdatedEl.textContent = '—';
            return;
        }
        const latestDate = new Date(latestTime);

        const options = { year: 'numeric', month: 'short' };
        const dateStr = latestDate.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', options);

        if (lastUpdatedEl) lastUpdatedEl.textContent = dateStr;
        if (footerLastUpdatedEl) footerLastUpdatedEl.textContent = dateStr;


    }



    /* ============================================================
       Search & Filter Bar
       ============================================================ */



    /* ============================================================
       Initialization
       ============================================================ */
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        setLanguage(currentLang);

        // Attach UI Event Listeners
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

        const langIdBtn = document.getElementById('lang-id');
        if (langIdBtn) langIdBtn.addEventListener('click', () => setLanguage('id'));

        const langEnBtn = document.getElementById('lang-en');
        if (langEnBtn) langEnBtn.addEventListener('click', () => setLanguage('en'));

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

        if (typeof Lenis !== 'undefined') {
            const globalLenis = new Lenis();
            function rafGlobal(time) {
                globalLenis.raf(time);
                requestAnimationFrame(rafGlobal);
            }
            requestAnimationFrame(rafGlobal);
        }
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


    document.addEventListener('alpine:init', () => {
        Alpine.data('filterSystem', () => ({
            currentLang: localStorage.getItem('lang') || 'id',
            currentPlaceholder: '',
            categories: CATEGORIES,
            zones: ['Ciseke', 'GKPN', 'Jalan Sayang', 'Jatos / Raya Jatinangor', 'Hegarmanah'],
            searchQuery: '',
            selectedCategories: [],
            selectedBudget: null,
            isOpenNow: false,
            is24Hours: false,
            selectedZone: null,
            sortBy: 'default',
            limit: 12,
            fuse: null,

            init() {
                window.addEventListener('language-changed', (e) => {
                    this.currentLang = e.detail.lang;
                    this.updatePlaceholder();
                });
                this.updatePlaceholder();

                setInterval(() => {
                    if (document.activeElement !== document.getElementById('search-input')) {
                        this.rotatePlaceholder();
                    }
                }, 3000);

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
                this.$watch('sortBy', () => this.refreshIcons());
                this.$watch('limit', () => this.refreshIcons());

                setTimeout(() => {
                    this.initDragScroll();
                }, 100);
            },

            refreshIcons() {
                this.$nextTick(() => {
                    if (window.lucide) lucide.createIcons();
                });
            },


            get hasActiveFilters() {
                return this.searchQuery.trim().length > 0 ||
                    this.selectedCategories.length > 0 ||
                    this.selectedBudget !== null ||
                    this.isOpenNow ||
                    this.is24Hours ||
                    this.selectedZone !== null;
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
                    if (this.is24Hours && (!place.hours || !place.hours.is_24_hours)) return false;
                    if (this.selectedZone !== null && place.zone !== this.selectedZone) return false;
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


            clearFilters() {
                this.searchQuery = '';
                this.selectedCategories = [];
                this.selectedBudget = null;
                this.isOpenNow = false;
                this.is24Hours = false;
                this.selectedZone = null;
            },

            updatePlaceholder() {
                const placeholders = TRANSLATIONS[this.currentLang].search_placeholders;
                if (!this.currentPlaceholder || !placeholders.includes(this.currentPlaceholder)) {
                    this.currentPlaceholder = placeholders[0];
                }
            },

            rotatePlaceholder() {
                const placeholders = TRANSLATIONS[this.currentLang].search_placeholders;
                const currentIndex = placeholders.indexOf(this.currentPlaceholder);
                const nextIndex = (currentIndex + 1) % placeholders.length;
                this.currentPlaceholder = placeholders[nextIndex];
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
                if (this.currentLang === 'id') {
                    if (sortValue === 'default') return 'Relevan';
                    if (sortValue === 'cheapest') return 'Termurah';
                    if (sortValue === 'highest_rated') return 'Rating';
                } else {
                    if (sortValue === 'default') return 'Default';
                    if (sortValue === 'cheapest') return 'Cheapest';
                    if (sortValue === 'highest_rated') return 'Rating';
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

                    let isTicking = false;
                    const updateScrollMask = () => {
                        if (!isTicking) {
                            window.requestAnimationFrame(() => {
                                const { scrollLeft, scrollWidth, clientWidth } = slider;
                                const canScrollLeft = scrollLeft > 0;
                                const canScrollRight = Math.ceil(scrollLeft + clientWidth) < scrollWidth;

                                const wrapper = slider.parentElement;
                                wrapper.classList.toggle('mask-left', canScrollLeft && !canScrollRight);
                                wrapper.classList.toggle('mask-right', !canScrollLeft && canScrollRight);
                                wrapper.classList.toggle('mask-both', canScrollLeft && canScrollRight);
                                isTicking = false;
                            });
                            isTicking = true;
                        }
                    };

                    slider.addEventListener('scroll', updateScrollMask, { passive: true });
                    window.addEventListener('resize', updateScrollMask, { passive: true });
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
})();
