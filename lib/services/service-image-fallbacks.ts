const serviceImageFallbacks: Record<
  string,
  { src: string; alt: string }
> = {
  permak: {
    src: "/images/home/permak.jpg",
    alt: "Proses pengerjaan permak pakaian",
  },
  sablon: {
    src: "/images/home/portfolio-5.jpeg",
    alt: "Proses pengerjaan pakaian di workshop Arriyadh Studio",
  },
  kaos: {
    src: "/images/home/portfolio-18.jpeg",
    alt: "Kaos custom hasil produksi Arriyadh Studio",
  },
  kemeja: {
    src: "/images/home/portfolio-23.jpeg",
    alt: "Kemeja seragam custom hasil produksi Arriyadh Studio",
  },
  jersey: {
    src: "/images/home/portfolio-10.jpeg",
    alt: "Jersey olahraga custom hasil produksi Arriyadh Studio",
  },
  lainnya: {
    src: "/images/home/portfolio-20.jpeg",
    alt: "",
  },
};

export function getServiceImageFallback(slug: string) {
  return serviceImageFallbacks[slug] ?? null;
}
