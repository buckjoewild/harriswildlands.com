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
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/life-ops", label: "LifeOps", icon: Activity },
    { href: "/think-ops", label: "ThinkOps", icon: Lightbulb },
    { href: "/teaching", label: "Teaching Assistant", icon: GraduationCap },
    { href: "/harris", label: "Harris Wildlands", icon: Trees },
  ];

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
          isActive 
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold" 
            : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1"
        )}>
          <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
          <span>{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border/50 bg-card/30 backdrop-blur-sm p-6 fixed inset-y-0 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-display font-bold text-xl text-white">B</span>
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight">BruceOps</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="pt-6 border-t border-border/50">
           <NavLink href="/settings" label="Settings" icon={Settings} />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
             <span className="font-display font-bold text-lg text-white">B</span>
           </div>
           <span className="font-display font-bold text-xl">BruceOps</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-background/95 z-30 pt-20 px-6 lg:hidden animate-in fade-in duration-200">
          <nav className="space-y-4">
             {navItems.map((item) => (
              <div key={item.href} onClick={() => setSidebarOpen(false)}>
                <NavLink {...item} />
              </div>
            ))}
             <div onClick={() => setSidebarOpen(false)} className="pt-4 mt-4 border-t border-border">
                <NavLink href="/settings" label="Settings" icon={Settings} />
             </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-72 w-full min-h-screen overflow-y-auto pt-20 lg:pt-0">
        <div className="container mx-auto max-w-7xl p-4 md:p-8 lg:p-12 animate-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
