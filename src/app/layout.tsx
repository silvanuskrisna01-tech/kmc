import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KMC — Krisna Music Course | Kursus Musik Profesional di Banjarmasin",
  description:
    "Kursus musik profesional untuk Piano, Gitar, dan Drum. Belajar dari guru berpengalaman, jadwal fleksibel, laporan perkembangan bulanan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" style={{ height: '100%', scrollBehavior: 'smooth' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>{children}</body>
    </html>
  );
}