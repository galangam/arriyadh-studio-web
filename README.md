# Arriyadh Studio Web

Arriyadh Studio Web adalah aplikasi web full-stack untuk usaha konveksi, sablon,
permak pakaian, dan penjualan produk ready-stock. Aplikasi ini menyediakan
informasi bisnis, pemesanan terstruktur, pelacakan status pesanan, pembayaran
manual, serta panel admin untuk mengelola pesanan dan konten website.

Project ini dikembangkan sebagai project tugas akhir PKL untuk membantu
digitalisasi proses bisnis Arriyadh Studio.

## Tentang Project

Sistem memiliki dua aktor utama:

- **Pelanggan**, yang dapat melihat informasi, membuat pesanan, membayar, dan
  melacak pesanan tanpa membuat akun.
- **Admin**, yang masuk melalui Supabase Auth untuk mengelola pesanan, workflow,
  pembayaran, dan konten website.

Terdapat dua jenis pemesanan yang diproses secara terpisah: layanan custom yang
memerlukan peninjauan harga oleh admin dan produk ready-stock dengan harga
katalog.

## Fitur Utama

### Pelanggan

- Beranda dan informasi bisnis.
- Halaman Tentang Kami dengan peta Google Maps interaktif.
- Katalog layanan aktif dan form pemesanan layanan custom.
- Dukungan detail varian, ukuran, material, dan referensi desain sesuai layanan.
- Katalog produk ready-stock beserta varian, ukuran, kuantitas, dan checkout.
- Konfirmasi order dan halaman pembayaran berbasis token order.
- Pembayaran melalui Transfer BRI atau COD.
- Upload bukti transfer dengan validasi file.
- Pelacakan pesanan menggunakan kode pesanan tanpa akun pelanggan.
- Integrasi WhatsApp melalui tautan `wa.me` dengan pesan yang telah disiapkan.
- Halaman Syarat & Ketentuan dan Kebijakan Privasi.

Route publik utama:

| Route | Fungsi |
| --- | --- |
| `/` | Beranda dan ringkasan bisnis |
| `/tentang-kami` | Profil, informasi workshop, portfolio, dan peta |
| `/layanan` | Katalog layanan |
| `/layanan/[slug]/pesan` | Form pesanan layanan custom |
| `/produk` | Katalog produk ready-stock |
| `/produk/[slug]/checkout` | Checkout produk |
| `/pesanan/berhasil/[token]` | Konfirmasi pesanan |
| `/pembayaran/[token]` | Pemilihan/pengiriman pembayaran |
| `/lacak-pesanan` | Pelacakan berdasarkan kode pesanan |
| `/syarat-ketentuan` | Syarat dan ketentuan layanan |
| `/kebijakan-privasi` | Kebijakan privasi |

### Admin

- Login menggunakan Supabase Auth dengan model single-admin.
- Dashboard ringkasan pesanan.
- Daftar pesanan dengan pencarian, filter, dan pagination.
- Detail order dan export data terfilter ke CSV.
- Penetapan harga layanan custom.
- Verifikasi bukti Transfer BRI.
- Konfirmasi DP COD untuk layanan custom.
- Konfirmasi COD untuk produk ready-stock.
- Pembaruan status sesuai workflow masing-masing order.
- Pembatalan order dan WhatsApp handoff kepada pelanggan.
- CMS untuk informasi bisnis, beranda, Tentang Kami, layanan, produk, portfolio,
  featured services, dan featured products.
- Pengelolaan status aktif/published, urutan konten, dan gambar katalog.

Tidak tersedia signup admin secara publik. Otorisasi admin menggunakan
`app_metadata.role = "admin"`.

## Alur Pemesanan

### Pesan Layanan Custom

1. Pelanggan memilih layanan aktif dan mengisi kebutuhan pesanan.
2. Server memvalidasi data, varian, ukuran, dan referensi desain yang diperlukan.
3. Database membuat order dengan status `menunggu_harga` serta snapshot layanan.
4. Admin meninjau kebutuhan dan menetapkan harga.
5. Database menghasilkan DP sebesar 50% dari harga yang ditetapkan.
6. Pelanggan memilih Transfer BRI atau COD untuk pembayaran DP.
7. Admin memverifikasi transfer atau mengonfirmasi pembayaran DP COD.
8. Order masuk ke workflow produksi sesuai jenis layanan.
9. Admin memperbarui status dan pelanggan memantaunya melalui kode pesanan.

