/* ================================================================
   LIFEOPS - Enhanced Morning/Evening Daily Logs
   Split into morning calibration and evening reflection
   ================================================================ */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLogSchema, type Log } from "@shared/schema";
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
import { Loader2, Sun, Moon, CheckCircle2, Dumbbell, BookOpen, Heart, Brain, Droplets, Coffee } from "lucide-react";
import { CardWithBotanical } from "@/components/BotanicalMotifs";
import { LaneBg } from "@/lib/coreImagery";
import { useToast } from "@/hooks/use-toast";

type LogType = "morning" | "evening";

const logFormSchema = insertLogSchema.extend({
  logType: z.enum(["morning", "evening"]).default("evening"),
});

type LogFormValues = z.infer<typeof logFormSchema>;

const MORNING_HABITS = [
  { key: "exercise", label: "Exercise", icon: Dumbbell, color: "emerald" },
  { key: "meditation", label: "Meditation", icon: Brain, color: "violet" },
  { key: "prayer", label: "Prayer", icon: Heart, color: "amber" },
  { key: "journaling", label: "Journaling", icon: BookOpen, color: "blue" },
  { key: "coldShower", label: "Cold Shower", icon: Droplets, color: "cyan" },
] as const;

const EVENING_DRIFT = [
  { key: "vaping", label: "Vaping" },
  { key: "alcohol", label: "Alcohol" },
  { key: "junkFood", label: "Junk Food" },
  { key: "doomScrolling", label: "Doom Scrolling" },
  { key: "lateScreens", label: "Late Screens" },
  { key: "excessCaffeine", label: "Excess Caffeine" },
] as const;

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
                LIFE_OPS<span className="cursor-blink">_</span>
              </h2>
              <p className="font-mono text-amber-500/70 text-xs mt-3 tracking-wide">
                &gt; daily calibration // morning + evening logs
              </p>
            </div>
          </div>
        </div>

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
      sleepHours: 7,
      sleepQuality: 5,
      energy: 5,
      mentalClarity: 5,
      motivation: 5,
      exercise: false,
      meditation: false,
      prayer: false,
      journaling: false,
      coldShower: false,
      coffeeCount: 1,
      morningIntention: "",
      oneThingPriority: "",
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
        sleepHours: 7,
        sleepQuality: 5,
        energy: 5,
        mentalClarity: 5,
        motivation: 5,
        exercise: false,
        meditation: false,
        prayer: false,
        journaling: false,
        coldShower: false,
        coffeeCount: 1,
        morningIntention: "",
        oneThingPriority: "",
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
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-400" />
                Sleep Quality
              </h3>
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
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                Mental State
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Energy: {form.watch("energy") || 5}/10</Label>
                  <Slider
                    min={1} max={10} step={1}
                    value={[form.watch("energy") || 5]}
                    onValueChange={([v]) => form.setValue("energy", v)}
                    data-testid="slider-energy"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mental Clarity: {form.watch("mentalClarity") || 5}/10</Label>
                  <Slider
                    min={1} max={10} step={1}
                    value={[form.watch("mentalClarity") || 5]}
                    onValueChange={([v]) => form.setValue("mentalClarity", v)}
                    data-testid="slider-mental-clarity"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Motivation: {form.watch("motivation") || 5}/10</Label>
                  <Slider
                    min={1} max={10} step={1}
                    value={[form.watch("motivation") || 5]}
                    onValueChange={([v]) => form.setValue("motivation", v)}
                    data-testid="slider-motivation"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Morning Habits
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {MORNING_HABITS.map((habit) => (
                  <div
                    key={habit.key}
                    className={`p-3 rounded-lg border transition-all ${
                      form.watch(habit.key as keyof LogFormValues)
                        ? `bg-${habit.color}-500/10 border-${habit.color}-500/30`
                        : "bg-secondary/20 border-border/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <habit.icon className={`w-4 h-4 shrink-0 ${
                          form.watch(habit.key as keyof LogFormValues) ? `text-${habit.color}-400` : "text-muted-foreground"
                        }`} />
                        <span className="text-sm font-medium truncate">{habit.label}</span>
                      </div>
                      <Switch
                        checked={form.watch(habit.key as keyof LogFormValues) as boolean || false}
                        onCheckedChange={(c) => form.setValue(habit.key as any, c)}
                        data-testid={`switch-${habit.key}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                Caffeine & Hydration
              </h3>
              <div className="flex items-center gap-4">
                <Label>Coffees Today: {form.watch("coffeeCount") || 0}</Label>
                <Slider
                  min={0} max={6} step={1}
                  value={[form.watch("coffeeCount") || 0]}
                  onValueChange={([v]) => form.setValue("coffeeCount", v)}
                  className="w-48"
                  data-testid="slider-coffee"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">Intention Setting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Morning Intention</Label>
                  <Textarea
                    {...form.register("morningIntention")}
                    placeholder="Today I will focus on..."
                    className="h-20"
                    data-testid="textarea-intention"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ONE Thing Priority</Label>
                  <Input
                    {...form.register("oneThingPriority")}
                    placeholder="The single most important thing today"
                    data-testid="input-one-thing"
                  />
                </div>
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
      energy: 5,
      stress: 5,
      mood: 5,
      focus: 5,
      connection: 5,
      vaping: false,
      alcohol: false,
      junkFood: false,
      doomScrolling: false,
      lateScreens: false,
      excessCaffeine: false,
      topWin: "",
      topFriction: "",
      tomorrowPriority: "",
      gratitudeNote: "",
    },
  });

  useEffect(() => {
    if (existingLog) {
      form.reset({
        ...form.getValues(),
        ...existingLog,
        logType: "evening",
      });
    } else {
      form.reset({
        date,
        logType: "evening",
        energy: 5,
        stress: 5,
        mood: 5,
        focus: 5,
        connection: 5,
        vaping: false,
        alcohol: false,
        junkFood: false,
        doomScrolling: false,
        lateScreens: false,
        excessCaffeine: false,
        topWin: "",
        topFriction: "",
        tomorrowPriority: "",
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
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">Day Metrics (1-10)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { key: "energy", label: "Energy", color: "emerald" },
                  { key: "stress", label: "Stress", color: "red" },
                  { key: "mood", label: "Mood", color: "amber" },
                  { key: "focus", label: "Focus", color: "violet" },
                  { key: "connection", label: "Connection", color: "pink" },
                ].map((metric) => (
                  <div key={metric.key} className="space-y-2">
                    <Label className="flex justify-between">
                      <span>{metric.label}</span>
                      <span className={`font-mono text-${metric.color}-400`}>
                        {String(form.watch(metric.key as keyof LogFormValues) ?? 5)}
                      </span>
                    </Label>
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

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400">Drift Factors</h3>
              <p className="text-xs text-muted-foreground">Check any that happened today</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EVENING_DRIFT.map((drift) => (
                  <div
                    key={drift.key}
                    className={`p-3 rounded-lg border transition-all ${
                      form.watch(drift.key as keyof LogFormValues)
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-secondary/20 border-border/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{drift.label}</span>
                      <Switch
                        checked={form.watch(drift.key as keyof LogFormValues) as boolean || false}
                        onCheckedChange={(c) => form.setValue(drift.key as any, c)}
                        data-testid={`switch-${drift.key}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">Reflection</h3>
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
                <div className="space-y-2">
                  <Label>Tomorrow's Priority</Label>
                  <Input
                    {...form.register("tomorrowPriority")}
                    placeholder="What matters most tomorrow?"
                    data-testid="input-tomorrow"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gratitude Note</Label>
                  <Input
                    {...form.register("gratitudeNote")}
                    placeholder="Something you're grateful for"
                    data-testid="input-gratitude"
                  />
                </div>
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
