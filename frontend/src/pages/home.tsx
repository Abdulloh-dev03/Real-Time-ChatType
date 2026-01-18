import { useOutletContext } from "react-router-dom"
import { useState, useEffect } from "react"
import { Sidebar } from "../components/sidebar"
import { ChatList } from "../components/chat/chat-list"
import { ChatArea } from "../components/chat/chat-area"

interface LayoutContext {
  theme: "light" | "dark"
  toggleTheme: () => void
}

export default function Home() {
  const { theme, toggleTheme } = useOutletContext<LayoutContext>()
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
   
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId)
  }

  const handleBackToChatList = () => {
    setSelectedChat(null)
  }

  return (
    <div className="flex h-screen relative overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 z-40" onClick={() => setSidebarOpen(false)} />}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} toggleTheme={toggleTheme} theme={theme} />

      <div className="flex flex-1 relative z-10">
        {/* ChatList - Hidden on mobile when chat is selected */}
        <div
          className={`
            ${isMobile && selectedChat ? "hidden" : "flex"}
            w-full md:w-80 lg:w-96 flex-col
          `}
        >
          <ChatList
            onSelectChat={handleSelectChat}
            onMenuClick={() => setSidebarOpen(true)}
            isDark={theme === "dark"}
          />
        </div>

        {/* ChatArea - Hidden on mobile when no chat is selected */}
        <div
          className={`
            ${isMobile && !selectedChat ? "hidden" : "flex"}
            flex-1 flex-col
          `}
        >
          <ChatArea theme={theme} onBackToChatList={handleBackToChatList} isMobile={isMobile} />
        </div>
      </div>
    </div>
  )
}
