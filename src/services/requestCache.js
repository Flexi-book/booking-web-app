const cacheStore = new Map()
const inflightStore = new Map()
const STORAGE_PREFIX = 'flexibook_cache:'

function canUseSessionStorage() {
  try {
    return typeof window !== 'undefined' && !!window.sessionStorage
  } catch {
    return false
  }
}

function readPersisted(key) {
  if (!canUseSessionStorage()) return null
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writePersisted(key, value) {
  if (!canUseSessionStorage()) return
  try {
    window.sessionStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify(value)
    )
  } catch {
    // no-op
  }
}

function removePersisted(keys) {
  if (!canUseSessionStorage()) return
  keys.forEach((key) => {
    try {
      window.sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`)
    } catch {
      // no-op
    }
  })
}

export function fetchWithCache(key, fetcher, ttlMs = 30000) {
  const now = Date.now()
  const cached = cacheStore.get(key)
  if (cached && cached.expiresAt > now) {
    return Promise.resolve(cached.value)
  }

  if (!cached) {
    const persisted = readPersisted(key)
    if (persisted) {
      cacheStore.set(key, persisted)
      if (persisted.expiresAt > now) {
        return Promise.resolve(persisted.value)
      }
      const inflightPersisted = inflightStore.get(key)
      if (!inflightPersisted) {
        const refresh = Promise.resolve()
          .then(fetcher)
          .then((value) => {
            const next = { value, expiresAt: Date.now() + ttlMs }
            cacheStore.set(key, next)
            writePersisted(key, next)
            return value
          })
          .finally(() => {
            inflightStore.delete(key)
          })
        inflightStore.set(key, refresh)
        return refresh
      }
      return inflightPersisted
    }
  }

  const inflight = inflightStore.get(key)
  if (inflight) {
    return inflight
  }

  const request = Promise.resolve()
    .then(fetcher)
    .then((value) => {
      const next = { value, expiresAt: Date.now() + ttlMs }
      cacheStore.set(key, next)
      writePersisted(key, next)
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
  removePersisted(keys)
}
