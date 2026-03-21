import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Fingerprint, Lock, Unlock, Loader2, CheckCircle2, Radio, ScanFace } from "lucide-react";
import { useNavigate } from "react-router-dom";

type UnlockPhase = 'idle' | 'fetching' | 'awaiting_vp' | 'awaiting_biometric' | 'unlocking' | 'unlocked';

const phaseConfig: Record<UnlockPhase, { label: string; sublabel: string; icon: typeof Shield; color: string }> = {
  idle: { label: 'Vault Locked', sublabel: 'Authenticate to access your credentials', icon: Lock, color: 'text-muted-foreground' },
  fetching: { label: 'Fetching Challenge', sublabel: 'Requesting authentication challenge from server', icon: Radio, color: 'text-primary' },
  awaiting_vp: { label: 'Verifiable Presentation', sublabel: 'Generating cryptographic proof of identity', icon: Shield, color: 'text-primary' },
  awaiting_biometric: { label: 'Biometric Required', sublabel: 'Confirm your identity with biometrics', icon: ScanFace, color: 'text-accent' },
  unlocking: { label: 'Unlocking Vault', sublabel: 'Decrypting your secure vault...', icon: Unlock, color: 'text-primary' },
  unlocked: { label: 'Vault Unlocked', sublabel: 'Welcome back', icon: CheckCircle2, color: 'text-primary' },
};

const phaseOrder: UnlockPhase[] = ['fetching', 'awaiting_vp', 'awaiting_biometric', 'unlocking', 'unlocked'];

export default function VaultLockedScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<UnlockPhase>('idle');
  const [completedPhases, setCompletedPhases] = useState<UnlockPhase[]>([]);

  const startUnlock = useCallback(() => {
    if (phase !== 'idle') return;
    let i = 0;
    const timings = [1500, 2000, 1800, 1200, 500];
    
    const advance = () => {
      const p = phaseOrder[i];
      setPhase(p);
      if (i > 0) {
        setCompletedPhases((prev) => [...prev, phaseOrder[i - 1]]);
      }
      i++;
      if (i < phaseOrder.length) {
        setTimeout(advance, timings[i]);
      }
    };
    
    setTimeout(advance, 300);
  }, [phase]);

  useEffect(() => {
    if (phase === 'unlocked') {
      const t = setTimeout(() => navigate('/'), 1200);
      return () => clearTimeout(t);
    }
  }, [phase, navigate]);

  const config = phaseConfig[phase];
  const Icon = config.icon;
  const isActive = phase !== 'idle' && phase !== 'unlocked';

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Animated rings */}
      <div className="relative mb-10">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 w-36 h-36 -m-6 rounded-full border border-primary/10"
          animate={isActive ? { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 w-36 h-36 -m-6 rounded-full border border-primary/5"
          animate={isActive ? { scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />

        {/* Main icon */}
        <motion.div
          className={`w-24 h-24 rounded-2xl flex items-center justify-center ${
            phase === 'unlocked' ? 'bg-primary/15 glow-primary' :
            phase === 'awaiting_biometric' ? 'bg-accent/10 glow-accent' :
            isActive ? 'bg-primary/10' : 'bg-card border border-border'
          }`}
          animate={phase === 'awaiting_biometric' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
              transition={{ duration: 0.3 }}
            >
              {isActive && phase !== 'awaiting_biometric' ? (
                <Loader2 className={`w-10 h-10 ${config.color} animate-spin`} />
              ) : (
                <Icon className={`w-10 h-10 ${config.color}`} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center mb-10"
        >
          <h2 className="text-xl font-semibold text-foreground mb-1.5">{config.label}</h2>
          <p className="text-sm text-muted-foreground">{config.sublabel}</p>
        </motion.div>
      </AnimatePresence>

      {/* Phase progress */}
      {phase !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs space-y-2 mb-10"
        >
          {phaseOrder.slice(0, -1).map((p) => {
            const completed = completedPhases.includes(p) || phase === 'unlocked';
            const active = phase === p;
            const pConfig = phaseConfig[p];
            const PIcon = pConfig.icon;
            return (
              <motion.div
                key={p}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  active ? 'bg-card border border-primary/20' :
                  completed ? 'bg-card/30 border border-border/50' : 'opacity-30'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  completed ? 'bg-primary/10' : active ? 'bg-secondary' : 'bg-secondary/50'
                }`}>
                  {completed ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : active ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <PIcon className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className={`text-xs font-medium ${completed || active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {pConfig.label}
                  </p>
                </div>
                {completed && (
                  <span className="ml-auto text-[10px] text-primary font-mono">✓</span>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Unlock button */}
      {phase === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-xs"
        >
          <button
            onClick={startUnlock}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-medium text-sm glow-primary hover:brightness-110 transition-all active:scale-[0.98]"
          >
            <Fingerprint className="w-5 h-5" />
            Unlock Vault
          </button>
          <p className="text-center text-[10px] text-muted-foreground/50 mt-4">
            SSI authentication · Hardware-bound keys
          </p>
        </motion.div>
      )}
    </div>
  );
}
