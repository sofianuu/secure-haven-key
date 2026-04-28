import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Download, Filter } from "lucide-react";
import { MOCK_LOGS, type AuditSeverity } from "@/lib/admin-mock";

const sevStyle: Record<AuditSeverity, { dot: string; chip: string; label: string }> = {
  info:     { dot: 'bg-primary',                  chip: 'bg-primary/10 text-primary',                       label: 'Info' },
  warning:  { dot: 'bg-[hsl(var(--warning))]',    chip: 'bg-[hsl(var(--warning))/0.12] text-[hsl(var(--warning))]', label: 'Warning' },
  critical: { dot: 'bg-destructive',              chip: 'bg-destructive/15 text-destructive',               label: 'Critical' },
};

export default function AdminLogs() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState<AuditSeverity | 'all'>('all');

  const filtered = useMemo(() => {
    return MOCK_LOGS.filter((l) => {
      if (severity !== 'all' && l.severity !== severity) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return l.userAlias.toLowerCase().includes(q) ||
             l.event.toLowerCase().includes(q) ||
             l.details.toLowerCase().includes(q) ||
             l.ip.includes(q);
    });
  }, [query, severity]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Audit logs</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Tamper-evident event stream · {filtered.length} entries.</p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card text-xs font-medium hover:bg-secondary/60 transition-colors w-fit">
          <Download className="w-3.5 h-3.5" />
          Export JSONL
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border focus-within:border-accent/40 transition-colors">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search event, user, IP, details..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {(['all', 'info', 'warning', 'critical'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              className={`px-3 py-2 rounded-lg text-xs capitalize transition-colors whitespace-nowrap ${
                severity === s
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-card border border-border text-muted-foreground hover:border-accent/20'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Logs list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[140px_120px_140px_1fr_140px_110px] gap-3 px-5 py-3 border-b border-border bg-secondary/30 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          <span>Timestamp</span>
          <span>Severity</span>
          <span>Event</span>
          <span>Details</span>
          <span>User</span>
          <span>IP</span>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((log) => {
            const s = sevStyle[log.severity];
            return (
              <div key={log.id} className="px-5 py-3 hover:bg-secondary/30 transition-colors">
                {/* Mobile */}
                <div className="md:hidden space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${s.chip}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {log.timestamp.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-foreground">{log.event}</p>
                  <p className="text-[11px] text-muted-foreground">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 pt-1">
                    <span>{log.userAlias} · {log.device}</span>
                    <span className="font-mono">{log.ip}</span>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden md:grid grid-cols-[140px_120px_140px_1fr_140px_110px] gap-3 items-center text-xs">
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {log.timestamp.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`inline-flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${s.chip}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <span className="font-mono text-foreground/90 truncate">{log.event}</span>
                  <span className="text-muted-foreground truncate">{log.details}</span>
                  <span className="text-foreground/80 truncate">{log.userAlias}</span>
                  <span className="font-mono text-muted-foreground text-[11px] truncate">{log.ip}</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">No matching events.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
