import { Key, ShieldCheck, Lock, Fingerprint, Copy } from "lucide-react";
import { motion } from "framer-motion";
import type { CryptoKey } from "@/lib/password-store";
import { toast } from "sonner";

interface WalletViewProps {
  keys: CryptoKey[];
}

const typeConfig = {
  identity: { icon: Fingerprint, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  signing: { icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  encryption: { icon: Lock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

export default function WalletView({ keys }: WalletViewProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-lg font-semibold text-foreground mb-1">Key Wallet</h2>
      <p className="text-sm text-muted-foreground mb-6">Manage your cryptographic keys and digital identity.</p>

      {/* SSI Identity Card */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/20 glow-primary mb-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Fingerprint className="w-5 h-5 text-primary" />
            <span className="text-xs uppercase tracking-[0.15em] text-primary font-medium">Decentralized Identity</span>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Self-Sovereign Identity</h3>
          <p className="text-xs text-muted-foreground mb-4">No passwords needed — authenticate with your cryptographic identity across services.</p>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border">
            <span className="text-xs font-mono text-muted-foreground">DID: did:key:z6MkhaXgBZD...vwRz</span>
            <button onClick={() => { navigator.clipboard.writeText('did:key:z6MkhaXgBZDvwRz'); toast.success('DID copied'); }} className="p-1 rounded hover:bg-secondary transition-colors">
              <Copy className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Keys Grid */}
      <div className="space-y-3">
        {keys.map((key, i) => {
          const config = typeConfig[key.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={key.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-all"
            >
              <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">{key.name}</h4>
                <p className="text-xs font-mono text-muted-foreground truncate">{key.publicKey}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  key.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }`}>
                  {key.status}
                </span>
                <Key className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
