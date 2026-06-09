import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Users, MapPin, Radio } from "lucide-react";
import { useI18n, LanguageToggle } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WhereNow — Family Safety & Real-Time Location" },
      { name: "description", content: "Real-time location sharing for families. One-tap Safe Mode for kids, full control for parents." },
      { property: "og:title", content: "WhereNow — Stay close, stay safe" },
      { property: "og:description", content: "Real-time location sharing for families with one-tap Safe Mode." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-8 flex items-center gap-2">
        <div className="size-9 rounded-xl bg-gradient-to-br from-teal to-safe grid place-items-center">
          <Radio className="size-5 text-background" strokeWidth={2.5} />
        </div>
        <span className="font-display font-bold text-lg tracking-tight">WhereNow</span>
        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle />
          <span className="text-xs text-muted-foreground glass px-3 py-1 rounded-full">{t("beta")}</span>
        </div>
      </header>

      <main className="flex-1 px-6 pt-14 pb-10 flex flex-col">
        <div className="inline-flex items-center gap-2 self-start text-xs uppercase tracking-[0.2em] text-teal mb-6">
          <span className="size-1.5 rounded-full bg-teal animate-pulse" />
          {t("familySafetyNetwork")}
        </div>
        <h1 className="text-5xl font-bold leading-[1.05] mb-5">
          {t("heroTitle1")}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal to-safe">
            {t("heroTitle2")}
          </span>
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-md">
          {t("heroSub")}
        </p>

        <div className="flex flex-col gap-3 mb-12">
          <Link
            to="/host"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-teal/40 p-5 border border-teal/20 hover:border-teal/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl glass grid place-items-center shrink-0">
                <Shield className="size-6 text-teal" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-lg">{t("imParent")}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal/20 text-teal">{t("host")}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t("parentSub")}</p>
              </div>
            </div>
          </Link>

          <Link
            to="/member"
            className="group relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur p-5 border border-border hover:border-safe/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-safe/15 grid place-items-center shrink-0">
                <Users className="size-6 text-safe" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-lg">{t("imMember")}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-safe/20 text-safe">{t("oneTap")}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t("memberSub")}</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-auto">
          {[
            { icon: MapPin, label: t("liveGps") },
            { icon: Shield, label: t("sosAlerts") },
            { icon: Radio, label: t("geofence") },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass rounded-xl p-3 text-center">
              <Icon className="size-4 text-teal mx-auto mb-1.5" />
              <div className="text-[11px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
