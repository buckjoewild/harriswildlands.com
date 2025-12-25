import { useState } from "react";
import { useIdeas, useCreateIdea, useUpdateIdea, useRealityCheck } from "@/hooks/use-bruce-ops";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIdeaSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, ArrowRight, BrainCircuit, Rocket, Archive } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";

type IdeaFormValues = z.infer<typeof insertIdeaSchema>;

export default function ThinkOps() {
  const [activeTab, setActiveTab] = useState("capture");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">ThinkOps</h2>
          <p className="text-muted-foreground">From spark to shipment.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="capture">Inbox</TabsTrigger>
          <TabsTrigger value="reality">Reality Check</TabsTrigger>
          <TabsTrigger value="build">Build & Ship</TabsTrigger>
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
        <Input {...form.register("title")} placeholder="e.g. The Super App" />
      </div>

      <div className="space-y-2">
        <Label>The Pitch (One sentence)</Label>
        <Input {...form.register("pitch")} placeholder="It's like X but for Y..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Who is it for?</Label>
          <Input {...form.register("whoItHelps")} />
        </div>
        <div className="space-y-2">
          <Label>Pain it solves?</Label>
          <Input {...form.register("painItSolves")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Why I care?</Label>
        <Textarea {...form.register("whyICare")} placeholder="Personal motivation..." />
      </div>

      <div className="space-y-2">
        <Label>Tiny Test (≤ 7 days)</Label>
        <Input {...form.register("tinyTest")} placeholder="How can I validate this quickly?" />
      </div>

      <Button type="submit" className="w-full mt-4" disabled={isPending}>
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
    if (filter === "reality") return idea.status === "draft" || idea.status === "parked"; // Show drafts here too for processing
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredIdeas.map((idea) => (
        <Card key={idea.id} className="group border-border/50 hover:border-primary/50 transition-all duration-300">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="font-display">{idea.title}</CardTitle>
                <StatusBadge status={idea.status || 'draft'} />
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {format(new Date(idea.createdAt), "MMM d")}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">{idea.pitch}</p>
            
            {filter === "reality" && idea.realityCheck && (
              <div className="p-3 bg-secondary/30 rounded-lg text-xs space-y-2">
                <div className="font-semibold text-accent flex items-center gap-2">
                   <BrainCircuit className="w-3 h-3" /> AI Analysis
                </div>
                {/* Safe access to JSONB field */}
                <p className="line-clamp-3 italic opacity-80">
                  {(idea.realityCheck as any).decision || "Analysis pending..."}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/30 pt-4">
            {filter === "draft" && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                onClick={() => runCheck(idea.id)}
                disabled={isChecking}
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
                   className="flex-1 hover:text-destructive hover:bg-destructive/10"
                   onClick={() => updateIdea({ id: idea.id, status: "discarded" })}
                >
                  <Archive className="w-3 h-3 mr-2" /> Discard
                </Button>
                <Button 
                   variant="default" 
                   size="sm" 
                   className="flex-1"
                   onClick={() => updateIdea({ id: idea.id, status: "promoted" })}
                >
                  <Rocket className="w-3 h-3 mr-2" /> Promote
                </Button>
              </div>
            )}

             {filter === "promoted" && (
              <Button variant="outline" size="sm" className="w-full">
                View Specs & Build
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
