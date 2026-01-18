
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import UserInfoCard from "../components/profile/UserInfoCard"
import ProfileDetailsCard from "../components/profile/ProfileDetailsCard"
import AccountDetailsCard from "../components/profile/AccountDetailsCard"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function Profile() {
  const [showProfileForm, setShowProfileForm] = useState(false)
  const toggleProfileForm = () => setShowProfileForm((prev) => !prev)

  return (
    <div className="min-h-screen py-4 px-4 sm:py-6 sm:px-6 lg:py-10 lg:px-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-all duration-200 border border-zinc-200 dark:border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chat List
        </Link>
      </div>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <UserInfoCard onEditClick={toggleProfileForm} isEditing={showProfileForm} />

        <AnimatePresence>
          {showProfileForm && (
            <motion.div
              key="profileForm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <ProfileDetailsCard onClose={toggleProfileForm} />
            </motion.div>
          )}
        </AnimatePresence>

        <AccountDetailsCard />
      </div>
    </div>
  )
}
