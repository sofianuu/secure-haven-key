import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import keyforgelogo from "@/assets/keyforge-logo.png";

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="w-20 h-20 relative">
          <img src={keyforgelogo} alt="KeyForge" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="text-center mb-16"
      >
        <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
          Key<span className="text-gradient-primary">Forge</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
          Your self-sovereign vault.
          <br />
          No passwords. No compromises.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="w-full max-w-xs space-y-3"
      >
        <button
          onClick={() => navigate("/onboarding")}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm glow-primary hover:brightness-110 transition-all"
        >
          Get Started
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate("/unlock")}
          className="w-full px-6 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
        >
          I already have an account
        </button>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 text-[10px] text-muted-foreground/40 tracking-wider uppercase"
      >
        End-to-end encrypted · Open source
      </motion.p>
    </div>
  );
}
