import { useState, useEffect, useRef } from "react"
import {
  Sun, Moon, Eye, Building2, Camera, ImagePlus,
  Trash2, Edit2, Save, Plus, CheckCircle2, Palette,
  Globe, Phone, MapPin, X
} from "lucide-react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

// ── helpers ──────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        checked ? "bg-slate-900" : "bg-slate-200"
      )}
    >
      <span className={cn(
        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        checked ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  )
}

// ── THEME PANEL ───────────────────────────────────────────────────
function ThemePanel() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark", "color-blind")
    root.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const themes = [
    {
      id: "light",
      label: "Modo Claro",
      icon: Sun,
      preview: "bg-white",
      accent: "bg-slate-100",
      barColor: "bg-slate-900",
      desc: "Limpio y minimalista"
    },
    {
      id: "dark",
      label: "Modo Oscuro",
      icon: Moon,
      preview: "bg-slate-900",
      accent: "bg-slate-800",
      barColor: "bg-blue-400",
      desc: "Reduce la fatiga visual"
    },
    {
      id: "color-blind",
      label: "Accesibilidad",
      icon: Eye,
      preview: "bg-amber-50",
      accent: "bg-amber-100",
      barColor: "bg-amber-500",
      desc: "Contraste optimizado"
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:border-slate-300",
              theme === t.id
                ? "border-slate-950 bg-slate-50/50 shadow-sm"
                : "border-slate-200 bg-white"
            )}
          >
            <div className={cn("w-full rounded-lg overflow-hidden border border-slate-100 h-20 p-3 flex flex-col gap-2", t.preview)}>
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", t.barColor)} />
                <div className={cn("h-1.5 w-10 rounded-full", t.accent)} />
              </div>
              <div className={cn("flex-1 rounded-md p-2 space-y-1", t.accent)}>
                <div className={cn("h-1 w-full rounded-full opacity-30", t.barColor)} />
                <div className={cn("h-1 w-2/3 rounded-full opacity-20", t.barColor)} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <t.icon className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-semibold text-xs text-slate-900">{t.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{t.desc}</p>
              </div>
              {theme === t.id && (
                <CheckCircle2 className="h-4 w-4 text-slate-950" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}


// ── BUSINESS PANEL ────────────────────────────────────────────────
function BusinessPanel() {
  const [saved, setSaved] = useState(false)
  const [info, setInfo] = useState({
    name: localStorage.getItem("biz_name") || "Flexibook Business",
    tagline: localStorage.getItem("biz_tagline") || "",
    description: localStorage.getItem("biz_description") || "",
    phone: localStorage.getItem("biz_phone") || "",
    address: localStorage.getItem("biz_address") || "",
    website: localStorage.getItem("biz_website") || "",
    logo: localStorage.getItem("biz_logo") || null,
  })
  const fileRef = useRef()

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setInfo(prev => ({ ...prev, logo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    Object.entries(info).forEach(([k, v]) => {
      if (v) localStorage.setItem(`biz_${k}`, v)
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/30 border-b border-slate-100 py-4 px-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <CardTitle className="text-sm font-semibold text-slate-900">Perfil del Negocio</CardTitle>
          </div>
          <CardDescription className="text-xs font-medium">Información básica que verán tus clientes en la página de reservas.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div
                onClick={() => fileRef.current.click()}
                className="relative h-24 w-24 rounded-2xl overflow-hidden bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center cursor-pointer group hover:border-slate-400 transition-colors"
              >
                {info.logo ? (
                  <img src={info.logo} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-300">
                    <Camera className="h-6 w-6" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Logo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <Button variant="ghost" size="sm" onClick={() => fileRef.current.click()} className="h-7 text-[10px] font-semibold uppercase tracking-wider border border-slate-200 hover:bg-slate-50">
                Cambiar Imagen
              </Button>
            </div>

            {/* Fields */}
            <div className="flex-1 w-full grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 ml-1">Nombre Comercial</Label>
                  <Input className="h-9 text-sm font-medium border-slate-200 focus:ring-slate-400" 
                    value={info.name} onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 ml-1">Eslogan</Label>
                  <Input className="h-9 text-sm font-medium border-slate-200 focus:ring-slate-400" 
                    placeholder="Ej: Experiencias únicas"
                    value={info.tagline} onChange={e => setInfo(p => ({ ...p, tagline: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 ml-1">Breve Descripción</Label>
                <textarea
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 resize-none min-h-[80px]"
                  value={info.description}
                  onChange={e => setInfo(p => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/30 border-b border-slate-100 py-4 px-6">
          <CardTitle className="text-sm font-semibold text-slate-900">Datos de Contacto</CardTitle>
          <CardDescription className="text-xs font-medium">¿Cómo pueden encontrarte tus clientes?</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 ml-1"><Phone className="h-3 w-3 text-slate-400" /> Teléfono</Label>
            <Input className="h-9 text-sm font-medium border-slate-200" value={info.phone}
              onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 ml-1"><MapPin className="h-3 w-3 text-slate-400" /> Ubicación</Label>
            <Input className="h-9 text-sm font-medium border-slate-200" value={info.address}
              onChange={e => setInfo(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 ml-1"><Globe className="h-3 w-3 text-slate-400" /> Web</Label>
            <Input className="h-9 text-sm font-medium border-slate-200" value={info.website}
              onChange={e => setInfo(p => ({ ...p, website: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 text-white font-medium h-9 px-6 rounded-md shadow-sm transition-all active:scale-95 gap-2">
          <Save className="h-4 w-4" />
          {saved ? "Guardado" : "Guardar Cambios"}
        </Button>
        {saved && (
          <span className="text-xs font-semibold text-emerald-600 animate-in fade-in flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Cambios aplicados con éxito
          </span>
        )}
      </div>
    </div>
  )
}

// ── GALLERY PANEL ─────────────────────────────────────────────────
function GalleryPanel() {
  const [photos, setPhotos] = useState([
    { id: 1, url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop", name: "Ambiente Principal", description: "Espacio de trabajo y confort" },
    { id: 2, url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&h=300&fit=crop", name: "Recepción", description: "Área de bienvenida" },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [newPhoto, setNewPhoto] = useState({ url: "", name: "", description: "" })
  const fileRef = useRef()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setNewPhoto(p => ({ ...p, url: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleAdd = () => {
    if (!newPhoto.url || !newPhoto.name) return
    setPhotos(p => [...p, { id: Date.now(), ...newPhoto }])
    setNewPhoto({ url: "", name: "", description: "" })
    setShowAdd(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-slate-900">Catálogo Visual</h3>
          <p className="text-xs text-slate-500 font-medium">{photos.length} imágenes publicadas</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-medium h-8 px-3 rounded-md text-xs gap-2">
          <ImagePlus className="h-3.5 w-3.5" /> Añadir Foto
        </Button>
      </div>

      {showAdd && (
        <Card className="border border-slate-200 bg-slate-50/50 shadow-none animate-in slide-in-from-top-2 duration-300">
          <CardContent className="p-4 flex gap-4">
             <div onClick={() => fileRef.current.click()} className="h-24 w-32 shrink-0 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden">
                {newPhoto.url ? <img src={newPhoto.url} className="h-full w-full object-cover" /> : <Camera className="h-5 w-5 text-slate-400" />}
             </div>
             <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
             <div className="flex-1 space-y-2">
                <Input placeholder="Nombre de la imagen" className="h-8 text-xs font-medium border-slate-200" value={newPhoto.name} onChange={e => setNewPhoto(p => ({ ...p, name: e.target.value }))} />
                <Input placeholder="Descripción corta" className="h-8 text-xs font-medium border-slate-200" value={newPhoto.description} onChange={e => setNewPhoto(p => ({ ...p, description: e.target.value }))} />
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-semibold uppercase" onClick={() => setShowAdd(false)}>Cancelar</Button>
                  <Button size="sm" className="h-7 text-[10px] font-semibold uppercase bg-slate-900" onClick={handleAdd}>Guardar</Button>
                </div>
             </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <Card key={photo.id} className="group overflow-hidden border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="relative aspect-video">
              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full bg-white/90 shadow-sm text-red-600" onClick={() => setPhotos(p => p.filter(x => x.id !== photo.id))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="font-semibold text-xs text-slate-900">{photo.name}</p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5 line-clamp-1">{photo.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────
export default function ConfigPanel() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Configuración</h1>
        <p className="text-sm text-muted-foreground font-medium">Personaliza la identidad y el comportamiento de tu plataforma.</p>
      </div>

      <Tabs defaultValue="negocio" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-lg h-auto gap-1 border border-slate-200/50">
          <TabsTrigger value="negocio" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 py-1.5 px-4 text-xs font-medium">
            <Building2 className="h-3.5 w-3.5" /> Negocio
          </TabsTrigger>
          <TabsTrigger value="apariencia" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 py-1.5 px-4 text-xs font-medium">
            <Palette className="h-3.5 w-3.5" /> Apariencia
          </TabsTrigger>
          <TabsTrigger value="galeria" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 py-1.5 px-4 text-xs font-medium">
            <ImagePlus className="h-3.5 w-3.5" /> Galería
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apariencia">
          <ThemePanel />
        </TabsContent>
        <TabsContent value="negocio">
          <BusinessPanel />
        </TabsContent>
        <TabsContent value="galeria">
          <GalleryPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
