import { motion } from "framer-motion";
import { Users, Smartphone, ShieldCheck, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { MOCK_USERS, MOCK_LOGS, AUTH_TIMELINE } from "@/lib/admin-mock";

export default function AdminDashboard() {
  const totalUsers = MOCK_USERS.length;
  const activeUsers = MOCK_USERS.filter((u) => u.status === 'active').length;
  const totalDevices = MOCK_USERS.reduce((acc, u) => acc + u.devices.length, 0);
  const criticalEvents = MOCK_LOGS.filter((l) => l.severity === 'critical').length;

  const stats = [
    { label: 'Total Users',        value: totalUsers,    sub: `${activeUsers} active`,           icon: Users,        accent: 'text-primary',  bg: 'bg-primary/10' },
    { label: 'Bound Devices',      value: totalDevices,  sub: 'across all DIDs',                 icon: Smartphone,   accent: 'text-accent',   bg: 'bg-accent/10' },
    { label: 'Auths (24h)',        value: '1,284',       sub: '+12% vs yesterday',               icon: TrendingUp,   accent: 'text-success',  bg: 'bg-[hsl(var(--success))/0.1]' },
    { label: 'Critical Events',    value: criticalEvents,sub: 'last 7 days',                     icon: AlertTriangle,accent: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  const max = Math.max(...AUTH_TIMELINE.map((d) => d.success + d.failed));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Operations overview</h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Real-time signals from the SSI gateway.</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-4"
          >
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.accent}`} />
            </div>
            <p className="text-2xl font-semibold text-foreground font-mono leading-none">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">{s.label}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Auth timeline chart */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Authentication activity
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Last 14 days · success vs. failed</p>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-primary" /> success</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-destructive" /> failed</span>
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-40">
          {AUTH_TIMELINE.map((d, i) => {
            const total = d.success + d.failed;
            const h = (total / max) * 100;
            const failPct = (d.failed / total) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                  <div
                    className="w-full rounded-t-sm bg-primary/80 hover:bg-primary transition-colors relative"
                    style={{ height: `${h}%` }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 bg-destructive rounded-t-sm"
                      style={{ height: `${failPct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground/70">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent events */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success" />
            Recent security events
          </h3>
          <span className="text-[10px] text-muted-foreground">live feed</span>
        </div>
        <div className="space-y-2">
          {MOCK_LOGS.slice(0, 5).map((log) => {
            const sevColor =
              log.severity === 'critical' ? 'bg-destructive' :
              log.severity === 'warning' ? 'bg-[hsl(var(--warning))]' :
              'bg-primary';
            return (
              <div key={log.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full ${sevColor} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">
                    <span className="font-mono text-muted-foreground">{log.event}</span> · {log.details}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">{log.userAlias} · {log.device}</p>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                  {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
