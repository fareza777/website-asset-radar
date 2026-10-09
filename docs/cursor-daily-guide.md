# Update harian Game Asset Radar

## Instruksi singkat untuk Cursor

> Update Game Asset Radar setiap hari. Setiap run tambah MINIMAL 50 aset BARU
> terverifikasi, tanpa batas maksimal jumlah aset. Gabungkan gratis permanen,
> Free Today dan deals berkualitas. Jangan berhenti di 50/100 atau karena run
> sebelumnya sudah menambah banyak hari ini. Teruskan selama waktu, bandwidth
> dan sumber yang diizinkan masih tersedia. Cari rilis baru
> sekaligus isi katalog dari aset lama yang belum masuk. Jika satu kandidat
> gagal, cari pengganti; jangan berhenti setelah satu batch. Cek sumber, lisensi,
> harga, diskon, preview, link dan duplikat. Arsipkan promo yang selesai.
> Update juga Curated Collections: review minimal 3 koleksi, tambah aset yang
> cocok, dan buat maksimal 1 tema baru bila berguna. Tiap koleksi 6–16 aset gratis
> terverifikasi. Perubahan koleksi tidak dihitung sebagai 50 aset baru.
> Setelah semua pemeriksaan dan build lulus, langsung commit dan push ke main
> tanpa PR atau review saya. Jangan mengarang data untuk memenuhi target.

Prompt lengkap: [daily-assets.md](../.cursor/automations/daily-assets.md).
Jadwal tersimpan di akun Cursor perlu memakai prompt repo terbaru tersebut.
File repo ini tidak mendaftarkan atau mengaktifkan jadwal akun secara otomatis.

## Target dan batas

Angka berlaku dari [automation-policy.json](../data/automation-policy.json).

| Pekerjaan                                      |                Per run |
| ---------------------------------------------- | ---------------------: |
| Target aset baru, semua tipe digabung          |         **Minimal 50** |
| Maksimal penambahan aset                       |       **Tanpa plafon** |
| Maksimal pemeriksaan kandidat                  |           Tanpa plafon |
| Publisher dipantau                             |                     10 |
| Koleksi existing direview / tema baru          | Minimal 3 / maksimal 1 |
| Aset gratis per Curated Collection             |                   6–16 |
| Recheck promo / free lama                      |       Maksimal 50 / 20 |
| Waktu keseluruhan / cadangan validasi dan push |          90 / 10 menit |
| Download baru                                  |                 500 MB |

Recheck harga, tanggal baru, URL kandidat dan menghidupkan promo lama bukan aset
baru. Simpan ID katalog/free/promo/archive saat run dimulai; hitung hanya ID baru
yang belum ada pada baseline itu. Penambahan run lain pada hari yang sama tidak
memenuhi minimum run ini. Jika melanjutkan run yang terputus, pakai baseline yang
sama agar tidak menghitung ulang. Lima descriptor hanya ukuran satu batch.
Lewati 50, 100, 200 dan seterusnya selama sumber terverifikasi dan anggaran nyata
masih tersedia. Waktu 90 menit dan download 500 MB menjaga biaya; keduanya bukan
jatah jumlah aset. Laporkan penyebab berhenti dan shortfall bila minimum gagal.
Jangan mengklaim 50 ketika hanya 9 masuk. Batas satu tema koleksi baru tetap per
hari, terpisah dari jumlah aset yang tidak dibatasi.

## Langkah harian

1. Ambil main terbaru, install npm ci, arsipkan expired/stale dengan
   npm run offers:update, lalu refresh snapshot kurs npm run prices:refresh.
2. Pantau sepuluh publisher dengan workflow existing. Cari promo BARU dari sumber
   yang mengizinkan akses, dengan npm run offers:discover -- --limit=30 --inspect.
   Baca .cache/promotion-discovery-report.json. Ini hanya kandidat/observasi harga,
   belum izin publish. Tiga puluh hanya batch pertama, bisa diperbesar selama
   waktu tersedia; jangan mengulang kandidat gagal yang sama. Verifikasi produk, harga/currency/tier, lisensi, format
   dan expiry absolut. Terapkan kandidat terverifikasi lewat updater existing.
