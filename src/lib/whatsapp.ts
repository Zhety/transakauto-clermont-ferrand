import { INTENT_LABELS, type LeadInput } from './lead'

const API_VERSION = 'v21.0'

/**
 * Envoie une alerte WhatsApp (API officielle Meta Cloud) à chaque numéro
 * configuré, via un message « template » approuvé. Ne lève jamais : un échec
 * WhatsApp ne doit pas perdre le lead (email + base restent le canal principal).
 *
 * Variables attendues par le template (dans cet ordre) :
 *   {{1}} véhicule · {{2}} téléphone · {{3}} localisation · {{4}} type de demande
 */
export async function sendLeadWhatsApp(lead: LeadInput): Promise<{ sent: boolean; error?: string }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const template = process.env.WHATSAPP_TEMPLATE_NAME
  const lang = process.env.WHATSAPP_TEMPLATE_LANG ?? 'fr'
  const recipients = (process.env.WHATSAPP_RECIPIENTS ?? '')
    .split(',')
    .map((s) => s.trim().replace(/[^\d]/g, ''))
    .filter(Boolean)

  if (!token || !phoneId || !template || recipients.length === 0) {
    return { sent: false, error: 'whatsapp-not-configured' }
  }

  const vehicle = [lead.make, lead.model, lead.version].filter(Boolean).join(' ')
  const location = `${lead.postalCode} ${lead.city ?? ''}`.trim() || '—'
  const params = [vehicle, lead.phone, location, INTENT_LABELS[lead.intent]]

  const url = `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`

  const results = await Promise.all(
    recipients.map(async (to) => {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
              name: template,
              language: { code: lang },
              components: [
                { type: 'body', parameters: params.map((text) => ({ type: 'text', text })) },
              ],
            },
          }),
        })
        if (!res.ok) {
          console.error('[whatsapp] envoi échoué', to, res.status, await res.text())
          return false
        }
        return true
      } catch (error) {
        console.error('[whatsapp] erreur réseau', error)
        return false
      }
    }),
  )

  return { sent: results.some(Boolean) }
}
