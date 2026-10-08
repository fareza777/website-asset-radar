# Panduan update harian GameAssetRadar di Cursor

**Maksimum yang disiapkan: 50 aset baru terverifikasi per hari**, gabungan free,
limited free, dan deals. Ini batas kerja proyek yang dapat ditinjau manusia,
bukan batas resmi Cursor atau jaminan ada 50 aset baru setiap hari. Setiap aset
membentuk satu halaman SEO `/asset/<slug>/` secara otomatis. Tidak perlu menulis
artikel generik atau membuat blog agar jumlah halaman bertambah.

## Batas kerja

Angka utama disimpan di [`data/automation-policy.json`](../data/automation-policy.json).
Prompt harian wajib membacanya; script discovery dan link checker juga memakai
batas kandidat dan recheck dari file itu.

| Pekerjaan                                            |              Maksimum per hari/run |
| ---------------------------------------------------- | ---------------------------------: |
| Aset baru yang lolos verifikasi, semua tipe digabung |           50 per hari Asia/Jakarta |
| Kandidat baru yang diperiksa, semua sumber digabung  |                                150 |
| Promo lama yang diverifikasi ulang                   |                                 50 |
| Aset free lama yang dicek ulang                      |                                 20 |
| Descriptor per batch importer                        |                                  5 |
| Halaman index Kenney yang diikuti discovery          |                                 20 |
| Waktu kerja keseluruhan, termasuk validasi dan PR    |                           60 menit |
| Waktu terakhir yang dicadangkan untuk validasi/PR    |                           10 menit |
| Download archive baru secara kumulatif               |                             500 MB |
| Draft PR aktif                                       | 1; lanjutkan PR yang masih terbuka |

Kualitas dan pengecekan promo lama didahulukan. Batas waktu, bandwidth, izin
sumber, jumlah temuan, dan penggunaan cloud agent bisa menurunkan hasil harian.
Nol penambahan boleh terjadi. Rerun manual harus menghitung penambahan yang sudah
diajukan/di-merge hari itu; jangan membuat tambahan jatah 50. Batas waktu dan
download adalah instruksi untuk agent, bukan timer/billing limiter pada Cursor.
Importer tetap membatasi ukuran setiap response dan lima descriptor per batch.

## Setup satu kali

