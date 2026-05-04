import { useLocation, Link, useNavigate } from "react-router-dom"
import {
  LayoutGrid,
  Calendar,
  Layers,
  History,
  Settings,
  LogOut,
  Briefcase,
  ChevronDown,
  User,
  Bell,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from "@/components/ui/avatar"

const mainNavItems = [
  { title: "Dashboard",  url: "/admin/dashboard", icon: LayoutGrid },
  { title: "Reservas",   url: "/admin/reservas",  icon: Calendar },
  { title: "Servicios",  url: "/admin/servicios", icon: Layers },
  { title: "Activos",    url: "/admin/activos",    icon: Briefcase },
  { title: "Historial",  url: "/admin/historial", icon: History },
]

const secondaryNavItems = [
  { title: "Notificaciones", url: "/admin/notificaciones", icon: Bell },
  { title: "Configuración",  url: "/admin/config",        icon: Settings },
]

export function AppSidebar({ ...props }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── HEADER / LOGO ───────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin/dashboard">
                <div className="flex aspect-square h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-slate-900 dark:text-white">Flexibook</span>
                  <span className="truncate text-xs text-slate-400">Panel de Gestión</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── MAIN NAVIGATION ─────────────────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            General
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── FOOTER / USER ───────────────────── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="relative">
                    <Avatar className="h-9 w-9 rounded-xl">
                      <AvatarImage src="https://avatar.vercel.sh/flexiadmin" alt="Admin" />
                      <AvatarFallback className="rounded-xl bg-blue-600 text-white font-bold text-xs">
                        AD
                      </AvatarFallback>
                      <AvatarBadge className="bg-emerald-500 h-2.5 w-2.5" />
                    </Avatar>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-slate-800 dark:text-white">Administrador</span>
                    <span className="truncate text-xs text-slate-400">admin@flexibook.app</span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-xl p-2"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer py-2.5" onClick={() => navigate("/admin/config")}>
                  <User className="h-4 w-4 text-slate-400" /> Ver Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer py-2.5" onClick={() => navigate("/admin/config")}>
                  <Settings className="h-4 w-4 text-slate-400" /> Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
