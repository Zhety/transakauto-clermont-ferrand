import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { SITE } from '@/lib/site'
import './globals.css'

/** Police de la charte Transakauto. */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const noindex = process.env.NEXT_PUBLIC_NOINDEX === 'true'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Vendre sa voiture à Clermont-Fd et dans le Puy-de-Dôme | Transakauto",
    template: `%s — ${SITE.name}`,
  },
  description:
    "Estimation gratuite sous 24h, annonce, visites et paiement sécurisé : nous vendons votre voiture à votre place. Clermont-Fd, Issoire, Riom et le Puy-de-Dôme.",
  applicationName: SITE.name,
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  keywords: [
    'vendre sa voiture Clermont-Fd',
    'estimation voiture gratuite Clermont-Fd',
    'reprise voiture Clermont-Fd',
    'rachat voiture Issoire',
    'vendre sa voiture Riom',
    'vendre voiture occasion Puy-de-Dôme',
    'intermédiation automobile Auvergne',
    'mandataire auto Clermont-Fd',
    'Transakauto Clermont-Fd',
  ],
  category: 'automotive',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: SITE.name,
    url: SITE.url,
    title: "Vendre sa voiture à Clermont-Fd et dans le Puy-de-Dôme | Transakauto",
    description:
      "Estimation gratuite sous 24h, vente accompagnée ou reprise immédiate. Nous vendons votre véhicule à votre place, en toute sécurité.",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Vendre sa voiture à Clermont-Fd et dans le Puy-de-Dôme | Transakauto",
    description: 'Estimation gratuite sous 24h. Nous vendons votre véhicule à votre place, en toute sécurité.',
  },
  // Le blocage d'indexation vaut aussi pour les balises meta, pas seulement
  // pour robots.txt : certains moteurs suivent l'un sans l'autre.
  robots: noindex
    ? { index: false, follow: false }
    : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  other: {
    'geo.region': 'FR-ARA',
    'geo.placename': 'Clermont-Fd',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={poppins.variable}>
      <body className="min-h-screen bg-paper text-ink">{children}</body>
    </html>
  )
}
