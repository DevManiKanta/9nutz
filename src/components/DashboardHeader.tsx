import React, { useState } from 'react';
import { Search, Plus, Bell, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onMenuToggle: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  onMenuToggle,
  searchValue,
  onSearchChange,
}) => {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 bg-search-bg border-search-border rounded-full h-10 focus:ring-2 focus:ring-chart-primary focus:border-chart-primary"
          />
        </div>
        <Button
          size="sm"
          className="rounded-full h-10 w-10 p-0 bg-chart-primary hover:bg-chart-primary/90 text-white"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Right Section - Actions & User */}
      <div className="flex items-center gap-4">
        {/* Language & Notifications */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <div className="w-5 h-3 bg-red-500 rounded-sm mr-1"></div>
            English
          </div>
          
          {/* Shopping Cart Icon */}
          <Button variant="ghost" size="sm" className="relative">
            <div className="w-5 h-5 border border-muted-foreground rounded"></div>
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">4</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 ml-4">
          <div className="w-8 h-8 bg-chart-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">T</span>
          </div>
          <span className="text-sm font-medium text-foreground">Thomson</span>
        </div>
      </div>
    </header>
  );
};