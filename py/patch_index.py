import os
import re

# Resolve paths relative to the script's parent directory (project root)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
index_path = os.path.join(BASE_DIR, "index.html")

with open(index_path, "r") as f:
    content = f.read()

filter_bar_start = content.find('<div id="filter-bar" class="filter-bar">')
filter_bar_end = content.find('</div>\n    </div>\n\n    <script')

if filter_bar_start == -1 or filter_bar_end == -1:
    print("Could not find filter-bar boundaries")
    exit(1)

new_filter_bar = """<div id="filter-bar" class="filter-bar" x-data="filterSystem()">
        <div class="filter-container">
            <!-- Search Row -->
            <div class="search-wrapper">
                <input type="text" id="search-input" class="search-input"
                    x-model="searchQuery"
                    :placeholder="getSearchPlaceholder()"
                    autocomplete="off">
                <kbd class="search-kbd" id="search-kbd" aria-hidden="true">Ctrl + K</kbd>
            </div>

            <!-- Category Pills Row -->
            <div class="category-pills-wrapper" id="category-pills-wrapper">
                <div id="category-pills" class="category-pills" data-lenis-prevent>
                    <div id="category-pills-inner" class="category-pills-inner">
                        <template x-for="(cat, key) in categories" :key="key">
                            <button class="category-pill" 
                                :class="selectedCategories.includes(key) ? 'active' : ''"
                                @click="toggleCategory(key)">
                                <i :data-lucide="cat.icon" class="icon-sm"></i>
                                <span x-text="cat.label[currentLang]"></span>
                            </button>
                        </template>
                    </div>
                </div>
            </div>
            
            <!-- Secondary Filters Row (Zones, Operational, Budget) -->
            <div class="secondary-filters-row" style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.5rem; margin-top: 0.5rem;">
                <!-- Zones -->
                <div class="custom-dropdown" x-data="{ open: false }" @click.away="open = false">
                    <button class="dropdown-trigger" @click="open = !open" :aria-expanded="open">
                        <i data-lucide="map-pin" class="icon-xs"></i>
                        <span x-text="selectedZone ? selectedZone : (currentLang === 'id' ? 'Semua Area' : 'All Zones')"></span>
                        <i data-lucide="chevron-down" class="icon-xs dropdown-arrow"></i>
                    </button>
                    <div class="dropdown-menu" :class="open ? 'show' : ''">
                        <div class="dropdown-option" :class="!selectedZone ? 'active' : ''" @click="selectedZone = null; open = false">
                            <span x-text="currentLang === 'id' ? 'Semua Area' : 'All Zones'"></span>
                        </div>
                        <template x-for="zone in zones" :key="zone">
                            <div class="dropdown-option" :class="selectedZone === zone ? 'active' : ''" @click="selectedZone = zone; open = false" x-text="zone"></div>
                        </template>
                    </div>
                </div>

                <!-- Budget -->
                <div class="price-filters" style="display: flex; gap: 0.5rem;">
                    <template x-for="price in [1, 2, 3]" :key="price">
                        <button class="price-btn"
                            :class="selectedBudget === price ? 'active' : ''"
                            @click="selectedBudget = selectedBudget === price ? null : price"
                            x-text="getPriceLabel(price)">
                        </button>
                    </template>
                </div>

                <!-- Operational Status -->
                <button class="open-now-btn" :class="isOpenNow ? 'active' : ''" @click="isOpenNow = !isOpenNow">
                    <i data-lucide="clock" class="icon-xs"></i> 
                    <span x-text="currentLang === 'id' ? 'Buka Sekarang' : 'Open Now'"></span>
                </button>
                <button class="open-now-btn" :class="is24Hours ? 'active' : ''" @click="is24Hours = !is24Hours">
                    <i data-lucide="moon" class="icon-xs"></i> 
                    <span>24 Jam</span>
                </button>
            </div>

            <!-- Dynamic Facilities Row -->
            <div class="facilities-row" x-show="isFacilityFilterVisible" x-transition style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
                <template x-for="facility in facilitiesList" :key="facility.id">
                    <button class="category-pill" 
                        :class="selectedFacilities.includes(facility.id) ? 'active' : ''"
                        @click="toggleFacility(facility.id)">
                        <i :data-lucide="facility.icon" class="icon-xs"></i>
                        <span x-text="facility.label[currentLang]"></span>
                    </button>
                </template>
            </div>

            <!-- Control Row -->
            <div class="filter-actions" style="justify-content: space-between; width: 100%; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 1rem; margin-top: 0.5rem;">
                
                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <!-- Sort By -->
                    <div class="settings-wrapper">
                        <label class="settings-label">
                            <i data-lucide="arrow-down-up" class="icon-sm"></i> <span x-text="currentLang === 'id' ? 'Urutkan:' : 'Sort by:'"></span>
                        </label>
                        <div class="custom-dropdown" x-data="{ open: false }" @click.away="open = false">
                            <button class="dropdown-trigger" @click="open = !open" :aria-expanded="open">
                                <span x-text="getSortLabel(sortBy)"></span>
                                <i data-lucide="chevron-down" class="icon-xs dropdown-arrow"></i>
                            </button>
                            <div class="dropdown-menu" :class="open ? 'show' : ''">
                                <div class="dropdown-option" :class="sortBy === 'nearest' ? 'active' : ''" @click="sortBy = 'nearest'; open = false" x-text="currentLang === 'id' ? 'Terdekat' : 'Nearest'"></div>
                                <div class="dropdown-option" :class="sortBy === 'cheapest' ? 'active' : ''" @click="sortBy = 'cheapest'; open = false" x-text="currentLang === 'id' ? 'Termurah' : 'Cheapest'"></div>
                                <div class="dropdown-option" :class="sortBy === 'highest_rated' ? 'active' : ''" @click="sortBy = 'highest_rated'; open = false" x-text="currentLang === 'id' ? 'Rating Tertinggi' : 'Highest Rated'"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Limit -->
                    <div class="settings-wrapper">
                        <label class="settings-label">
                            <i data-lucide="settings-2" class="icon-sm"></i> <span x-text="currentLang === 'id' ? 'Tampilkan:' : 'Show:'"></span>
                        </label>
                        <div class="custom-dropdown" x-data="{ open: false }" @click.away="open = false">
                            <button class="dropdown-trigger" @click="open = !open" :aria-expanded="open">
                                <span x-text="limit === 'all' ? (currentLang === 'id' ? 'Semua' : 'All') : limit"></span>
                                <i data-lucide="chevron-down" class="icon-xs dropdown-arrow"></i>
                            </button>
                            <div class="dropdown-menu" :class="open ? 'show' : ''">
                                <template x-for="val in [12, 24, 36, 'all']" :key="val">
                                    <div class="dropdown-option" :class="limit === val ? 'active' : ''" @click="limit = val; open = false">
                                        <span x-text="val === 'all' ? (currentLang === 'id' ? 'Semua' : 'All') : val"></span>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <button class="clear-filters-btn" :class="hasActiveFilters ? 'is-visible' : ''" @click="clearFilters()">
                    <i data-lucide="x" class="icon-xs"></i> 
                    <span x-text="currentLang === 'id' ? 'Hapus Filter' : 'Clear Filters'"></span>
                </button>
            </div>
"""

new_content = content[:filter_bar_start] + new_filter_bar + content[filter_bar_end:]

# Add Alpine and Fuse.js scripts
script_injection = """
    <script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>"""
new_content = new_content.replace('<script src="https://unpkg.com/lucide@latest"></script>', script_injection)

with open(index_path, "w") as f:
    f.write(new_content)

print("index.html patched")
