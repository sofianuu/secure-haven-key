import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { generatePassword, evaluateStrength } from "@/lib/password-store";
import { toast } from "sonner";

export default function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState(() => generatePassword(20));

  const regenerate = () => {
    setPassword(generatePassword(length, { uppercase, lowercase, numbers, symbols }));
  };

  const strength = evaluateStrength(password);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
      <h2 className="text-lg font-semibold text-foreground mb-1">Password Generator</h2>
      <p className="text-sm text-muted-foreground mb-6">Generate cryptographically secure passwords.</p>

      {/* Output */}
      <div className="p-4 rounded-xl bg-card border border-border glow-border mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex-1 text-base font-mono text-primary break-all leading-relaxed">{password}</span>
          <button onClick={() => { navigator.clipboard.writeText(password); toast.success('Copied!'); }} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <Copy className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={regenerate} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${strength === 'strong' ? 'bg-success' : strength === 'medium' ? 'bg-warning' : 'bg-destructive'}`}
              initial={{ width: 0 }}
              animate={{ width: strength === 'strong' ? '100%' : strength === 'medium' ? '66%' : '33%' }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-xs text-muted-foreground capitalize">{strength}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-foreground">Length</label>
            <span className="text-sm font-mono text-primary">{length}</span>
          </div>
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => { setLength(+e.target.value); }}
            onMouseUp={regenerate}
            onTouchEnd={regenerate}
            className="w-full accent-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Uppercase (A-Z)', checked: uppercase, onChange: setUppercase },
            { label: 'Lowercase (a-z)', checked: lowercase, onChange: setLowercase },
            { label: 'Numbers (0-9)', checked: numbers, onChange: setNumbers },
            { label: 'Symbols (!@#$)', checked: symbols, onChange: setSymbols },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2.5 p-3 rounded-lg bg-card border border-border hover:border-primary/20 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={opt.checked}
                onChange={(e) => { opt.onChange(e.target.checked); setTimeout(regenerate, 0); }}
                className="accent-primary w-3.5 h-3.5"
              />
              <span className="text-xs text-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