### Beli Produk Ready-Stock

1. Pelanggan memilih produk, varian aktif, ukuran, dan kuantitas.
2. Harga dihitung ulang di server berdasarkan katalog aktif dan surcharge ukuran.
3. Pelanggan memilih Transfer BRI atau COD.
4. Admin memverifikasi pembayaran atau mengonfirmasi order COD.
5. Order diproses hingga selesai tanpa masuk ke workflow produksi garment.

Data nama produk, varian, kuantitas, dan harga disimpan sebagai snapshot saat
order dibuat sehingga histori tidak bergantung penuh pada perubahan katalog.

## Workflow Pesanan

### Konveksi dan Sablon

```text
Sample / Mockup
→ Desain
→ Pecah Warna
→ Potong
→ Sablon
→ Jahit
→ Iron
→ Packing
→ Selesai
```

### Permak

```text
Diterima → Dikerjakan → Quality Check → Selesai
```

### Produk Ready-Stock

```text
Menunggu Verifikasi → Diproses → Selesai
```

Database dan aplikasi membatasi perpindahan status agar mengikuti workflow yang
sesuai. Order yang belum selesai juga dapat dibatalkan oleh admin.

## Pembayaran dan WhatsApp

Metode pembayaran yang didukung:

- Transfer Bank BRI.
- COD.

Detail rekening produksi dikonfigurasi di aplikasi dan hanya ditampilkan pada
alur pembayaran pelanggan. Sistem tidak menggunakan payment gateway atau
verifikasi pembayaran otomatis; seluruh pembayaran diperiksa manual oleh admin.

Integrasi WhatsApp menggunakan tautan resmi `wa.me`. Aplikasi hanya menyiapkan
dan membuka pesan; pengiriman tetap dilakukan secara manual oleh pelanggan atau
admin. Project tidak menggunakan bot maupun library otomasi WhatsApp tidak resmi.

## Pelacakan Pesanan

Pelanggan melacak order menggunakan `order_code`, bukan UUID database atau token
pembayaran. Hasil tracking publik dibatasi pada data yang diperlukan untuk
memahami jenis order, ringkasan item, status, dan progres.

Nama pelanggan, nomor WhatsApp, email, alamat, catatan admin, bukti pembayaran,
dan path file privat tidak disertakan dalam hasil tracking publik.

## Tech Stack

| Teknologi | Penggunaan |
| --- | --- |
| Next.js 16.3.1 | Full-stack framework dan App Router |
| React 19.2.8 | Komponen antarmuka |
| TypeScript | Type safety aplikasi |
| Tailwind CSS 4 | Styling berbasis utility dan design token CSS-first |
| Supabase PostgreSQL | Database utama |
| Supabase Auth | Autentikasi admin |
| Supabase Storage | Penyimpanan gambar dan dokumen order |
| `@supabase/ssr` | Session Supabase pada server dan Proxy |
| `@supabase/supabase-js` | Akses Supabase dari aplikasi |
| npm | Package manager |
| Vercel | Target deployment aplikasi Next.js |

## Arsitektur Singkat

Project menggunakan Next.js App Router dengan pola berikut:

- Server Components digunakan sebagai default untuk komposisi halaman dan
  pengambilan data.
- Client Components digunakan untuk form, menu, dialog, upload, filter, dan
  interaksi browser.
- Server Actions menangani validasi dan mutation dari form publik maupun admin.
- Satu Route Handler menangani export CSV order admin.
- Operasi berbasis session menggunakan session-bound Supabase server client yang
  membaca session pengguna melalui cookie.
- Elevated Supabase client diberi `server-only` dan digunakan hanya pada jalur
  server tepercaya yang memang perlu melewati RLS.
- Root `proxy.ts` memperbarui session serta melindungi navigasi admin.

## Struktur Project

```text
app/          Route, layout, Server Actions, dan Route Handler App Router
components/   Komponen UI, layout publik/admin, dan bagian halaman reusable
lib/          Data access, business logic, validasi, auth, dan Supabase client
database/     SQL incremental untuk perubahan schema, policy, dan CMS
public/       Branding, icon, dan gambar lokal
```

Route publik dikelompokkan dalam `app/(public)`, sedangkan halaman admin yang
memerlukan autentikasi berada di `app/admin/(protected)`.

## Database dan Storage

