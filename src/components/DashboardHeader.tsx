import React, { useEffect, useRef, useState } from "react";
import { Search, Plus, Bell, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IMAGES } from "@/assets/Images";

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

  const [plusOpen, setPlusOpen] = useState(false);
  const plusBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const tabs = [
    { key: "dashboard", label: "Dashboard", path: "/" },
    { key: "products", label: "Products", path: "/products" },
    { key: "routemap", label: "RouteMap", path: "/routemap" },
    { key: "employees", label: "Employees", path: "/employees" },
    { key: "inventory", label: "Inventory Management", path: "/inventory" },
  ];

  // outside click & ESC
  useEffect(() => {
    function onDoc(e: MouseEvent | KeyboardEvent) {
      if ((e as KeyboardEvent).key === "Escape") {
        setPlusOpen(false);
        return;
      }
      if (!panelRef.current || !plusBtnRef.current) return;
      const target = (e as MouseEvent).target as Node | null;
      if (target && !panelRef.current.contains(target) && !plusBtnRef.current.contains(target)) {
        setPlusOpen(false);
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
  }, []);

  // focus management
  useEffect(() => {
    if (plusOpen) {
      lastActiveElementRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => {
        const firstBtn = panelRef.current?.querySelector<HTMLButtonElement>('button[data-qtab="0"]');
        firstBtn?.focus();
      });
    } else {
      requestAnimationFrame(() => {
        lastActiveElementRef.current?.focus?.();
      });
    }
  }, [plusOpen]);

  function handleTabClick(path: string) {
    setPlusOpen(false);
    if (location.pathname !== path) navigate(path);
  }

  function handlePanelKeyDown(e: React.KeyboardEvent) {
    if (!panelRef.current) return;
    const buttons = Array.from(panelRef.current.querySelectorAll<HTMLButtonElement>('button[data-qtab]'));
    if (!buttons.length) return;
    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      buttons[(currentIndex + 1) % buttons.length].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      buttons[(currentIndex - 1 + buttons.length) % buttons.length].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttons[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttons[buttons.length - 1].focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      (document.activeElement as HTMLButtonElement)?.click();
    }
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        {/* Logo */}
        <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
          <img
            src={IMAGES.logo}
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Search bar */}
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
        {/* Quick actions (Plus) */}
        <div className="relative flex items-center gap-2">
          <Button
            size="sm"
            ref={plusBtnRef}
            aria-haspopup="menu"
            aria-expanded={plusOpen}
            onClick={() => setPlusOpen((v) => !v)}
            className="rounded-full h-10 w-10 p-0 bg-chart-primary hover:bg-chart-primary/90 text-white"
            title="Quick actions"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-foreground hidden sm:inline">Quick Links</span>

          {plusOpen && (
            <div
              ref={panelRef}
              role="menu"
              aria-label="Quick navigate"
              className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50"
              style={{ top: "calc(100% + 8px)" }}
              onKeyDown={handlePanelKeyDown}
            >
              <div className="p-3">
                <div className="text-xs font-semibold text-muted-foreground px-1 py-1">
                  Quick navigate
                </div>
                <div className="mt-2 divide-y divide-gray-100" role="menu">
                  {tabs.map((t, idx) => {
                    const isActive = location.pathname === t.path || (t.path === "/" && location.pathname === "/");
                    return (
                      <button
                        key={t.key}
                        data-qtab={idx}
                        onClick={() => handleTabClick(t.path)}
                        className={cn(
                          "w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 focus:outline-none",
                          isActive ? "bg-blue-50" : ""
                        )}
                        aria-current={isActive ? "page" : undefined}
                        role="menuitem"
                      >
                        <span className={`w-2 h-2 rounded-full ${isActive ? "bg-chart-primary" : "bg-gray-300"}`} />
                        <h1 className="text-sm font-medium">{t.label}</h1>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 px-1">
                  <button
                    onClick={() => setPlusOpen(false)}
                    className="w-full text-sm px-3 py-2 text-center rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="sm">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User */}
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 bg-chart-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">T</span>
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:inline">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
