import { useState } from "react";
import { Shield, Key, Wallet, Star, LayoutGrid, Plus, Lock, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (view: View) => {
    onViewChange(view);
    setMobileOpen(false);
  };

  const handleAdd = () => {
    onAddNew();
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 glow-border flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">KeyForge</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Vault</p>
          </div>
        </div>
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Add button */}
      <div className="px-4 mb-2">
        <button
          onClick={handleAdd}
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
              onClick={() => handleNav(item.view)}
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
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2.5">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">KeyForge</span>
        </div>
        <button onClick={onAddNew} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col bg-card border-r border-border"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 h-screen flex-col border-r border-border bg-card/50 backdrop-blur-sm">
        {sidebarContent}
      </aside>
    </>
  );
}
