import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Cpu, Smartphone, CheckCircle2, ChevronRight, ChevronLeft, Shield, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Step = 'server' | 'keygen' | 'bind' | 'done';

const steps: { id: Step; label: string; icon: typeof Server }[] = [
  { id: 'server', label: 'Server', icon: Server },
  { id: 'keygen', label: 'Key Gen', icon: Cpu },
  { id: 'bind', label: 'Bind', icon: Smartphone },
  { id: 'done', label: 'Done', icon: CheckCircle2 },
];

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('server');
  const [serverUrl, setServerUrl] = useState('https://vault.keyforge.io');
  const [isProcessing, setIsProcessing] = useState(false);
  const [keyGenerated, setKeyGenerated] = useState(false);
  const [deviceBound, setDeviceBound] = useState(false);
  const [publicKeyPreview, setPublicKeyPreview] = useState('');

  const stepIndex = steps.findIndex((s) => s.id === currentStep);

  const simulateKeyGen = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      const chars = '0123456789abcdef';
      let key = '0x';
      for (let i = 0; i < 64; i++) key += chars[Math.floor(Math.random() * chars.length)];
      setPublicKeyPreview(key.slice(0, 12) + '...' + key.slice(-8));
      setKeyGenerated(true);
      setIsProcessing(false);
    }, 2000);
  }, []);

  const simulateBind = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      setDeviceBound(true);
      setIsProcessing(false);
    }, 2500);
  }, []);

  const goNext = () => {
    if (currentStep === 'server') {
      if (!serverUrl.trim()) return;
      setCurrentStep('keygen');
    } else if (currentStep === 'keygen') {
      if (!keyGenerated) {
        simulateKeyGen();
        return;
      }
      setCurrentStep('bind');
    } else if (currentStep === 'bind') {
      if (!deviceBound) {
        simulateBind();
        return;
      }
      setCurrentStep('done');
    } else {
      navigate('/unlock');
    }
  };

  const goBack = () => {
    if (currentStep === 'keygen') setCurrentStep('server');
    else if (currentStep === 'bind') setCurrentStep('keygen');
  };

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col px-6 py-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Setup Device</h1>
          <p className="text-xs text-muted-foreground">Configure your secure vault</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1 mb-10 px-2">
        {steps.map((step, i) => {
          const isActive = i === stepIndex;
          const isComplete = i < stepIndex;
          return (
            <div key={step.id} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-1 rounded-full overflow-hidden bg-secondary">
                <motion.div
                  className={`h-full rounded-full ${isComplete || isActive ? 'bg-primary' : 'bg-transparent'}`}
                  initial={{ width: 0 }}
                  animate={{ width: isComplete ? '100%' : isActive ? '50%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <step.icon className={`w-3 h-3 ${isComplete ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground/40'}`} />
                <span className={`text-[10px] ${isActive ? 'text-foreground font-medium' : isComplete ? 'text-primary' : 'text-muted-foreground/40'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 'server' && (
            <StepCard key="server" title="Gateway Server" subtitle="Enter your vault server URL to connect.">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Server URL</label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-secondary border border-border text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="https://vault.example.com"
                  />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[11px] text-muted-foreground">Connection is encrypted with TLS 1.3</p>
                </div>
              </div>
            </StepCard>
          )}

          {currentStep === 'keygen' && (
            <StepCard key="keygen" title="Hardware Key Generation" subtitle="Generate a cryptographic key pair in your device's secure enclave.">
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border transition-all duration-500 ${
                  keyGenerated ? 'bg-primary/5 border-primary/20 glow-border' : 'bg-secondary/50 border-border'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${keyGenerated ? 'bg-primary/10' : 'bg-secondary'}`}>
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : keyGenerated ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Cpu className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {isProcessing ? 'Generating...' : keyGenerated ? 'Key Generated' : 'StrongBox / TEE'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isProcessing ? 'Accessing secure enclave' : keyGenerated ? 'Ed25519 key pair ready' : 'Hardware-backed key storage'}
                      </p>
                    </div>
                  </div>
                  {keyGenerated && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-2.5 rounded-lg bg-background/50 border border-border"
                    >
                      <p className="text-[10px] text-muted-foreground mb-0.5">Public Key</p>
                      <p className="text-xs font-mono text-primary">{publicKeyPreview}</p>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
                  <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground">Private key never leaves the secure hardware. Even KeyForge cannot access it.</p>
                </div>
              </div>
            </StepCard>
          )}

          {currentStep === 'bind' && (
            <StepCard key="bind" title="Bind Device" subtitle="Register your device's public key with the server.">
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border transition-all duration-500 ${
                  deviceBound ? 'bg-primary/5 border-primary/20 glow-border' : 'bg-secondary/50 border-border'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${deviceBound ? 'bg-primary/10' : 'bg-secondary'}`}>
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : deviceBound ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {isProcessing ? 'Binding device...' : deviceBound ? 'Device Bound' : 'Ready to bind'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isProcessing ? 'Sending public key to server' : deviceBound ? 'Your device is now registered' : 'Tap continue to register'}
                      </p>
                    </div>
                  </div>
                </div>

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    {['Connecting to server...', 'Verifying identity...', 'Registering device...'].map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.6 }}
                        className="flex items-center gap-2 text-[11px] text-muted-foreground"
                      >
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {step}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </StepCard>
          )}

          {currentStep === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 glow-primary"
              >
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </motion.div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Device Registered ✓</h2>
              <p className="text-sm text-muted-foreground max-w-xs mb-2">
                Your vault is ready. Your identity is self-sovereign.
              </p>
              <p className="text-xs text-muted-foreground/50 mb-8 font-mono">{publicKeyPreview}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom buttons */}
      <div className="flex gap-3 mt-6 pb-safe">
        {stepIndex > 0 && currentStep !== 'done' && (
          <button
            onClick={goBack}
            className="px-5 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={goNext}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm glow-primary hover:brightness-110 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : currentStep === 'done' ? (
            'Open Vault'
          ) : currentStep === 'keygen' && !keyGenerated ? (
            'Generate Key'
          ) : currentStep === 'bind' && !deviceBound ? (
            'Bind Device'
          ) : (
            'Continue'
          )}
          {!isProcessing && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg font-semibold text-foreground mb-1">{title}</h2>
      <p className="text-xs text-muted-foreground mb-6">{subtitle}</p>
      {children}
    </motion.div>
  );
}