Supabase PostgreSQL menyimpan dua jenis order: `service` dan `product`. Database
menangani unique order code/token, snapshot katalog, validasi harga produk,
generated DP 50%, guard transisi status, serta perlindungan snapshot historis.

SQL dalam folder `database/` merupakan patch incremental, bukan full migration
history atau schema dasar lengkap. Terapkan file yang diperlukan sesuai urutan
nomornya pada project Supabase yang sudah memiliki schema dasar. Patch terbaru:

```text
database/step-5-13-admin-product-variants-select-policy.sql
```

Patch tersebut menambahkan jalur SELECT bagi admin untuk membaca seluruh varian
produk, termasuk varian inactive, tanpa memperluas akses publik.

Bucket Storage yang digunakan:

| Bucket | Akses | Batas dan format | Penggunaan |
| --- | --- | --- | --- |
| `content-images` | Public | 5 MiB; JPEG, PNG, WebP | Gambar CMS |
| `design-references` | Private | 10 MiB; JPEG, PNG, WebP, PDF | Referensi desain pelanggan |
| `payment-proofs` | Private | 5 MiB; JPEG, PNG, WebP | Bukti pembayaran |

File upload divalidasi berdasarkan ukuran, MIME type, dan signature/magic bytes.
Admin mengakses dokumen pada bucket private melalui signed URL berumur pendek.

## Instalasi

Prasyarat:

- Node.js yang kompatibel dengan Next.js 16.
- npm.
- Project Supabase yang telah dikonfigurasi.

Clone repository dan install dependency:

```bash
git clone https://github.com/galangam/arriyadh-studio-web.git
cd arriyadh-studio-web
npm install
```

## Environment Variables

Buat `.env.local` di root project. Tiga variabel berikut wajib tersedia:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Untuk menentukan origin aplikasi secara eksplisit, variabel berikut dapat
ditambahkan:

```env
NEXT_PUBLIC_SITE_URL=
```

`SUPABASE_SECRET_KEY` hanya boleh tersedia di environment server. Jangan memakai
prefix `NEXT_PUBLIC_`, memasukkannya ke repository, atau mengaksesnya dari Client
Component.

## Menjalankan Project

Development server:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Menjalankan hasil production build secara lokal:

```bash
npm run build
npm run start
```

## Validasi

Jalankan pemeriksaan berikut sebelum deployment atau review perubahan:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Ketiga perintah tersebut telah lulus pada branch final saat README ini disusun.

## Deployment

Target deployment adalah Vercel dengan Supabase sebagai backend:

1. Buat atau pilih project Supabase dan siapkan schema dasar yang dibutuhkan.
2. Terapkan patch SQL incremental dari `database/` sesuai dependensi dan urutan.
3. Konfigurasikan environment variables pada environment deployment.
4. Deploy aplikasi Next.js ke Vercel.
5. Jalankan pemeriksaan route publik, login admin, order, pembayaran, dan tracking
   pada environment deployment.

Jangan memasukkan secret Supabase atau konfigurasi privat ke repository maupun
dokumentasi publik.

## Keamanan

- Route admin dilindungi di server dan melalui Proxy.
- Server Actions sensitif melakukan pemeriksaan admin secara mandiri.
- Role admin bersumber dari trusted `app_metadata` Supabase Auth.
- Elevated Supabase key hanya digunakan dalam modul server-only.
- Browser publik tidak memiliki direct SELECT ke tabel order.
- Referensi desain dan bukti pembayaran disimpan di bucket private.
- Tracking publik hanya mengembalikan subset data non-sensitif.
- Database menjaga status transition, integritas harga, dan historical snapshot.

## Batasan Sistem

- Pelanggan tidak memiliki akun dan menggunakan kode pesanan untuk tracking.
- Harga layanan custom harus ditentukan admin sebelum pembayaran.
- Verifikasi pembayaran dilakukan manual.
- WhatsApp memerlukan interaksi manual pengguna atau admin.
- Sistem belum menyediakan payment settlement atau laporan keuangan otomatis.

## Status Project

Implementasi fitur utama dan validasi project telah selesai. Project saat ini
berada pada tahap finalisasi deployment dan masih dapat dikembangkan melalui
perbaikan, penyempurnaan, serta fitur tambahan pada versi berikutnya.

## Pengembangan

Project ini dibuat sebagai bagian dari tugas akhir PKL dan portfolio pengembangan
web full-stack untuk mendigitalisasi proses pemesanan serta pengelolaan konten
Arriyadh Studio.
