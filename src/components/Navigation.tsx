import { NavLink } from "@/components/NavLink";
import { Brain } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold">
            <Brain className="w-6 h-6 text-primary" />
            <span>Brandon Hub</span>
          </NavLink>
          
          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground font-medium"
            >
              Home
            </NavLink>
            <NavLink
              to="/content"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground font-medium"
            >
              Content Generator
            </NavLink>
            <NavLink
              to="/templates"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground font-medium"
            >
              Templates
            </NavLink>
            <NavLink
              to="/history"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground font-medium"
            >
              History
            </NavLink>
            <NavLink
              to="/analytics"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground font-medium"
            >
              Analytics
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};
