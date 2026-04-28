import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Smartphone, Laptop, Apple, ChevronDown, ShieldOff, KeyRound, Cpu } from "lucide-react";
import { MOCK_USERS, formatRelative, type AdminUser, type DeviceType } from "@/lib/admin-mock";

const statusStyle: Record<AdminUser['status'], string> = {
  active:    'bg-[hsl(var(--success))/0.12] text-[hsl(var(--success))]',
  suspended: 'bg-destructive/15 text-destructive',
  pending:   'bg-[hsl(var(--warning))/0.15] text-[hsl(var(--warning))]',
};

const deviceIcon: Record<DeviceType, typeof Smartphone> = {
  iOS: Apple,
  Android: Smartphone,
  Desktop: Laptop,
};

export default function AdminUsers() {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MOCK_USERS.filter((u) => {
    const q = query.toLowerCase();
    return !q || u.alias.toLowerCase().includes(q) || u.did.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Users & Devices</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{filtered.length} SSI identities · manage bindings and revocations.</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border focus-within:border-accent/40 transition-colors w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search alias, DID, email..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header — desktop only */}
        <div className="hidden md:grid grid-cols-[1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_40px] gap-3 px-5 py-3 border-b border-border bg-secondary/30 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          <span>Identity</span>
          <span>DID</span>
          <span>Status</span>
          <span>Last auth</span>
          <span>Devices</span>
          <span></span>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((user) => {
            const isOpen = expanded === user.id;
            return (
              <div key={user.id}>
                <button
                  onClick={() => setExpanded(isOpen ? null : user.id)}
                  className="w-full grid grid-cols-2 md:grid-cols-[1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_40px] gap-3 px-5 py-4 items-center hover:bg-secondary/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-foreground">{user.alias.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.alias}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  <p className="hidden md:block text-xs font-mono text-muted-foreground truncate">{user.did}</p>

                  <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide ${statusStyle[user.status]}`}>
                    {user.status}
                  </span>

                  <p className="hidden md:block text-xs text-muted-foreground">{formatRelative(user.lastAuth)}</p>

                  <div className="hidden md:flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono">{user.devices.length}</span>
                  </div>

                  <ChevronDown className={`hidden md:block w-4 h-4 text-muted-foreground transition-transform justify-self-end ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-secondary/20"
                    >
                      <div className="px-5 py-4 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <Cpu className="w-3 h-3" />
                          Bound devices
                        </div>
                        {user.devices.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic px-2">No devices registered yet.</p>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-2">
                            {user.devices.map((d) => {
                              const Icon = deviceIcon[d.type];
                              return (
                                <div
                                  key={d.id}
                                  className={`rounded-lg border p-3 flex items-start gap-3 ${d.revoked ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'}`}
                                >
                                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${d.revoked ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-medium text-foreground truncate">{d.label}</p>
                                      {d.revoked && (
                                        <span className="text-[9px] uppercase tracking-wider text-destructive font-medium">revoked</span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-mono">{d.trust} · {formatRelative(d.lastSeen)}</p>
                                  </div>
                                  {!d.revoked && (
                                    <button className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0" title="Revoke">
                                      <ShieldOff className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors">
                            <KeyRound className="w-3.5 h-3.5" />
                            Rotate keys
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs hover:bg-destructive/20 transition-colors">
                            <ShieldOff className="w-3.5 h-3.5" />
                            Suspend identity
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
