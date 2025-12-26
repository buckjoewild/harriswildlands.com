/* ================================================================
   THINKOPS - Ideas Lane
   Invention, learning, experiments, reality-checking, building
   Visual: Neural constellation with mind map tree
   ================================================================ */

import { useState } from "react";
import { useIdeas, useCreateIdea, useUpdateIdea, useRealityCheck } from "@/hooks/use-bruce-ops";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIdeaSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, BrainCircuit, Rocket, Archive, Lightbulb } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CardWithBotanical } from "@/components/BotanicalMotifs";
import CoreImagery from "@/lib/coreImagery";

type IdeaFormValues = z.infer<typeof insertIdeaSchema>;

export default function ThinkOps() {
  const [activeTab, setActiveTab] = useState("capture");

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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-violet-500/25" data-testid="button-new-idea">
                <Plus className="w-4 h-4" /> New Idea
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Capture Spark</DialogTitle>
              </DialogHeader>
              <CaptureIdeaForm onSuccess={() => setActiveTab("reality")} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="capture" data-testid="tab-inbox">Inbox</TabsTrigger>
          <TabsTrigger value="reality" data-testid="tab-reality">Reality Check</TabsTrigger>
          <TabsTrigger value="build" data-testid="tab-build">Build & Ship</TabsTrigger>
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
  
  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(insertIdeaSchema),
    defaultValues: {
      status: "draft"
    }
  });

  const onSubmit = (data: IdeaFormValues) => {
    createIdea(data, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Concept Name</Label>
        <Input {...form.register("title")} placeholder="e.g. The Super App" data-testid="input-idea-title" />
      </div>

      <div className="space-y-2">
        <Label>The Pitch (One sentence)</Label>
        <Input {...form.register("pitch")} placeholder="It's like X but for Y..." data-testid="input-idea-pitch" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Who is it for?</Label>
          <Input {...form.register("whoItHelps")} data-testid="input-who-helps" />
        </div>
        <div className="space-y-2">
          <Label>Pain it solves?</Label>
          <Input {...form.register("painItSolves")} data-testid="input-pain-solves" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Why I care?</Label>
        <Textarea {...form.register("whyICare")} placeholder="Personal motivation..." data-testid="textarea-why-care" />
      </div>

      <div className="space-y-2">
        <Label>Tiny Test (7 days or less)</Label>
        <Input {...form.register("tinyTest")} placeholder="How can I validate this quickly?" data-testid="input-tiny-test" />
      </div>

      <Button type="submit" className="w-full mt-4" disabled={isPending} data-testid="button-capture-idea">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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
        <p className="text-muted-foreground">No ideas in this stage.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredIdeas.map((idea) => (
        <CardWithBotanical key={idea.id}>
          <Card className="group border-border/30 bg-card/80 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300" data-testid={`card-idea-${idea.id}`}>
          <CardHeader>
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1 min-w-0">
                <CardTitle className="font-display truncate">{idea.title}</CardTitle>
                <StatusBadge status={idea.status || 'draft'} />
              </div>
              <span className="text-xs text-muted-foreground font-mono shrink-0">
                {idea.createdAt ? format(new Date(idea.createdAt), "MMM d") : ""}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">{idea.pitch}</p>
            
            {filter === "reality" && idea.realityCheck && (
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs space-y-2">
                <div className="font-semibold text-violet-400 flex items-center gap-2">
                   <BrainCircuit className="w-3 h-3" /> AI Analysis
                </div>
                <p className="line-clamp-3 italic opacity-80">
                  {String((idea.realityCheck as Record<string, unknown>)?.decision || "Analysis pending...")}
                </p>
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
      ))}
    </div>
  );
}
