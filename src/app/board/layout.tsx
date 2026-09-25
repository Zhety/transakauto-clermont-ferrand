import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tableau des leads',
  robots: { index: false, follow: false },
}

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper text-ink">{children}</div>
}
