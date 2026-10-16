# Artemis II Space Exploration

## Struktur file
- `index.html`: struktur dan konten halaman
- `css/style.css`: CSS kustom
- `js/tailwind-config.js`: konfigurasi tema Tailwind CSS
- `js/main.js`: animasi GSAP, smooth scroll Lenis, progress bar, dan flywheel timeline
- `assets/images/`: logo, foto kru, dan background halaman yang dipakai secara lokal

## Cara menjalankan
Buka folder ini di VS Code, lalu jalankan `index.html` menggunakan ekstensi Live Server. Koneksi internet diperlukan karena Tailwind CSS, GSAP, ScrollTrigger, Lenis, Iconify, font, dan beberapa gambar masih dimuat dari CDN/URL eksternal.

Catatan: class utility Tailwind dan beberapa custom property seperti `--deg` tetap berada di HTML karena menjadi bagian dari markup/konfigurasi tiap elemen. Koneksi internet masih dibutuhkan untuk Tailwind, GSAP, ScrollTrigger, Lenis, Iconify, dan font; foto serta logo sudah dibundel di `assets/images/`.
