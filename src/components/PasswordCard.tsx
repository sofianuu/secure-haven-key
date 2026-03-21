import { useState } from "react";
import { Eye, EyeOff, Copy, Star, ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { PasswordEntry } from "@/lib/password-store";
import { toast } from "sonner";

interface PasswordCardProps {
  entry: PasswordEntry;
  index: number;
  onEdit: (entry: PasswordEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  social: 'bg-blue-500/10 text-blue-400',
  finance: 'bg-emerald-500/10 text-emerald-400',
  work: 'bg-amber-500/10 text-amber-400',
  personal: 'bg-purple-500/10 text-purple-400',
  crypto: 'bg-orange-500/10 text-orange-400',
};

export default function PasswordCard({ entry, index, onEdit, onDelete, onToggleFavorite }: PasswordCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const maskedPassword = '•'.repeat(Math.min(entry.password.length, 16));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative p-4 rounded-xl bg-card border border-border hover:border-primary/20 hover:glow-border transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
            {entry.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">{entry.title}</h3>
            <p className="text-xs text-muted-foreground">{entry.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(entry.id)}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <Star className={`w-3.5 h-3.5 ${entry.favorite ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-8 z-10 w-36 rounded-lg bg-popover border border-border shadow-xl py-1"
              >
                <button onClick={() => { onEdit(entry); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => { onDelete(entry.id); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-secondary transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Password field */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border mb-3">
        <span className="flex-1 text-xs font-mono text-muted-foreground truncate">
          {revealed ? entry.password : maskedPassword}
        </span>
        <button onClick={() => setRevealed(!revealed)} className="p-1 rounded hover:bg-secondary transition-colors">
          {revealed ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        <button onClick={() => copyToClipboard(entry.password, 'Password')} className="p-1 rounded hover:bg-secondary transition-colors">
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ${categoryColors[entry.category] || 'bg-secondary text-muted-foreground'}`}>
          {entry.category}
        </span>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${
            entry.strength === 'strong' ? 'bg-success' : entry.strength === 'medium' ? 'bg-warning' : 'bg-destructive'
          }`} />
          <span className="text-[10px] text-muted-foreground capitalize">{entry.strength}</span>
          {entry.url && (
            <a href={entry.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-secondary transition-colors">
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
