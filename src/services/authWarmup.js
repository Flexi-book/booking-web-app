import { authClient } from '../api/apiClients'

let warmupInFlight = null

export function warmAuthService() {
  if (warmupInFlight) return warmupInFlight

  warmupInFlight = authClient.get('/health', { timeout: 1500 })
    .catch(() => null)
    .finally(() => {
      warmupInFlight = null
    })

  return warmupInFlight
}
