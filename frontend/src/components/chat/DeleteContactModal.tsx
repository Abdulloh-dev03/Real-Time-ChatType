import { useState } from "react"
import { X } from "lucide-react"

interface DeleteContactModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  contactName: string
  isDark?: boolean
}

export function DeleteContactModal({
  isOpen,
  onClose,
  onConfirm,
  contactName,
  isDark = false,
}: DeleteContactModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error("Error deleting contact:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`rounded-lg p-6 max-w-md w-full mx-4 ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Delete Contact</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-gray-100 cursor-pointer ${isDark ? "hover:bg-gray-700" : ""}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm mb-4">
            Are you sure you want to delete <strong>{contactName}</strong> from your contacts?
          </p>
          <p className="text-xs text-gray-500">
            This will remove them from your contact list and you from theirs. Your chat history will remain.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Contact"}
          </button>
        </div>
      </div>
    </div>
  )
}
