import { Shield, LayoutDashboard, Users, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

export type AdminView = 'dashboard' | 'users' | 'logs';

interface Props {
  active: AdminView;
  onChange: (v: AdminView) => void;
}

const items: { view: AdminView; label: string; icon: typeof Shield; desc: string }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & stats' },
  { view: 'users',     label: 'Users & Devices', icon: Users,     desc: 'SSI identities' },
  { view: 'logs',      label: 'Audit Logs',      icon: FileText,  desc: 'Security events' },
];

export default function AdminSidebar({ active, onChange }: Props) {
  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">KeyForge</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-accent">Admin Console</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-1 px-2 pb-2 overflow-x-auto">
          {items.map((it) => {
            const isActive = active === it.view;
            return (
              <button
                key={it.view}
                onClick={() => onChange(it.view)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  isActive ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:bg-secondary/60'
                }`}
              >
                <it.icon className="w-3.5 h-3.5" />
                {it.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 h-screen flex-col border-r border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">KeyForge</h1>
            <p className="text-[10px] uppercase tracking-[0.22em] text-accent">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {items.map((it) => {
            const isActive = active === it.view;
            return (
              <button
                key={it.view}
                onClick={() => onChange(it.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative ${
                  isActive ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <it.icon className="w-4 h-4" />
                <div className="flex-1 text-left">
                  <p className="leading-tight">{it.label}</p>
                  <p className="text-[10px] text-muted-foreground/70 leading-tight">{it.desc}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-4 space-y-3">
          <Link
            to="/vault"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to user vault
          </Link>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Signed in as</p>
              <p className="text-xs font-mono text-foreground">admin@keyforge</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
