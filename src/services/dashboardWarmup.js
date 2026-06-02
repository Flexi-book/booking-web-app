export function warmDashboardData() {
  import('./gestionService')
    .then(({ reservasApi, activosApi, serviciosApi }) =>
      Promise.allSettled([
        reservasApi.listar(),
        activosApi.listar(),
        serviciosApi.listar(),
      ])
    )
    .catch(() => {
      // Warmup best-effort: no bloquea login ni navegación.
    })
}
