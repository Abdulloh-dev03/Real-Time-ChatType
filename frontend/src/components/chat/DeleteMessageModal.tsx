
import { useState } from "react"
import { X } from "lucide-react"
import type { IMessage } from "../../types"

interface DeleteMessageModalProps {
  isOpen: boolean
  message: IMessage | null
  otherUserName: string
  onClose: () => void
  onConfirm: (messageId: string, deleteForBoth: boolean) => void
}

export function DeleteMessageModal({ isOpen, message, otherUserName, onClose, onConfirm }: DeleteMessageModalProps) {
  const [deleteForBoth, setDeleteForBoth] = useState(false)

  if (!isOpen || !message) return null

  const handleConfirm = () => {
    onConfirm(message._id, deleteForBoth)
    setDeleteForBoth(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Message</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">Do you want to delete this message?</p>

          {/* Delete for both option */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={deleteForBoth}
              onChange={(e) => setDeleteForBoth(e.target.checked)}
              className="w-4 h-4 text-neutral-900 bg-gray-100 border-gray-300 rounded  cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Also delete for {otherUserName}</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
