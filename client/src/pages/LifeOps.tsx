/* ================================================================
   LIFEOPS - Stewardship Lane
   Daily calibration, routines, logs, family leadership
   Visual: Regeneration Field with bioluminescent fungi & aurora
   Target: 1-2 minutes to complete
   ================================================================ */

import { useState, useEffect } from "react";
import { useLogs, useCreateLog, useLogByDate, useUpdateLog } from "@/hooks/use-bruce-ops";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLogSchema, DAY_TYPES, PRIMARY_EMOTIONS, WIN_CATEGORIES, TIME_DRAINS, type Log } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Lightbulb, Activity, ChevronDown, Wine, Cigarette, Cookie, Smartphone, Moon, Coffee, UtensilsCrossed, Dumbbell } from "lucide-react";
import { CardWithBotanical } from "@/components/BotanicalMotifs";
import CoreImagery from "@/lib/coreImagery";

type LogFormValues = z.infer<typeof insertLogSchema>;

const SCALE_LABELS = {
  energy: { low: "Crashed", high: "Unstoppable", color: "text-emerald-400" },
  stress: { low: "Zen", high: "Maxed Out", color: "text-red-400" },
  mood: { low: "Dark", high: "Grateful", color: "text-amber-400" },
  focus: { low: "Scattered", high: "Locked In", color: "text-violet-400" },
  sleepQuality: { low: "Terrible", high: "Restorative", color: "text-blue-400" },
  moneyPressure: { low: "Stable", high: "Crushing", color: "text-yellow-500" },
  connection: { low: "Isolated", high: "Deeply Connected", color: "text-pink-400" },
};

const VICE_ITEMS = [
  { key: "vaping", label: "Vaping", icon: Cigarette, description: "Did you vape today?" },
  { key: "alcohol", label: "Alcohol", icon: Wine, description: "Any drinks today?" },
  { key: "junkFood", label: "Junk Food", icon: Cookie, description: "Processed/fast food?" },
  { key: "doomScrolling", label: "Doom Scroll", icon: Smartphone, description: "Wasted time scrolling?" },
  { key: "lateScreens", label: "Late Screens", icon: Moon, description: "Screens after 10pm?" },
  { key: "skippedMeals", label: "Skipped Meals", icon: UtensilsCrossed, description: "Missed proper meals?" },
  { key: "excessCaffeine", label: "Excess Caffeine", icon: Coffee, description: "Too much coffee?" },
] as const;

const PROMPT_EXAMPLES = {
  topWin: [
    "Finished the project proposal",
    "Great conversation with my kid", 
    "30 min workout before work",
    "Stayed calm in a stressful meeting"
  ],
  topFriction: [
    "Procrastinated on taxes",
    "Snapped at my spouse",
    "Couldn't focus all morning",
    "Skipped my morning routine"
  ],
  tomorrowPriority: [
    "Submit quarterly report",
    "Call mom",
    "Morning workout no excuses",
    "Finish reading that chapter"
  ]
};

