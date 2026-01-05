/* ================================================================
   SYSTEM MAP - Documentation Portal with Botanical Sci-Fi Terminal Aesthetic
   "Know What You Built" - A living map of HarrisWildlands
   ================================================================ */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sprout, 
  Lightbulb, 
  Target, 
  Brain,
  Database,
  Wifi,
  Zap,
  Shield,
  Clock,
  Heart,
  Users,
  Lock,
  ChevronRight,
  Terminal,
  FlaskConical,
  BookOpen,
  FileJson,
  Sparkles,
  TrendingUp,
  CalendarDays,
  Link2,
  GraduationCap,
  Tent,
  Map
} from "lucide-react";

export default function SystemMap() {
  return (
    <div className="relative min-h-full space-y-12 pb-16">
      {/* HERO SECTION */}
      <section className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-black/60 to-cyan-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
        
        <div className="relative z-10 p-6 md:p-10">
          <div className="bg-black/70 border border-cyan-500/40 p-5 backdrop-blur-md inline-block mb-8">
            <p className="font-mono text-cyan-400/80 text-xs mb-1 tracking-wider">C:\SYSTEM_MAP&gt;</p>
            <h1 className="font-mono font-normal text-2xl md:text-4xl tracking-tight text-cyan-300 uppercase flex items-center gap-3">
              <Map className="w-8 h-8" />
              KNOW WHAT YOU BUILT<span className="cursor-blink">_</span>
            </h1>
            <p className="font-mono text-cyan-400/70 text-sm mt-3 tracking-wide max-w-2xl">
              &gt; A living map of HarrisWildlands—your personal operating system for tracking life, capturing ideas, and building resilience through self-knowledge.
            </p>
          </div>
          
          {/* Status Pills */}
          <div className="flex flex-wrap gap-3">
            <StatusPill label="API Online" color="green" />
            <StatusPill label="Database Connected" color="green" />
            <StatusPill label="AI Ready" color="blue" />
            <StatusPill label="100 calls/day quota" color="amber" />
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <div className="text-center px-4">
        <blockquote className="font-serif text-lg md:text-xl text-muted-foreground italic">
          "Building resilience through self-knowledge. Not measuring yourself—witnessing yourself."
        </blockquote>
      </div>

      {/* SECTION 1: HOW EVERYTHING CONNECTS */}
      <section>
        <SectionHeader icon={Link2} title="HOW EVERYTHING CONNECTS" />
        <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <pre className="font-mono text-[10px] sm:text-xs md:text-sm text-cyan-300/90 p-4 md:p-6 overflow-x-auto whitespace-pre leading-relaxed">
{`                    ┌─────────────────────────────────────────┐
                    │              YOUR LIFE                   │
                    └─────────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │   LifeOps     │       │   ThinkOps    │       │    Goals      │
    │  Morning Log  │       │ Idea Capture  │       │ Trunk/Leaves  │
    │  Evening Log  │       │ Reality Check │       │  Check-ins    │
    └───────┬───────┘       └───────┬───────┘       └───────┬───────┘
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │     PostgreSQL        │
                        │    (Your Data)        │
                        └───────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │  Weekly   │   │ AI Squad  │   │  Export   │
            │  Review   │   │ Analysis  │   │ JSON/PDF  │
            └───────────┘   └───────────┘   └───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Gemini / OpenRouter  │
                    │  (Optional, Cached)   │
                    │   $0.10/month avg     │
                    └───────────────────────┘`}
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 2: THE THREE LANES */}
      <section>
        <SectionHeader icon={Sprout} title="THE THREE LANES" />
        <div className="grid md:grid-cols-3 gap-4">
          <LaneCard 
            icon={Sprout}
            title="LifeOps"
            color="amber"
            purpose="Daily logging with morning and evening check-ins"
            features="Sleep, hydration, energy, stress, habits, drift factors, reflection"
            insight="50+ tracking points, AI-powered weekly synthesis"
          />
          <LaneCard 
            icon={Lightbulb}
            title="ThinkOps"
            color="violet"
            purpose="Capture ideas without contaminating the daily ledger"
            features="Quick capture, who it helps, pain it solves, excitement/feasibility scores"
            insight="Optional AI 'reality check' for validation"
          />
          <LaneCard 
            icon={Target}
            title="Goals"
            color="emerald"
            purpose="Track commitments at Trunk (big rocks) and Leaves (weekly) levels"
            features="Domain-based organization, weekly minimums, progress tracking"
            insight="Aggregated in weekly review"
          />
        </div>
      </section>

      {/* SECTION 3: ENDPOINTS REFERENCE */}
      <section>
        <SectionHeader icon={Terminal} title="ENDPOINTS REFERENCE" />
        <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-cyan-500/30 bg-black/40">
                    <th className="text-left p-3 text-cyan-400/80 tracking-wider">METHOD</th>
                    <th className="text-left p-3 text-cyan-400/80 tracking-wider">ENDPOINT</th>
                    <th className="text-left p-3 text-cyan-400/80 tracking-wider hidden md:table-cell">PURPOSE</th>
                    <th className="text-left p-3 text-cyan-400/80 tracking-wider">AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/20">
                  <EndpointRow method="GET" endpoint="/api/health" purpose="Is the system alive?" ai={false} />
                  <EndpointRow method="GET" endpoint="/api/logs" purpose="Fetch all daily logs" ai={false} />
                  <EndpointRow method="POST" endpoint="/api/logs" purpose="Create a new log" ai={false} />
                  <EndpointRow method="GET" endpoint="/api/logs/:date" purpose="Get log for specific date" ai={false} />
                  <EndpointRow method="POST" endpoint="/api/logs/summary" purpose="Generate AI summary" ai={true} />
                  <EndpointRow method="GET" endpoint="/api/ideas" purpose="Fetch all ideas" ai={false} />
                  <EndpointRow method="POST" endpoint="/api/ideas" purpose="Create new idea" ai={false} />
                  <EndpointRow method="POST" endpoint="/api/ideas/:id/reality-check" purpose="AI reality check" ai={true} />
                  <EndpointRow method="GET" endpoint="/api/goals" purpose="Fetch all goals" ai={false} />
                  <EndpointRow method="POST" endpoint="/api/goals" purpose="Create new goal" ai={false} />
                  <EndpointRow method="GET" endpoint="/api/checkins" purpose="Fetch all check-ins" ai={false} />
                  <EndpointRow method="POST" endpoint="/api/checkins" purpose="Create check-in" ai={false} />
                  <EndpointRow method="GET" endpoint="/api/review/weekly" purpose="Weekly review aggregation" ai={false} />
                  <EndpointRow method="POST" endpoint="/api/ai/search" purpose="Smart semantic search" ai={true} />
                  <EndpointRow method="POST" endpoint="/api/ai/squad" purpose="Multi-perspective analysis" ai={true} />
                  <EndpointRow method="POST" endpoint="/api/ai/correlations" purpose="Pattern discovery" ai={true} />
                  <EndpointRow method="POST" endpoint="/api/ai/weekly-synthesis" purpose="AI weekly narrative" ai={true} />
                  <EndpointRow method="GET" endpoint="/api/export/data" purpose="Download everything as JSON" ai={false} />
                  <EndpointRow method="GET" endpoint="/api/ai/quota" purpose="Check AI usage" ai={false} />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 4: COST PROTECTION */}
      <section>
        <SectionHeader icon={Shield} title="COST PROTECTION" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard value="$0.10" label="Average Monthly Cost" color="emerald" />
          <StatCard value="100" label="Daily Quota (Calls)" color="cyan" />
          <StatCard value="24hr" label="Cache Duration" color="violet" />
          <StatCard value="10/min" label="Rate Limit" color="amber" />
        </div>
      </section>

      {/* SECTION 5: THE PHILOSOPHY */}
      <section>
        <SectionHeader icon={Heart} title="THE PHILOSOPHY" />
        <div className="grid md:grid-cols-2 gap-4">
          <PhilosophyCard 
            number="01"
            title="Witnessing, Not Measuring"
            description="You're not optimizing yourself. You're seeing yourself clearly over time. The goal is acceptance and clarity, not perfection."
          />
          <PhilosophyCard 
            number="02"
            title="Resilience, Not Immunity"
            description="Self-knowledge doesn't make you bulletproof. It shortens the drift-to-correction cycle. You catch yourself faster."
          />
          <PhilosophyCard 
            number="03"
            title="Privacy-First, Local-First"
            description="Your data stays on your machine. No cloud sync. No third-party analytics. AI is optional and you control what it sees."
          />
          <PhilosophyCard 
            number="04"
            title="Faith, Family, Teaching"
            description="These are the non-negotiable domains. The system exists to serve them, not to optimize them away."
          />
        </div>
      </section>

      {/* SECTION 6: ALTERNATE PATHS (What's Next) */}
      <section>
        <SectionHeader icon={Sparkles} title="ALTERNATE PATHS" subtitle="What's Next" />
        <div className="space-y-3">
          <FutureFeature 
            icon={FlaskConical}
            title="A/B Testing Yourself"
            description="Run 7-day experiments on yourself. Get results with honest uncertainty ranges, not fake confidence."
            status="READY TO BUILD"
            statusColor="emerald"
          />
          <FutureFeature 
            icon={FileJson}
            title="Sacred Data Export"
            description="Generate a beautiful year-end PDF that tells your story using your data."
            status="READY TO BUILD"
            statusColor="emerald"
          />
          <FutureFeature 
            icon={CalendarDays}
            title="Monthly Micro-Synthesis"
            description="A 2-page monthly reflection bridging daily logs and annual export."
            status="PLANNED"
            statusColor="cyan"
          />
          <FutureFeature 
            icon={TrendingUp}
            title="Cross-Domain Correlations"
            description="Auto-discover hidden patterns across LifeOps, ThinkOps, and Goals."
            status="EXPLORING"
            statusColor="violet"
          />
          <FutureFeature 
            icon={GraduationCap}
            title="Teaching Assistant"
            description="Generate lessons and materials for your classroom."
            status="EXPLORING"
            statusColor="violet"
          />
          <FutureFeature 
            icon={Tent}
            title="HarrisWildlands Content Studio"
            description="Multi-AI content generation for the family business."
            status="EXPLORING"
            statusColor="violet"
          />
        </div>
      </section>

      {/* SECTION 7: QUICK REFERENCE */}
      <section>
        <SectionHeader icon={BookOpen} title="QUICK REFERENCE" subtitle="Terminal Commands" />
        <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <pre className="font-mono text-xs md:text-sm text-emerald-300/90 overflow-x-auto whitespace-pre leading-loose">
{`# Start the server
cd harriswildlands.com && npm run dev

# Check if it's running
curl http://localhost:5000/api/health

# Push database changes
npm run db:push

# Backup your data
pg_dump > backup_$(date +%Y%m%d).sql

# Export everything
curl http://localhost:5000/api/export/data > my-data.json

# Check AI quota
curl http://localhost:5000/api/ai/quota`}
            </pre>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: "green" | "blue" | "amber" }) {
  const colorClasses = {
    green: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    blue: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
    amber: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  };
  const dotColors = {
    green: "bg-emerald-400",
    blue: "bg-cyan-400",
    amber: "bg-amber-400",
  };
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm font-mono text-xs ${colorClasses[color]}`}>
      <span className={`w-2 h-2 rounded-full ${dotColors[color]} animate-pulse`} />
      {label}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      <div>
        <h2 className="font-mono text-lg text-cyan-300 tracking-wide uppercase">{title}</h2>
        {subtitle && <p className="font-mono text-xs text-cyan-400/60">&gt; {subtitle}</p>}
      </div>
    </div>
  );
}

function LaneCard({ icon: Icon, title, color, purpose, features, insight }: { 
  icon: any; 
  title: string; 
  color: "amber" | "violet" | "emerald";
  purpose: string; 
  features: string; 
  insight: string;
}) {
  const colorClasses = {
    amber: "border-amber-500/30 text-amber-400",
    violet: "border-violet-500/30 text-violet-400",
    emerald: "border-emerald-500/30 text-emerald-400",
  };
  
  return (
    <Card className={`bg-black/60 backdrop-blur-sm ${colorClasses[color]}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Icon className="w-6 h-6" />
          <h3 className="font-mono text-lg tracking-wide">{title}</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">PURPOSE</p>
            <p className="text-foreground/80">{purpose}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">FEATURES</p>
            <p className="text-foreground/80">{features}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">KEY INSIGHT</p>
            <p className="text-foreground/80">{insight}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EndpointRow({ method, endpoint, purpose, ai }: { method: string; endpoint: string; purpose: string; ai: boolean }) {
  const methodColors: Record<string, string> = {
    GET: "text-emerald-400",
    POST: "text-cyan-400",
    PUT: "text-amber-400",
    DELETE: "text-red-400",
  };
  
  return (
    <tr className="hover:bg-cyan-500/5 transition-colors">
      <td className={`p-3 ${methodColors[method] || "text-foreground"}`}>{method}</td>
      <td className="p-3 text-foreground/90">{endpoint}</td>
      <td className="p-3 text-muted-foreground hidden md:table-cell">{purpose}</td>
      <td className="p-3">
        {ai ? (
          <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/40 text-[10px]">
            <Zap className="w-3 h-3 mr-1" />
            AI
          </Badge>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </td>
    </tr>
  );
}

function StatCard({ value, label, color }: { value: string; label: string; color: "emerald" | "cyan" | "violet" | "amber" }) {
  const colorClasses = {
    emerald: "border-emerald-500/30 text-emerald-300",
    cyan: "border-cyan-500/30 text-cyan-300",
    violet: "border-violet-500/30 text-violet-300",
    amber: "border-amber-500/30 text-amber-300",
  };
  
  return (
    <Card className={`bg-black/60 backdrop-blur-sm ${colorClasses[color]}`}>
      <CardContent className="p-4 text-center">
        <p className="font-mono text-2xl md:text-3xl font-bold">{value}</p>
        <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function PhilosophyCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <span className="font-mono text-3xl text-cyan-500/40 font-bold">{number}</span>
          <div>
            <h3 className="font-mono text-cyan-300 tracking-wide mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FutureFeature({ icon: Icon, title, description, status, statusColor }: { 
  icon: any; 
  title: string; 
  description: string; 
  status: string;
  statusColor: "emerald" | "cyan" | "violet";
}) {
  const statusClasses = {
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    violet: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  };
  
  return (
    <Card className="bg-black/60 border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 shrink-0">
            <Icon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h3 className="font-mono text-foreground tracking-wide">{title}</h3>
              <Badge variant="outline" className={`text-[10px] ${statusClasses[statusColor]}`}>
                {status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
