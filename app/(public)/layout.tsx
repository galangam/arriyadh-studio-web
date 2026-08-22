import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background">
      <PublicNavbar />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
