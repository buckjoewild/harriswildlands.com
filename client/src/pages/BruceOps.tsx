/* ================================================================
   BRUCEOPS - Command Center
   System settings, AI configuration, personal protocols
   Visual: Sensor space with cosmic eye and botanical borders
   ================================================================ */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Shield, Settings, Brain, Zap, Lock, Sparkles } from "lucide-react";
import CoreImagery from "@/lib/coreImagery";

export default function BruceOps() {
  const systemModules = [
    {
      title: "AI Intelligence",
      description: "GPT-4o-mini via OpenRouter, personalized with Bruce context",
      icon: Brain,
      status: "Active",
      statusColor: "text-emerald-400"
    },
    {
      title: "Privacy Shield",
      description: "All data user-scoped, no external sharing, local-first",
      icon: Shield,
      status: "Enabled",
      statusColor: "text-emerald-400"
    },
    {
      title: "Session Security",
      description: "PostgreSQL-backed sessions with secure tokens",
      icon: Lock,
      status: "Secured",
      statusColor: "text-emerald-400"
    },
    {
      title: "Theme Engine",
      description: "FIELD / LAB / SANCTUARY adaptive theming",
      icon: Sparkles,
      status: "Active",
      statusColor: "text-emerald-400"
    }
  ];

  const protocols = [
    { name: "Daily Calibration", lane: "LifeOps", frequency: "Daily" },
    { name: "Idea Reality Check", lane: "ThinkOps", frequency: "Per capture" },
    { name: "Drift Detection", lane: "LifeOps", frequency: "Weekly" },
    { name: "Content Generation", lane: "HarrisWildlands", frequency: "On demand" }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header with BruceOps Core Imagery */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${CoreImagery.bruceops})`,
            backgroundPosition: "center 25%"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="relative z-10 p-6 md:p-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center backdrop-blur-sm">
            <Eye className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">BruceOps</h2>
            <p className="text-sm text-muted-foreground tracking-widest uppercase">
              Command Center // System Protocols
            </p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemModules.map((module) => (
          <Card 
            key={module.title} 
            className="border-border/30 bg-card/80 backdrop-blur-sm hover:border-cyan-500/30 transition-all"
            data-testid={`card-module-${module.title.toLowerCase().replace(/\s/g, '-')}`}
          >
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <module.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-display font-semibold">{module.title}</h3>
                  <span className={`text-xs font-mono ${module.statusColor}`}>{module.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Protocols */}
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Active Protocols
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/20">
            {protocols.map((protocol, i) => (
              <div 
                key={i} 
                className="p-4 flex items-center justify-between gap-4"
                data-testid={`row-protocol-${i}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-medium">{protocol.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">{protocol.lane}</Badge>
                  <span className="text-xs text-muted-foreground">{protocol.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm tracking-wide uppercase">System Configuration</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Version</p>
              <p className="font-mono">BRUCE.OS v1.0</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">AI Model</p>
              <p className="font-mono">gpt-4o-mini</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Database</p>
              <p className="font-mono">PostgreSQL</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Auth</p>
              <p className="font-mono">Replit OIDC</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-[10px] text-muted-foreground/60 tracking-widest uppercase">
          Private by default // Faithful intelligence // Built for Bruce
        </p>
      </div>
    </div>
  );
}
