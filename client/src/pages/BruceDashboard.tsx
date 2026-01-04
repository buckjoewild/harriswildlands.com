/* ================================================================
   BRUCE™ DASHBOARD - Unified Command Center + AI Operations Hub
   Merges: Dashboard stats + Weekly Review, Steward Chat, Teaching
   ================================================================ */

import { useState } from "react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, MessageSquare, GraduationCap, Brain, Sprout, Target, Lightbulb, Trees } from "lucide-react";
import { LaneBg } from "@/lib/coreImagery";
import { useDashboardStats } from "@/hooks/use-bruce-ops";

import WeeklyReviewContent from "./WeeklyReview";
import ChatContent from "./Chat";
import TeachingContent from "./TeachingAssistant";

export default function BruceDashboard() {
  const [activeTab, setActiveTab] = useState("review");
  const { data: stats, isLoading } = useDashboardStats();

  const laneLinks = [
    { href: "/life", label: "ROOTS", sublabel: "Life", icon: Sprout, color: "text-amber-400 border-amber-500/50", testId: "link-lane-roots" },
    { href: "/goals", label: "GROWTH", sublabel: "Goals", icon: Target, color: "text-emerald-400 border-emerald-500/50", testId: "link-lane-growth" },
    { href: "/think", label: "CANOPY", sublabel: "Think", icon: Lightbulb, color: "text-violet-400 border-violet-500/50", testId: "link-lane-canopy" },
    { href: "/lab", label: "LAB", sublabel: "Playground", icon: Brain, color: "text-cyan-400 border-cyan-500/50", testId: "link-lane-lab" },
    { href: "/harris", label: "WILDLANDS", sublabel: "Brand", icon: Trees, color: "text-emerald-400 border-emerald-500/50", testId: "link-lane-wildlands" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ 
          backgroundImage: `url(${LaneBg.root})`,
          backgroundPosition: "center 30%"
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <div className="relative rounded-xl overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ 
              backgroundImage: `url(${LaneBg.root2})`,
              backgroundPosition: "center 25%"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        
          <div className="relative z-10 p-6 md:p-8">
            <div className="bg-black/70 border border-cyan-500/40 p-4 md:p-5 backdrop-blur-md inline-block">
              <p className="font-mono text-cyan-400/80 text-xs mb-1 tracking-wider">bruce@wildlands:~$</p>
              <h2 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-cyan-300 uppercase flex items-center gap-3">
                <Brain className="w-7 h-7" />
                BRUCE<span className="text-cyan-500">™</span> DASHBOARD<span className="cursor-blink">_</span>
              </h2>
              <p className="font-mono text-cyan-400/70 text-xs mt-2 tracking-wide">
                &gt; command center // AI operations hub
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="font-mono text-[10px] text-cyan-400/70 tracking-widest uppercase mb-1">DAILY_LOG</p>
              <p className="font-mono text-lg text-cyan-300">
                {stats?.logsToday ? "COMPLETE" : "PENDING"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border border-violet-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="font-mono text-[10px] text-violet-400/70 tracking-widest uppercase mb-1">OPEN_IDEAS</p>
              <p className="font-mono text-lg text-violet-300">{stats?.openLoops || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border border-amber-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="font-mono text-[10px] text-amber-400/70 tracking-widest uppercase mb-1">DRIFT_FLAGS</p>
              <p className="font-mono text-lg text-amber-300">{Array.isArray(stats?.driftFlags) ? stats.driftFlags.length : 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border border-emerald-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="font-mono text-[10px] text-emerald-400/70 tracking-widest uppercase mb-1">SYSTEM</p>
              <p className="font-mono text-lg text-emerald-300">ACTIVE</p>
            </CardContent>
          </Card>
        </div>

        {stats?.driftFlags && Array.isArray(stats.driftFlags) && stats.driftFlags.length > 0 && (
          <Card className="bg-black/60 border border-red-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="font-mono text-[10px] text-red-400 tracking-widest uppercase mb-2">&gt; ATTENTION_REQUIRED</p>
              <ul className="space-y-1">
                {stats.driftFlags.map((flag: string, i: number) => (
                  <li key={i} className="font-mono text-sm text-red-300/80 flex items-start gap-2">
                    <span className="text-red-400">-</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="border-t border-cyan-500/30 pt-4">
          <p className="font-mono text-[10px] text-cyan-400/60 tracking-widest uppercase mb-3">&gt; QUICK_NAV</p>
          <div className="grid grid-cols-5 gap-2">
            {laneLinks.map((lane) => (
              <Link key={lane.href} href={lane.href} data-testid={lane.testId}>
                <Card className={`bg-black/60 border ${lane.color} backdrop-blur-sm cursor-pointer hover-elevate transition-all`}>
                  <CardContent className="p-2 flex flex-col items-center text-center">
                    <lane.icon className={`w-4 h-4 mb-1 ${lane.color.split(' ')[0]}`} />
                    <p className={`font-mono text-[10px] ${lane.color.split(' ')[0]}`}>{lane.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="review" data-testid="tab-review">
              <BarChart3 className="w-4 h-4 mr-2" /> Review
            </TabsTrigger>
            <TabsTrigger value="steward" data-testid="tab-steward">
              <MessageSquare className="w-4 h-4 mr-2" /> Steward
            </TabsTrigger>
            <TabsTrigger value="teaching" data-testid="tab-teaching">
              <GraduationCap className="w-4 h-4 mr-2" /> Teaching
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="review" className="mt-6">
            <WeeklyReviewContent embedded />
          </TabsContent>
          
          <TabsContent value="steward" className="mt-6">
            <ChatContent embedded />
          </TabsContent>
          
          <TabsContent value="teaching" className="mt-6">
            <TeachingContent embedded />
          </TabsContent>
        </Tabs>

        <div className="text-center pt-4 pb-2">
          <p className="font-mono text-[10px] text-cyan-400/40 tracking-widest uppercase">
            PRIVATE BY DEFAULT // NO SHARING // BRUCE.OS v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
