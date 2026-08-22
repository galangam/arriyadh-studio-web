"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type PortfolioImage = {
  src: string;
  alt: string;
};

type PortfolioCarouselProps = {
  images: readonly PortfolioImage[];
};

function CarouselArrow({ direction }: { direction: "previous" | "next" }) {
  const isPrevious = direction === "previous";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={isPrevious ? "M19 12H5m6 6-6-6 6-6" : "M5 12h14m-6-6 6 6-6 6"} />
    </svg>
  );
}

export function PortfolioCarousel({ images }: PortfolioCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) return null;

  const previousIndex = (activeIndex - 1 + images.length) % images.length;

  const nextIndex = (activeIndex + 1) % images.length;

  const previousImage = images[previousIndex];
  const activeImage = images[activeIndex];
  const nextImage = images[nextIndex];

  function previous() {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }

  function next() {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX;

    if (endX === undefined) return;

    const distance = touchStartX.current - endX;

    if (Math.abs(distance) > 45) {
      if (distance > 0) {
        next();
      } else {
        previous();
      }
    }

    touchStartX.current = null;
  }

  return (
    <div className="mt-12">
      <div
        className="relative mx-auto max-w-6xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid items-center md:grid-cols-[0.72fr_1.35fr_0.72fr] md:gap-gutter">
          {/* Previous preview */}
          <button
            type="button"
            onClick={previous}
            aria-label="Lihat hasil produksi sebelumnya"
            className="group hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:block"
          >
            <div className="relative aspect-[4/3] overflow-hidden border border-outline-variant bg-surface-container opacity-45 blur-[1.5px] saturate-50 transition-all duration-300 group-hover:scale-[0.94] group-hover:opacity-65 group-hover:blur-[0.5px]">
              <Image
                src={previousImage.src}
                alt=""
                fill
                sizes="25vw"
                className="object-cover"
                aria-hidden="true"
              />
            </div>
          </button>

          {/* Active */}
          <figure
            key={activeImage.src}
            className="portfolio-focus relative aspect-[4/3] overflow-hidden border border-outline bg-surface-white shadow-md"
          >
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              priority={activeIndex === 0}
              sizes="(min-width: 768px) 52vw, 100vw"
              className="object-cover"
            />

            <figcaption className="sr-only">
              Hasil produksi {activeIndex + 1} dari {images.length}
            </figcaption>
          </figure>

          {/* Next preview */}
          <button
            type="button"
            onClick={next}
            aria-label="Lihat hasil produksi berikutnya"
            className="group hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:block"
          >
            <div className="relative aspect-[4/3] overflow-hidden border border-outline-variant bg-surface-container opacity-45 blur-[1.5px] saturate-50 transition-all duration-300 group-hover:scale-[0.94] group-hover:opacity-65 group-hover:blur-[0.5px]">
              <Image
                src={nextImage.src}
                alt=""
                fill
                sizes="25vw"
                className="object-cover"
                aria-hidden="true"
              />
            </div>
          </button>
        </div>

        {/* Controls */}
        <button
          type="button"
          onClick={previous}
          aria-label="Lihat portofolio sebelumnya"
          className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md border border-outline-variant bg-surface-white/95 text-primary shadow-sm transition-all hover:-translate-x-0.5 hover:border-outline md:left-[25%]"
        >
          <CarouselArrow direction="previous" />
        </button>

        <button
          type="button"
          onClick={next}
          aria-label="Lihat portofolio berikutnya"
          className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md border border-outline-variant bg-surface-white/95 text-primary shadow-sm transition-all hover:translate-x-0.5 hover:border-outline md:right-[25%]"
        >
          <CarouselArrow direction="next" />
        </button>
      </div>

      {/* Counter */}
      <div className="mx-auto mt-gutter flex max-w-md items-center justify-center gap-margin-mobile">
        <span className="font-body text-label-md text-primary">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>

        <div className="h-px flex-1 bg-outline-variant">
          <div
            className="h-px bg-primary transition-[width] duration-300"
            style={{
              width: `${((activeIndex + 1) / images.length) * 100}%`,
            }}
          />
        </div>

        <span className="font-body text-label-md text-secondary">
          {String(images.length).padStart(2, "0")}
        </span>
      </div>

      <style jsx global>{`
        @keyframes portfolio-focus {
          from {
            opacity: 0.72;
            transform: scale(0.975);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .portfolio-focus {
          animation: portfolio-focus 280ms ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .portfolio-focus {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
