/* ================================================================
   LAYOUT - Holo-Atlas Navigation with Botanical Sci-Fi Aesthetic
   ================================================================ */

import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Activity, 
  Lightbulb, 
  GraduationCap, 
  Trees, 
  Menu, 
  X,
  Settings,
  LogOut,
  User,
  Grid3X3,
  Leaf,
  FlaskConical,
  Church,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useTheme, ThemeMode } from "./ThemeProvider";
import { InterfaceOverlay } from "./InterfaceOverlay";
import { BotanicalCorner } from "./BotanicalMotifs";

interface LayoutProps {
  children: ReactNode;
}

const themeConfig: Record<ThemeMode, { label: string; icon: any; color: string }> = {
  field: { label: "FIELD", icon: Leaf, color: "text-green-400" },
  lab: { label: "LAB", icon: FlaskConical, color: "text-teal-400" },
  sanctuary: { label: "SANCTUARY", icon: Church, color: "text-amber-400" },
};

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { theme, setTheme, overlayEnabled, setOverlayEnabled } = useTheme();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/life-ops", label: "LifeOps", icon: Activity },
    { href: "/think-ops", label: "ThinkOps", icon: Lightbulb },
    { href: "/bruce-ops", label: "BruceOps", icon: Eye },
    { href: "/teaching", label: "Teaching", icon: GraduationCap },
    { href: "/harris", label: "Wildlands", icon: Trees },
  ];

  const cycleTheme = () => {
    const themes: ThemeMode[] = ["field", "lab", "sanctuary"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div className={cn(
          "holo-nav-item flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 cursor-pointer",
          isActive && "active bg-primary/10 text-foreground"
        )}>
          <Icon className={cn(
            "w-4 h-4 transition-colors",
            isActive ? "text-primary" : "text-muted-foreground"
          )} />
          <span className={cn(
            "text-sm tracking-wide",
            isActive ? "text-foreground font-medium" : "text-muted-foreground"
          )}>{label}</span>
        </div>
      </Link>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center aurora-bg">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/50 to-accent/50 animate-pulse" />
            <div className="absolute inset-2 rounded-lg bg-background flex items-center justify-center">
              <Trees className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 aurora-bg grain-texture">
        <div className="max-w-md text-center space-y-8 relative">
          <div className="botanical-corner botanical-corner-tl opacity-20">
            <BotanicalCorner />
          </div>
          <div className="botanical-corner botanical-corner-br opacity-20">
            <BotanicalCorner />
          </div>
          
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 blur-xl" />
            <div className="relative w-full h-full rounded-2xl bg-card border border-primary/20 flex items-center justify-center">
              <Trees className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <div>
            <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Harris Wildlands</h1>
            <p className="font-principle text-lg text-muted-foreground italic">
              Faithful intelligence for family stewardship, wonder, and building.
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="w-full max-w-xs glow-hover"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            <User className="w-5 h-5 mr-2" />
            Enter the Wildlands
          </Button>
          
          <p className="text-xs text-muted-foreground tracking-wide">
            PRIVATE BY DEFAULT // NO SHARING
          </p>
        </div>
        <InterfaceOverlay isActive={overlayEnabled} currentPage="/" />
      </div>
    );
  }

  const CurrentThemeIcon = themeConfig[theme].icon;

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden grain-texture">
      <InterfaceOverlay isActive={overlayEnabled} currentPage={location} />
      
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/30 bg-card/50 backdrop-blur-sm p-4 fixed inset-y-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/40 to-accent/40 blur-sm" />
            <div className="relative w-full h-full rounded-lg bg-card border border-primary/20 flex items-center justify-center">
              <Trees className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight leading-none">Wildlands</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">BRUCE.OS</p>
          </div>
        </div>

        {/* Theme & Overlay Controls */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={cycleTheme}
            className={cn("flex-1 text-xs gap-2", themeConfig[theme].color)}
            data-testid="button-theme-switch"
          >
            <CurrentThemeIcon className="w-3 h-3" />
            {themeConfig[theme].label}
          </Button>
          <Button
            variant={overlayEnabled ? "default" : "outline"}
            size="icon"
            onClick={() => setOverlayEnabled(!overlayEnabled)}
            className="shrink-0"
            data-testid="button-overlay-toggle"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase px-4 mb-2">CHANNELS</p>
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Settings */}
        <div className="pt-4 border-t border-border/30">
          <NavLink href="/settings" label="System Config" icon={Settings} />
        </div>

        {/* User Profile */}
        <div className="pt-4 mt-4 border-t border-border/30">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="w-8 h-8 border border-primary/20">
              <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" data-testid="text-username">
                {user?.firstName || 'Operator'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate tracking-wide">
                ACTIVE SESSION
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logout()}
              className="shrink-0"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background/90 backdrop-blur-md border-b border-border/30 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-card border border-primary/20 flex items-center justify-center">
            <Trees className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold">Wildlands</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOverlayEnabled(!overlayEnabled)}
            className={overlayEnabled ? "text-primary" : ""}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-background/98 z-30 pt-16 px-4 lg:hidden animate-in fade-in duration-200">
          <div className="flex gap-2 mb-6">
            {(["field", "lab", "sanctuary"] as ThemeMode[]).map((t) => {
              const Icon = themeConfig[t].icon;
              return (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(t)}
                  className="flex-1 text-xs gap-1"
                >
                  <Icon className="w-3 h-3" />
                  {themeConfig[t].label}
                </Button>
              );
            })}
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <div key={item.href} onClick={() => setSidebarOpen(false)}>
                <NavLink {...item} />
              </div>
            ))}
            <div onClick={() => setSidebarOpen(false)} className="pt-4 mt-4 border-t border-border/30">
              <NavLink href="/settings" label="System Config" icon={Settings} />
            </div>
            <div className="pt-4 mt-4 border-t border-border/30">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign out
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 w-full min-h-screen overflow-y-auto pt-16 lg:pt-0 aurora-bg">
        <div className="container mx-auto max-w-6xl p-4 md:p-6 lg:p-8 animate-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
