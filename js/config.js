/* ============================================================
   Configuration Data (Immutable)
   ============================================================ */

const TRANSLATIONS = Object.freeze({
    id: Object.freeze({
        "hero_tagline": "Apapun yang kamu butuhkan di Jatinangor, dari mahasiswa, untuk mahasiswa.",
        "hero_subtitle": "Panduan tempat-tempat penting di sekitar kampus ITB Jatinangor dan Unpad.",
        "hero_stat_listings": "Lokasi",
        "hero_stat_categories": "Kategori",
        "hero_stat_updated": "Terakhir Diperbarui",
        "search_placeholders": Object.freeze([
            "Cari laundry murah...",
            "Cari tempat print...",
            "Cari kopi buat nugas...",
            "Cari apotek 24 jam...",
            "Cari kos dekat ITB..."
        ]),
        "open_now": "Buka Sekarang",
        "clear_filters": "Hapus Filter",
        "show_label": "Tampilkan:",
        "show_all": "Semua",
        "footer_heading_stats": "Statistik Direktori",
        "footer_stat_listings": "Lokasi",
        "footer_stat_categories": "Kategori",
        "footer_updated": "Terakhir diperbarui:",
        "footer_heading_contribute": "Kontribusi",
        "footer_github": "Lihat di GitHub",
        "footer_submit_link": "Tambahkan Lokasi Baru",
        "footer_heading_about": "Tentang",
        "footer_about_desc": "Proyek open-source oleh mahasiswa STEI-K ITB untuk membantu navigasi kehidupan kampus di Jatinangor.",
        "footer_credits": "Dibuat oleh Haidar",
        "footer_back_top": "Kembali ke Atas",
        "filter_all_zones": "Semua Area",
        "filter_24_hours": "24 Jam",
        "sort_label": "Urutkan:",
        "sort_default": "Relevan",
        "sort_cheapest": "Termurah",
        "sort_rating": "Rating",
        "status_open": "Buka",
        "status_closed": "Tutup",
        "empty_title": "Tidak ada tempat ditemukan",
        "empty_desc": "Coba ubah kata kunci atau hapus beberapa filter.",
        "empty_reset": "Hapus Filter",
        "count_showing": "Menampilkan",
        "count_places": "tempat",
        "count_of": "dari",
        "card_maps_link": "Buka di Maps"
    }),
    en: Object.freeze({
        "hero_tagline": "Everything you need in Jatinangor, by students, for students.",
        "hero_subtitle": "A guide to essential places around ITB Jatinangor and Unpad campuses.",
        "hero_stat_listings": "Places",
        "hero_stat_categories": "Categories",
        "hero_stat_updated": "Last Updated",
        "search_placeholders": Object.freeze([
            "Search for cheap laundry...",
            "Search for printing shops...",
            "Search for study cafes...",
            "Search for 24hr pharmacies...",
            "Search for boarding houses..."
        ]),
        "open_now": "Open Now",
        "clear_filters": "Clear Filters",
        "show_label": "Show:",
        "show_all": "All",
        "footer_heading_stats": "Directory Stats",
        "footer_stat_listings": "Places",
        "footer_stat_categories": "Categories",
        "footer_updated": "Last updated:",
        "footer_heading_contribute": "Contribute",
        "footer_github": "View on GitHub",
        "footer_submit_link": "Submit a New Place",
        "footer_heading_about": "About",
        "footer_about_desc": "An open-source project by ITB STEI-K students to help navigate campus life in Jatinangor.",
        "footer_credits": "Built by Haidar",
        "footer_back_top": "Back to Top",
        "filter_all_zones": "All Zones",
        "filter_24_hours": "24 Hours",
        "sort_label": "Sort by:",
        "sort_default": "Default",
        "sort_cheapest": "Cheapest",
        "sort_rating": "Rating",
        "status_open": "Open",
        "status_closed": "Closed",
        "empty_title": "No places found",
        "empty_desc": "Try changing your keywords or removing some filters.",
        "empty_reset": "Clear Filters",
        "count_showing": "Showing",
        "count_places": "places",
        "count_of": "of",
        "card_maps_link": "Open in Maps"
    })
});

const CATEGORIES = Object.freeze({
    'food-cheap': Object.freeze({ label: Object.freeze({ en: 'Warteg & Warung', id: 'Warteg & Warung' }), icon: 'utensils' }),
    'food-restaurant': Object.freeze({ label: Object.freeze({ en: 'Restaurants & Cafes', id: 'Restoran & Kafe' }), icon: 'chef-hat' }),
    'food-cafe-wifi': Object.freeze({ label: Object.freeze({ en: 'Study Cafes', id: 'Kafe Tugas' }), icon: 'coffee' }),
    'food-drinks': Object.freeze({ label: Object.freeze({ en: 'Drinks & Snacks', id: 'Minuman & Jajanan' }), icon: 'cup-soda' }),
    'printing': Object.freeze({ label: Object.freeze({ en: 'Printing & Photocopy', id: 'Fotokopi & Print' }), icon: 'printer' }),
    'stationery': Object.freeze({ label: Object.freeze({ en: 'Stationery & Supplies', id: 'Alat Tulis (ATK)' }), icon: 'pencil' }),
    'daily-needs': Object.freeze({ label: Object.freeze({ en: 'Daily Needs', id: 'Kebutuhan Harian' }), icon: 'shopping-basket' }),
    'services': Object.freeze({ label: Object.freeze({ en: 'Services', id: 'Servis' }), icon: 'wrench' })
});

window.TRANSLATIONS = TRANSLATIONS;
window.CATEGORIES = CATEGORIES;
