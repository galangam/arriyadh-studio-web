import type { Metadata } from "next";
import {
  Hanken_Grotesk,
  Inter,
} from "next/font/google";

import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arriyadh Studio",
    template: "%s | Arriyadh Studio",
  },

  description:
    "Website resmi Arriyadh Studio untuk layanan konveksi, sablon, permak, dan produk ready-stock.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${hankenGrotesk.variable} ${inter.variable}`}
    >
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}