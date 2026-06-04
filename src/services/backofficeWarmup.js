import { adminClient } from '../api/apiClients'

let warmupInFlight = null

export function warmBackofficeService() {
  if (warmupInFlight) return warmupInFlight

  warmupInFlight = adminClient.get('/health', { timeout: 5000 })
    .catch(() => null)
    .finally(() => {
      warmupInFlight = null
    })

  return warmupInFlight
}
