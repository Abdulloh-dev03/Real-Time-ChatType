import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`flex h-screen ${theme === "dark" ? "dark" : ""}`}>
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 text-gray-900 dark:text-white transition-colors">
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ theme, toggleTheme }} />
        </main>
      </div>
    </div>
  );
}
