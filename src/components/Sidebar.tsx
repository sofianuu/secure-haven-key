import { Shield, Key, Wallet, Star, LayoutGrid, Plus, Lock } from "lucide-react";
import { motion } from "framer-motion";

type View = 'vault' | 'favorites' | 'wallet' | 'generator';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onAddNew: () => void;
  counts: { total: number; favorites: number; keys: number };
}

const navItems: { view: View; label: string; icon: typeof Shield }[] = [
  { view: 'vault', label: 'Vault', icon: LayoutGrid },
  { view: 'favorites', label: 'Favorites', icon: Star },
  { view: 'wallet', label: 'Wallet', icon: Wallet },
  { view: 'generator', label: 'Generator', icon: Key },
];

export default function Sidebar({ activeView, onViewChange, onAddNew, counts }: SidebarProps) {
  return (
    <aside className="w-64 h-screen flex flex-col border-r border-border bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 glow-border flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">KeyForge</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Vault</p>
        </div>
      </div>

      {/* Add button */}
      <div className="px-4 mb-2">
        <button
          onClick={onAddNew}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium glow-border"
        >
          <Plus className="w-4 h-4" />
          Add Credential
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          const count = item.view === 'vault' ? counts.total : item.view === 'favorites' ? counts.favorites : item.view === 'wallet' ? counts.keys : null;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {count !== null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${isActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status */}
      <div className="p-4 mx-3 mb-3 rounded-lg bg-secondary/50 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-3 h-3 text-success" />
          <span className="text-xs font-medium text-success">Encrypted</span>
        </div>
        <p className="text-[10px] text-muted-foreground">AES-256-GCM · Zero-knowledge</p>
      </div>
    </aside>
  );
}
