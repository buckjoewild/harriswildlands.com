/* ================================================================
   LIFEOPS V2 - Science-Integrated Daily Logs
   Morning: Reward Contract + Sleep + Body + Motivational Anchor
   Evening: Core Outcome + Contingency + Scripts + Body + Mind + Environment + Recovery
   ================================================================ */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertLogSchema, 
  type Log,
  REWARD_TYPES,
  TRIGGER_LEVELS,
  SCRIPT_GAPS,
  MOVEMENT_LEVELS,
  VALUES_PROTECTED,
  LEAK_TYPES,
  FRICTION_UPGRADES
} from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, Sun, Moon, CheckCircle2, Trophy, Zap, Brain, 
  Shield, AlertTriangle, Target, Heart, Bed, Coffee,
  Dumbbell, Droplets, BookOpen, XCircle, TrendingUp, Flame
} from "lucide-react";
import { CardWithBotanical } from "@/components/BotanicalMotifs";
import { LaneBg } from "@/lib/coreImagery";
import { useToast } from "@/hooks/use-toast";

type LogType = "morning" | "evening";

const logFormSchema = insertLogSchema.extend({
  logType: z.enum(["morning", "evening"]).default("evening"),
});

type LogFormValues = z.infer<typeof logFormSchema>;

interface WeeklyStats {
  yesDays: number;
  totalDays: number;
  rewardClaimedRate: number;
  sleepAdherenceRate: number;
  environmentLeakCount: number;
  scriptsUsedTotal: number;
  streak: number;
}

