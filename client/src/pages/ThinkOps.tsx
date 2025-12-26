/* ================================================================
   THINKOPS - Ideas Lane
   Invention, learning, experiments, reality-checking, building
   Visual: Neural constellation with mind map tree
   ================================================================ */

import { useState } from "react";
import { useIdeas, useCreateIdea, useUpdateIdea, useRealityCheck } from "@/hooks/use-bruce-ops";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIdeaSchema, IDEA_CATEGORIES, TIME_ESTIMATES, type Idea } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, BrainCircuit, Rocket, Archive, Lightbulb, Zap, Star, Clock, Users, Target, Heart, FlaskConical, BookOpen, Home, Cross } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CardWithBotanical } from "@/components/BotanicalMotifs";
import CoreImagery from "@/lib/coreImagery";

type IdeaFormValues = z.infer<typeof insertIdeaSchema>;

const CATEGORY_ICONS: Record<string, any> = {
  tech: FlaskConical,
  business: Target,
  creative: Lightbulb,
  family: Home,
  faith: Cross,
  learning: BookOpen,
};

const CATEGORY_COLORS: Record<string, string> = {
  tech: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  business: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  creative: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  family: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  faith: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  learning: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

const PITCH_EXAMPLES = [
  "It's like Notion but for dads tracking family goals",
  "A weekly email that curates the best faith podcasts",
  "A simple app that gamifies habit tracking for kids",
  "A course teaching teachers to use AI effectively",
];

const TINY_TEST_EXAMPLES = [
  "Post about it on Twitter and gauge interest",
  "Build a landing page and collect 10 email signups",
  "Create a prototype and show 3 potential users",
  "Write a blog post explaining the concept",
  "Record a 2-minute explainer video",
];

export default function ThinkOps() {
  const [activeTab, setActiveTab] = useState("capture");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Hero Header with ThinkOps Core Imagery */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${CoreImagery.thinkops})`,
            backgroundPosition: "center 15%"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="relative z-10 p-6 md:p-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center backdrop-blur-sm">
              <Lightbulb className="w-7 h-7 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold">ThinkOps</h2>
              <p className="text-sm text-muted-foreground tracking-widest uppercase">
                Ideas Channel // From Spark to Shipment
              </p>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-violet-500/25" data-testid="button-new-idea">
                <Plus className="w-4 h-4" /> New Idea
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-400" />
                  Capture New Idea
                </DialogTitle>
              </DialogHeader>
              <CaptureIdeaForm onSuccess={() => {
                setDialogOpen(false);
                setActiveTab("reality");
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="capture" data-testid="tab-inbox">
            <Lightbulb className="w-4 h-4 mr-2" /> Inbox
          </TabsTrigger>
          <TabsTrigger value="reality" data-testid="tab-reality">
            <BrainCircuit className="w-4 h-4 mr-2" /> Reality Check
          </TabsTrigger>
          <TabsTrigger value="build" data-testid="tab-build">
            <Rocket className="w-4 h-4 mr-2" /> Build & Ship
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="capture" className="mt-6">
          <IdeaList filter="draft" />
        </TabsContent>
        
        <TabsContent value="reality" className="mt-6">
          <IdeaList filter="reality" />
        </TabsContent>
        
        <TabsContent value="build" className="mt-6">
          <IdeaList filter="promoted" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CaptureIdeaForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutate: createIdea, isPending } = useCreateIdea();
  const [captureMode, setCaptureMode] = useState<"quick" | "deep">("quick");
  
  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(insertIdeaSchema),
    defaultValues: {
      status: "draft",
      captureMode: "quick",
      category: "tech",
      excitement: 5,
      feasibility: 5,
    }
  });

  const onSubmit = (data: IdeaFormValues) => {
    createIdea({ ...data, captureMode }, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
      {/* Capture Mode Toggle */}
      <div className="flex gap-2 p-1 bg-secondary/30 rounded-lg">
        <Button
          type="button"
          variant={captureMode === "quick" ? "default" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setCaptureMode("quick")}
          data-testid="button-quick-mode"
        >
          <Zap className="w-4 h-4 mr-2" /> Quick Capture
        </Button>
        <Button
          type="button"
          variant={captureMode === "deep" ? "default" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setCaptureMode("deep")}
          data-testid="button-deep-mode"
        >
          <BrainCircuit className="w-4 h-4 mr-2" /> Deep Dive
        </Button>
      </div>

      {/* Category Selection */}
      <div className="space-y-3">
        <Label>Category</Label>
        <RadioGroup
          value={form.watch("category") || "tech"}
          onValueChange={(v) => form.setValue("category", v)}
          className="flex flex-wrap gap-2"
        >
          {IDEA_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Lightbulb;
            return (
              <div key={cat}>
                <RadioGroupItem value={cat} id={`cat-${cat}`} className="peer sr-only" />
                <Label
                  htmlFor={`cat-${cat}`}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm peer-data-[state=checked]:border-violet-500 peer-data-[state=checked]:bg-violet-500/10 hover-elevate ${CATEGORY_COLORS[cat] || ''}`}
                  data-testid={`radio-cat-${cat}`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Basic Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Idea Title</Label>
          <Input 
            {...form.register("title")} 
            placeholder="Give your idea a memorable name" 
            data-testid="input-idea-title" 
          />
        </div>

        <div className="space-y-2">
          <Label>The Pitch (One sentence)</Label>
          <Input 
            {...form.register("pitch")} 
            placeholder={PITCH_EXAMPLES[Math.floor(Math.random() * PITCH_EXAMPLES.length)]}
            data-testid="input-idea-pitch" 
          />
          <p className="text-xs text-muted-foreground">Tip: "It's like X but for Y..." format works great</p>
        </div>
      </div>

      {/* Deep Capture Fields */}
      {captureMode === "deep" && (
        <div className="space-y-4 p-4 bg-secondary/10 rounded-lg border border-border/30">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" /> Deep Dive Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" /> Who is it for?
              </Label>
              <Input 
                {...form.register("whoItHelps")} 
                placeholder="e.g., Busy dads, New teachers, Solo founders"
                data-testid="input-who-helps" 
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" /> Pain it solves?
              </Label>
              <Input 
                {...form.register("painItSolves")} 
                placeholder="e.g., Overwhelm, Time waste, Confusion"
                data-testid="input-pain-solves" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-muted-foreground" /> Why do I care?
            </Label>
            <Textarea 
              {...form.register("whyICare")} 
              placeholder="What makes this personal? Why does it excite you?"
              data-testid="textarea-why-care" 
            />
          </div>

          <div className="space-y-2">
            <Label>Resources Needed</Label>
            <Input 
              {...form.register("resourcesNeeded")} 
              placeholder="e.g., $500, 10 hours, a developer friend"
              data-testid="input-resources"
            />
          </div>

          <div className="space-y-3">
            <Label>Time Estimate</Label>
            <RadioGroup
              value={form.watch("timeEstimate") || "days"}
              onValueChange={(v) => form.setValue("timeEstimate", v)}
              className="flex flex-wrap gap-2"
            >
              {TIME_ESTIMATES.map((time) => (
                <div key={time}>
                  <RadioGroupItem value={time} id={`time-${time}`} className="peer sr-only" />
                  <Label
                    htmlFor={`time-${time}`}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border/50 bg-secondary/20 px-3 py-1.5 text-sm peer-data-[state=checked]:border-violet-500 peer-data-[state=checked]:bg-violet-500/10 hover-elevate"
                    data-testid={`radio-time-${time}`}
                  >
                    <Clock className="w-3 h-3" />
                    {time.charAt(0).toUpperCase() + time.slice(1)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Excitement & Feasibility Sliders */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Excitement</Label>
                <span className="text-sm font-mono text-violet-400">{form.watch("excitement") || 5}/10</span>
              </div>
              <Slider 
                min={1} max={10} step={1} 
                value={[form.watch("excitement") || 5]} 
                onValueChange={([v]) => form.setValue("excitement", v)}
                data-testid="slider-excitement"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Meh</span>
                <span>On Fire</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Feasibility</Label>
                <span className="text-sm font-mono text-emerald-400">{form.watch("feasibility") || 5}/10</span>
              </div>
              <Slider 
                min={1} max={10} step={1} 
                value={[form.watch("feasibility") || 5]} 
                onValueChange={([v]) => form.setValue("feasibility", v)}
                data-testid="slider-feasibility"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Moonshot</span>
                <span>Easy Win</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tiny Test */}
      <div className="space-y-2">
        <Label>Tiny Test (7 days or less)</Label>
        <Input 
          {...form.register("tinyTest")} 
          placeholder={TINY_TEST_EXAMPLES[Math.floor(Math.random() * TINY_TEST_EXAMPLES.length)]}
          data-testid="input-tiny-test" 
        />
        <p className="text-xs text-muted-foreground">How can you validate this idea quickly without building the whole thing?</p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending} data-testid="button-capture-idea">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
        Capture Idea
      </Button>
    </form>
  );
}

function IdeaList({ filter }: { filter: "draft" | "reality" | "promoted" }) {
  const { data: ideas, isLoading } = useIdeas();
  const { mutate: runCheck, isPending: isChecking } = useRealityCheck();
  const { mutate: updateIdea } = useUpdateIdea();

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;

  const filteredIdeas = ideas?.filter(idea => {
    if (filter === "draft") return idea.status === "draft";
    if (filter === "reality") return idea.status === "draft" || idea.status === "parked";
    if (filter === "promoted") return idea.status === "promoted" || idea.status === "shipped";
    return false;
  });

  if (!filteredIdeas?.length) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-xl">
        <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground mb-2">No ideas in this stage.</p>
        <p className="text-xs text-muted-foreground/60">Click "New Idea" to capture a spark!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredIdeas.map((idea) => {
        const CategoryIcon = CATEGORY_ICONS[idea.category || 'tech'] || Lightbulb;
        const categoryColor = CATEGORY_COLORS[idea.category || 'tech'] || '';
        
        return (
          <CardWithBotanical key={idea.id}>
            <Card className="group border-border/30 bg-card/80 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300" data-testid={`card-idea-${idea.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${categoryColor}`}>
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                      <CardTitle className="font-display truncate">{idea.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={idea.status || 'draft'} />
                      {idea.category && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {idea.category}
                        </Badge>
                      )}
                      {idea.captureMode === "deep" && (
                        <Badge variant="outline" className="text-xs text-violet-400 border-violet-500/30">
                          Deep Dive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {idea.createdAt ? format(new Date(idea.createdAt), "MMM d") : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{idea.pitch}</p>
                
                
                {filter === "reality" && idea.realityCheck != null && (
                  <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs space-y-2">
                    <div className="font-semibold text-violet-400 flex items-center gap-2">
                       <BrainCircuit className="w-3 h-3" /> AI Analysis
                    </div>
                    <p className="line-clamp-3 italic opacity-80">
                      {String((idea.realityCheck as { decision?: string })?.decision ?? "Analysis pending...")}
                    </p>
                  </div>
                )}

                {idea.tinyTest && (
                  <div className="p-2 bg-secondary/30 rounded text-xs">
                    <span className="font-semibold">Tiny Test: </span>
                    <span className="text-muted-foreground">{idea.tinyTest}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between gap-2 border-t border-border/30 pt-4">
                {filter === "draft" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-500 transition-colors"
                    onClick={() => runCheck(idea.id)}
                    disabled={isChecking}
                    data-testid={`button-reality-check-${idea.id}`}
                  >
                    {isChecking ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : <BrainCircuit className="w-3 h-3 mr-2"/>}
                    Run Reality Check
                  </Button>
                )}

                {filter === "reality" && (
                  <div className="flex gap-2 w-full">
                    <Button 
                       variant="secondary" 
                       size="sm" 
                       className="flex-1"
                       onClick={() => updateIdea({ id: idea.id, status: "discarded" })}
                       data-testid={`button-discard-${idea.id}`}
                    >
                      <Archive className="w-3 h-3 mr-2" /> Discard
                    </Button>
                    <Button 
                       variant="default" 
                       size="sm" 
                       className="flex-1"
                       onClick={() => updateIdea({ id: idea.id, status: "promoted" })}
                       data-testid={`button-promote-${idea.id}`}
                    >
                      <Rocket className="w-3 h-3 mr-2" /> Promote
                    </Button>
                  </div>
                )}

                 {filter === "promoted" && (
                  <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-specs-${idea.id}`}>
                    View Specs & Build
                  </Button>
                )}
              </CardFooter>
            </Card>
          </CardWithBotanical>
        );
      })}
    </div>
  );
}
