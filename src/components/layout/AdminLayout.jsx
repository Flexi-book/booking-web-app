import { useLocation, Outlet, useNavigate } from "react-router-dom"
import { Bell, Search, Settings, User, LogOut } from "lucide-react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const routeLabels = {
  "/admin/dashboard":       "Dashboard",
  "/admin/reservas":        "Reservas",
  "/admin/servicios":       "Servicios",
  "/admin/activos":         "Activos",
  "/admin/historial":       "Historial",
  "/admin/config":          "Configuración",
  "/admin/notificaciones":  "Notificaciones",
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentLabel = routeLabels[location.pathname] ?? "Panel"
  const isHome = location.pathname === "/admin/dashboard"

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* ── HEADER ──────────────────────────────────────── */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-5" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="/admin/dashboard"
                    className="text-slate-400 hover:text-blue-600 text-xs font-medium transition-colors"
                  >
                    Inicio
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {!isHome && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {currentLabel}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar..."
                className="h-9 w-52 lg:w-72 rounded-xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-blue-200 pl-9 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            </Button>

            <Separator orientation="vertical" className="data-[orientation=vertical]:h-5 hidden sm:block" />

            {/* Profile information removed as it is now in the Sidebar */}
          </div>
        </header>

        {/* ── PAGE CONTENT ────────────────────────────────── */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-0">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
