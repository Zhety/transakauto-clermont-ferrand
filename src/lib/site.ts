/**
 * Coordonnées et informations légales de l'agence.
 * Données société vérifiées au registre national des entreprises (SIRET
 * 930 899 000 00010). L'adresse est celle du siège social, qui est aussi
 * celle de l'agence.
 */
export const SITE = {
  name: 'Transakauto Clermont-Fd',
  legalName: 'AP AUTOMOBILE (SAS)',
  tagline: "Agence d'intermédiation automobile à Clermont-Fd",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://transakautoclermontferrand.com',

  phone: '+33 6 76 42 76 03',
  phoneDisplay: '06 76 42 76 03',
  email: 'contact@transakautoclermontferrand.com',

  address: {
    street: '8 Avenue Jean Curabet',
    postalCode: '63170',
    city: 'Aubière',
    country: 'France',
  },

  hours: 'Du lundi au samedi, 10h - 19h',

  // Mentions légales
  siret: 'SIRET 930 899 000 00010',
  rcs: 'RCS Clermont-Fd 930 899 000',
  vat: 'TVA intracommunautaire FR82 930 899 000',
  capital: 'Capital social de 1 000 €',
  director: 'Audrey Quiclet',
  hosting: 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA',

  areas: [
    'Clermont-Fd',
    'Aubière',
    'Issoire',
    "Cournon-d'Auvergne",
    'Lempdes',
    'Chamalières',
    'Royat',
    'Gerzat',
    'Riom',
    'Pont-du-Château',
    'Veyre-Monton',
    'Lezoux',
    'Volvic',
    'Le Mont-Dore',
    'Saint-Nectaire',
    'Pontgibaud',
    'Besse',
    'Super-Besse',
  ],
} as const

export const NAV = [
  { href: '/#services', label: 'Nos services' },
  { href: '/#process', label: 'Comment ça marche' },
  { href: '/#faq', label: 'Questions fréquentes' },
] as const
