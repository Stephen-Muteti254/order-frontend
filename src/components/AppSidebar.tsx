import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  Sun, 
  Moon,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/invoices', icon: FileText, label: 'Invoices & Reports' },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-foreground/50 z-40 lg:hidden transition-opacity",
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={() => setCollapsed(true)}
      />

      {/* Mobile menu button */}
      <button
        onClick={() => setCollapsed(false)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-card border border-border shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 w-64"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "lg:justify-center")}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">O</span>
            </div>
            <span className={cn(
              "font-semibold text-sm whitespace-nowrap transition-opacity",
              collapsed && "lg:hidden"
            )}>
              OrderManager
            </span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="lg:hidden h-6 w-6 flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "lg:mx-auto")} />
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap transition-opacity",
                  collapsed && "lg:hidden"
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {/* User info */}
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50",
            collapsed && "lg:justify-center lg:px-2"
          )}>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-primary">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className={cn("flex-1 min-w-0", collapsed && "lg:hidden")}>
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
            </div>
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={cn(
              "w-full justify-start gap-3 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "lg:justify-center lg:px-2"
            )}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className={cn(collapsed && "lg:hidden")}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(
              "w-full justify-start gap-3 text-sidebar-muted hover:text-destructive hover:bg-destructive/10",
              collapsed && "lg:justify-center lg:px-2"
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className={cn(collapsed && "lg:hidden")}>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
