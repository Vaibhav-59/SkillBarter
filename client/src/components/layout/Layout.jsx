import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import MobileNav from "./MobileNav";

export default function Layout() {
  const { theme } = useContext(ThemeContext);
  const d = theme === "dark";

  return (
    <div className={`min-h-screen relative transition-colors duration-300 pb-16 md:pb-0 ${
      d
        ? "bg-[#0c0f1a]"
        : "bg-[#f4f7fa]"
    }`}>
      <MobileNav />

      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex flex-col flex-1 min-h-screen min-w-0">
          <main className="flex-1 overflow-x-hidden pt-16 md:pt-0">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
