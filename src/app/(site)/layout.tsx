import { AnchorBehavior } from '@/components/anchor-behavior'
import { Analytics } from '@/components/analytics'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

/** Layout du site public : entête, contenu, pied de page. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <AnchorBehavior />
      <Analytics />
    </>
  )
}
