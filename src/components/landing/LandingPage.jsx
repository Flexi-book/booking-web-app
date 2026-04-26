import { useState } from 'react'
import { Link } from 'react-router-dom'

const categorias = ['Peluquería', 'Gimnasio', 'Fisioterapia', 'Yoga', 'Odontología', 'Masajes']

const negocios = [
  { nombre: 'Studio Zen Spa', categoria: 'Masajes', rating: 4.9, reviews: 128, img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80' },
  { nombre: 'FitLife Gym', categoria: 'Gimnasio', rating: 4.7, reviews: 94, img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
  { nombre: 'Sonrisa Dental', categoria: 'Odontología', rating: 5.0, reviews: 61, img: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&q=80' },
  { nombre: 'Corte & Style', categoria: 'Peluquería', rating: 4.8, reviews: 210, img: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&q=80' },
]

function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export default function LandingPage() {
  const [busqueda, setBusqueda] = useState('')
  const [ciudad, setCiudad] = useState('')

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/flexibook-logo.svg" alt="Flexibook" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Flexibook
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            <a href="#" className="text-blue-600 border-b-2 border-blue-600 pb-0.5">Explorar</a>
            <a href="#" className="hover:text-gray-900 transition">Precios</a>
            <a href="#" className="hover:text-gray-900 transition">Empresas</a>
            <a href="#" className="hover:text-gray-900 transition">Ayuda</a>
          </nav>

          {/* CTA */}
          <Link
            to="/login"
            className="shrink-0 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            Ingreso empresa
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative overflow-hidden py-20 px-6"
        style={{
          background: 'radial-gradient(ellipse 90% 80% at 85% 50%, #fde8e0 0%, #fdf0ec 25%, #f5f0ff 55%, #eef3ff 75%, #ffffff 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">

          <h1
            className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Encuentra y reserva los mejores servicios de tu ciudad
          </h1>

          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Descubre{' '}
            <span className="text-blue-600 font-medium">peluquerías</span>,{' '}
            <span className="text-green-600 font-medium">gimnasios</span>,{' '}
            <span className="text-purple-600 font-medium">centros de salud</span>{' '}
            y mucho más en un solo clic.
          </p>

          {/* Barra de búsqueda */}
          <div className="flex flex-col sm:flex-row bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl mx-auto mb-5">
            <div className="flex items-center gap-3 px-4 py-3.5 flex-1 border-b sm:border-b-0 sm:border-r border-gray-200">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="¿Qué estás buscando?"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5 flex-1">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                placeholder="Ciudad o código postal"
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-7 py-3.5 transition shrink-0 m-0">
              Buscar
            </button>
          </div>

          {/* Categorías rápidas */}
          <div className="flex flex-wrap justify-center gap-2">
            {categorias.map(cat => (
              <button
                key={cat}
                className="text-xs font-medium text-gray-600 bg-white border border-gray-200 px-4 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition shadow-sm"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* NEGOCIOS DESTACADOS */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Negocios destacados
            </h2>
            <button className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {negocios.map((n, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={n.img}
                    alt={n.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    <StarIcon />
                    {n.rating}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">{n.categoria}</p>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{n.nombre}</h3>
                  <p className="text-xs text-gray-400">{n.reviews} reseñas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-gray-900 text-gray-400 py-7">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <img src="/flexibook-logo.svg" alt="Flexibook" className="w-7 h-7 object-contain" />
            <span className="text-white font-semibold">Flexibook</span>
          </div>
          <p>© 2024 Flexibook. Todos los derechos reservados.</p>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition font-medium">
            Acceso administrador →
          </Link>
        </div>
      </footer>

    </div>
  )
}
