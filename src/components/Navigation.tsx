import { NavLink } from "@/components/NavLink";
import { Brain, Menu, Home, LayoutDashboard, FileText, Layout, Clock, BarChart, Calendar, CalendarRange, Archive, Globe, Shield, Smartphone, Link2, QrCode } from "lucide-react";
import { useAdminCheck } from "@/hooks/use-admin-check";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export const Navigation = () => {
  useKeyboardShortcuts();
  const { isAdmin } = useAdminCheck();
  
  return (
    <nav className="border-b bg-card/80 backdrop-blur-lg supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 text-xl font-bold group">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Brandon Hub</span>
          </NavLink>
          
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <ThemeToggle />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-card border-border z-50">
              <DropdownMenuItem asChild>
                <NavLink to="/" end className="w-full cursor-pointer flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                  <DropdownMenuShortcut>⌘⇧H</DropdownMenuShortcut>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/dashboard" className="w-full cursor-pointer flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                  <DropdownMenuShortcut>⌘⇧D</DropdownMenuShortcut>
                </NavLink>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Content Creation</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <NavLink to="/content" className="w-full cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Content Generator
                  <DropdownMenuShortcut>⌘⇧C</DropdownMenuShortcut>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/templates" className="w-full cursor-pointer flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Templates
                  <DropdownMenuShortcut>⌘⇧T</DropdownMenuShortcut>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/library" className="w-full cursor-pointer flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Content Library
                  <DropdownMenuShortcut>⌘⇧I</DropdownMenuShortcut>
                </NavLink>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Management</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <NavLink to="/history" className="w-full cursor-pointer flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  History
                  <DropdownMenuShortcut>⌘⇧R</DropdownMenuShortcut>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/analytics" className="w-full cursor-pointer flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Analytics
                  <DropdownMenuShortcut>⌘⇧A</DropdownMenuShortcut>
                </NavLink>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Scheduling</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <NavLink to="/calendar" className="w-full cursor-pointer flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendar
                  <DropdownMenuShortcut>⌘⇧L</DropdownMenuShortcut>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/bulk-schedule" className="w-full cursor-pointer flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" />
                  Bulk Schedule
                  <DropdownMenuShortcut>⌘⇧B</DropdownMenuShortcut>
                </NavLink>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tools</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <NavLink to="/scraper" className="w-full cursor-pointer flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Web Scraper
                  <DropdownMenuShortcut>⌘⇧W</DropdownMenuShortcut>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/native-features" className="w-full cursor-pointer flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Native Features
                  <DropdownMenuShortcut>⌘⇧N</DropdownMenuShortcut>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/deep-linking" className="w-full cursor-pointer flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Deep Linking
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/qr-share" className="w-full cursor-pointer flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Codes
                </NavLink>
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Admin</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <NavLink to="/admin" className="w-full cursor-pointer flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </NavLink>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};
