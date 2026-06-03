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

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function ensureAuthServiceReady({
  maxWaitMs = 8000,
  intervalMs = 1200,
} = {}) {
  const deadline = Date.now() + maxWaitMs

  while (Date.now() < deadline) {
    const response = await warmAuthService()
    if (response) return true

    const remaining = deadline - Date.now()
    if (remaining <= 0) break

    await sleep(Math.min(intervalMs, remaining))
  }

  return false
}
