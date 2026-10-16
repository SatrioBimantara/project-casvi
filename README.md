# Satrio & Casviana | Our Universe

## Struktur file
- `index.html`: struktur dan konten halaman
- `css/style.css`: CSS kustom
- `js/tailwind-config.js`: konfigurasi tema Tailwind CSS
- `js/main.js`: animasi GSAP, smooth scroll Lenis, progress bar, dan flywheel timeline
- `assets/images/`: foto personal dan background halaman yang dipakai secara lokal
- `DESIGN.md`: arah desain, aturan layout, tipografi, warna, motion, dan voice

## Cara menjalankan
Buka folder ini di VS Code, lalu jalankan `index.html` menggunakan ekstensi Live Server. Koneksi internet dibutuhkan untuk Tailwind CSS, GSAP, ScrollTrigger, Lenis, Iconify, dan font dari CDN. Seluruh foto dan musik yang dipakai halaman berada di folder lokal.

Catatan: class utility Tailwind dan beberapa custom property seperti `--deg` tetap berada di HTML karena menjadi bagian dari markup atau konfigurasi tiap elemen. Koneksi internet masih dibutuhkan untuk Tailwind, GSAP, ScrollTrigger, Lenis, Iconify, dan font. Jika layanan animasi gagal dimuat, halaman tetap menyediakan fallback scroll native dan interaksi manual.
