import { motion } from "framer-motion";
import { Shield, Server, Fingerprint, Lock, LogOut, ChevronRight, Smartphone, Bell, Eye, Trash2, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

interface SettingItem {
  icon: typeof Shield;
  label: string;
  desc: string;
  action?: string;
  danger?: boolean;
}

const sections: { title: string; items: SettingItem[] }[] = [
  {
    title: 'Appearance',
    items: [
      { icon: Sun, label: 'Theme', desc: 'Switch between light and dark mode', action: 'theme' },
    ],
  },
  {
    title: 'Security',
    items: [
      { icon: Fingerprint, label: 'Biometric Auth', desc: 'Fingerprint / Face ID enabled', action: 'toggle' },
      { icon: Lock, label: 'Auto-Lock', desc: 'After 5 minutes of inactivity', action: 'chevron' },
      { icon: Eye, label: 'Clipboard Clear', desc: 'Auto-clear after 30 seconds', action: 'toggle' },
    ],
  },
  {
    title: 'Connection',
    items: [
      { icon: Server, label: 'Gateway Server', desc: 'vault.keyforge.io', action: 'chevron' },
      { icon: Smartphone, label: 'Device Binding', desc: 'This device is registered', action: 'chevron' },
      { icon: Bell, label: 'Notifications', desc: 'Security alerts enabled', action: 'toggle' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: LogOut, label: 'Lock Vault', desc: 'Lock and return to login', action: 'chevron' },
      { icon: Trash2, label: 'Delete All Data', desc: 'Permanently remove vault data', danger: true, action: 'chevron' },
    ],
  },
];

export default function SettingsView() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark';

  const handleAction = (label: string) => {
    if (label === 'Lock Vault') {
      navigate('/unlock');
    }
    if (label === 'Theme') {
      setTheme(isDark ? 'light' : 'dark');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-lg font-semibold text-foreground mb-1">Settings</h2>
      <p className="text-sm text-muted-foreground mb-6">Manage your vault preferences and security.</p>

      <div className="space-y-6">
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
          >
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">{section.title}</h3>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleAction(item.label)}
                  className={`w-full flex items-center gap-3.5 p-4 bg-card hover:bg-secondary/50 transition-colors text-left ${
                    item.danger ? 'hover:bg-destructive/5' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    item.danger ? 'bg-destructive/10' : 'bg-primary/10'
                  }`}>
                    <item.icon className={`w-4.5 h-4.5 ${item.danger ? 'text-destructive' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.danger ? 'text-destructive' : 'text-foreground'}`}>{item.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  {item.action === 'chevron' && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  {item.action === 'toggle' && (
                    <div className="w-10 h-6 rounded-full bg-primary/20 relative shrink-0">
                      <div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-primary shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Version */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-muted-foreground/40 font-mono">KeyForge v1.0.0 · AES-256-GCM</p>
      </div>
    </motion.div>
  );
}
