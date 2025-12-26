/* ================================================================
   DASHBOARD - Harris Wildlands Landing
   Immersive hero with aurora forest + 3 portal doors to lanes
   ================================================================ */

import { Link } from "wouter";
import { useDashboardStats } from "@/hooks/use-bruce-ops";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Lightbulb, Eye, AlertTriangle, Sparkles, Heart, Shield, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RootNetwork } from "@/components/BotanicalMotifs";
import CoreImagery from "@/lib/coreImagery";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const doors = [
    {
      href: "/life-ops",
      title: "LifeOps",
      subtitle: "Stewardship",
      description: "Daily calibration, family leadership, consistency tracking",
      icon: Activity,
      coreImage: CoreImagery.lifeops,
      accentColor: "from-emerald-500/30 via-green-600/20 to-transparent",
      glowColor: "shadow-emerald-500/20",
      borderColor: "border-emerald-500/30 hover:border-emerald-400/50"
    },
    {
      href: "/think-ops",
      title: "ThinkOps", 
      subtitle: "Ideas",
      description: "Invention, learning, experiments, reality-checking",
      icon: Lightbulb,
      coreImage: CoreImagery.thinkops,
      accentColor: "from-violet-500/30 via-purple-600/20 to-transparent",
      glowColor: "shadow-violet-500/20",
      borderColor: "border-violet-500/30 hover:border-violet-400/50"
    },
    {
      href: "/bruce-ops",
      title: "BruceOps",
      subtitle: "Command",
      description: "System settings, AI configuration, personal protocols",
      icon: Eye,
      coreImage: CoreImagery.bruceops,
      accentColor: "from-cyan-500/30 via-teal-600/20 to-transparent",
      glowColor: "shadow-cyan-500/20",
      borderColor: "border-cyan-500/30 hover:border-cyan-400/50"
    }
  ];

  const principles = [
    { icon: Shield, label: "Integrity" },
    { icon: Heart, label: "Service" },
    { icon: Eye, label: "Clarity" },
    { icon: Sparkles, label: "Love" },
    { icon: Zap, label: "Courage" }
  ];

  return (
    <div className="space-y-8 -mt-4">
      {/* Hero Section with HarrisWildlands Aurora Background */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${CoreImagery.harriswildlands})`,
            backgroundPosition: "center top"
          }}
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        
        {/* Content */}
        <div className="relative z-10 px-6 pt-12 pb-16 text-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <RootNetwork className="w-96 h-48 stroke-primary" />
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">
            Harris Wildlands
          </h1>
          <p className="font-principle text-lg md:text-xl text-white/90 italic max-w-xl mx-auto drop-shadow-md">
            Faithful intelligence for family stewardship, wonder, and building.
          </p>
          
          {/* Crest indicator */}
          <div className="mt-8 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-7 h-7 text-emerald-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Three Portal Doors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {doors.map((door) => (
          <Link key={door.href} href={door.href}>
            <div className="group relative h-full">
              <Card className={`
                relative h-full overflow-hidden cursor-pointer 
                transition-all duration-500 ease-out
                border-2 ${door.borderColor}
                hover:shadow-xl ${door.glowColor}
                hover:scale-[1.02] hover:-translate-y-1
                bg-card/80 backdrop-blur-sm
              `}>
                {/* Background image from core pack */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${door.coreImage})`,
                    backgroundPosition: "center 30%"
                  }}
                />
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${door.accentColor} opacity-50 group-hover:opacity-70 transition-opacity`} />
                
                <CardContent className="relative z-10 p-6 flex flex-col h-full min-h-[200px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-background/50 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                      <door.icon className="w-6 h-6 text-white/90" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl leading-none text-foreground">{door.title}</h3>
                      <p className="text-[11px] text-muted-foreground tracking-[0.2em] uppercase mt-1">{door.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground flex-1 leading-relaxed">{door.description}</p>
                  
                  <div className="mt-5 flex items-center gap-2 text-xs tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="w-8 h-px bg-current" />
                    <span>Enter</span>
                    <span className="w-8 h-px bg-current" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </Link>
        ))}
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Daily Log</p>
            <p className="text-xl font-display font-bold">
              {stats?.logsToday ? "Done" : "Pending"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Open Ideas</p>
            <p className="text-xl font-display font-bold">{stats?.openLoops || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Drift Flags</p>
            <p className="text-xl font-display font-bold">{stats?.driftFlags?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">System</p>
            <p className="text-xl font-display font-bold text-green-400">Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Drift Alerts */}
      {stats?.driftFlags && stats.driftFlags.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="font-semibold text-sm tracking-wide uppercase">Attention Required</h3>
            </div>
            <ul className="space-y-2">
              {stats.driftFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Principles Strip */}
      <div className="border-t border-b border-border/20 py-6">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {principles.map((p) => (
            <div key={p.label} className="flex items-center gap-2 text-muted-foreground">
              <p.icon className="w-4 h-4 text-primary/60" />
              <span className="text-xs tracking-widest uppercase font-principle">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-4">
        <p className="text-[10px] text-muted-foreground/60 tracking-widest uppercase">
          Private by default // No sharing // BRUCE.OS v1.0
        </p>
      </div>
    </div>
  );
}
