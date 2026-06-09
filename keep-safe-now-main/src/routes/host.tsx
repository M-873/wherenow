import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, Battery, Shield, Settings2, Plus, MapPin, History, AlertTriangle, X, Copy, Check, Share2 } from "lucide-react";
import { lazy, Suspense, useState, type ReactNode } from "react";
import { MOCK_MEMBERS, MOCK_GEOFENCES, MOCK_ROUTE, MOCK_ALERTS } from "@/lib/mock-data";
import { useI18n, LanguageToggle } from "@/lib/i18n";
import { ClientOnly } from "@/components/ClientOnly";

const FamilyMap = lazy(() => import("@/components/FamilyMap").then((m) => ({ default: m.FamilyMap })));

export const Route = createFileRoute("/host")({
  head: () => ({
    meta: [
      { title: "Host Dashboard — WhereNow" },
      { name: "description", content: "Live family map, member permissions, SOS alerts and geofence history." },
    ],
  }),
  component: HostDashboard,
});

type Tab = "map" | "members" | "alerts" | "history";

function HostDashboard() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("map");
  const [selected, setSelected] = useState(MOCK_MEMBERS[0].id);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link to="/" className="size-9 rounded-full glass grid place-items-center">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-widest text-teal">{t("host")}</div>
          <div className="font-display font-semibold text-lg leading-tight">{t("theCarterFamily")}</div>
        </div>
        <LanguageToggle />
        <button onClick={() => setNotifOpen(true)} className="size-9 rounded-full glass grid place-items-center relative">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
        </button>
      </header>

      {tab === "map" && <MapTab selected={selected} setSelected={setSelected} />}
      {tab === "members" && <MembersTab />}
      {tab === "alerts" && <AlertsTab />}
      {tab === "history" && <HistoryTab />}

      <nav className="fixed bottom-0 inset-x-0 px-4 pb-4 pt-2 pointer-events-none">
        <div className="glass rounded-2xl p-1.5 grid grid-cols-4 gap-1 pointer-events-auto max-w-md mx-auto">
          {([
            ["map", MapPin, t("map")],
            ["members", Shield, t("members")],
            ["alerts", AlertTriangle, t("alerts")],
            ["history", History, t("history")],
          ] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key as Tab)}
              className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-medium transition-all ${
                tab === key ? "bg-teal text-teal-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {notifOpen && <NotificationsSheet onClose={() => setNotifOpen(false)} />}
    </div>
  );
}

