/* ================================================================
   DASHBOARD - Harris Wildlands Home/Command Center
   Hero manifesto + 3 primary doors + principles strip
   ================================================================ */

import { Link } from "wouter";
import { useDashboardStats } from "@/hooks/use-bruce-ops";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Lightbulb, Trees, AlertTriangle, Sparkles, Heart, Shield, Eye, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardWithBotanical, RootNetwork } from "@/components/BotanicalMotifs";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
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
      color: "from-green-500/20 to-emerald-600/10",
      iconColor: "text-green-400"
    },
    {
      href: "/think-ops",
      title: "ThinkOps", 
      subtitle: "Ideas",
      description: "Invention, learning, experiments, reality-checking",
      icon: Lightbulb,
      color: "from-violet-500/20 to-purple-600/10",
      iconColor: "text-violet-400"
    },
    {
      href: "/harris",
      title: "Wildlands",
      subtitle: "Build",
      description: "Website content, creative output, public work",
      icon: Trees,
      color: "from-teal-500/20 to-cyan-600/10", 
      iconColor: "text-teal-400"
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
    <div className="space-y-10">
      {/* Hero Manifesto */}
      <div className="relative text-center py-8">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <RootNetwork className="w-96 h-48 stroke-primary" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Harris Wildlands
        </h1>
        <p className="font-principle text-lg md:text-xl text-muted-foreground italic max-w-lg mx-auto">
          Faithful intelligence for family stewardship, wonder, and building.
        </p>
      </div>

      {/* Three Primary Doors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {doors.map((door) => (
          <Link key={door.href} href={door.href}>
            <CardWithBotanical className="h-full">
              <Card className={`h-full border-border/30 bg-gradient-to-br ${door.color} glow-hover cursor-pointer transition-all duration-300 hover:scale-[1.02]`}>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-card/80 border border-border/30 flex items-center justify-center">
                      <door.icon className={`w-5 h-5 ${door.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg leading-none">{door.title}</h3>
                      <p className="text-[10px] text-muted-foreground tracking-widest uppercase">{door.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{door.description}</p>
                  <div className="mt-4 text-xs text-primary tracking-wide">
                    ENTER CHANNEL
                  </div>
                </CardContent>
              </Card>
            </CardWithBotanical>
          </Link>
        ))}
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/30 bg-card/50">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Daily Log</p>
            <p className="text-xl font-display font-bold">
              {stats?.logsToday ? "Done" : "Pending"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/50">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Open Ideas</p>
            <p className="text-xl font-display font-bold">{stats?.openLoops || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/50">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Drift Flags</p>
            <p className="text-xl font-display font-bold">{stats?.driftFlags?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/50">
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
      <div className="text-center">
        <p className="text-[10px] text-muted-foreground/60 tracking-widest uppercase">
          Private by default // No sharing // BRUCE.OS v1.0
        </p>
      </div>
    </div>
  );
}