3. Teruskan impor katalog tanpa plafon jumlah:

   ```sh
   npm run catalog:grow -- --write
   ```

   Command melanjutkan antrean OpenGameArt, Kenney, Poly Haven dan ambientCG tanpa berhenti
   di 50/100. Jumlah masuk lebih awal hari ini hanya informasi. Sumber bergantian;
   duplikat/kandidat tanpa bukti ditolak. Setiap impor berhasil disimpan. Gunakan
   --minutes=<sisa menit total>, --minimum=<sisa minimum run ini> dan
   --downloaded-bytes=<bytes yang sudah diunduh run ini> untuk meneruskan anggaran.
   Contoh setelah 12 menit, 3 promo BARU dan nol download pack/media:
   npm run catalog:grow -- --minutes=78 --minimum=47 --downloaded-bytes=0 --write.
   Gunakan --minimum pada jadwal baru. Flag lama --limit=50 sekarang berarti
   minimum, bukan batas berhenti; --candidates lama tidak membatasi pemeriksaan. Tanpa --write hanya discovery; --plan menampilkan rencana tanpa
   internet atau mengubah data. Jangan reset anggaran dengan mengulang command.

4. Baca .cache/growth-report.json: minimumRemaining, additionLimit/inspectionLimit
   null (tanpa plafon), tambahan nyata, penolakan, sumber terblokir,
   totalRunDownloadBytes, shortfall dan stopReason. Cocokkan seluruh tambahan
   run ini dengan baseline awal, termasuk promo baru. Recheck bila waktu cukup.
5. Update data/collections.json: review minimal 3 koleksi secara bergantian,
   prioritaskan tema yang cocok dengan aset baru. Tambah/pilih ulang aset yang
   relevan, buang referensi hilang dan pertahankan 6–16 aset gratis terverifikasi.
   Buat maksimal 1 koleksi baru bila temanya berguna dan berbeda. Cover harus
   salah satu member; pertahankan ID/URL existing. Jangan campur promo sementara
   ke koleksi gratis atau menjanjikan semua pack langsung cocok di satu engine.
   Tulis deskripsi Inggris dan updatedAt UTC hanya ketika isi benar-benar berubah.
   Review tanpa perubahan tidak mengganti tanggal. Laporkan koleksi direview,
   diubah/baru, serta member ditambah/dihapus. Ini tidak menambah hitungan 50 aset.
6. Jalankan semua pemeriksaan di bawah. Stage hanya katalog/koleksi/bukti/media berizin,
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
npm run catalog:grow -- --mode=backfill --write
```

Mode manual untuk backlog awal: tanpa plafon jumlah aset/pemeriksaan, dengan
anggaran 120 menit dan 1.000 MB per run. Jadwal biasa tetap memakai anggaran
90 menit/500 MB. Lanjutkan pada run berikutnya tanpa mengimpor URL lama.
Jangan jalankan beberapa writer bersamaan atau melewati validasi.

## Sumber dan kualitas

Kenney memerlukan CC0 pada produk dan License.txt archive. Poly Haven memakai
API texture, CC0 dan checksum file diffuse; jangan salin render situsnya.
ambientCG memakai API material dan format yang dinyatakan publisher; lisensinya
secara eksplisit mencakup render material CC0. Semua preview punya provenance.
Fab, itch.io dan GameDev Market tetap perlu bukti harga/lisensi per promo serta
izin akses. OpenGameArt sekarang punya importer untuk CC0, CC-BY-3.0 dan
CC-BY-4.0: cek author/lisensi pada produk, inspeksi download sebenarnya, simpan
atribusi, dan buat preview dari file berlisensi. Preview galeri situsnya tidak
boleh diasumsikan berlisensi sama. Crawl-delay sumber tetap dipatuhi.
Publisher lain masih memerlukan adapter per produk; nama dalam prompt saja
tidak mengaktifkan dukungan baru. Unity belum menjadi sumber impor otomatis.
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

Laporan: free + limited free + deals BARU RUN INI versus minimum 50; tampilkan
tambahan run sebelumnya hari ini secara terpisah, jangan menggunakannya untuk
berhenti. Sebut tanpa plafon jumlah dan alasan berhenti yang sebenarnya;
collections direview/diubah/baru dan perubahan member;
shortfall/alasan; recheck/arsip; sumber berhasil/skip/blocked; evidence;
waktu/download; hasil pemeriksaan; commit/push dan status deploy.

## Jadwal Cursor

Repo fareza777/website-asset-radar, branch main, harian 08:00 Asia/Jakarta
(01:00 UTC), Node.js 24 dan npm ci. Tempel prompt lengkap terbaru, save/activate
di akun Cursor, lalu coba satu run. Cloud agent mengikuti biaya/limit akun;
website tetap static Vercel tanpa backend berbayar.
