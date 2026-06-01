const cacheStore = new Map()
const inflightStore = new Map()

export function fetchWithCache(key, fetcher, ttlMs = 30000) {
  const now = Date.now()
  const cached = cacheStore.get(key)
  if (cached && cached.expiresAt > now) {
    return Promise.resolve(cached.value)
  }

  const inflight = inflightStore.get(key)
  if (inflight) {
    return inflight
  }

  const request = Promise.resolve()
    .then(fetcher)
    .then((value) => {
      cacheStore.set(key, { value, expiresAt: Date.now() + ttlMs })
      return value
    })
    .finally(() => {
      inflightStore.delete(key)
    })

  inflightStore.set(key, request)
  return request
}

export function clearCacheKeys(keys) {
  keys.forEach((key) => {
    cacheStore.delete(key)
    inflightStore.delete(key)
  })
}

