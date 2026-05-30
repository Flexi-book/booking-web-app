import { useState, useEffect } from 'react'

export function useCrudPanel(api, emptyForm, mapItemToForm = null) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      setItems(await api.listar())
    } catch {
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  function iniciarEdicion(item) {
    setForm(mapItemToForm ? mapItemToForm(item) : { ...item })
    setEditingId(item.id)
    setShowForm(true)
    setError('')
  }

  function cancelar() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await api.actualizar(editingId, form)
      } else {
        await api.crear(form)
      }
      cancelar()
      await cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    }
  }

  async function eliminar(id, msg = '¿Eliminar este elemento?') {
    if (!confirm(msg)) return
    try {
      await api.eliminar(id)
      await cargar()
    } catch {
      setError('Error al eliminar')
    }
  }

  return { items, form, setForm, editingId, loading, error, setError, showForm, setShowForm, iniciarEdicion, cancelar, guardar, eliminar }
}
