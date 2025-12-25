import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHarrisContentSchema } from "@shared/schema";
import { useCreateHarrisContent } from "@/hooks/use-bruce-ops";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trees, Sparkles, LayoutTemplate } from "lucide-react";

type HarrisFormValues = z.infer<typeof insertHarrisContentSchema>;

export default function HarrisWildlands() {
  const { mutate: generate, isPending } = useCreateHarrisContent();
  
  const form = useForm<HarrisFormValues>({
    resolver: zodResolver(insertHarrisContentSchema),
    defaultValues: {
      coreMessage: { definition: "", audience: "", pain: "", promise: "" },
      siteMap: { homeGoal: "", startHereGoal: "", resourcesGoal: "", cta: "" },
      leadMagnet: { title: "", problem: "", timeToValue: "", delivery: "" }
    }
  });

  const onSubmit = (data: HarrisFormValues) => {
    generate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-950/30 rounded-xl border border-green-900/50">
          <Trees className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold">Harris Wildlands</h2>
          <p className="text-muted-foreground">Brand voice and content generator.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Strategic Inputs</CardTitle>
            <CardDescription>Define the core message to guide the content.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Core Identity</h3>
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Input {...form.register("coreMessage.audience")} placeholder="Who is this for?" />
                </div>
                <div className="space-y-2">
                  <Label>Primary Pain</Label>
                  <Input {...form.register("coreMessage.pain")} placeholder="What keeps them up at night?" />
                </div>
                 <div className="space-y-2">
                  <Label>The Promise</Label>
                  <Textarea {...form.register("coreMessage.promise")} placeholder="What transformation do you offer?" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Site Goals</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label>Home Goal</Label>
                    <Input {...form.register("siteMap.homeGoal")} />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA</Label>
                    <Input {...form.register("siteMap.cta")} />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isPending}>
                {isPending ? (
                   <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Copy...</>
                ) : (
                   <><Sparkles className="mr-2 h-4 w-4" /> Generate Site Copy</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="h-full border-border/50 bg-secondary/5 border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-muted-foreground" />
                Generated Content
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
               <p>Fill out the strategy form to generate content.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
