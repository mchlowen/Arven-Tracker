ARVEN TRACKER — SAFARI / iPHONE PWA

PENTING:
- PWA memerlukan secure origin (HTTPS) untuk instalasi Home Screen dan Service Worker.
- File ini tidak bisa dipasang langsung dengan membuka index.html dari aplikasi Files.
- Setelah pertama kali dibuka melalui HTTPS dan ditambahkan ke Home Screen, app shell dapat berjalan offline.
- Data transaksi disimpan di IndexedDB pada browser/perangkat ini.
- Backup JSON harus dibuat dan disimpan secara berkala.
- PIN adalah access gate aplikasi, bukan pengganti passcode iPhone atau enkripsi perangkat.
- Jangan menghapus website data Safari sebelum membuat backup.

CARA MEMASANG:
1. Unggah seluruh isi folder ini ke static hosting yang menyediakan HTTPS (misalnya GitHub Pages atau Cloudflare Pages).
2. Buka URL situs tersebut di Safari pada iPhone.
3. Tunggu sampai halaman termuat penuh sekali dengan koneksi internet.
4. Tekan tombol Share di Safari.
5. Pilih "Add to Home Screen" / "Tambahkan ke Layar Utama".
6. Aktifkan "Open as Web App" jika opsi tersedia, lalu tekan Add.
7. Buka ikon ARVEN dari Home Screen.
8. Masuk ke Settings > Atur / ubah PIN untuk membuat PIN 6 digit.

CATATAN PRIVASI:
- Aplikasi tidak mengirim transaksi ke API atau database cloud.
- Hosting hanya menyajikan file aplikasi statis.
- Font eksternal Google Fonts dipakai sebagai peningkatan visual; jika offline font sistem akan digunakan.
- Untuk penggunaan yang lebih privat, self-host font atau hapus import Google Fonts di styles.css.

FITUR:
- Dashboard cash flow bulanan
- Tambah transaksi pemasukan/pengeluaran
- Breakdown pengeluaran berdasarkan kategori
- Anggaran per kategori
- PIN lokal
- Ekspor dan impor JSON
- Cache app shell untuk akses offline

VERSI INI ADALAH STARTER PWA, BUKAN APLIKASI NATIVE iOS.
