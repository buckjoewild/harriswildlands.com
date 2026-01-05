import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";

import BruceDashboard from "@/pages/BruceDashboard";
import LifeOps from "@/pages/LifeOps";
import Goals from "@/pages/Goals";
import ThinkOps from "@/pages/ThinkOps";
import Lab from "@/pages/Lab";
import HarrisWildlands from "@/pages/HarrisWildlands";
import SystemMap from "@/pages/SystemMap";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={BruceDashboard} />
        <Route path="/life" component={LifeOps} />
        <Route path="/goals" component={Goals} />
        <Route path="/think" component={ThinkOps} />
        <Route path="/lab" component={Lab} />
        <Route path="/harris" component={HarrisWildlands} />
        <Route path="/system-map" component={SystemMap} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
