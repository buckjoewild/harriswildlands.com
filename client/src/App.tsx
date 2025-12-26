import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";

import Dashboard from "@/pages/Dashboard";
import LifeOps from "@/pages/LifeOps";
import ThinkOps from "@/pages/ThinkOps";
import TeachingAssistant from "@/pages/TeachingAssistant";
import HarrisWildlands from "@/pages/HarrisWildlands";
import BruceOps from "@/pages/BruceOps";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/life-ops" component={LifeOps} />
        <Route path="/think-ops" component={ThinkOps} />
        <Route path="/teaching" component={TeachingAssistant} />
        <Route path="/harris" component={HarrisWildlands} />
        <Route path="/bruce-ops" component={BruceOps} />
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
