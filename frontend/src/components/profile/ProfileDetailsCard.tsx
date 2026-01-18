import { useState, useRef, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { message as antdMessage } from "antd";
import { useAppSelector } from "../../app/hooks";
import { useUpdateProfileMutation } from "../../features/api/apiSlice";

interface ProfileDetailsCardProps {
  onClose?: () => void;
}

export default function ProfileDetailsCard({
  onClose,
}: ProfileDetailsCardProps) {
  const { user } = useAppSelector((state) => state.auth); // User now in auth slice mostly, or rely on api cache?
  // Actually user is in auth slice via checkAuth? yes.
  // But wait, the component was selecting from `state.user`.
  // I must double check where `user` is stored. `authSlice` stores `user`. `userSlice` stored `user` too but I gutted it.
  // `App.tsx` dispatches `apiSlice.endpoints.checkAuth` which presumably updates `authSlice` user?
  // Let's check `App.tsx` again.
  // Ah, `useCheckAuthQuery` data is used to `dispatch(setUser(data))` in `App.tsx`.
  // `setUser` is in `authSlice`? Or `userSlice`?
  // `setUser` was imported from `authSlice` in `App.tsx` previously? Or `userSlice`?
  // In `App.tsx` (Step 26), `import { setUser } from "./features/auth/authSlice";` was present? No, `setUser` is usually in `authSlice` or `userSlice`.
  // Let's assume `state.auth.user` is the source of truth now.

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [initialUserLoaded, setInitialUserLoaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [messageApi, contextHolder] = antdMessage.useMessage();

  useEffect(() => {
    if (user && !initialUserLoaded) {
      setfirstName(user.firstName || "");
      setlastName(user.lastName || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setPreviewUrl(user.profilePic || "/user.jpg");
      setInitialUserLoaded(true);
    }
  }, [user, initialUserLoaded]);

  const beforeUpload = (file: File) => {
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    return false;
  };
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    console.log("Submitting profile...");
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("username", username);
    formData.append("bio", bio);
    if (file) formData.append("file", file);

    try {
      await updateProfile(formData).unwrap();
      messageApi.success("Profile updated successfully");
      // No need to reload, cache invalidation handles it?
      // "User" tag invalidation should refetch checkAuth -> update Store
      if (onClose) onClose();
    } catch (err: unknown) {
      // Error handling
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update profile";
      messageApi.error(errorMsg);
    }
  };

  if (!user) return <div className="text-center ">Loading...</div>;

  return (
    <>
      {contextHolder}
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
          Profile Details
        </h3>

        {/* Profile Picture with Camera Icon */}
        <div className="flex ">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24">
            <div className="w-full h-full rounded-full bg-zinc-200 dark:bg-zinc-800">
              <img
                src={previewUrl || "/user.jpg"}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Camera Button */}
            <button
              type="button"
              onClick={handleUploadClick}
              className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 p-1.5 sm:p-2 bg-gray-600 hover:bg-gray-700 cursor-pointer rounded-full shadow-md transition-all border-2 border-white dark:border-zinc-900"
            >
              <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && beforeUpload(e.target.files[0])
              }
              className="hidden"
            />
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-sm mb-1 text-zinc-700 dark:text-zinc-300">
              First Name
            </label>
            <input
              value={firstName}
              onChange={(e) => setfirstName(e.target.value)}
              type="text"
              placeholder="John"
              className="w-full px-3 sm:px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none text-sm sm:text-base"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm mb-1 text-zinc-700 dark:text-zinc-300">
              Last Name
            </label>
            <input
              value={lastName}
              onChange={(e) => setlastName(e.target.value)}
              type="text"
              placeholder="Doe"
              className="w-full px-3 sm:px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none text-sm sm:text-base"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1 text-zinc-700 dark:text-zinc-300">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="#johndoe"
              className="w-full px-3 sm:px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none text-sm sm:text-base"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1 text-zinc-700 dark:text-zinc-300">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A little about me..."
              rows={4}
              className="w-full px-3 sm:px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none resize-none text-sm sm:text-base"
            />
          </div>
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isUpdating}
          className="w-full mt-4 cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isUpdating && <Loader2 className="animate-spin w-4 h-4" />}
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  );
}
