export function warmDashboardData(companyId) {
  if (!companyId) return Promise.resolve()

  return import('./gestionService')
    .then(({ reservasApi, activosApi, serviciosApi }) =>
      Promise.allSettled([
        reservasApi.listar({ companyId }),
        activosApi.listar({ companyId }),
        serviciosApi.listar({ companyId }),
      ])
    )
    .catch(() => {
      // Warmup best-effort: no bloquea login ni navegación.
    })
}
