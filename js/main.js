(function () {
    /* ------------------------------------------------------------
       State
       ------------------------------------------------------------ */
    let currentLang = localStorage.getItem('lang') || 'id';
    let allPlaces = [];

    function isPlaceOpenNow(place, nowWIB) {
        if (!place.hours) return true;
        if (place.hours.is_24_hours) return true;
        if (!place.hours.open || !place.hours.close) return false;

        // Evaluate against Asia/Jakarta (WIB) timezone
        nowWIB = nowWIB || new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
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
                document.dispatchEvent(new CustomEvent('places-error'));
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
            _placeholderIndex: 0,
            hasError: false,
            categories: CATEGORIES,
            zones: ['Ciseke', 'Cikeruh', 'Jalan Sayang'],
            searchQuery: '',
            selectedCategories: [],
            selectedBudget: null,
            isOpenNow: false,
            is24Hours: false,
            selectedZone: null,
            sortBy: 'default',
            limit: 12,
            viewMode: localStorage.getItem('viewMode') || 'grid',
            fuse: null,
            places: [],

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



                // Setup Fuse options
                const options = {
                    keys: ['name', 'category', 'description'],
                    threshold: 0.3
                };
                this.fuse = new Fuse(this.places, options);

                // Listen for fetched data
                document.addEventListener('places-loaded', () => {
                    this.places = allPlaces;
                    this.fuse = new Fuse(this.places, options);
                });

                // Watch for changes to update lucide icons
                this.$watch('selectedCategories', () => this.refreshIcons());
                this.$watch('selectedBudget', () => this.refreshIcons());
                this.$watch('isOpenNow', () => this.refreshIcons());
                this.$watch('is24Hours', () => this.refreshIcons());
                this.$watch('selectedZone', () => this.refreshIcons());
                this.$watch('sortBy', () => this.refreshIcons());
                this.$watch('limit', () => this.refreshIcons());
                this.$watch('viewMode', (value) => {
                    localStorage.setItem('viewMode', value);
                    this.refreshIcons();
                });

                this.$nextTick(() => {
                    this.initDragScroll();
                });
            },

            refreshIcons() {
                this.$nextTick(() => {
                    if (window.lucide) lucide.createIcons({ root: this.$root });
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
                let results = this.places;

                if (this.searchQuery.trim().length > 0 && this.fuse) {
                    results = this.fuse.search(this.searchQuery).map(res => res.item);
                }

                const nowWIB = this.isOpenNow || this.sortBy === 'default' /* if needed */
                    ? new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }))
                    : null;

                results = results.filter(place => {
                    if (this.selectedCategories.length > 0 && !this.selectedCategories.includes(place.category)) return false;
                    if (this.selectedBudget !== null && place.price_range !== this.selectedBudget) return false;
                    if (this.isOpenNow && !isPlaceOpenNow(place, nowWIB)) return false;
                    if (this.is24Hours && (!place.hours || !place.hours.is_24_hours)) return false;
                    if (this.selectedZone !== null && place.zone !== this.selectedZone) return false;
                    return true;
                });

                if (this.sortBy === 'cheapest') {
                    results.sort((a, b) => (a.price_range || 3) - (b.price_range || 3));
                } else if (this.sortBy === 'highest_rated') {
                    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                } else if (this.sortBy === 'alphabetical_asc') {
                    results.sort((a, b) => a.name.localeCompare(b.name));
                } else if (this.sortBy === 'alphabetical_desc') {
                    results.sort((a, b) => b.name.localeCompare(a.name));
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
                this._placeholderIndex = 0;
                this.currentPlaceholder = placeholders[this._placeholderIndex];
            },

            rotatePlaceholder() {
                const placeholders = TRANSLATIONS[this.currentLang].search_placeholders;
                this._placeholderIndex = (this._placeholderIndex + 1) % placeholders.length;
                this.currentPlaceholder = placeholders[this._placeholderIndex];
            },

            getPriceLabel(priceRange) {
                switch (priceRange) {
                    case 1: return '< 15k';
                    case 2: return '15–35k';
                    case 3: return '> 35k';
                    default: return '';
                }
            },

            getPriceSymbol(priceRange) {
                switch (priceRange) {
                    case 1: return 'Rp';
                    case 2: return 'Rp Rp';
                    case 3: return 'Rp Rp Rp';
                    default: return '';
                }
            },

            isPlaceOpen(place) {
                return isPlaceOpenNow(place);
            },

            formatDate(dateString) {
                if (!dateString) return '';
                const date = new Date(dateString);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = String(date.getFullYear()).slice(-2);
                return `${day}/${month}/${year}`;
            },

            getSortLabel(sortValue) {
                if (!window.TRANSLATIONS) return '';
                const t = window.TRANSLATIONS[this.currentLang];
                if (sortValue === 'default') return t.sort_default;
                if (sortValue === 'cheapest') return t.sort_cheapest;
                if (sortValue === 'highest_rated') return t.sort_rating;
                if (sortValue === 'alphabetical_asc') return t.sort_az;
                if (sortValue === 'alphabetical_desc') return t.sort_za;
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

                    updateScrollMask();
                }
            }
        }));
    });

    // Initialize Lenis for smooth scrolling
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        window.lenis = lenis;

        // Subtle parallax effects for big site elements
        const heroInner = document.querySelector('.hero-inner');
        const heroGridWrapper = document.querySelector('.hero-grid-wrapper');
        const filterBar = document.querySelector('.filter-bar');

        const siteFooter = document.querySelector('.site-footer');
        const footerGrid = document.querySelector('.footer-grid');

        lenis.on('scroll', (e) => {
            const scrollY = e.animatedScroll;
            if (heroInner) {
                heroInner.style.transform = `translateY(${scrollY * 0.35}px)`;
                // Fade out content as we scroll down to create a blue fade effect (longer fade)
                heroInner.style.opacity = Math.max(0, 1 - (scrollY / 650));
            }
            if (heroGridWrapper) heroGridWrapper.style.transform = `translateY(${scrollY * 0.15}px)`;
            if (filterBar) filterBar.style.transform = `translateY(${-scrollY * 0.03}px)`;

            // Footer parallax
            if (siteFooter && footerGrid) {
                const footerRect = siteFooter.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                // Check if footer is in viewport
                if (footerRect.top < windowHeight) {
                    const visibleAmount = windowHeight - footerRect.top;
                    const progress = Math.max(0, Math.min(1, visibleAmount / footerRect.height));
                    // Start pushed down by 60px and slide up to 0 as it becomes fully visible
                    footerGrid.style.transform = `translateY(${(1 - progress) * 60}px)`;
                    footerGrid.style.opacity = progress * 1.5; // Slight fade in
                }
            }
        });

        // Double Lenis for horizontal pills
        const slider = document.getElementById('category-pills');
        const lenisPills = slider ? new Lenis({
            wrapper: slider,
            content: slider.querySelector('.category-pills-inner'),
            orientation: 'horizontal',
            gestureOrientation: 'both',
            direction: 'horizontal',
            gestureDirection: 'both',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        }) : null;

        function raf(time) {
            lenis.raf(time);
            if (lenisPills) lenisPills.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }
})();
