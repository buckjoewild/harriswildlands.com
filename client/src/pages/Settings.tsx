import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Settings() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold">Settings</h2>
        <p className="text-muted-foreground">Configure Bruce's behavior.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Model Configuration</CardTitle>
          <CardDescription>Adjust how Bruce responds to your requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preferred Model</Label>
            <Select defaultValue="gpt-4o">
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (Balanced)</SelectItem>
                <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet (Creative)</SelectItem>
                <SelectItem value="o1-preview">o1 Preview (Reasoning)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bruce's Tone</Label>
            <Select defaultValue="direct">
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct & Professional</SelectItem>
                <SelectItem value="socratic">Socratic & Questioning</SelectItem>
                <SelectItem value="empathetic">Empathetic & Supportive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button>Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
