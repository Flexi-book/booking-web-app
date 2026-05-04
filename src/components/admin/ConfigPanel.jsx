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

// ── helpers ──────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
        checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
      )}
    >
      <span className={cn(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        checked ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  )
}

// ── THEME PANEL ───────────────────────────────────────────────────
function ThemePanel() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")

  useEffect(() => {
    const root = document.documentElement
    // Remove all theme classes first
    root.classList.remove("light", "dark", "color-blind")
    // Apply selected theme
    root.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const themes = [
    {
      id: "light",
      label: "Claro",
      icon: Sun,
      preview: "bg-white",
      accent: "bg-slate-100",
      barColor: "bg-blue-500",
      desc: "Ideal para espacios iluminados"
    },
    {
      id: "dark",
      label: "Oscuro",
      icon: Moon,
      preview: "bg-slate-900",
      accent: "bg-slate-800",
      barColor: "bg-blue-400",
      desc: "Reduce la fatiga visual nocturna"
    },
    {
      id: "color-blind",
      label: "Daltónico",
      icon: Eye,
      preview: "bg-amber-50",
      accent: "bg-amber-100",
      barColor: "bg-amber-500",
      desc: "Optimizado para protanopia y deuteranopia"
    },
  ]

  return (
    <div className="space-y-8">
      {/* Theme Selector */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Tema de interfaz</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "group relative flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:shadow-md",
                theme === t.id
                  ? "border-blue-600 ring-4 ring-blue-500/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
              )}
            >
              {/* Preview mockup */}
              <div className={cn("w-full rounded-xl overflow-hidden shadow-inner h-24 p-3 flex flex-col gap-2", t.preview)}>
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", t.barColor)} />
                  <div className={cn("h-2 w-12 rounded-full", t.accent)} />
                </div>
                <div className={cn("flex-1 rounded-lg p-2 space-y-1.5", t.accent)}>
                  <div className={cn("h-1.5 w-3/4 rounded-full opacity-50", t.barColor)} />
                  <div className={cn("h-1.5 w-1/2 rounded-full opacity-30", t.barColor)} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <t.icon className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-sm">{t.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                </div>
                {theme === t.id && (
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


// ── BUSINESS PANEL ────────────────────────────────────────────────
function BusinessPanel() {
  const [saved, setSaved] = useState(false)
  const [info, setInfo] = useState({
    name: localStorage.getItem("biz_name") || "Mi Negocio",
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
    <div className="space-y-6">
      {/* Logo + Name Row */}
      <Card className="border border-slate-100 dark:border-slate-800 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base">Identidad del Negocio</CardTitle>
          </div>
          <CardDescription>Esta información aparecerá en tu perfil público y en los correos enviados a tus clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div
                onClick={() => fileRef.current.click()}
                className="relative h-28 w-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer group hover:border-blue-400 transition-colors"
              >
                {info.logo ? (
                  <img src={info.logo} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Camera className="h-7 w-7" />
                    <span className="text-xs">Logo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current.click()} className="w-full text-xs">
                Cambiar logo
              </Button>
            </div>

            {/* Fields */}
            <div className="flex-1 w-full grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="biz-name">Nombre del Negocio *</Label>
                  <Input id="biz-name" placeholder="Ej: Centro Wellness Serenity"
                    value={info.name} onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="biz-tagline">Eslogan / Tagline</Label>
                  <Input id="biz-tagline" placeholder="Ej: Tu bienestar, nuestra misión"
                    value={info.tagline} onChange={e => setInfo(p => ({ ...p, tagline: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-desc">Descripción</Label>
                <textarea
                  id="biz-desc"
                  rows={3}
                  placeholder="Cuéntales a tus clientes sobre tu negocio..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  value={info.description}
                  onChange={e => setInfo(p => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="border border-slate-100 dark:border-slate-800 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Información de Contacto</CardTitle>
          <CardDescription>Datos visibles para tus clientes en el perfil público.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Teléfono</Label>
            <Input placeholder="+56 9 1234 5678" value={info.phone}
              onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Dirección</Label>
            <Input placeholder="Av. Principal 123, Santiago" value={info.address}
              onChange={e => setInfo(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Sitio Web</Label>
            <Input placeholder="https://minegocio.cl" value={info.website}
              onChange={e => setInfo(p => ({ ...p, website: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Save className="h-4 w-4" />
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </Button>
        {saved && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm animate-in fade-in duration-300">
            <CheckCircle2 className="h-4 w-4" /> Los cambios se aplicaron correctamente.
          </div>
        )}
      </div>
    </div>
  )
}

// ── GALLERY PANEL ─────────────────────────────────────────────────
function GalleryPanel() {
  const [photos, setPhotos] = useState([
    { id: 1, url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop", name: "Sala de Masajes", description: "Ambiente tranquilo y relajante" },
    { id: 2, url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&h=300&fit=crop", name: "Recepción", description: "Te damos la bienvenida" },
  ])
  const [editing, setEditing] = useState(null)
  const [newPhoto, setNewPhoto] = useState({ url: "", name: "", description: "" })
  const [showAdd, setShowAdd] = useState(false)
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

  const handleDelete = (id) => setPhotos(p => p.filter(x => x.id !== id))

  const handleUpdate = (id) => {
    setPhotos(p => p.map(x => x.id === id ? { ...x, ...editing } : x))
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {photos.length} foto{photos.length !== 1 ? "s" : ""} en tu galería pública
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <ImagePlus className="h-4 w-4" /> Agregar foto
        </Button>
      </div>

      {/* Add photo form */}
      {showAdd && (
        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 shadow-none animate-in fade-in slide-in-from-top-2 duration-300">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Preview */}
              <div
                onClick={() => fileRef.current.click()}
                className="relative h-36 w-full sm:w-48 shrink-0 rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer group hover:border-blue-400 transition-colors"
              >
                {newPhoto.url ? (
                  <img src={newPhoto.url} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs text-center px-2">Haz clic para subir una foto</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

              <div className="flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label>Nombre de la foto *</Label>
                  <Input placeholder="Ej: Sala de tratamientos"
                    value={newPhoto.name}
                    onChange={e => setNewPhoto(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Descripción</Label>
                  <Input placeholder="Ej: Equipada con tecnología de última generación"
                    value={newPhoto.description}
                    onChange={e => setNewPhoto(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setNewPhoto({ url: "", name: "", description: "" }) }}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleAdd} disabled={!newPhoto.url || !newPhoto.name}
                className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="h-3.5 w-3.5" /> Agregar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <Card key={photo.id} className="group overflow-hidden border border-slate-100 dark:border-slate-800 shadow-none hover:shadow-md transition-shadow">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={photo.url}
                alt={photo.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Action buttons on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setEditing({ id: photo.id, name: photo.name, description: photo.description })}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors shadow"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Edit mode */}
            {editing?.id === photo.id ? (
              <CardContent className="pt-4 space-y-2">
                <Input
                  className="text-sm"
                  value={editing.name}
                  onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                />
                <Input
                  className="text-sm"
                  value={editing.description}
                  onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                />
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => handleUpdate(photo.id)} className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1 text-xs">
                    <Save className="h-3 w-3" /> Guardar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="text-xs">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="pt-3 pb-4">
                <p className="font-semibold text-sm text-slate-800 dark:text-white">{photo.name}</p>
                {photo.description && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{photo.description}</p>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
          <ImagePlus className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-sm font-medium">No hay fotos en tu galería</p>
          <p className="text-xs mt-1">Agrega imágenes de tu negocio para atraer más clientes</p>
        </div>
      )}
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────
export default function ConfigPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Configuración</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Personaliza tu panel y la información que verán tus clientes.
        </p>
      </div>

      <Tabs defaultValue="apariencia" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl h-auto gap-1">
          <TabsTrigger value="apariencia" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 py-2 px-4">
            <Palette className="h-4 w-4" /> Apariencia
          </TabsTrigger>
          <TabsTrigger value="negocio" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 py-2 px-4">
            <Building2 className="h-4 w-4" /> Mi Negocio
          </TabsTrigger>
          <TabsTrigger value="galeria" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 py-2 px-4">
            <ImagePlus className="h-4 w-4" /> Galería
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
