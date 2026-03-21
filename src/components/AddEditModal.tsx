import { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PasswordEntry } from "@/lib/password-store";
import { CATEGORIES, generatePassword, evaluateStrength } from "@/lib/password-store";

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'strength'>) => void;
  editEntry?: PasswordEntry | null;
}

export default function AddEditModal({ isOpen, onClose, onSave, editEntry }: AddEditModalProps) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<PasswordEntry['category']>('personal');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editEntry) {
      setTitle(editEntry.title);
      setUsername(editEntry.username);
      setPassword(editEntry.password);
      setUrl(editEntry.url || '');
      setCategory(editEntry.category);
      setNotes(editEntry.notes || '');
    } else {
      setTitle(''); setUsername(''); setPassword(''); setUrl(''); setCategory('personal'); setNotes('');
    }
  }, [editEntry, isOpen]);

  const handleSave = () => {
    if (!title.trim() || !password.trim()) return;
    onSave({ title, username, password, url: url || undefined, category, notes, favorite: editEntry?.favorite || false });
    onClose();
  };

  const strength = evaluateStrength(password);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">{editEntry ? 'Edit' : 'Add'} Credential</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <Field label="Title" value={title} onChange={setTitle} placeholder="e.g. GitHub" />
              <Field label="Username / Email" value={username} onChange={setUsername} placeholder="user@example.com" />
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Enter or generate"
                  />
                  <button
                    onClick={() => setPassword(generatePassword())}
                    className="px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                {password && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        strength === 'strong' ? 'w-full bg-success' : strength === 'medium' ? 'w-2/3 bg-warning' : 'w-1/3 bg-destructive'
                      }`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground capitalize">{strength}</span>
                  </div>
                )}
              </div>

              <Field label="URL" value={url} onChange={setUrl} placeholder="https://example.com" />

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                        category === cat.value
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'bg-secondary text-muted-foreground border border-transparent hover:border-border'
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <div className="p-5 border-t border-border flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg bg-secondary text-muted-foreground text-sm hover:bg-secondary/80 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors glow-primary">
                {editEntry ? 'Update' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        placeholder={placeholder}
      />
    </div>
  );
}