export default function LifeOps() {
  return (
    <div className="space-y-6">
      {/* Hero Header with LifeOps Core Imagery */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${CoreImagery.lifeops})`,
            backgroundPosition: "center 20%"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="relative z-10 p-6 md:p-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-sm">
            <Activity className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">LifeOps</h2>
            <p className="text-sm text-muted-foreground tracking-widest uppercase">
              Stewardship Channel // Daily Calibration
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="log" data-testid="tab-daily-log">Daily Log</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">History & Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="log" className="mt-6">
          <DailyLogForm />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <LogHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DailyLogForm() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: existingLog, isLoading: checkingExisting } = useLogByDate(today);
  const { mutate: createLog, isPending: isCreating } = useCreateLog();
  const { mutate: updateLog, isPending: isUpdating } = useUpdateLog();
  
  const [deepDivesOpen, setDeepDivesOpen] = useState(false);
  const [quickMode, setQuickMode] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const isEditMode = !!existingLog?.id;
  const isPending = isCreating || isUpdating;
  
  const defaultValues: LogFormValues = {
    date: today,
    energy: 5,
    stress: 5,
    mood: 5,
    focus: 5,
    sleepQuality: 5,
    moneyPressure: 5,
    connection: 5,
    vaping: false,
    alcohol: false,
    junkFood: false,
    doomScrolling: false,
    lateScreens: false,
    skippedMeals: false,
    excessCaffeine: false,
    exercise: false,
    dayType: "work",
    primaryEmotion: "peaceful",
    winCategory: "none",
    timeDrain: "none",
  };
  
  const form = useForm<LogFormValues>({
    resolver: zodResolver(insertLogSchema),
    defaultValues,
  });

  useEffect(() => {
    if (existingLog) {
      const logData = {
        ...defaultValues,
        ...existingLog,
      };
      form.reset(logData);
    }
  }, [existingLog]);

  const onSubmit = (data: LogFormValues) => {
    setSaveSuccess(false);
    
    const handleSuccess = () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    };
    
    const handleError = () => {
      setSaveSuccess(false);
    };
    
    if (isEditMode && existingLog?.id) {
      updateLog({ ...data, id: existingLog.id }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createLog(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  if (checkingExisting) {
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
            <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
            <span>{isEditMode ? 'Update Today\'s Log' : 'Daily Calibration'}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {format(new Date(), "MMM d, yyyy")}
            </span>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className={quickMode ? 'text-muted-foreground' : 'text-foreground font-medium'}>Full</span>
                <Switch 
                  checked={quickMode}
                  onCheckedChange={setQuickMode}
                  data-testid="switch-quick-mode"
                />
                <span className={quickMode ? 'text-foreground font-medium' : 'text-muted-foreground'}>Quick</span>
              </div>
              <span className="text-xs font-normal text-muted-foreground">{quickMode ? '~1 min' : '~3 min'}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* SECTION 1: VICES CHECK */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-400">1</span>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Vices Check</h3>
                <span className="text-xs text-muted-foreground">(Yes = did it today)</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {VICE_ITEMS.map((vice) => (
                  <div 
                    key={vice.key}
                    className={`p-3 rounded-lg border transition-all ${
                      form.watch(vice.key as keyof LogFormValues) 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-secondary/20 border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <vice.icon className={`w-4 h-4 shrink-0 ${
                          form.watch(vice.key as keyof LogFormValues) ? 'text-red-400' : 'text-muted-foreground'
                        }`} />
                        <span className="text-sm font-medium truncate">{vice.label}</span>
                      </div>
                      <Switch 
                        checked={form.watch(vice.key as keyof LogFormValues) as boolean || false}
                        onCheckedChange={(c) => form.setValue(vice.key as any, c)}
                        data-testid={`switch-${vice.key}`}
                      />
                    </div>
                  </div>
                ))}
                
                {/* Exercise is positive - styled differently */}
                <div 
                  className={`p-3 rounded-lg border transition-all ${
                    form.watch("exercise") 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-secondary/20 border-border/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Dumbbell className={`w-4 h-4 shrink-0 ${
                        form.watch("exercise") ? 'text-emerald-400' : 'text-muted-foreground'
                      }`} />
                      <span className="text-sm font-medium truncate">Exercise</span>
                    </div>
                    <Switch 
                      checked={form.watch("exercise") || false}
                      onCheckedChange={(c) => form.setValue("exercise", c)}
                      data-testid="switch-exercise"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: LIFE METRICS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-violet-400">2</span>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Life Metrics</h3>
                <span className="text-xs text-muted-foreground">(1-10 scale)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(SCALE_LABELS).map(([key, labels]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <span className={`font-mono font-bold ${labels.color}`}>
                        {form.watch(key as keyof LogFormValues) || 5}
                      </span>
                    </div>
                    <Slider 
                      min={1} max={10} step={1} 
                      value={[form.watch(key as keyof LogFormValues) as number || 5]} 
                      onValueChange={([v]) => form.setValue(key as any, v)}
                      className="py-2"
                      data-testid={`slider-${key}`}
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{labels.low}</span>
                      <span>{labels.high}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTIONS 3-5: Only show when NOT in quick mode */}
            {!quickMode && (
            <>
            {/* SECTION 3: QUICK CONTEXT */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-400">3</span>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Quick Context</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Day Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">What kind of day was it?</Label>
                  <RadioGroup
                    value={form.watch("dayType") || "work"}
                    onValueChange={(v) => form.setValue("dayType", v)}
                    className="flex flex-wrap gap-2"
                  >
                    {DAY_TYPES.map((type) => (
                      <div key={type}>
                        <RadioGroupItem value={type} id={`day-${type}`} className="peer sr-only" />
                        <Label
                          htmlFor={`day-${type}`}
                          className="flex cursor-pointer items-center rounded-md border border-border/50 bg-secondary/20 px-3 py-1.5 text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary hover-elevate"
                          data-testid={`radio-day-${type}`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Primary Emotion */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Primary emotion today?</Label>
                  <RadioGroup
                    value={form.watch("primaryEmotion") || "peaceful"}
                    onValueChange={(v) => form.setValue("primaryEmotion", v)}
                    className="flex flex-wrap gap-2"
                  >
                    {PRIMARY_EMOTIONS.map((emotion) => (
                      <div key={emotion}>
                        <RadioGroupItem value={emotion} id={`emotion-${emotion}`} className="peer sr-only" />
                        <Label
                          htmlFor={`emotion-${emotion}`}
                          className="flex cursor-pointer items-center rounded-md border border-border/50 bg-secondary/20 px-3 py-1.5 text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary hover-elevate"
                          data-testid={`radio-emotion-${emotion}`}
                        >
                          {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Win Category */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Biggest win category?</Label>
                  <RadioGroup
                    value={form.watch("winCategory") || "none"}
                    onValueChange={(v) => form.setValue("winCategory", v)}
                    className="flex flex-wrap gap-2"
                  >
                    {WIN_CATEGORIES.map((cat) => (
                      <div key={cat}>
                        <RadioGroupItem value={cat} id={`win-${cat}`} className="peer sr-only" />
                        <Label
                          htmlFor={`win-${cat}`}
                          className="flex cursor-pointer items-center rounded-md border border-border/50 bg-secondary/20 px-3 py-1.5 text-sm peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-500/10 peer-data-[state=checked]:text-emerald-500 hover-elevate"
                          data-testid={`radio-win-${cat}`}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Time Drain */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Biggest time drain?</Label>
                  <RadioGroup
                    value={form.watch("timeDrain") || "none"}
                    onValueChange={(v) => form.setValue("timeDrain", v)}
                    className="flex flex-wrap gap-2"
                  >
                    {TIME_DRAINS.map((drain) => (
                      <div key={drain}>
                        <RadioGroupItem value={drain} id={`drain-${drain}`} className="peer sr-only" />
                        <Label
                          htmlFor={`drain-${drain}`}
                          className="flex cursor-pointer items-center rounded-md border border-border/50 bg-secondary/20 px-3 py-1.5 text-sm peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 peer-data-[state=checked]:text-orange-500 hover-elevate"
                          data-testid={`radio-drain-${drain}`}
                        >
                          {drain.charAt(0).toUpperCase() + drain.slice(1).replace(/-/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* SECTION 4: REFLECTION PROMPTS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-cyan-400">4</span>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Quick Reflections</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Top Win</Label>
                  <Input 
                    {...form.register("topWin")} 
                    placeholder={PROMPT_EXAMPLES.topWin[Math.floor(Math.random() * PROMPT_EXAMPLES.topWin.length)]}
                    data-testid="input-top-win" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Top Friction</Label>
                  <Input 
                    {...form.register("topFriction")} 
                    placeholder={PROMPT_EXAMPLES.topFriction[Math.floor(Math.random() * PROMPT_EXAMPLES.topFriction.length)]}
                    data-testid="input-top-friction" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tomorrow's ONE Thing</Label>
                  <Input 
                    {...form.register("tomorrowPriority")} 
                    placeholder={PROMPT_EXAMPLES.tomorrowPriority[Math.floor(Math.random() * PROMPT_EXAMPLES.tomorrowPriority.length)]}
                    data-testid="input-tomorrow" 
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: OPTIONAL DEEP DIVES */}
            <Collapsible open={deepDivesOpen} onOpenChange={setDeepDivesOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full justify-between text-muted-foreground"
                  data-testid="button-toggle-deep-dives"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-400">5</span>
                    </div>
                    <span className="text-sm font-semibold uppercase tracking-wider">Optional Deep Dives</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${deepDivesOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Family Connection</Label>
                  <Textarea 
                    {...form.register("familyConnection")} 
                    placeholder="A meaningful moment with family today... (e.g., 'Read bedtime story to kids', 'Long talk with spouse about goals')"
                    className="h-20" 
                    data-testid="textarea-family" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Faith Alignment</Label>
                  <Textarea 
                    {...form.register("faithAlignment")} 
                    placeholder="How did faith show up today? (e.g., 'Morning prayer felt grounded', 'Struggled to trust God with finances')"
                    className="h-20" 
                    data-testid="textarea-faith" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Drift Check</Label>
                  <Textarea 
                    {...form.register("driftCheck")} 
                    placeholder="Where am I drifting off course? (e.g., 'Spending too much time on phone', 'Avoiding hard conversations')"
                    className="h-20 border-destructive/20 focus-visible:ring-destructive/50" 
                    data-testid="textarea-drift"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            </>
            )}

            <Button 
              type="submit" 
              className={`w-full transition-all ${saveSuccess ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`} 
              disabled={isPending} 
              data-testid="button-save-log"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Saved
                </>
              ) : isEditMode ? "Update Log" : "Save Daily Log"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </CardWithBotanical>
  );
}

function LogHistory() {
  const { data: logs, isLoading } = useLogs();

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;

  if (!logs?.length) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground">No logs yet. Start your daily calibration above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {logs?.map((log: Log) => (
        <Card key={log.id} className="overflow-hidden border-border/40 hover:border-emerald-500/30 transition-all backdrop-blur-sm" data-testid={`card-log-${log.id}`}>
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-64 bg-secondary/30 border-b md:border-b-0 md:border-r border-border/40 flex flex-col justify-center space-y-4">
              <div className="text-2xl font-display font-bold">{format(new Date(log.date), "MMM d, yyyy")}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                   <span className="text-muted-foreground text-xs uppercase">Energy</span>
                   <span className="font-mono font-bold text-emerald-400">{log.energy}/10</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-muted-foreground text-xs uppercase">Stress</span>
                   <span className="font-mono font-bold text-red-400">{log.stress}/10</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-muted-foreground text-xs uppercase">Mood</span>
                   <span className="font-mono font-bold text-amber-400">{log.mood}/10</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-muted-foreground text-xs uppercase">Focus</span>
                   <span className="font-mono font-bold text-violet-400">{log.focus}/10</span>
                </div>
              </div>
              {log.dayType && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Day Type: </span>
                  <span className="capitalize">{log.dayType}</span>
                </div>
              )}
            </div>
            
            <div className="p-6 flex-1 space-y-4">
               {log.aiSummary && (
                 <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-sm leading-relaxed">
                   <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                     <Lightbulb className="w-4 h-4" /> AI Insight
                   </div>
                   {log.aiSummary}
                 </div>
               )}
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="font-semibold block mb-1">Win</span>
                   <p className="text-muted-foreground">{log.topWin || "-"}</p>
                 </div>
                 <div>
                   <span className="font-semibold block mb-1">Friction</span>
                   <p className="text-muted-foreground">{log.topFriction || "-"}</p>
                 </div>
               </div>
               
               {/* Vice summary */}
               <div className="flex flex-wrap gap-2 text-xs">
                 {log.vaping && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">Vaping</span>}
                 {log.alcohol && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">Alcohol</span>}
                 {log.junkFood && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">Junk Food</span>}
                 {log.doomScrolling && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">Doom Scroll</span>}
                 {log.exercise && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Exercise</span>}
               </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
