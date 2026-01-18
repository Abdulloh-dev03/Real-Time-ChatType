

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Paperclip, Send, X, Smile } from "lucide-react"
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react"
import { IoCheckmarkCircle } from "react-icons/io5"
import { socket } from "../../lib/socket"
import { useAppSelector } from "../../app/hooks"

interface MessageInputProps {
  onSendText: (text: string, editingMessageId?: string) => void
  onSendImage: (file: File) => void
  onCancel?: () => void
  editingMessageId?: string
  initialText?: string
}

export default function MessageInput({
  onSendText,
  onSendImage,
  onCancel,
  editingMessageId,
  initialText = "",
}: MessageInputProps) {
  const [text, setText] = useState(initialText)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const selectedUser = useAppSelector((state) => state.chat.selectedUser)
  const currentUser = useAppSelector((state) => state.auth.user)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setText(initialText)
  }, [initialText])

  useEffect(() => {
    if (editingMessageId && inputRef.current) {
      inputRef.current.focus()
      const textLength = initialText.length
      inputRef.current.setSelectionRange(textLength, textLength)
    }
  }, [editingMessageId, initialText])

  const handleTypingStart = useCallback(() => {
    if (!isTyping && selectedUser?._id && currentUser?._id && !editingMessageId) {
      setIsTyping(true)
      socket.emit("startTyping", {
        userId: currentUser._id,
        contactId: selectedUser._id,
      })
    }
  }, [isTyping, selectedUser?._id, currentUser?._id, editingMessageId])

  const handleTypingStop = useCallback(() => {
    if (isTyping && selectedUser?._id && currentUser?._id) {
      setIsTyping(false)
      socket.emit("stopTyping", {
        userId: currentUser._id,
        contactId: selectedUser._id,
      })
    }
  }, [isTyping, selectedUser?._id, currentUser?._id])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    setText(newText)

    if (newText.trim() && !editingMessageId) {
      handleTypingStart()

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop()
      }, 2000)
    } else if (!newText.trim() && isTyping) {
      handleTypingStop()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const handleSend = () => {
    if (text.trim() || selectedImage) {
      if (isTyping) {
        handleTypingStop()
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }

      if (text.trim()) {
        onSendText(text.trim(), editingMessageId)
        if (!editingMessageId) {
          setText("")
        }
      }
      if (selectedImage) {
        onSendImage(selectedImage)
        setSelectedImage(null)
        setPreviewUrl(null)
      }
      setShowEmojiPicker(false)
    }
  }

  const handleCancel = () => {
    setText("")
    onCancel?.()
  }

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTyping) {
        handleTypingStop()
      }
    }
  }, [handleTypingStop, isTyping])

  return (
    <div className="absolute bottom-0 left-0 right-0 px-4 py-3 z-20 space-y-2">
      {showEmojiPicker && (
        <div className="mb-2 rounded-xl backdrop-blur-md bg-white/90 dark:bg-black/90 border border-white/20 dark:border-white/10 shadow-lg">
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            theme={Theme.AUTO}
            height={350}
            width="100%"
            searchDisabled={false}
            skinTonesDisabled={false}
            previewConfig={{
              showPreview: false,
            }}
          />
        </div>
      )}

      {previewUrl && (
        <div className="relative w-fit max-w-xs">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt="Preview"
            className="rounded-lg border border-gray-300 shadow-lg"
          />
          <button
            onClick={clearImage}
            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {editingMessageId && <div className="text-sm text-blue-500 dark:text-blue-400 px-2">Editing message</div>}

      <div className="flex items-center gap-3 rounded-xl backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 shadow-md px-4 py-2">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-700 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition cursor-pointer"
          title="Attach image"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-gray-700 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition cursor-pointer"
          title="Add emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSend()
            } else if (e.key === "Escape" && editingMessageId) {
              e.preventDefault()
              handleCancel()
            }
          }}
          placeholder={editingMessageId ? "Edit your message..." : "Write a message..."}
          className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 outline-none"
        />

        {editingMessageId && (
          <button
            onClick={handleCancel}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
            title="Cancel editing"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={handleSend}
          className="text-black dark:text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={editingMessageId ? "Save changes" : "Send message"}
          disabled={!text.trim() && !selectedImage}
        >
          {editingMessageId ? <IoCheckmarkCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