1. Buka [Cursor Automations](https://cursor.com/automations), buat automation,
   pilih **Single repository**: `fareza777/website-asset-radar`, branch `main`.
2. Nama: **GameAssetRadar — daily verified discovery**. Pilih scheduled trigger
   setiap hari **08:00 Asia/Jakarta**. Jika UI menggunakan UTC, gunakan **01:00 UTC**
   (`0 1 * * *`). Pastikan next-run yang ditampilkan sesuai.
3. Tempel **seluruh isi** [prompt siap pakai](../.cursor/automations/daily-assets.md).
   Gunakan Node.js 24 dan install command `npm ci`. Pilih model sesuai anggaran
   akun; tidak perlu paket hosting/database baru.
4. Gunakan kemampuan PR bawaan Cursor. Helper shell opsional tersedia jika `gh`
   sudah terautentikasi. Minta output **draft PR** terhadap `main`.
5. Save dan Activate di akun Cursor, lalu jalankan satu kali untuk meninjau hasil.
   Sesudah PR direview dan di-merge, integrasi Vercel yang sudah ada melakukan deploy.

File prompt dalam repo **belum mengaktifkan jadwal di akun Cursor**. Scheduled
automations memakai cloud agents; penggunaan agent mengikuti biaya/limit akun.
Atur spending limit akun jika tersedia dan periksa usage setelah run percobaan.
Jadwal bisa mulai terlambat, sehingga jangan menganggapnya sebagai pengecekan
harga real-time. Setup ini mengikuti [dokumentasi resmi Cursor](https://cursor.com/docs/cloud-agent/automations).

## Urutan kerja setiap hari

1. Ambil main terbaru atau lanjutkan draft PR katalog yang masih terbuka. Tolak
   perubahan di luar file katalog, bukti, dan media berizin. Install locked dependencies.
2. Arsipkan promo kedaluwarsa/stale melalui `npm run offers:update`. Jangan
   memperbarui tanggal verifikasi hanya karena menjalankan script.
3. Verifikasi promo tertua terlebih dahulu: produk persis sama, harga asli dan
   promo, mata uang, tier, izin komersial, rating jika tersedia, dan expiry yang
   benar-benar diketahui. HEAD hanya memeriksa link, bukan harga/lisensi.
4. Temukan kandidat dari sumber yang diizinkan; pilih paling berguna dan hindari
   duplicate URL/affiliate/versi. Utamakan free assets, limited free premium, lalu
   deals yang memenuhi diskon 30%+, Radar Score 70+, dan ambang kualitas.
5. Verifikasi lisensi dan isi setiap kandidat. Import free assets dalam batch
   **maksimal 5**, sampai sisa jatah harian, waktu, atau download habis. Maksimal
   10 batch penuh hanya jika tidak ada promo baru yang memakai jatah 50 tersebut.
6. Simpan evidence aktual. Untuk promo, masukkan kandidat ke queue lalu jalankan
   updater; updater menghitung discount/Radar Score dan memakai waktu dari evidence.
7. Recheck sampai 20 free assets lama jika masih dalam waktu. Jalankan semua
   validasi. Hentikan import baru ketika sisa waktu 10 menit.
8. Buka/perbarui satu draft PR dengan daftar perubahan dan ringkasan angka/bukti.
   Jangan auto-merge atau deploy langsung. Tanpa perubahan valid, tidak perlu PR.

## Perintah yang dipakai

```sh
npm ci
npm run offers:update
npm run catalog:discover -- --limit=150
npm run offers:check-links -- --limit=50

# Setelah descriptor ditinjau; tiap file berisi paling banyak 5 aset.
npx tsx scripts/seed-catalog.ts --input=.cache/kenney-imports.json
npx tsx scripts/seed-polyhaven.ts --input=.cache/polyhaven-imports.json

# Setelah evidence promo dan data/offer-candidates.json diperbarui.
npm run offers:update
npm run catalog:check -- --limit=20 --write

npm run offers:validate
npm run catalog:validate
npm run lint
npm run typecheck
npm test
npm run build

# Opsional, hanya jika gh terautentikasi; menjalankan validasi lagi lalu membuat draft PR.
node scripts/open-catalog-pr.mjs --publish
```

Discovery hanya menulis `.cache/discovery-report.json`; ia tidak menerbitkan
150 kandidat. Jangan menjalankan semua batch setelah mencapai jatah 50 gabungan.
Kegagalan robots, 403, CAPTCHA, rate limit, harga ambigu, atau lisensi tidak jelas
berarti sumber/candidate dilewati dan dilaporkan. Jangan bypass proteksi atau
menambah domain ke allowlist dari dalam automation.

## Sumber, preview, dan konten

Importer free saat ini mendukung **Kenney CC0** dan **Poly Haven texture API**.
Marketplace prioritas promo adalah **Fab, Unity Asset Store, itch.io, dan GameDev
Market**, hanya jika akses/metode pengumpulan diizinkan. Prioritas bukan izin
scrape otomatis; sumber yang tidak bisa diverifikasi tidak diterbitkan. Sumber
lain memerlukan implementasi dan review tersendiri.

Pilih screenshot yang menjelaskan asset dari gallery publisher. `publisherPreview`
menyimpan URL CDN yang benar-benar terlihat, source produk, kredit, alt, waktu
cek gambar, dan catatan provenance. Pakai versi kecil yang sudah disediakan
publisher jika teramati. Gambar tetap di CDN publisher; jangan download/rehost
marketing art atau file premium. `preview` lokal memerlukan izin penggunaan gambar
yang tercatat. Untuk audio tanpa screenshot yang berguna, pakai animasi original
yang sudah tersedia. Pengecekan screenshot **tidak** memperbarui `lastChecked` harga.

Summary setiap aset harus singkat, original, faktual, mudah dibaca, dan menyebut
batasan isi yang penting. Jangan mengarang rating, review, harga asli, expiry,
jumlah file, engine integration, atau tanggal rilis. Countdown hanya untuk expiry
absolut dengan timezone yang diketahui. Harga/claim promo disembunyikan otomatis
jika expired atau sudah 48 jam tanpa evidence baru, sekalipun deploy belum berubah.

## Format ringkasan PR

```text
Tanggal/run: <Asia/Jakarta dan waktu UTC>
Kandidat diperiksa: <jumlah dari maksimal 150>
Aset baru: <free> free + <limited free> limited free + <deal> deals = <total, maksimal 50/hari>
Recheck: <promo> promo + <free> free
Diarsipkan: <jumlah dan alasan>
Dilewati/gagal: <jumlah dan alasan singkat>
Pemakaian: <menit> menit, <MB> archive baru
Sisa jatah hari ini: <jumlah>
Validasi: <hasil sebenarnya>
Evidence: <source/license/price/preview untuk tiap record>
```

Review minimal: periksa source/price/license setiap penambahan, isi preview,
expiry, duplicate, dan hasil CI. Setelah merge, site tetap static dan tidak
memerlukan akun pengunjung atau paid backend.
