import React, { useEffect, useRef, useState } from "react";
import { Search, Plus, Bell, Settings, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IMAGES } from "@/assets/Images";
import { useAuth } from "@/components/contexts/AuthContext";

interface HeaderProps {
  onMenuToggle?: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  onMenuToggle,
  searchValue,
  onSearchChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth(); // make sure user object has { email, name }

  const [plusOpen, setPlusOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const plusBtnRef = useRef<HTMLButtonElement | null>(null);
  const plusPanelRef = useRef<HTMLDivElement | null>(null);
  const userBtnRef = useRef<HTMLDivElement | null>(null);
  const userPanelRef = useRef<HTMLDivElement | null>(null);
  const notifBtnRef = useRef<HTMLButtonElement | null>(null);
  const notifPanelRef = useRef<HTMLDivElement | null>(null);

  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const tabs = [
    { key: "dashboard", label: "Dashboard", path: "/" },
    { key: "products", label: "Products", path: "/products" },
    { key: "routemap", label: "RouteMap", path: "/routemap" },
    { key: "employees", label: "Employees", path: "/employees" },
    { key: "inventory", label: "Inventory Management", path: "/inventory" },
  ];

  // close dropdowns on outside click / ESC
  useEffect(() => {
    function onDoc(e: MouseEvent | KeyboardEvent | TouchEvent) {
      if ((e as KeyboardEvent).key === "Escape") {
        setPlusOpen(false);
        setUserOpen(false);
        setNotifOpen(false);
        return;
      }
      const target = (e as MouseEvent).target as Node | null;
      if (!target) return;

      if (
        plusOpen &&
        plusPanelRef.current &&
        plusBtnRef.current &&
        !plusPanelRef.current.contains(target) &&
        !plusBtnRef.current.contains(target)
      ) {
        setPlusOpen(false);
      }

      if (
        userOpen &&
        userPanelRef.current &&
        userBtnRef.current &&
        !userPanelRef.current.contains(target) &&
        !userBtnRef.current.contains(target)
      ) {
        setUserOpen(false);
      }

      if (
        notifOpen &&
        notifPanelRef.current &&
        notifBtnRef.current &&
        !notifPanelRef.current.contains(target) &&
        !notifBtnRef.current.contains(target)
      ) {
        setNotifOpen(false);
      }
    }

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onDoc);
    };
  }, [plusOpen, userOpen, notifOpen]);

  // logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUserOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
          <img src={IMAGES.logo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 bg-search-bg border-search-border rounded-full h-10 focus:ring-2 focus:ring-chart-primary focus:border-chart-primary"
            aria-label="Search"
          />
        </div>
      </div>

      {/* Right: Quick actions + notifications + user */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <Button
            ref={notifBtnRef}
            variant="ghost"
            size="sm"
            onClick={() => {
              setNotifOpen((v) => !v);
              setPlusOpen(false);
              setUserOpen(false);
            }}
            className="relative"
          >
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>
          {notifOpen && (
            <div
              ref={notifPanelRef}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50"
            >
              <div className="p-3">
                <div className="text-sm font-semibold mb-2">Notifications</div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="p-2 rounded-md hover:bg-gray-50">New order received</li>
                  <li className="p-2 rounded-md hover:bg-gray-50">Stock Update</li>
                  <li className="p-2 rounded-md hover:bg-gray-50">Employee request pending</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        {/* Settings */}
        <Button variant="ghost" size="sm">
          {/* <Settings className="h-5 w-5" /> */}
        </Button>

        {/* User */}
        <div className="relative">
          <div
            ref={userBtnRef}
            tabIndex={0}
            role="button"
            aria-haspopup="menu"
            aria-expanded={userOpen}
            onClick={() => {
              setUserOpen((v) => !v);
              setPlusOpen(false);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 ml-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 bg-chart-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.[0] || "A"}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              {user?.name || "Admin"}
            </span>
          </div>

          {userOpen && (
            <div
              ref={userPanelRef}
              role="menu"
              aria-label="User menu"
              className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50"
            >
              <div className="p-3">
                <div className="flex items-center gap-3 px-1 py-2">
                  <div className="w-10 h-10 bg-chart-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.[0] || "A"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{user?.name || "Admin"}</div>
                    <div className="text-xs text-muted-foreground">{user?.email || ""}</div>
                  </div>
                </div>
                <div className="mt-2 border-t border-gray-100 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-50 focus:outline-none"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
