import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield, Radio, Battery, MapPin, AlertTriangle, Check, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n, LanguageToggle } from "@/lib/i18n";

export const Route = createFileRoute("/member")({
  head: () => ({
    meta: [
      { title: "Safe Mode — WhereNow" },
      { name: "description", content: "One-tap location sharing. Press once. Stay safe." },
    ],
  }),
  component: MemberApp,
});

type Stage = "join" | "setup" | "ready" | "active";

function MemberApp() {
  const [stage, setStage] = useState<Stage>("join");
  const [code, setCode] = useState("");

  return (
    <div className="relative">
      <div className="absolute top-6 right-5 z-50">
        <LanguageToggle />
      </div>
      {stage === "join" && <JoinScreen code={code} setCode={setCode} onJoin={() => setStage("setup")} />}
      {stage === "setup" && <SetupScreen onDone={() => setStage("ready")} />}
      {stage === "ready" && <ReadyScreen onStart={() => setStage("active")} />}
      {stage === "active" && <ActiveScreen onStop={() => setStage("ready")} />}
    </div>
  );
}

function JoinScreen({ code, setCode, onJoin }: { code: string; setCode: (s: string) => void; onJoin: () => void }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col px-6 pt-6">
      <Link to="/" className="size-9 rounded-full glass grid place-items-center self-start">
        <ArrowLeft className="size-4" />
      </Link>
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="size-16 rounded-2xl bg-gradient-to-br from-teal to-safe grid place-items-center mb-6">
          <Radio className="size-8 text-background" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t("enterCode")}</h1>
        <p className="text-muted-foreground mb-8">{t("enterCodeSub")}</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="FAM-XXXX"
          className="w-full text-center font-display text-2xl tracking-[0.3em] py-5 rounded-2xl glass border border-teal/30 outline-none focus:border-teal placeholder:text-muted-foreground/40"
        />
        <button
          onClick={onJoin}
          disabled={code.length < 4}
          className="mt-4 w-full py-5 rounded-2xl bg-gradient-to-r from-teal to-safe text-background font-semibold text-lg disabled:opacity-40 transition-opacity"
        >
          {t("continue")}
        </button>
      </div>
    </div>
  );
}

function SetupScreen({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const steps = [
    { icon: MapPin, title: t("allowLocation"), desc: t("allowLocationSub") },
    { icon: AlertTriangle, title: t("allowNotifications"), desc: t("allowNotificationsSub") },
    { icon: Battery, title: t("batteryExempt"), desc: t("batteryExemptSub") },
  ];
  const cur = steps[step];
  const Icon = cur.icon;

  return (
    <div className="min-h-screen flex flex-col px-6 pt-6">
      <div className="flex gap-1.5 mb-10">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-teal" : "bg-muted"}`} />
        ))}
      </div>
      <div className="flex-1 flex flex-col justify-center text-center max-w-sm mx-auto w-full">
        <div className="size-24 rounded-3xl bg-teal/15 grid place-items-center mx-auto mb-8 pulse-ring">
          <Icon className="size-12 text-teal" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold mb-3">{cur.title}</h1>
        <p className="text-muted-foreground text-lg mb-10">{cur.desc}</p>
        <button
          onClick={() => (step < steps.length - 1 ? setStep(step + 1) : onDone())}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-teal to-safe text-background font-semibold text-lg"
        >
          {step < steps.length - 1 ? t("allowContinue") : t("finishSetup")}
        </button>
        <button onClick={onDone} className="mt-3 text-sm text-muted-foreground py-2">{t("skip")}</button>
      </div>
    </div>
  );
}

function ReadyScreen({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col px-6 pt-6 pb-10">
      <div className="text-center mt-6">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{t("hiEmma")}</div>
        <div className="font-display font-bold text-2xl mt-1">{t("tapToShare")}</div>
      </div>

      <div className="flex-1 grid place-items-center">
        <button
          onClick={onStart}
          className="relative size-64 rounded-full bg-gradient-to-br from-teal to-safe text-background grid place-items-center pulse-ring shadow-glow active:scale-95 transition-transform"
        >
          <div className="text-center">
            <Shield className="size-14 mx-auto mb-2" strokeWidth={2} />
            <div className="font-display font-bold text-2xl">{t("start")}</div>
            <div className="font-display font-bold text-2xl -mt-1">{t("safeMode")}</div>
          </div>
        </button>
      </div>

      <div className="glass rounded-2xl p-4 text-center text-sm text-muted-foreground">
        {t("pressInstruction")}
      </div>
    </div>
  );
}

function ActiveScreen({ onStop }: { onStop: () => void }) {
  const { t } = useI18n();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sent, setSent] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startHold = () => {
    setHolding(true);
    setProgress(0);
    const start = Date.now();
    timerRef.current = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 2000) * 100);
      setProgress(p);
      if (p >= 100) {
        clearHold();
        setSent(true);
      }
    }, 30);
  };

  const clearHold = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const cancelHold = () => {
    clearHold();
    setHolding(false);
    setProgress(0);
  };

  useEffect(() => () => clearHold(), []);

  return (
    <div className="min-h-screen flex flex-col px-6 pt-6 pb-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs">
          <span className="size-2 rounded-full bg-safe animate-pulse" />
          <span className="text-safe font-medium">{t("safeModeActive")}</span>
        </div>
      </div>

      <div className="flex-1 grid place-items-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-safe/20 animate-ping" />
          <div className="absolute inset-4 rounded-full bg-safe/30 animate-ping" style={{ animationDelay: "0.4s" }} />
          <div className="relative size-48 rounded-full bg-gradient-to-br from-safe to-teal grid place-items-center">
            <Check className="size-20 text-background" strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <MiniStat icon={MapPin} label={t("gps")} value={t("on")} />
          <MiniStat icon={Radio} label={t("sync")} value={t("live")} />
          <MiniStat icon={Battery} label={t("battery")} value="84%" />
        </div>

        <button
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          className="relative w-full py-5 rounded-2xl bg-destructive text-destructive-foreground font-bold text-xl flex items-center justify-center gap-2 sos-pulse overflow-hidden select-none touch-none"
        >
          <span
            className="absolute inset-y-0 left-0 bg-destructive-foreground/20 transition-[width] duration-75"
            style={{ width: `${progress}%` }}
          />
          <AlertTriangle className="size-6 relative" />
          <span className="relative">{holding ? t("sosSending") : t("sosHold")}</span>
        </button>

        <button onClick={onStop} className="w-full py-3 rounded-2xl glass text-muted-foreground text-sm">
          {t("stopSafe")}
        </button>
      </div>

      {sent && <SosSentModal onClose={() => setSent(false)} />}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <Icon className="size-4 text-teal mx-auto mb-1" />
      <div className="font-display font-bold text-base">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function SosSentModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <ModalShell onClose={onClose}>
      <div className="text-center">
        <div className="size-16 rounded-full bg-destructive/20 grid place-items-center mx-auto mb-4">
          <AlertTriangle className="size-8 text-destructive" />
        </div>
        <h3 className="font-display font-bold text-xl mb-2">{t("sosSent")}</h3>
        <p className="text-sm text-muted-foreground mb-5">{t("sosSentSub")}</p>
        <button onClick={onClose} className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal to-safe text-background font-semibold">
          {t("ok")}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[500] bg-background/70 backdrop-blur-sm grid place-items-center px-6" onClick={onClose}>
      <div className="glass rounded-3xl p-6 w-full max-w-sm relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 size-8 rounded-full bg-background/40 grid place-items-center">
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
