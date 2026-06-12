import type { Metadata } from "next";
import { Archivo_Black, Outfit, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-archivo" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const plex = IBM_Plex_Mono({ weight: ["400", "600", "700"], subsets: ["latin"], variable: "--font-plex" });

export const metadata: Metadata = {
  title: "Le Mondial, raconté par la data — pronostics du jour | Ninjads",
  description:
    "Chaque jour de la Coupe du Monde 2026 : les pronostics d'un modèle data 100% transparent, le verdict de la veille, et l'historique complet. Aucun prono modifié après coup.",
  openGraph: {
    title: "Le Mondial, raconté par la data",
    description: "Les pronostics data du jour, le verdict d'hier, et le compteur de réussite du modèle.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${archivo.variable} ${outfit.variable} ${plex.variable}`}>
      <body>{children}</body>
    </html>
  );
}
