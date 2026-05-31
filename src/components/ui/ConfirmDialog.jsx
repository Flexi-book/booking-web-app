import { useEffect, useRef } from 'react'
import Button from './Button'

export default function ConfirmDialog({
  open,
  title = '¿Confirmar acción?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    if (open) ref.current.showModal()
    else ref.current.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      className="rounded-xl shadow-xl p-6 w-full max-w-sm backdrop:bg-black/40"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      {message && <p className="text-sm text-gray-600 mb-6">{message}</p>}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </dialog>
  )
}
