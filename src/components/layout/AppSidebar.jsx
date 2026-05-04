import { useLocation, Link, useNavigate } from "react-router-dom"
import {
  LayoutGrid,
  Calendar,
  Clock,
  History,
  Settings,
  LogOut,
  Users,
  ChevronDown,
  User,
  Bell,
  Layers,
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
import authService from "../../services/authService"

export function AppSidebar({ ...props }) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = authService.getUser()

  const mainNavItems = [
    { title: "Dashboard",  url: "/admin/dashboard", icon: LayoutGrid },
    { title: "Reservas",   url: "/admin/reservas",  icon: Calendar },
    { title: "Servicios",  url: "/admin/servicios", icon: Clock },
    { title: "Activos",    url: "/admin/activos",    icon: Users },
    { title: "Historial",  url: "/admin/historial", icon: History },
  ]

  const secondaryNavItems = [
    { title: "Notificaciones", url: "/admin/notificaciones", icon: Bell },
    { title: "Configuración",  url: "/admin/config",        icon: Settings },
  ]

  const handleLogout = () => {
    authService.logout()
    window.location.href = '/login'
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── HEADER / LOGO ───────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin/dashboard">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shrink-0 overflow-hidden">
                  <img 
                    src="/flexibook-logo.svg" 
                    alt="Flexibook" 
                    className="h-full w-full object-contain p-1" 
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-semibold text-slate-900 dark:text-white uppercase tracking-tight">
                    {user?.companyName || user?.nombreEmpresa || 'Mi Negocio'}
                  </span>
                  <span className="truncate text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panel de Gestión</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── MAIN NAVIGATION ─────────────────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-slate-400 uppercase py-4">
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
                    className="h-10"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-slate-400 uppercase py-4">
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
                    className="h-10"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{item.title}</span>
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
                    <Avatar className="h-9 w-9 rounded-xl border border-slate-200">
                      <AvatarImage src={user?.avatarUrl} alt="User" />
                      <AvatarFallback className="rounded-xl bg-slate-900 text-white font-bold text-xs">
                        {(user?.nombre || user?.name || 'A').charAt(0)}
                      </AvatarFallback>
                      <AvatarBadge className="bg-emerald-500 h-2.5 w-2.5" />
                    </Avatar>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-semibold text-slate-900 dark:text-white leading-none">
                      {user?.nombre || user?.name || 'Administrador'}
                    </span>
                    <span className="truncate text-[11px] font-medium text-slate-400 mt-1">
                      {user?.email || 'admin@flexibook.app'}
                    </span>
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
                  <User className="h-4 w-4 text-slate-400" /> Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer py-2.5" onClick={() => navigate("/admin/config")}>
                  <Settings className="h-4 w-4 text-slate-400" /> Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
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