function WeeklyDashboard() {
  const { data: stats, isLoading } = useQuery<WeeklyStats>({
    queryKey: ["/api/logs/stats/weekly"],
  });

  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const metrics = [
    { 
      label: "YES Days", 
      value: stats.yesDays, 
      total: stats.totalDays,
      format: "ratio",
      icon: Target,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    { 
      label: "Streak", 
      value: stats.streak, 
      format: "number",
      icon: Flame,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    },
    { 
      label: "Rewards Claimed", 
      value: stats.rewardClaimedRate, 
      format: "percent",
      icon: Trophy,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10"
    },
    { 
      label: "Sleep Adherence", 
      value: stats.sleepAdherenceRate, 
      format: "percent",
      icon: Bed,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    { 
      label: "Env Leaks", 
      value: stats.environmentLeakCount, 
      format: "number",
      icon: AlertTriangle,
      color: stats.environmentLeakCount > 0 ? "text-red-400" : "text-emerald-400",
      bgColor: stats.environmentLeakCount > 0 ? "bg-red-500/10" : "bg-emerald-500/10"
    },
    { 
      label: "Scripts Used", 
      value: stats.scriptsUsedTotal, 
      format: "number",
      icon: Zap,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10"
    },
  ];

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/30" data-testid="weekly-dashboard">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          7-Day Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className={`p-3 rounded-lg ${metric.bgColor} border border-border/20`}
              data-testid={`stat-${metric.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className={`text-xl font-bold ${metric.color}`}>
                {metric.format === "ratio" && (
                  <>{metric.value}/{metric.total}</>
                )}
                {metric.format === "percent" && (
                  <>{metric.value}%</>
                )}
                {metric.format === "number" && (
                  <>{metric.value}</>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LifeOps() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeTab, setActiveTab] = useState<LogType>("morning");

  return (
    <div className="relative min-h-full">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ backgroundImage: `url(${LaneBg.root2})`, backgroundPosition: "center 30%" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${LaneBg.root2})`, backgroundPosition: "center 30%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
          
          <div className="relative z-10 p-6 md:p-8">
            <div className="bg-black/70 border border-amber-600/40 p-4 md:p-6 backdrop-blur-md inline-block">
              <p className="font-mono text-amber-500/80 text-xs mb-1 tracking-wider">lifeops@root:~$</p>
              <h2 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-amber-400 uppercase">
                LIFE_OPS v2<span className="cursor-blink">_</span>
              </h2>
              <p className="font-mono text-amber-500/70 text-xs mt-3 tracking-wide">
                &gt; science-integrated // 5-minute daily calibration
              </p>
            </div>
          </div>
        </div>

        <WeeklyDashboard />

        <div className="flex items-center justify-between gap-4 flex-wrap px-1">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-background"
            data-testid="input-date-picker"
          />
          <span className="text-sm text-muted-foreground">
            {format(new Date(selectedDate + "T12:00:00"), "EEEE, MMMM d, yyyy")}
          </span>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LogType)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="morning" className="flex items-center gap-2" data-testid="tab-morning">
              <Sun className="w-4 h-4" />
              Morning Log
              <LogStatusIndicator date={selectedDate} logType="morning" />
            </TabsTrigger>
            <TabsTrigger value="evening" className="flex items-center gap-2" data-testid="tab-evening">
              <Moon className="w-4 h-4" />
              Evening Log
              <LogStatusIndicator date={selectedDate} logType="evening" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="morning" className="mt-6">
            <MorningLogForm date={selectedDate} />
          </TabsContent>
          
          <TabsContent value="evening" className="mt-6">
            <EveningLogForm date={selectedDate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LogStatusIndicator({ date, logType }: { date: string; logType: LogType }) {
  const { data: log } = useQuery<Log | null>({
    queryKey: ["/api/logs", date, logType],
    queryFn: async () => {
      const res = await fetch(`/api/logs/${date}?logType=${logType}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });
  
  if (log) {
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" data-testid={`status-${logType}-complete`} />;
  }
  return null;
}

function SectionHeader({ icon: Icon, title, color = "amber" }: { icon: any; title: string; color?: string }) {
  const colorClasses: Record<string, string> = {
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    violet: "text-violet-400",
    blue: "text-blue-400",
    red: "text-red-400",
    cyan: "text-cyan-400",
  };
  
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
      <Icon className={`w-4 h-4 ${colorClasses[color] || "text-foreground"}`} />
      {title}
    </h3>
  );
}

function MorningLogForm({ date }: { date: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: existingLog, isLoading } = useQuery<Log | null>({
    queryKey: ["/api/logs", date, "morning"],
    queryFn: async () => {
      const res = await fetch(`/api/logs/${date}?logType=morning`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });
  
  const isEditMode = !!existingLog?.id;
  
  const form = useForm<LogFormValues>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      date,
      logType: "morning",
      rewardContract: "",
      sleepHours: 7,
      sleepQuality: 5,
      wakeTimeHeld: false,
      bedtimeWindowHeld: false,
      screensDocked: false,
      proteinForwardMeal: false,
      hydrationBeforeNoon: false,
      timeInWord: 5,
      peaceLevel: 5,
      integrityAlignment: 5,
      serviceExpressed: 5,
      valueProtected: "",
      energy: 5,
      mentalClarity: 5,
      motivation: 5,
      exercise: false,
      meditation: false,
      prayer: false,
      journaling: false,
      coldShower: false,
    },
  });

  useEffect(() => {
    if (existingLog) {
      form.reset({
        ...form.getValues(),
        ...existingLog,
        logType: "morning",
      });
    } else {
      form.reset({
        date,
        logType: "morning",
        rewardContract: "",
        sleepHours: 7,
        sleepQuality: 5,
        wakeTimeHeld: false,
        bedtimeWindowHeld: false,
        screensDocked: false,
        proteinForwardMeal: false,
        hydrationBeforeNoon: false,
        timeInWord: 5,
        peaceLevel: 5,
        integrityAlignment: 5,
        serviceExpressed: 5,
        valueProtected: "",
        energy: 5,
        mentalClarity: 5,
        motivation: 5,
        exercise: false,
        meditation: false,
        prayer: false,
        journaling: false,
        coldShower: false,
      });
    }
  }, [existingLog, date]);

  const { mutate: saveLog, isPending } = useMutation({
    mutationFn: async (data: LogFormValues & { _existingId?: number }) => {
      const { _existingId, ...logData } = data;
      if (_existingId) {
        return apiRequest("PUT", `/api/logs/${_existingId}`, logData);
      }
      return apiRequest("POST", "/api/logs", logData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({ title: "Morning log saved!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error saving log", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: LogFormValues) => {
    const logId = existingLog?.id;
    saveLog({ ...data, date, logType: "morning", _existingId: logId });
  };

  const sleepHours = form.watch("sleepHours") || 7;
  const bedtimeHeld = form.watch("bedtimeWindowHeld");
  const isHighRisk = sleepHours < 6.5 || !bedtimeHeld;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CardWithBotanical className="max-w-4xl">
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="text-lg flex items-center flex-wrap gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <span>{isEditMode ? "Update Morning Log" : "Start Your Day Strong"}</span>
            {isEditMode && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {isHighRisk && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                High Risk Tomorrow
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="space-y-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <SectionHeader icon={Trophy} title="Reward Contract" color="amber" />
              <p className="text-xs text-muted-foreground">Set your reward before the day begins</p>
              <div className="space-y-2">
                <Label>If I follow the plan today, I earn:</Label>
                <Input
                  {...form.register("rewardContract")}
                  placeholder="e.g., 1 hour of project time, movie night, hobby time..."
                  className="bg-background"
                  data-testid="input-reward-contract"
                />
              </div>
            </div>

            <div className="space-y-4">
              <SectionHeader icon={Bed} title="Sleep & Circadian Law" color="blue" />
              <p className="text-xs text-muted-foreground">This controls impulse and cravings</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Hours of Sleep: {form.watch("sleepHours") || 7}</Label>
                  <Slider
                    min={0} max={12} step={0.5}
                    value={[form.watch("sleepHours") || 7]}
                    onValueChange={([v]) => form.setValue("sleepHours", v)}
                    data-testid="slider-sleep-hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sleep Quality: {form.watch("sleepQuality") || 5}/10</Label>
                  <Slider
                    min={1} max={10} step={1}
                    value={[form.watch("sleepQuality") || 5]}
                    onValueChange={([v]) => form.setValue("sleepQuality", v)}
                    data-testid="slider-sleep-quality"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: "wakeTimeHeld", label: "Wake time held?", icon: Sun },
                  { key: "bedtimeWindowHeld", label: "Bedtime window held?", icon: Moon },
                  { key: "screensDocked", label: "Screens docked outside bedroom?", icon: Shield },
                ].map((item) => (
                  <div key={item.key} className={`p-3 rounded-lg border transition-all ${
                    form.watch(item.key as keyof LogFormValues)
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-secondary/20 border-border/50"
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <Switch
                        checked={form.watch(item.key as keyof LogFormValues) as boolean || false}
                        onCheckedChange={(c) => form.setValue(item.key as any, c)}
                        data-testid={`switch-${item.key}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <SectionHeader icon={Droplets} title="Body Regulation" color="cyan" />
              <p className="text-xs text-muted-foreground">Stabilizing the nervous system</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "proteinForwardMeal", label: "Protein-forward first meal?", icon: Coffee },
                  { key: "hydrationBeforeNoon", label: "Hydration before noon?", icon: Droplets },
                ].map((item) => (
                  <div key={item.key} className={`p-3 rounded-lg border transition-all ${
                    form.watch(item.key as keyof LogFormValues)
                      ? "bg-cyan-500/10 border-cyan-500/30"
                      : "bg-secondary/20 border-border/50"
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <Switch
                        checked={form.watch(item.key as keyof LogFormValues) as boolean || false}
                        onCheckedChange={(c) => form.setValue(item.key as any, c)}
                        data-testid={`switch-${item.key}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: "exercise", label: "Exercise", icon: Dumbbell },
                  { key: "meditation", label: "Meditation", icon: Brain },
                  { key: "prayer", label: "Prayer", icon: Heart },
                  { key: "coldShower", label: "Cold Shower", icon: Droplets },
                ].map((item) => (
                  <div key={item.key} className={`p-3 rounded-lg border transition-all ${
                    form.watch(item.key as keyof LogFormValues)
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-secondary/20 border-border/50"
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <Switch
                        checked={form.watch(item.key as keyof LogFormValues) as boolean || false}
                        onCheckedChange={(c) => form.setValue(item.key as any, c)}
                        data-testid={`switch-${item.key}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <SectionHeader icon={Heart} title="Motivational Alignment (Anchor)" color="violet" />
              <p className="text-xs text-muted-foreground">Your "why" check - quick but real</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: "timeInWord", label: "Time in Word/Prayer" },
                  { key: "peaceLevel", label: "Peace/Steadiness" },
                  { key: "integrityAlignment", label: "Integrity Alignment" },
                  { key: "serviceExpressed", label: "Service/Love Expressed" },
                ].map((metric) => (
                  <div key={metric.key} className="space-y-2">
                    <Label className="text-xs">{metric.label}: {form.watch(metric.key as keyof LogFormValues) as number || 5}/10</Label>
                    <Slider
                      min={0} max={10} step={1}
                      value={[form.watch(metric.key as keyof LogFormValues) as number || 5]}
                      onValueChange={([v]) => form.setValue(metric.key as any, v)}
                      data-testid={`slider-${metric.key}`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label>Which value will I protect today?</Label>
                <Select
                  value={form.watch("valueProtected") || ""}
                  onValueChange={(v) => form.setValue("valueProtected", v)}
                >
                  <SelectTrigger data-testid="select-value-protected">
                    <SelectValue placeholder="Select a value..." />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUES_PROTECTED.map((value) => (
                      <SelectItem key={value} value={value}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <SectionHeader icon={Brain} title="Mental State" color="violet" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: "energy", label: "Energy" },
                  { key: "mentalClarity", label: "Mental Clarity" },
                  { key: "motivation", label: "Motivation" },
                ].map((metric) => (
                  <div key={metric.key} className="space-y-2">
                    <Label>{metric.label}: {form.watch(metric.key as keyof LogFormValues) as number || 5}/10</Label>
                    <Slider
                      min={1} max={10} step={1}
                      value={[form.watch(metric.key as keyof LogFormValues) as number || 5]}
                      onValueChange={([v]) => form.setValue(metric.key as any, v)}
                      data-testid={`slider-${metric.key}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full" data-testid="button-save-morning">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEditMode ? "Update Morning Log" : "Save Morning Log"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </CardWithBotanical>
  );
}

function EveningLogForm({ date }: { date: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: existingLog, isLoading } = useQuery<Log | null>({
    queryKey: ["/api/logs", date, "evening"],
    queryFn: async () => {
      const res = await fetch(`/api/logs/${date}?logType=evening`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });
  
  const isEditMode = !!existingLog?.id;
  
  const form = useForm<LogFormValues>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      date,
      logType: "evening",
      followedPlan: false,
      rewardEarned: false,
      rewardClaimed: false,
      rewardType: "",
      pointsEarned: 0,
      triggersEncountered: [],
      scriptsUsed: 0,
      scriptRunWhenTriggered: false,
      mostUsedScript: "",
      scriptGap: "",
      caffeineCutoffHeld: false,
      movementLevel: "",
      otcPlanTaken: false,
      hungerStability: 5,
      urgeIntensity: 0,
      stress: 5,
      impulseControl: 5,
      focus: 5,
      anxietyRumination: 0,
      mood: 5,
      connection: 5,
      valueChoice: "",
      environmentProtected: false,
      environmentLeaks: false,
      leakTypes: [],
      leakFixedImmediately: false,
      systemResumed: false,
      nextBlockScript: "",
      frictionUpgrade: "",
      topWin: "",
      topFriction: "",
      gratitudeNote: "",
    },
  });

  useEffect(() => {
    if (existingLog) {
      form.reset({
        ...form.getValues(),
        ...existingLog,
        logType: "evening",
        triggersEncountered: existingLog.triggersEncountered || [],
        leakTypes: existingLog.leakTypes || [],
      });
    } else {
      form.reset({
        date,
        logType: "evening",
        followedPlan: false,
        rewardEarned: false,
        rewardClaimed: false,
        rewardType: "",
        pointsEarned: 0,
        triggersEncountered: [],
        scriptsUsed: 0,
        scriptRunWhenTriggered: false,
        mostUsedScript: "",
        scriptGap: "",
        caffeineCutoffHeld: false,
        movementLevel: "",
        otcPlanTaken: false,
        hungerStability: 5,
        urgeIntensity: 0,
        stress: 5,
        impulseControl: 5,
        focus: 5,
        anxietyRumination: 0,
        mood: 5,
        connection: 5,
        valueChoice: "",
        environmentProtected: false,
        environmentLeaks: false,
        leakTypes: [],
        leakFixedImmediately: false,
        systemResumed: false,
        nextBlockScript: "",
        frictionUpgrade: "",
        topWin: "",
        topFriction: "",
        gratitudeNote: "",
      });
    }
  }, [existingLog, date]);

  const { mutate: saveLog, isPending } = useMutation({
    mutationFn: async (data: LogFormValues & { _existingId?: number }) => {
      const { _existingId, ...logData } = data;
      if (_existingId) {
        return apiRequest("PUT", `/api/logs/${_existingId}`, logData);
      }
      return apiRequest("POST", "/api/logs", logData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({ title: "Evening log saved!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error saving log", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: LogFormValues) => {
    const logId = existingLog?.id;
    saveLog({ ...data, date, logType: "evening", _existingId: logId });
  };

  const followedPlan = form.watch("followedPlan");
  const urgeIntensity = form.watch("urgeIntensity") || 0;
  const stress = form.watch("stress") || 5;
  const impulseControl = form.watch("impulseControl") || 5;
  const environmentLeaks = form.watch("environmentLeaks");

  const getAutoInterpretation = () => {
    const insights: string[] = [];
    if (urgeIntensity >= 7 && (form.watch("sleepHours") || 7) < 7) {
      insights.push("High urge + low sleep = Fix sleep & friction first");
    }
    if (stress >= 7 && impulseControl <= 4) {
      insights.push("High stress + low impulse control = Run scripts + reduce choices");
    }
    if (environmentLeaks) {
      insights.push("Environment leak detected = Patch leak immediately");
    }
    return insights;
  };

  const autoInsights = getAutoInterpretation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CardWithBotanical className="max-w-4xl">
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="text-lg flex items-center flex-wrap gap-2">
            <Moon className="w-5 h-5 text-blue-400" />
            <span>{isEditMode ? "Update Evening Log" : "Evening Reflection"}</span>
            {isEditMode && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className={`p-6 rounded-lg border-2 transition-all ${
              followedPlan 
                ? "bg-emerald-500/10 border-emerald-500/50" 
                : "bg-red-500/5 border-red-500/30"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className={`w-8 h-8 ${followedPlan ? "text-emerald-400" : "text-red-400"}`} />
                  <div>
                    <h3 className="text-lg font-bold">Followed the plan today?</h3>
                    <p className="text-xs text-muted-foreground">The truth checkbox - everything else explains why</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold ${followedPlan ? "text-emerald-400" : "text-red-400"}`}>
                    {followedPlan ? "YES" : "NO"}
                  </span>
                  <Switch
                    checked={followedPlan || false}
                    onCheckedChange={(c) => form.setValue("followedPlan", c)}
                    className="scale-150"
                    data-testid="switch-followed-plan"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <SectionHeader icon={Trophy} title="Contingency Management" color="amber" />
              <p className="text-xs text-muted-foreground">The levers that make change stick</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg border transition-all ${
                  form.watch("rewardEarned") ? "bg-amber-500/10 border-amber-500/30" : "bg-secondary/20 border-border/50"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reward Earned?</span>
                    <Switch
                      checked={form.watch("rewardEarned") || false}
                      onCheckedChange={(c) => form.setValue("rewardEarned", c)}
                      data-testid="switch-reward-earned"
                    />
                  </div>
                </div>
                <div className={`p-3 rounded-lg border transition-all ${
                  form.watch("rewardClaimed") ? "bg-emerald-500/10 border-emerald-500/30" : "bg-secondary/20 border-border/50"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Claimed Same-Day?</span>
                    <Switch
                      checked={form.watch("rewardClaimed") || false}
                      onCheckedChange={(c) => form.setValue("rewardClaimed", c)}
                      data-testid="switch-reward-claimed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Points Earned: {form.watch("pointsEarned") || 0}/10</Label>
                  <Slider
                    min={0} max={10} step={1}
                    value={[form.watch("pointsEarned") || 0]}
                    onValueChange={([v]) => form.setValue("pointsEarned", v)}
                    data-testid="slider-points-earned"
                  />
                </div>
              </div>
              
              <Select
                value={form.watch("rewardType") || ""}
                onValueChange={(v) => form.setValue("rewardType", v)}
              >
                <SelectTrigger data-testid="select-reward-type">
                  <SelectValue placeholder="What reward did I earn?" />
                </SelectTrigger>
                <SelectContent>
                  {REWARD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <SectionHeader icon={Zap} title="Script Execution (CBT)" color="violet" />
              <p className="text-xs text-muted-foreground">Behavioral, not emotional</p>
              
              <div className="space-y-3">
                <Label className="text-xs">Triggers encountered (check all)</Label>
                <div className="flex flex-wrap gap-2">
                  {TRIGGER_LEVELS.map((trigger) => {
                    const triggers = form.watch("triggersEncountered") || [];
                    const isSelected = triggers.includes(trigger);
                    const colorMap: Record<string, string> = {
                      Red: "bg-red-500/20 border-red-500/50 text-red-400",
                      Yellow: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
                      Green: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
                    };
                    return (
                      <Badge
                        key={trigger}
                        variant="outline"
                        className={`cursor-pointer transition-all ${isSelected ? colorMap[trigger] : ""}`}
                        onClick={() => {
                          const newTriggers = isSelected
                            ? triggers.filter((t: string) => t !== trigger)
                            : [...triggers, trigger];
                          form.setValue("triggersEncountered", newTriggers);
                        }}
                        data-testid={`badge-trigger-${trigger.toLowerCase()}`}
                      >
                        {trigger}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Scripts used (0-5): {form.watch("scriptsUsed") || 0}</Label>
                  <Slider
                    min={0} max={5} step={1}
                    value={[form.watch("scriptsUsed") || 0]}
                    onValueChange={([v]) => form.setValue("scriptsUsed", v)}
                    data-testid="slider-scripts-used"
                  />
                </div>
                <div className={`p-3 rounded-lg border transition-all ${
                  form.watch("scriptRunWhenTriggered") ? "bg-emerald-500/10 border-emerald-500/30" : "bg-secondary/20 border-border/50"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ran script when triggered?</span>
                    <Switch
                      checked={form.watch("scriptRunWhenTriggered") || false}
                      onCheckedChange={(c) => form.setValue("scriptRunWhenTriggered", c)}
                      data-testid="switch-script-run"
                    />
                  </div>
                </div>
              </div>
              
              {!form.watch("scriptRunWhenTriggered") && (form.watch("triggersEncountered")?.length || 0) > 0 && (
                <Select
                  value={form.watch("scriptGap") || ""}
                  onValueChange={(v) => form.setValue("scriptGap", v)}
                >
                  <SelectTrigger data-testid="select-script-gap">
                    <SelectValue placeholder="What was the gap?" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCRIPT_GAPS.map((gap) => (
                      <SelectItem key={gap} value={gap}>{gap}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-4">
              <SectionHeader icon={Coffee} title="Body Regulation" color="cyan" />
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: "caffeineCutoffHeld", label: "Caffeine cutoff held?" },
                  { key: "otcPlanTaken", label: "OTC plan taken?" },
                ].map((item) => (
                  <div key={item.key} className={`p-3 rounded-lg border transition-all ${
                    form.watch(item.key as keyof LogFormValues) ? "bg-cyan-500/10 border-cyan-500/30" : "bg-secondary/20 border-border/50"
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm">{item.label}</span>
                      <Switch
                        checked={form.watch(item.key as keyof LogFormValues) as boolean || false}
                        onCheckedChange={(c) => form.setValue(item.key as any, c)}
                        data-testid={`switch-${item.key}`}
                      />
                    </div>
                  </div>
                ))}
                <Select
                  value={form.watch("movementLevel") || ""}
                  onValueChange={(v) => form.setValue("movementLevel", v)}
                >
                  <SelectTrigger data-testid="select-movement">
                    <SelectValue placeholder="Movement level" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Hunger Stability: {form.watch("hungerStability") || 5}/10</Label>
                <Slider
                  min={0} max={10} step={1}
                  value={[form.watch("hungerStability") || 5]}
                  onValueChange={([v]) => form.setValue("hungerStability", v)}
                  data-testid="slider-hunger"
                />
              </div>
            </div>

            <div className="space-y-4">
              <SectionHeader icon={Brain} title="Mind & Urge Signal" color="violet" />
              <p className="text-xs text-muted-foreground">Track the state, not a story</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: "urgeIntensity", label: "Urge Intensity (peak)", color: "red" },
                  { key: "stress", label: "Stress Load", color: "amber" },
                  { key: "impulseControl", label: "Impulse Control", color: "emerald" },
                  { key: "focus", label: "Focus/Clarity", color: "blue" },
                  { key: "anxietyRumination", label: "Anxiety/Rumination", color: "violet" },
                  { key: "mood", label: "Mood", color: "pink" },
                ].map((metric) => (
                  <div key={metric.key} className="space-y-2">
                    <Label className="text-xs flex justify-between">
                      <span>{metric.label}</span>
                      <span className="font-mono">{form.watch(metric.key as keyof LogFormValues) as number || 0}</span>
                    </Label>
                    <Slider
                      min={0} max={10} step={1}
                      value={[form.watch(metric.key as keyof LogFormValues) as number || 0]}
                      onValueChange={([v]) => form.setValue(metric.key as any, v)}
                      data-testid={`slider-${metric.key}`}
                    />
                  </div>
                ))}
              </div>
              
              {autoInsights.length > 0 && (
                <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
                  <p className="text-xs font-semibold text-violet-400 mb-2">Auto-interpretation:</p>
                  {autoInsights.map((insight, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{insight}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <SectionHeader icon={Shield} title="Environment Integrity" color="emerald" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg border transition-all ${
                  form.watch("environmentProtected") ? "bg-emerald-500/10 border-emerald-500/30" : "bg-secondary/20 border-border/50"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Environment protected (no low-friction access)?</span>
                    <Switch
                      checked={form.watch("environmentProtected") || false}
                      onCheckedChange={(c) => form.setValue("environmentProtected", c)}
                      data-testid="switch-env-protected"
                    />
                  </div>
                </div>
                <div className={`p-3 rounded-lg border transition-all ${
                  form.watch("environmentLeaks") ? "bg-red-500/10 border-red-500/30" : "bg-secondary/20 border-border/50"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Any environment leaks?</span>
                    <Switch
                      checked={form.watch("environmentLeaks") || false}
                      onCheckedChange={(c) => form.setValue("environmentLeaks", c)}
                      data-testid="switch-env-leaks"
                    />
                  </div>
                </div>
              </div>
              
              {environmentLeaks && (
                <div className="space-y-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <Label className="text-xs text-red-400">Leak types (check all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {LEAK_TYPES.map((leak) => {
                      const leaks = form.watch("leakTypes") || [];
                      const isSelected = leaks.includes(leak);
                      return (
                        <Badge
                          key={leak}
                          variant="outline"
                          className={`cursor-pointer transition-all ${isSelected ? "bg-red-500/20 border-red-500/50 text-red-400" : ""}`}
                          onClick={() => {
                            const newLeaks = isSelected
                              ? leaks.filter((l: string) => l !== leak)
                              : [...leaks, leak];
                            form.setValue("leakTypes", newLeaks);
                          }}
                          data-testid={`badge-leak-${leak.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {leak}
                        </Badge>
                      );
                    })}
                  </div>
                  <div className={`p-3 rounded-lg border transition-all ${
                    form.watch("leakFixedImmediately") ? "bg-emerald-500/10 border-emerald-500/30" : "bg-secondary/20 border-border/50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fix applied immediately?</span>
                      <Switch
                        checked={form.watch("leakFixedImmediately") || false}
                        onCheckedChange={(c) => form.setValue("leakFixedImmediately", c)}
                        data-testid="switch-leak-fixed"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!followedPlan && (
              <div className="space-y-4 p-4 rounded-lg bg-red-500/5 border-2 border-red-500/30">
                <SectionHeader icon={XCircle} title="Recovery Rule" color="red" />
                <p className="text-xs text-muted-foreground">Containment tool, not shame tool</p>
                
                <div className={`p-3 rounded-lg border transition-all ${
                  form.watch("systemResumed") ? "bg-emerald-500/10 border-emerald-500/30" : "bg-secondary/20 border-border/50"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System resumed within next block?</span>
                    <Switch
                      checked={form.watch("systemResumed") || false}
                      onCheckedChange={(c) => form.setValue("systemResumed", c)}
                      data-testid="switch-system-resumed"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Next block script</Label>
                    <Input
                      {...form.register("nextBlockScript")}
                      placeholder="What's my next script?"
                      data-testid="input-next-script"
                    />
                  </div>
                  <Select
                    value={form.watch("frictionUpgrade") || ""}
                    onValueChange={(v) => form.setValue("frictionUpgrade", v)}
                  >
                    <SelectTrigger data-testid="select-friction-upgrade">
                      <SelectValue placeholder="Friction upgrade to apply now" />
                    </SelectTrigger>
                    <SelectContent>
                      {FRICTION_UPGRADES.map((upgrade) => (
                        <SelectItem key={upgrade} value={upgrade}>{upgrade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <SectionHeader icon={Heart} title="Daily Reflection" color="amber" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Top Win</Label>
                  <Input
                    {...form.register("topWin")}
                    placeholder="Best thing that happened today"
                    data-testid="input-top-win"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Top Friction</Label>
                  <Input
                    {...form.register("topFriction")}
                    placeholder="Biggest challenge today"
                    data-testid="input-top-friction"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Value Choice (optional)</Label>
                <Input
                  {...form.register("valueChoice")}
                  placeholder="Today I chose ______ over ______"
                  data-testid="input-value-choice"
                />
              </div>
              <div className="space-y-2">
                <Label>Gratitude Note</Label>
                <Textarea
                  {...form.register("gratitudeNote")}
                  placeholder="What are you grateful for today?"
                  className="h-20"
                  data-testid="textarea-gratitude"
                />
              </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full" data-testid="button-save-evening">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEditMode ? "Update Evening Log" : "Save Evening Log"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </CardWithBotanical>
  );
}
