import { NavLink } from "@/components/NavLink";
import { Brain, Menu, Home, FileText, Layout, Clock, BarChart, Calendar, CalendarRange } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Navigation = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold">
            <Brain className="w-6 h-6 text-primary" />
            <span>Brandon Hub</span>
          </NavLink>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-background z-50">
              <DropdownMenuItem asChild>
                <NavLink to="/" end className="w-full cursor-pointer flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </NavLink>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Content Creation</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <NavLink to="/content" className="w-full cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Content Generator
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/templates" className="w-full cursor-pointer flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Templates
                </NavLink>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Management</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <NavLink to="/history" className="w-full cursor-pointer flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  History
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/analytics" className="w-full cursor-pointer flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Analytics
                </NavLink>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Scheduling</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <NavLink to="/calendar" className="w-full cursor-pointer flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendar
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/bulk-schedule" className="w-full cursor-pointer flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" />
                  Bulk Schedule
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};
