import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Languages } from "lucide-react";

export type Lang = "en" | "bn";

const dict = {
  en: {
    // Landing
    beta: "Beta",
    familySafetyNetwork: "Family Safety Network",
    heroTitle1: "Know where they are.",
    heroTitle2: "The moment they need you.",
    heroSub: "Real-time GPS, geofence alerts, SOS, and route history — wrapped in a child-simple one-tap experience.",
    imParent: "I'm the Parent",
    parentSub: "Live map, alerts, permissions, history.",
    host: "Host",
    imMember: "I'm a Member",
    memberSub: "Join with code, press one button. Done.",
    oneTap: "One-tap",
    liveGps: "Live GPS",
    sosAlerts: "SOS Alerts",
    geofence: "Geofence",
    // Host
    theCarterFamily: "The Carter Family",
    map: "Map",
    members: "Members",
    alerts: "Alerts",
    history: "History",
    liveOnline: "Live · {n} online",
    safeZones: "Safe Zones",
    homeSchool: "Home · School",
    alertsToday: "Alerts Today",
    needsReview: "1 needs review",
    membersCount: "Members · {n}",
    invite: "Invite",
    inviteCode: "Invite Code",
    copy: "Copy",
    copied: "Copied!",
    seeAllMembers: "See all members",
    mapAccess: "Map access",
    sosAlertsToggle: "SOS alerts",
    geofenceToggle: "Geofence",
    recentActivity: "Recent activity",
    sosHistory: "SOS History",
    noSos: "No emergency alerts in the last 30 days.",
    todayRoute: "{name}'s route",
    today: "Today",
    distance: "Distance",
    time: "Time",
    stops: "Stops",
    arrivedAt: "Arrived at {place}",
    leftPlace: "Left {place}",
    batteryLow: "Battery low ({n}%)",
    minAgo: "{n} min ago",
    justNow: "just now",
    // Invite modal
    shareInvite: "Share invite",
    shareInviteSub: "Send this code to family members so they can join your space.",
    shareLink: "Share link",
    done: "Done",
    addGeofence: "Add safe zone",
    addGeofenceSub: "Create a zone and get alerts when members arrive or leave.",
    zoneName: "Zone name",
    zoneRadius: "Radius (m)",
    create: "Create",
    cancel: "Cancel",
    notifications: "Notifications",
    noNew: "You're all caught up.",
    // Member
    enterCode: "Enter your family code",
    enterCodeSub: "Ask your parent for the code. It looks like FAM-7K9X.",
    continue: "Continue",
    allowLocation: "Allow location",
    allowLocationSub: "We need this to keep you safe — choose Allow all the time.",
    allowNotifications: "Allow notifications",
    allowNotificationsSub: "So your family can reach you instantly.",
    batteryExempt: "Battery exemption",
    batteryExemptSub: "Keeps WhereNow running in the background.",
    allowContinue: "Allow & Continue",
    finishSetup: "Finish Setup",
    skip: "Skip for now",
    hiEmma: "Hi, Emma 👋",
    tapToShare: "Tap to share with family",
    start: "Start",
    safeMode: "Safe Mode",
    pressInstruction: "Press the button. That's it. Your family will see you on the map.",
    safeModeActive: "Safe Mode Active",
    gps: "GPS",
    sync: "Sync",
    battery: "Battery",
    on: "On",
    live: "Live",
    sosHold: "SOS — Hold to send",
    stopSafe: "Stop Safe Mode",
    sosSending: "Sending SOS… release to cancel",
    sosSent: "SOS sent to your family",
    sosSentSub: "They've been notified of your location.",
    ok: "OK",
  },
  bn: {
    beta: "বেটা",
    familySafetyNetwork: "পরিবার সুরক্ষা নেটওয়ার্ক",
    heroTitle1: "তারা কোথায় আছে জানুন।",
    heroTitle2: "যখন তাদের আপনাকে দরকার।",
    heroSub: "রিয়েল-টাইম জিপিএস, জিওফেন্স সতর্কতা, এসওএস ও রুট ইতিহাস — শিশুদের জন্য এক-ট্যাপে সহজ।",
    imParent: "আমি অভিভাবক",
    parentSub: "লাইভ ম্যাপ, সতর্কতা, অনুমতি, ইতিহাস।",
    host: "হোস্ট",
    imMember: "আমি একজন সদস্য",
    memberSub: "কোড দিয়ে যোগ দিন, একটি বোতাম চাপুন।",
    oneTap: "এক-ট্যাপ",
    liveGps: "লাইভ জিপিএস",
    sosAlerts: "এসওএস সতর্কতা",
    geofence: "জিওফেন্স",
    theCarterFamily: "কার্টার পরিবার",
    map: "ম্যাপ",
    members: "সদস্য",
    alerts: "সতর্কতা",
    history: "ইতিহাস",
    liveOnline: "লাইভ · {n} জন অনলাইন",
    safeZones: "নিরাপদ এলাকা",
    homeSchool: "বাড়ি · স্কুল",
    alertsToday: "আজকের সতর্কতা",
    needsReview: "১টি পর্যালোচনা প্রয়োজন",
    membersCount: "সদস্য · {n}",
    invite: "আমন্ত্রণ",
    inviteCode: "আমন্ত্রণ কোড",
    copy: "কপি",
    copied: "কপি হয়েছে!",
    seeAllMembers: "সব সদস্য দেখুন",
    mapAccess: "ম্যাপ অ্যাক্সেস",
    sosAlertsToggle: "এসওএস সতর্কতা",
    geofenceToggle: "জিওফেন্স",
    recentActivity: "সাম্প্রতিক কার্যকলাপ",
    sosHistory: "এসওএস ইতিহাস",
    noSos: "গত ৩০ দিনে কোনো জরুরি সতর্কতা নেই।",
    todayRoute: "{name} এর রুট",
    today: "আজ",
    distance: "দূরত্ব",
    time: "সময়",
    stops: "থামা",
    arrivedAt: "{place} এ পৌঁছেছে",
    leftPlace: "{place} থেকে চলে গেছে",
    batteryLow: "ব্যাটারি কম ({n}%)",
    minAgo: "{n} মিনিট আগে",
    justNow: "এইমাত্র",
    shareInvite: "আমন্ত্রণ শেয়ার করুন",
    shareInviteSub: "এই কোডটি পরিবারের সদস্যদের পাঠান যাতে তারা যোগ দিতে পারে।",
    shareLink: "লিঙ্ক শেয়ার করুন",
    done: "সম্পন্ন",
    addGeofence: "নিরাপদ এলাকা যোগ করুন",
    addGeofenceSub: "একটি এলাকা তৈরি করুন এবং সদস্যরা প্রবেশ বা প্রস্থান করলে সতর্কতা পান।",
    zoneName: "এলাকার নাম",
    zoneRadius: "ব্যাসার্ধ (মি)",
    create: "তৈরি করুন",
    cancel: "বাতিল",
    notifications: "বিজ্ঞপ্তি",
    noNew: "সব দেখা হয়ে গেছে।",
    enterCode: "আপনার পরিবারের কোড লিখুন",
    enterCodeSub: "আপনার অভিভাবকের কাছে কোড চান। এটি দেখতে FAM-7K9X এর মতো।",
    continue: "চালিয়ে যান",
    allowLocation: "অবস্থান অনুমতি দিন",
    allowLocationSub: "আপনাকে নিরাপদ রাখতে এটি দরকার — সর্বদা অনুমতি দিন বেছে নিন।",
    allowNotifications: "বিজ্ঞপ্তি অনুমতি দিন",
    allowNotificationsSub: "যাতে আপনার পরিবার তাৎক্ষণিকভাবে যোগাযোগ করতে পারে।",
    batteryExempt: "ব্যাটারি ছাড়",
    batteryExemptSub: "WhereNow ব্যাকগ্রাউন্ডে চালু রাখে।",
    allowContinue: "অনুমতি দিন ও এগিয়ে যান",
    finishSetup: "সেটআপ শেষ করুন",
    skip: "এখন এড়িয়ে যান",
    hiEmma: "হাই, এমা 👋",
    tapToShare: "পরিবারের সাথে শেয়ার করতে ট্যাপ করুন",
    start: "শুরু",
    safeMode: "সেফ মোড",
    pressInstruction: "বোতামটি চাপুন। ব্যাস। আপনার পরিবার ম্যাপে আপনাকে দেখতে পাবে।",
    safeModeActive: "সেফ মোড সক্রিয়",
    gps: "জিপিএস",
    sync: "সিঙ্ক",
    battery: "ব্যাটারি",
    on: "চালু",
    live: "লাইভ",
    sosHold: "এসওএস — পাঠাতে ধরে রাখুন",
    stopSafe: "সেফ মোড বন্ধ করুন",
    sosSending: "এসওএস পাঠানো হচ্ছে… বাতিল করতে ছাড়ুন",
    sosSent: "এসওএস আপনার পরিবারে পাঠানো হয়েছে",
    sosSentSub: "তাদের আপনার অবস্থান সম্পর্কে জানানো হয়েছে।",
    ok: "ঠিক আছে",
  },
} as const;

type Key = keyof typeof dict.en;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key, vars?: Record<string, string | number>) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem("wn-lang") as Lang)) || null;
    if (stored === "en" || stored === "bn") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("wn-lang", l);
  };

  const t = (k: Key, vars?: Record<string, string | number>) => {
    let s: string = (dict[lang] as Record<string, string>)[k] ?? (dict.en as Record<string, string>)[k] ?? k;
    if (vars) for (const [key, val] of Object.entries(vars)) s = s.replace(`{${key}}`, String(val));
    return s;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "bn" : "en")}
      className={`h-9 px-3 rounded-full glass flex items-center gap-1.5 text-xs font-semibold ${className}`}
      aria-label="Toggle language"
    >
      <Languages className="size-3.5 text-teal" />
      <span className={lang === "en" ? "text-teal" : "text-muted-foreground"}>EN</span>
      <span className="text-muted-foreground/40">/</span>
      <span className={lang === "bn" ? "text-teal" : "text-muted-foreground"}>BN</span>
    </button>
  );
}
