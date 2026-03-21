import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ChevronRight, Fingerprint, KeyRound, Lock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import keyforgelogo from "@/assets/keyforge-logo.png";

const features = [
  { icon: Fingerprint, title: "No Passwords", desc: "Authenticate with biometrics and cryptographic keys" },
  { icon: KeyRound, title: "Hardware-Bound", desc: "Keys stored in your device's secure enclave (TEE)" },
  { icon: Lock, title: "Zero Knowledge", desc: "We never see your data — only you can decrypt it" },
  { icon: Eye, title: "Self-Sovereign", desc: "You own your identity. No central authority." },
];

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 relative">
          <img src={keyforgelogo} alt="KeyForge" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse-glow" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">
          Key<span className="text-gradient-primary">Forge</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xs mx-auto">
          Your self-sovereign vault. No passwords. No compromises.
        </p>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full max-w-sm space-y-3 mb-10"
      >
        {features.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
            className="flex items-center gap-4 p-3.5 rounded-xl bg-card/60 border border-border backdrop-blur-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <feat.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">{feat.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="w-full max-w-sm space-y-3"
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
        transition={{ delay: 1.1 }}
        className="mt-8 text-[10px] text-muted-foreground/50 tracking-wider uppercase"
      >
        End-to-end encrypted · Open source
      </motion.p>
    </div>
  );
}
