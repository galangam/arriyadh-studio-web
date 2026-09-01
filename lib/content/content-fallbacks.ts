import "server-only";

export const siteSettingsFallback = {
  business_name: "Arriyadh Studio",
  whatsapp: "6281214719630",
  phone: "+62 812-1471-9630",
  email: "ananang559@gmail.com",
  address:
    "Jl. Moch Idris, Dusun Cibodas, Kec. Kalijati, Kabupaten Subang, Jawa Barat, Indonesia",
  operating_hours: "Senin – Sabtu: 09.00 – 17.00 WIB",
  maps_url:
    "https://www.google.com/maps/place/ARRIYADH+STUDIO/@-6.5269638,107.6929188,17z/data=!3m1!4b1!4m6!3m5!1s0x2e693d4dd1f64ee7:0x3c26c2cb7b7a7eb2!8m2!3d-6.5269638!4d107.6929188!16s%2Fg%2F11ygpmhxzz?entry=ttu&g_ep=EgoyMDI2MDgxOS4wIKXMDSoASAFQAw%3D%3D",
  instagram_url: "https://www.instagram.com/azs_creator422/",
  facebook_url: "https://www.facebook.com/share/1PQa5yvU6z/",
  tiktok_url: "https://www.tiktok.com/@arriyadh_studio",
} as const;

export const homepageContentFallback = {
  hero_eyebrow: "Terpercaya Sejak 2010",
  hero_title: "Solusi Konveksi & Sablon Terbaik di Subang",
  hero_description:
    "Kualitas premium untuk seragam, kaos, dan merchandise custom Anda. Pengerjaan tepat waktu dengan standar industri terpercaya.",
  hero_image_url: "/images/home/hero-workshop-demo.jpeg",
  intro_title: "Keahlian yang Berakar dari Pengalaman",
  intro_description:
    "Arriyadh Studio telah menjadi mitra terpercaya di Subang selama lebih dari satu dekade. Kami memadukan teknik tradisional dengan teknologi modern untuk menghasilkan produk tekstil yang tidak hanya tahan lama tetapi juga representatif bagi identitas bisnis atau komunitas Anda.",
  experience_value: "10+",
  experience_label: "Tahun Pengalaman Industri",
  portfolio_title: "Hasil Produksi Kami",
  portfolio_description:
    "Beberapa hasil produksi yang telah kami kerjakan untuk berbagai kebutuhan pelanggan.",
} as const;

export const aboutContentFallback = {
  page_title: "Mengenal Arriyadh Studio",
  page_subtitle: "Jasa Konveksi & Sablon Terpercaya di Subang",
  history_title: "Dedikasi pada Kualitas",
  history_body:
    "Arriyadh Studio berdiri sejak tahun 2010 dan bergerak dalam layanan konveksi, sablon, serta kebutuhan pakaian custom.\n\nSelama lebih dari satu dekade, kami berkomitmen memberikan hasil produksi yang rapi, berkualitas, tepat waktu, dan sesuai kebutuhan pelanggan.\n\nPelayanan kami mencakup kebutuhan individu, komunitas, organisasi, sekolah, perusahaan, maupun berbagai kebutuhan usaha lainnya.",
  founded_year: 2010,
  strength_1_title: "Sejak 2010",
  strength_1_description: "Berpengalaman",
  strength_2_title: "Kustom & Permak",
  strength_2_description: "Layanan Lengkap",
  strength_3_title: "Transparan",
  strength_3_description: "Pengerjaan Terbuka",
  workshop_title: "Kunjungi Workshop Kami",
  workshop_description:
    "Kami menyambut Anda untuk berkonsultasi langsung atau melihat proses pengerjaan di workshop kami yang berlokasi di Subang.",
  workshop_image_url: "/images/home/about/workshop-map.png",
} as const;

export const featuredServiceFallbackSlugs = [
  "permak",
  "sablon",
  "kaos",
  "kemeja",
  "jersey",
  "lainnya",
] as const;

export const featuredProductFallbackSlugs = [
  "kaos-polos-premium",
  "celana-kolor-santai",
] as const;

export const portfolioFallback = Array.from({ length: 33 }, (_, index) => {
  const number = index + 1;

  return {
    id: `local-portfolio-${number}`,
    title: `Hasil produksi Arriyadh Studio ${number}`,
    description: null,
    image_url: `/images/home/portfolio-${number}.jpeg`,
    alt: `Hasil produksi Arriyadh Studio ${number}`,
  };
});
