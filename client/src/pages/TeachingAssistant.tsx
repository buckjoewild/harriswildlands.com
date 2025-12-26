/* ================================================================
   TEACHING ASSISTANT - Work Lane
   Curriculum, lesson plans, assessments
   ================================================================ */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeachingRequestSchema } from "@shared/schema";
import { useCreateTeachingRequest, useTeachingRequests } from "@/hooks/use-bruce-ops";
import { z } from "zod";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, GraduationCap, FileText, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CardWithBotanical } from "@/components/BotanicalMotifs";
import { PageHeaderWithImage } from "@/components/HoverRevealImage";
import teachingHeroImage from "@assets/generated_images/teachingassistant_knowledge_tree_constellation.png";

type TeachingFormValues = z.infer<typeof insertTeachingRequestSchema>;

export default function TeachingAssistant() {
  const { data: requests, isLoading } = useTeachingRequests();
  const { mutate: createRequest, isPending } = useCreateTeachingRequest();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const form = useForm<TeachingFormValues>({
    resolver: zodResolver(insertTeachingRequestSchema),
    defaultValues: {
      format: "Lesson Plan",
      assessmentType: "Quiz"
    }
  });

  const onSubmit = (data: TeachingFormValues) => {
    createRequest(data, {
      onSuccess: () => form.reset()
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-4 flex flex-col gap-4">
        <PageHeaderWithImage src={teachingHeroImage} alt="Teaching Assistant botanical illustration">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Teaching Assistant</h2>
              <p className="text-sm text-muted-foreground tracking-wide">WORK CHANNEL // Curriculum & lesson plans</p>
            </div>
          </div>
        </PageHeaderWithImage>
        
        <Card className="flex-1 overflow-hidden border-border/50">
          <CardHeader>
             <CardTitle className="text-lg">Recent Requests</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[500px]">
            <div className="p-4 space-y-3">
              {isLoading && <Loader2 className="animate-spin mx-auto" />}
              {requests?.map((req) => (
                <div 
                  key={req.id} 
                  onClick={() => setSelectedRequest(req)}
                  className="p-3 rounded-lg border border-border/30 hover:bg-secondary/30 cursor-pointer transition-colors group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium truncate pr-2">{req.topic}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(req.createdAt!), "MMM d")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">{req.grade}</span>
                    <span>{req.standard}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-8 space-y-6 overflow-y-auto pr-2">
        {selectedRequest ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all" onClick={() => setSelectedRequest(null)}>
               <ChevronRight className="rotate-180 w-4 h-4 mr-2" /> Back to Form
             </Button>
             
             <Card>
               <CardHeader className="border-b border-border/50 bg-secondary/10">
                 <div className="flex justify-between">
                    <div>
                      <CardTitle className="font-display text-2xl">{selectedRequest.topic}</CardTitle>
                      <CardDescription>
                        {selectedRequest.grade} • {selectedRequest.standard} • {selectedRequest.timeBlock}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                      <FileText className="w-4 h-4 mr-2" /> Export PDF
                    </Button>
                 </div>
               </CardHeader>
               <CardContent className="p-6 prose prose-invert max-w-none">
                 {/* Render JSONB output nicely */}
                 <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                   {selectedRequest.output 
                      ? JSON.stringify(selectedRequest.output, null, 2) 
                      : "Generating..."}
                 </pre>
               </CardContent>
             </Card>
          </div>
        ) : (
          <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card to-secondary/5">
            <CardHeader>
              <CardTitle>New Material Request</CardTitle>
              <CardDescription>Bruce will analyze standards and create aligned content.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Grade Level</Label>
                    <Input {...form.register("grade")} placeholder="e.g. 5th Grade" />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject / Standard</Label>
                    <Input {...form.register("standard")} placeholder="e.g. NGSS-5-PS1-1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input {...form.register("topic")} placeholder="e.g. Properties of Matter" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Time Block</Label>
                    <Input {...form.register("timeBlock")} placeholder="e.g. 45 mins" />
                  </div>
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select onValueChange={(v) => form.setValue("format", v)} defaultValue="Lesson Plan">
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lesson Plan">Lesson Plan</SelectItem>
                        <SelectItem value="Worksheet">Worksheet</SelectItem>
                        <SelectItem value="Quiz">Quiz</SelectItem>
                        <SelectItem value="Project">Project Guide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Student Profile / Accommodations</Label>
                  <Textarea {...form.register("studentProfile")} placeholder="Any specific needs?" />
                </div>

                <div className="space-y-2">
                   <Label>Materials Available</Label>
                   <Input {...form.register("materials")} placeholder="e.g. Paper, scissors, basic lab kit" />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                  {isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Materials...</>
                  ) : (
                    <><GraduationCap className="mr-2 h-5 w-5" /> Generate with Bruce</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
