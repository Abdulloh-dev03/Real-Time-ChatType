

import { useState, forwardRef } from "react"
import type { IMessage } from "../../types"
import { Edit3, Trash2 } from "lucide-react"

interface MessageContextMenuProps {
  x: number
  y: number
  message: IMessage | null
  isMyMessage: boolean
  onClose: () => void
  onReact: (message: IMessage, emoji: string) => void
  onEdit: (message: IMessage) => void
  onDelete: (message: IMessage) => void
}

const MessageContextMenu = forwardRef<HTMLDivElement, MessageContextMenuProps>(
  ({ x, y, message, onClose, onReact, onEdit, onDelete, isMyMessage }, ref) => {
    const [showEmojiPicker] = useState(false)

    if (!message) return null
    const quickReactions = ["👍", "😂", "😮", "😎", "🔥", "👌", "😀", "😊"]

    return (
      <div
        ref={ref}
        className="absolute z-50 bg-white dark:backdrop-blur-md dark:bg-black/10 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95 transition-all duration-500 ease-out transform-3d hover:rotate-x-40 hover:rotate-z-3"
        style={{ top: y, left: x, width: 180 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Quick Emoji Reactions */}
        {!showEmojiPicker && (
          <div className="p-2">
            <div className="grid grid-cols-4 gap-4 mb-2">
              {quickReactions.map((emoji) => (
                <button
                  key={emoji}
                  className="flex items-center justify-center w-10 h-10 text-lg cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 active:scale-95"
                  onClick={() => {
                    onReact(message, emoji)
                    onClose()
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons - only show edit/delete for own messages */}
        {!showEmojiPicker && isMyMessage && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <button
              className="w-full text-left px-3 py-2 text-sm text-gray-700 cursor-pointer dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center justify-center gap-2"
              onClick={() => {
                if (message) {
                  onEdit(message)
                }
                onClose()
              }}
            >
              <Edit3 className="w-4 h-4 text-gray-500" />
              <span className="text-xs">Edit</span>
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 flex items-center justify-center gap-2"
              onClick={() => {
                onDelete(message)
                onClose()
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="text-xs">Delete</span>
            </button>
          </div>
        )}
      </div>
    )
  },
)

MessageContextMenu.displayName = "MessageContextMenu"

export default MessageContextMenu
