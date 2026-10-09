# Update harian Game Asset Radar

## Instruksi singkat untuk Cursor

> Update Game Asset Radar setiap hari. Target minimal 50 aset baru terverifikasi,
> gabungan gratis permanen, Free Today dan deals berkualitas. Cari rilis baru
> sekaligus isi katalog dari aset lama yang belum masuk. Jika satu kandidat
> gagal, cari pengganti; jangan berhenti setelah satu batch. Cek sumber, lisensi,
> harga, diskon, preview, link dan duplikat. Arsipkan promo yang selesai.
> Setelah semua pemeriksaan dan build lulus, langsung commit dan push ke main
> tanpa PR atau review saya. Jangan mengarang data untuk memenuhi target.

Prompt lengkap: [daily-assets.md](../.cursor/automations/daily-assets.md).
Jadwal tersimpan di akun Cursor perlu memakai prompt repo terbaru tersebut.
File repo ini tidak mendaftarkan atau mengaktifkan jadwal akun secara otomatis.

## Target dan batas

Angka berlaku dari [automation-policy.json](../data/automation-policy.json).

| Pekerjaan                                      |           Harian |
| ---------------------------------------------- | ---------------: |
| Target aset baru, semua tipe digabung          |   **Minimal 50** |
| Batas penambahan reguler                       |              100 |
| Pemeriksaan kandidat produk                    |              150 |
| Publisher dipantau                             |               10 |
| Recheck promo / free lama                      | Maksimal 50 / 20 |
| Waktu keseluruhan / cadangan validasi dan push |    90 / 10 menit |
| Download baru                                  |           500 MB |

Recheck harga, tanggal baru, URL kandidat dan menghidupkan promo lama bukan aset
baru. Hitung penambahan per hari Asia/Jakarta, termasuk yang sudah ada ketika
agent mulai. Rerun tidak mereset jatah. Lima descriptor hanya ukuran satu batch;
lanjutkan batch dan ganti kandidat gagal sampai target 50. Bila sumber/lisensi
atau anggaran benar-benar menghalangi target, laporkan shortfall dan penyebabnya.
Jangan mengklaim 50 ketika hanya 9 yang masuk.

## Langkah harian

1. Ambil main terbaru, install npm ci, arsipkan expired/stale dengan
   npm run offers:update, lalu refresh snapshot kurs npm run prices:refresh.
2. Pantau sepuluh publisher dengan workflow existing. Cari promo BARU dari sumber
   yang mengizinkan akses, dengan npm run offers:discover -- --limit=30 --inspect.
   Baca .cache/promotion-discovery-report.json. Ini hanya kandidat/observasi harga,
   belum izin publish. Hitung inspeksinya dalam anggaran 150. Verifikasi produk, harga/currency/tier, lisensi, format
   dan expiry absolut. Terapkan kandidat terverifikasi lewat updater existing.
3. Isi kekurangan target harian dengan:

   ```sh
   npm run catalog:grow -- --limit=50 --write
   ```

   Command menghitung free/promo/archive yang sudah ditambahkan hari ini, lalu
   melanjutkan antrean Kenney, Poly Haven dan ambientCG. Sumber dibagi bergantian;
   duplikat/kandidat tanpa bukti ditolak. Setiap impor berhasil disimpan. Gunakan
   --candidates=<sisa> dan --minutes=<sisa> untuk mengurangi anggaran yang sudah
   dipakai langkah sebelumnya. Tanpa --write hanya discovery.

4. Baca .cache/growth-report.json: target, tambahan nyata, penolakan, sumber
   terblokir, bytes download dan shortfall. Recheck aset lama jika waktu cukup.
5. Jalankan semua pemeriksaan di bawah. Stage hanya katalog/bukti/media berizin,
   commit dan push main. Jika main maju, rebase hanya commit katalog run ini dan
   ulangi pemeriksaan. Jangan force-push atau mengubah izin/proteksi branch.
   Vercel deploy otomatis; sebut berhasil hanya setelah commit itu live.

```sh
npm run offers:validate
npm run catalog:validate
npm run lint
npm run typecheck
npm test
npm run build
```

## Pengisian awal

```sh
npm run catalog:grow -- --mode=backfill --limit=150 --write
```

Mode terpisah untuk backlog awal: maksimal 500 penambahan, 1.000 pemeriksaan,
120 menit dan 1.000 MB per run. Lanjutkan pada run berikutnya tanpa mengimpor URL
lama. Jangan jalankan beberapa writer bersamaan atau melewati validasi.

## Sumber dan kualitas

Kenney memerlukan CC0 pada produk dan License.txt archive. Poly Haven memakai
API texture, CC0 dan checksum file diffuse; jangan salin render situsnya.
ambientCG memakai API material dan format yang dinyatakan publisher; lisensinya
secara eksplisit mencakup render material CC0. Semua preview punya provenance.
Fab, itch.io dan GameDev Market tetap perlu bukti harga/lisensi per promo serta
izin akses. Publisher lain/OpenGameArt masih memerlukan adapter per produk.
Synty/CraftPix tetap permission review dalam publisher monitor; jangan ambil
otomatis atau mengubah izinnya. Index bukan bukti harga/lisensi produk.

Unity Asset Store [section 3.3](https://unity.com/legal/as-terms) memerlukan
perjanjian terpisah untuk akses otomatis. Jangan scrape free catalog/Autumn Sale
atau private API, dan jangan mengaku Unity sudah dicek. Feed partner resmi yang
disertai izin bisa diintegrasikan terpisah.

Website tetap Inggris, harga tampil USD dengan aturan kurs existing. Evidence
menyimpan currency/tier asli. Ikuti Radar Score v3 dan Deal Score terpisah;
jangan default 90 atau menaikkan nilai agar lolos. Native memerlukan paket engine
nyata; Importable memerlukan format isi yang tercatat; lainnya Unverified.
Jangan menyalin pack berbayar/logo atau membuat harga/rating/expiry palsu.
Jangan membuat artikel filler atau memecah pack untuk menambah jumlah.

Laporan: free + limited free + deals baru; total harian versus target 50;
shortfall/alasan; recheck/arsip; sumber berhasil/skip/blocked; evidence;
waktu/download; hasil pemeriksaan; commit/push dan status deploy.

## Jadwal Cursor

Repo fareza777/website-asset-radar, branch main, harian 08:00 Asia/Jakarta
(01:00 UTC), Node.js 24 dan npm ci. Tempel prompt lengkap terbaru, save/activate
di akun Cursor, lalu coba satu run. Cloud agent mengikuti biaya/limit akun;
website tetap static Vercel tanpa backend berbayar.
