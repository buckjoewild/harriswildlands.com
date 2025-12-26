/* ================================================================
   LIFEOPS - Stewardship Lane
   Daily calibration, routines, logs, family leadership
   Visual: Regeneration Field with bioluminescent fungi & aurora
   ================================================================ */

import { useState } from "react";
import { useLogs, useCreateLog } from "@/hooks/use-bruce-ops";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLogSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Lightbulb, Activity } from "lucide-react";
import { CardWithBotanical } from "@/components/BotanicalMotifs";
import CoreImagery from "@/lib/coreImagery";

type LogFormValues = z.infer<typeof insertLogSchema>;

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
  const { mutate: createLog, isPending } = useCreateLog();
  
  const form = useForm<LogFormValues>({
    resolver: zodResolver(insertLogSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      energy: 5,
      stress: 5,
      mood: 5,
      moneyPressure: 5,
      vaping: false,
      exercise: false,
    }
  });

  const onSubmit = (data: LogFormValues) => {
    createLog(data, {
      onSuccess: () => form.reset()
    });
  };

  return (
    <CardWithBotanical className="max-w-3xl">
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Daily Calibration
          </CardTitle>
        </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Energy Level</Label>
                  <span className="text-sm font-mono text-emerald-400">{form.watch("energy")}</span>
                </div>
                <Slider 
                  min={1} max={10} step={1} 
                  value={[form.watch("energy") || 5]} 
                  onValueChange={([v]) => form.setValue("energy", v)}
                  className="py-2"
                  data-testid="slider-energy"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Stress Level</Label>
                  <span className="text-sm font-mono text-destructive">{form.watch("stress")}</span>
                </div>
                <Slider 
                  min={1} max={10} step={1} 
                  value={[form.watch("stress") || 5]} 
                  onValueChange={([v]) => form.setValue("stress", v)}
                  data-testid="slider-stress"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Mood</Label>
                  <span className="text-sm font-mono text-accent">{form.watch("mood")}</span>
                </div>
                <Slider 
                  min={1} max={10} step={1} 
                  value={[form.watch("mood") || 5]} 
                  onValueChange={([v]) => form.setValue("mood", v)}
                  data-testid="slider-mood"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Money Pressure</Label>
                  <span className="text-sm font-mono text-yellow-500">{form.watch("moneyPressure")}</span>
                </div>
                <Slider 
                  min={1} max={10} step={1} 
                  value={[form.watch("moneyPressure") || 5]} 
                  onValueChange={([v]) => form.setValue("moneyPressure", v)}
                  data-testid="slider-money"
                />
              </div>
            </div>

            <div className="space-y-6 p-6 bg-secondary/20 rounded-xl border border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vaping</Label>
                  <p className="text-xs text-muted-foreground">Did you vape today?</p>
                </div>
                <Switch 
                  checked={form.watch("vaping") || false}
                  onCheckedChange={(c) => form.setValue("vaping", c)}
                  data-testid="switch-vaping"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exercise</Label>
                  <p className="text-xs text-muted-foreground">Did you workout?</p>
                </div>
                <Switch 
                  checked={form.watch("exercise") || false}
                  onCheckedChange={(c) => form.setValue("exercise", c)}
                  data-testid="switch-exercise"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Top Win</Label>
                 <Input {...form.register("topWin")} placeholder="What went well?" data-testid="input-top-win" />
               </div>
               <div className="space-y-2">
                 <Label>Top Friction</Label>
                 <Input {...form.register("topFriction")} placeholder="What was hard?" data-testid="input-top-friction" />
               </div>
            </div>

            <div className="space-y-2">
              <Label>Tomorrow's Priority</Label>
              <Input {...form.register("tomorrowPriority")} placeholder="One thing to crush tomorrow" data-testid="input-tomorrow" />
            </div>

            <div className="space-y-2">
              <Label>Family Connection</Label>
              <Textarea {...form.register("familyConnection")} placeholder="Moments with family..." className="h-20" data-testid="textarea-family" />
            </div>

            <div className="space-y-2">
              <Label>Faith Alignment</Label>
              <Textarea {...form.register("faithAlignment")} placeholder="Spiritual check-in..." className="h-20" data-testid="textarea-faith" />
            </div>

             <div className="space-y-2">
              <Label>Drift Check</Label>
              <Textarea 
                {...form.register("driftCheck")} 
                placeholder="Where are you drifting off course?" 
                className="h-20 border-destructive/20 focus-visible:ring-destructive/50" 
                data-testid="textarea-drift"
              />
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto" disabled={isPending} data-testid="button-save-log">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : "Save Log"}
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
      {logs?.map((log) => (
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
                   <span className="font-mono font-bold text-destructive">{log.stress}/10</span>
                </div>
              </div>
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
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