function MapTab({ selected, setSelected }: { selected: string; setSelected: (id: string) => void }) {
  const { t } = useI18n();
  return (
    <>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-2 px-5 scrollbar-none">
        {MOCK_MEMBERS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all border ${
              selected === m.id ? "bg-teal text-teal-foreground border-teal" : "glass border-border"
            }`}
          >
            <span className="size-6 rounded-full grid place-items-center text-[10px] font-bold text-background" style={{ background: m.color }}>
              {m.initials}
            </span>
            {m.name}
          </button>
        ))}
      </div>

      <div className="mx-5 rounded-3xl overflow-hidden border border-border h-[55vh] relative">
        <ClientOnly fallback={<div className="h-full w-full grid place-items-center text-muted-foreground text-sm">Loading map…</div>}>
          <Suspense fallback={<div className="h-full w-full grid place-items-center text-muted-foreground text-sm">Loading map…</div>}>
            <FamilyMap members={MOCK_MEMBERS} geofences={MOCK_GEOFENCES} />
          </Suspense>
        </ClientOnly>
        <div className="absolute top-3 right-3 glass rounded-full px-3 py-1.5 text-[11px] flex items-center gap-1.5 z-[400]">
          <span className="size-1.5 rounded-full bg-safe animate-pulse" />
          {t("liveOnline", { n: 4 })}
        </div>
      </div>

      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        <StatCard label={t("safeZones")} value="2" sub={t("homeSchool")} icon={Shield} />
        <StatCard label={t("alertsToday")} value="3" sub={t("needsReview")} icon={Bell} />
      </div>
    </>
  );
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: any }) {
  return (
    <div className="glass rounded-2xl p-4">
      <Icon className="size-4 text-teal mb-2" />
      <div className="text-2xl font-display font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground/70 mt-1">{sub}</div>
    </div>
  );
}

function MembersTab() {
  const { t } = useI18n();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText("FAM-7K9X");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="px-5 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display font-semibold text-lg">{t("membersCount", { n: MOCK_MEMBERS.length })}</h2>
        <button onClick={() => setInviteOpen(true)} className="text-xs glass rounded-full px-3 py-1.5 flex items-center gap-1.5 text-teal">
          <Plus className="size-3.5" /> {t("invite")}
        </button>
      </div>

      <button onClick={copyCode} className="w-full glass rounded-2xl p-4 border-teal/30 text-left">
        <div className="text-[10px] uppercase tracking-widest text-teal mb-1">{t("inviteCode")}</div>
        <div className="flex items-center justify-between">
          <div className="font-display font-bold text-2xl tracking-[0.3em]">FAM-7K9X</div>
          <span className="text-xs text-teal flex items-center gap-1">
            {copied ? <><Check className="size-3" /> {t("copied")}</> : <><Copy className="size-3" /> {t("copy")}</>}
          </span>
        </div>
      </button>

      {MOCK_MEMBERS.map((m) => (
        <div key={m.id} className="glass rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full grid place-items-center text-sm font-bold text-background" style={{ background: m.color }}>
              {m.initials}
            </div>
            <div className="flex-1">
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <Battery className="size-3" /> {m.battery}% · {m.lastSeen}
              </div>
            </div>
            <button className="size-8 rounded-full glass grid place-items-center">
              <Settings2 className="size-3.5" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[11px]">
            <Toggle label={t("seeAllMembers")} defaultOn={m.id === "3"} />
            <Toggle label={t("mapAccess")} defaultOn />
            <Toggle label={t("sosAlertsToggle")} defaultOn />
            <Toggle label={t("geofenceToggle")} defaultOn={m.id !== "2"} />
          </div>
        </div>
      ))}

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} />}
    </div>
  );
}

function Toggle({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className="flex items-center justify-between p-2 rounded-lg bg-background/40">
      <span className="text-muted-foreground">{label}</span>
      <span className={`w-7 h-4 rounded-full relative transition-colors ${on ? "bg-teal" : "bg-muted"}`}>
        <span className={`absolute top-0.5 size-3 rounded-full bg-background transition-all ${on ? "left-3.5" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function AlertsTab() {
  const { t } = useI18n();
  const alertText = (a: typeof MOCK_ALERTS[number]) => {
    if (a.type === "geofence" && a.text.startsWith("Arrived")) return t("arrivedAt", { place: a.text.replace("Arrived at ", "") });
    if (a.type === "geofence" && a.text.startsWith("Left")) return t("leftPlace", { place: a.text.replace("Left ", "") });
    if (a.type === "battery") return t("batteryLow", { n: 23 });
    return a.text;
  };
  return (
    <div className="px-5 space-y-3">
      <h2 className="font-display font-semibold text-lg mb-2">{t("recentActivity")}</h2>
      {MOCK_ALERTS.map((a) => (
        <div key={a.id} className="glass rounded-2xl p-4 flex items-start gap-3">
          <div className={`size-9 rounded-xl grid place-items-center shrink-0 ${a.tone === "warn" ? "bg-destructive/20 text-destructive" : a.tone === "safe" ? "bg-safe/20 text-safe" : "bg-teal/20 text-teal"}`}>
            {a.tone === "warn" ? <Battery className="size-4" /> : <MapPin className="size-4" />}
          </div>
          <div className="flex-1">
            <div className="text-sm"><strong>{a.who}</strong> · {alertText(a)}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{a.time}</div>
          </div>
        </div>
      ))}

      <div className="glass rounded-2xl p-5 border-destructive/30 mt-6">
        <div className="flex items-center gap-2 text-destructive text-xs uppercase tracking-widest mb-2">
          <AlertTriangle className="size-3.5" /> {t("sosHistory")}
        </div>
        <div className="text-sm text-muted-foreground">{t("noSos")}</div>
      </div>
    </div>
  );
}

function HistoryTab() {
  const { t } = useI18n();
  const [geoOpen, setGeoOpen] = useState(false);
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-lg">{t("todayRoute", { name: "Emma" })}</h2>
        <span className="text-xs text-muted-foreground">{t("today")}</span>
      </div>
      <div className="rounded-3xl overflow-hidden border border-border h-[55vh]">
        <ClientOnly fallback={<div className="h-full grid place-items-center text-muted-foreground text-sm">Loading…</div>}>
          <Suspense fallback={<div className="h-full grid place-items-center text-muted-foreground text-sm">Loading…</div>}>
            <FamilyMap members={[MOCK_MEMBERS[0]]} route={MOCK_ROUTE} geofences={MOCK_GEOFENCES} />
          </Suspense>
        </ClientOnly>
      </div>
      <div className="mt-4 glass rounded-2xl p-4 grid grid-cols-3 gap-2 text-center">
        <div><div className="font-display font-bold text-xl">2.4<span className="text-sm">km</span></div><div className="text-[10px] text-muted-foreground">{t("distance")}</div></div>
        <div><div className="font-display font-bold text-xl">38<span className="text-sm">min</span></div><div className="text-[10px] text-muted-foreground">{t("time")}</div></div>
        <div><div className="font-display font-bold text-xl">5</div><div className="text-[10px] text-muted-foreground">{t("stops")}</div></div>
      </div>
      <button onClick={() => setGeoOpen(true)} className="mt-4 w-full py-3 rounded-2xl bg-teal/15 text-teal text-sm font-medium flex items-center justify-center gap-2">
        <Plus className="size-4" /> {t("addGeofence")}
      </button>
      {geoOpen && <GeofenceModal onClose={() => setGeoOpen(false)} />}
    </div>
  );
}

/* ---------- Modals ---------- */

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[500] bg-background/70 backdrop-blur-sm grid place-items-end sm:place-items-center px-4 pb-4" onClick={onClose}>
      <div className="glass rounded-3xl p-6 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 size-8 rounded-full bg-background/40 grid place-items-center">
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const code = "FAM-7K9X";

  return (
    <Modal onClose={onClose}>
      <div className="size-12 rounded-2xl bg-teal/20 grid place-items-center mb-4">
        <Share2 className="size-6 text-teal" />
      </div>
      <h3 className="font-display font-bold text-xl mb-1">{t("shareInvite")}</h3>
      <p className="text-sm text-muted-foreground mb-5">{t("shareInviteSub")}</p>

      <div className="rounded-2xl bg-background/40 p-4 mb-3 text-center">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{t("inviteCode")}</div>
        <div className="font-display font-bold text-3xl tracking-[0.3em] text-teal">{code}</div>
      </div>

      <button
        onClick={() => {
          navigator.clipboard?.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal to-safe text-background font-semibold flex items-center justify-center gap-2 mb-2"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? t("copied") : t("copy")}
      </button>
      <button
        onClick={() => navigator.share?.({ title: "WhereNow", text: `Join my family on WhereNow: ${code}` }).catch(() => {})}
        className="w-full py-3 rounded-2xl glass text-sm flex items-center justify-center gap-2"
      >
        <Share2 className="size-4" /> {t("shareLink")}
      </button>
    </Modal>
  );
}

function GeofenceModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [radius, setRadius] = useState(200);
  return (
    <Modal onClose={onClose}>
      <div className="size-12 rounded-2xl bg-teal/20 grid place-items-center mb-4">
        <Shield className="size-6 text-teal" />
      </div>
      <h3 className="font-display font-bold text-xl mb-1">{t("addGeofence")}</h3>
      <p className="text-sm text-muted-foreground mb-5">{t("addGeofenceSub")}</p>

      <label className="text-xs text-muted-foreground">{t("zoneName")}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Home" className="w-full mt-1 mb-4 px-4 py-3 rounded-xl bg-background/40 outline-none border border-border focus:border-teal" />

      <label className="text-xs text-muted-foreground">{t("zoneRadius")}: {radius}m</label>
      <input type="range" min={50} max={1000} step={50} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full mt-2 mb-5 accent-teal" />

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onClose} className="py-3 rounded-2xl glass text-sm">{t("cancel")}</button>
        <button onClick={onClose} disabled={!name} className="py-3 rounded-2xl bg-gradient-to-r from-teal to-safe text-background font-semibold disabled:opacity-40">
          {t("create")}
        </button>
      </div>
    </Modal>
  );
}

function NotificationsSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Modal onClose={onClose}>
      <h3 className="font-display font-bold text-xl mb-4">{t("notifications")}</h3>
      <div className="space-y-2">
        {MOCK_ALERTS.map((a) => (
          <div key={a.id} className="rounded-xl bg-background/40 p-3 flex items-start gap-3">
            <div className={`size-8 rounded-lg grid place-items-center shrink-0 ${a.tone === "warn" ? "bg-destructive/20 text-destructive" : a.tone === "safe" ? "bg-safe/20 text-safe" : "bg-teal/20 text-teal"}`}>
              {a.tone === "warn" ? <Battery className="size-3.5" /> : <MapPin className="size-3.5" />}
            </div>
            <div className="flex-1 text-sm">
              <div><strong>{a.who}</strong> · {a.text}</div>
              <div className="text-[11px] text-muted-foreground">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
