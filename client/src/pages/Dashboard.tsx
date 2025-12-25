import { useDashboardStats } from "@/hooks/use-bruce-ops";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, AlertTriangle, Lightbulb, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">Welcome Back</h2>
        <p className="text-muted-foreground mt-2">Here's your system status for today.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item}>
          <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Log Status</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">
                {stats?.logsToday ? "Completed" : "Pending"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.logsToday ? "Great consistency." : "Record your metrics today."}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ThinkOps Loops</CardTitle>
              <Lightbulb className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{stats?.openLoops || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active ideas requiring reality checks.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drift Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">
                {stats?.driftFlags.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Potential misalignments detected.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {stats?.driftFlags && stats.driftFlags.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-lg">Attention Required</h3>
          </div>
          <ul className="space-y-2">
            {stats.driftFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
