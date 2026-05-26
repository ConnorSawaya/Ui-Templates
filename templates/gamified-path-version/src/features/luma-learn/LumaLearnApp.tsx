"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Flame,
  Gem,
  Heart,
  Lock,
  Moon,
  RotateCcw,
  Settings2,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  appTabs,
  lessonItems,
  lessonOptions,
  topicItems,
  type AppTab,
  type LessonItem,
  type LessonStatus,
} from "./data";

type AppStage = "welcome" | "app";
type FeedbackState = "correct" | "retry";

interface LessonSession {
  lessonId: string;
  selectedOption: string | null;
  feedback: FeedbackState | null;
}

const transitions = {
  ease: [0.22, 1, 0.36, 1],
  duration: 0.22,
} as const;

const MAX_HEARTS = 5;
const LESSON_XP = 10;
const LESSON_GEMS = 2;
const DEFAULT_STREAK = 3;

type ThemeMode = "light" | "dark";
type LumaThemeStyle = CSSProperties & Record<`--${string}`, string>;

const lumaThemeStyles: Record<ThemeMode, LumaThemeStyle> = {
  light: {
    "--luma-page": "#f4fbf5",
    "--luma-surface": "#ffffff",
    "--luma-surface-overlay": "rgba(255, 255, 255, 0.85)",
    "--luma-surface-soft": "#f3faf4",
    "--luma-surface-softest": "#f7faf7",
    "--luma-text": "#1f2923",
    "--luma-muted": "#6c756e",
    "--luma-subtle": "#8a938c",
    "--luma-border": "#e7eee8",
    "--luma-border-strong": "#e5ede7",
    "--luma-border-soft": "#eef2ee",
    "--luma-line": "#e8efe9",
    "--luma-line-active": "#cce8d0",
    "--luma-accent": "#88c88d",
    "--luma-accent-strong": "#7dcf84",
    "--luma-accent-soft": "#eef8ef",
    "--luma-success": "#79b97f",
    "--luma-heart": "#e7899d",
    "--luma-heart-soft": "#fff3f6",
    "--luma-gem": "#7cc5c8",
    "--luma-gem-soft": "#eef8f8",
    "--luma-xp": "#e3a93a",
    "--luma-xp-soft": "#fff7e7",
    "--luma-streak": "#ef9a5a",
    "--luma-streak-soft": "#fff3e9",
    "--luma-locked": "#a7aea8",
    "--luma-locked-text": "#9da59f",
    "--luma-locked-border": "#c9d1ca",
    "--luma-danger-surface": "#fff6f3",
    "--luma-danger-border": "#f2e4de",
    "--luma-danger-text": "#df8f78",
  },
  dark: {
    "--luma-page": "#101712",
    "--luma-surface": "#17211a",
    "--luma-surface-overlay": "rgba(23, 33, 26, 0.92)",
    "--luma-surface-soft": "#1d2a21",
    "--luma-surface-softest": "#212f26",
    "--luma-text": "#edf4ee",
    "--luma-muted": "#a8b4ac",
    "--luma-subtle": "#8b988f",
    "--luma-border": "#2b372f",
    "--luma-border-strong": "#324037",
    "--luma-border-soft": "#263128",
    "--luma-line": "#29352c",
    "--luma-line-active": "#3f6947",
    "--luma-accent": "#78c980",
    "--luma-accent-strong": "#8add91",
    "--luma-accent-soft": "#1b3020",
    "--luma-success": "#9ad4a0",
    "--luma-heart": "#f2a3b4",
    "--luma-heart-soft": "#342127",
    "--luma-gem": "#8fd3d5",
    "--luma-gem-soft": "#1b2c2d",
    "--luma-xp": "#f1c261",
    "--luma-xp-soft": "#312913",
    "--luma-streak": "#f5ae73",
    "--luma-streak-soft": "#362416",
    "--luma-locked": "#69746d",
    "--luma-locked-text": "#8d9a91",
    "--luma-locked-border": "#4a554d",
    "--luma-danger-surface": "#2d1d19",
    "--luma-danger-border": "#4b322b",
    "--luma-danger-text": "#f0ae97",
  },
};

function getLessonPathOffset(index: number, total: number) {
  if (index === total - 1) {
    return 0;
  }

  return index % 2 === 0 ? -30 : 30;
}

function buildLessonPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return "";
  }

  return points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const previousPoint = points[index - 1];
      const controlY = (previousPoint.y + point.y) / 2;

      return `C ${previousPoint.x} ${controlY} ${point.x} ${controlY} ${point.x} ${point.y}`;
    })
    .join(" ");
}

function getLessonStatus(
  lesson: LessonItem,
  completedLessons: string[],
  activeLessonId: string
): LessonStatus {
  if (completedLessons.includes(lesson.id)) {
    return "complete";
  }

  if (lesson.id === activeLessonId) {
    return "active";
  }

  return "locked";
}

export function LumaLearnApp() {
  const theme = useStore((s) => s.theme);
  const [stage, setStage] = useState<AppStage>("welcome");
  const [tab, setTab] = useState<AppTab>("home");
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [xp, setXp] = useState(120);
  const [gems, setGems] = useState(24);
  const [completedLessons, setCompletedLessons] = useState<string[]>(["lesson-1"]);
  const [activeLessonId, setActiveLessonId] = useState("lesson-2");
  const [lessonSession, setLessonSession] = useState<LessonSession | null>(null);
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);

  const currentLesson = useMemo(
    () => lessonItems.find((lesson) => lesson.id === activeLessonId) ?? lessonItems[0],
    [activeLessonId]
  );

  const progressValue = useMemo(() => {
    const progressSteps = completedLessons.length + (lessonSession ? 0 : 1);
    return Math.min(100, Math.round((progressSteps / lessonItems.length) * 100));
  }, [completedLessons.length, lessonSession]);

  const openLesson = (lessonId: string) => {
    if (hearts <= 0) {
      setShowOutOfHearts(true);
      return;
    }

    const lesson = lessonItems.find((item) => item.id === lessonId);

    if (!lesson) {
      return;
    }

    const status = getLessonStatus(lesson, completedLessons, activeLessonId);

    if (status === "locked") {
      return;
    }

    setLessonSession({
      lessonId,
      selectedOption: null,
      feedback: null,
    });
  };

  const closeLesson = () => {
    setLessonSession(null);
  };

  const checkLesson = () => {
    if (!lessonSession?.selectedOption) {
      return;
    }

    const correct = lessonSession.selectedOption === lessonOptions[1];

    if (!correct) {
      const nextHearts = Math.max(0, hearts - 1);
      setHearts(nextHearts);

      if (nextHearts === 0) {
        setLessonSession(null);
        setTab("home");
        setShowOutOfHearts(true);
        return;
      }

      setLessonSession({
        ...lessonSession,
        feedback: "retry",
      });

      return;
    }

    setLessonSession({
      ...lessonSession,
      feedback: "correct",
    });
  };

  const continueLesson = () => {
    if (!lessonSession) {
      return;
    }

    if (lessonSession.feedback === "correct") {
      const nextLesson = lessonItems.find(
        (lesson) => !completedLessons.includes(lesson.id) && lesson.id !== lessonSession.lessonId
      );

      setXp((current) => current + LESSON_XP);
      setGems((current) => current + LESSON_GEMS);

      setCompletedLessons((current) =>
        current.includes(lessonSession.lessonId)
          ? current
          : [...current, lessonSession.lessonId]
      );

      if (nextLesson) {
        setActiveLessonId(nextLesson.id);
      }

      setLessonSession(null);
      setTab("home");
      return;
    }

    setLessonSession({
      lessonId: lessonSession.lessonId,
      selectedOption: null,
      feedback: null,
    });
  };

  const screen = lessonSession ? (
    <LessonScreen
      lessonLabel={lessonItems.find((lesson) => lesson.id === lessonSession.lessonId)?.label ?? "Lesson"}
      selectedOption={lessonSession.selectedOption}
      feedback={lessonSession.feedback}
      hearts={hearts}
      xp={xp}
      onBack={closeLesson}
      onSelectOption={(option) => {
        if (lessonSession.feedback) {
          return;
        }

        setLessonSession({
          ...lessonSession,
          selectedOption: option,
        });
      }}
      onCheck={checkLesson}
      onContinue={continueLesson}
    />
  ) : showOutOfHearts ? (
    <OutOfHeartsScreen
      onBackHome={() => {
        setShowOutOfHearts(false);
        setTab("home");
      }}
    />
  ) : tab === "home" ? (
    <HomeScreen
      progressValue={progressValue}
      hearts={hearts}
      streak={DEFAULT_STREAK}
      xp={xp}
      gems={gems}
      activeLessonId={activeLessonId}
      completedLessons={completedLessons}
      onOpenLesson={openLesson}
    />
  ) : tab === "learn" ? (
    <LearnScreen lesson={currentLesson} xp={xp} hearts={hearts} onOpenLesson={() => openLesson(currentLesson.id)} />
  ) : tab === "list" ? (
    <ListScreen />
  ) : (
    <ProfileScreen hearts={hearts} streak={DEFAULT_STREAK} xp={xp} gems={gems} />
  );

  return (
    <div
      className="min-h-[100svh] bg-[var(--luma-page)] text-[var(--luma-text)]"
      style={lumaThemeStyles[theme]}
    >
      <div className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-0 md:px-6 md:py-4">
        <div className="hidden items-center gap-2 pb-3 text-sm text-[var(--luma-muted)] md:flex">
          <span className="h-2 w-2 rounded-full bg-[var(--luma-accent)]" />
          Luma Learn
        </div>
        <AppShell>
          <AnimatePresence mode="wait">
            {stage === "welcome" ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={transitions}
                className="flex min-h-0 flex-1 flex-col"
              >
                <WelcomeScreen onStart={() => setStage("app")} />
              </motion.div>
            ) : (
              <motion.div
                key={lessonSession ? `${lessonSession.lessonId}-${lessonSession.feedback ?? "question"}` : tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={transitions}
                className="flex min-h-0 flex-1 flex-col"
              >
                {screen}
              </motion.div>
            )}
          </AnimatePresence>
          {stage === "app" && lessonSession === null ? (
            <BottomNav activeTab={tab} onChange={setTab} />
          ) : null}
        </AppShell>
      </div>
    </div>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex w-full flex-col overflow-hidden bg-transparent md:h-[min(780px,calc(100svh-5.5rem))] md:max-w-[420px] md:rounded-[34px] md:border md:border-[var(--luma-border-strong)] md:bg-[var(--luma-surface)] md:shadow-[0_24px_60px_rgba(20,34,22,0.06)]">
      <div className="flex min-h-[100svh] flex-1 flex-col bg-transparent md:min-h-0 md:bg-[var(--luma-surface)]">
        {children}
      </div>
    </div>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-10 text-center sm:px-8">
      <div className="mx-auto flex max-w-[18rem] flex-1 flex-col items-center justify-center">
        <Mascot size="large" />
        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-[var(--luma-line)] bg-[var(--luma-surface)] px-3 py-1.5 text-sm text-[var(--luma-muted)] shadow-[0_8px_22px_rgba(20,34,22,0.04)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--luma-accent)]" />
          Luma Learn
        </div>
        <h1 className="mt-6 text-[2rem] font-semibold tracking-[-0.03em] text-[var(--luma-text)]">
          Luma Learn
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--luma-muted)]">
          Simple learning, one step at a time.
        </p>
      </div>

      <div className="space-y-3 pb-4">
        <PrimaryButton onClick={onStart}>Get Started</PrimaryButton>
        <SecondaryButton onClick={onStart}>Sign In</SecondaryButton>
      </div>
    </div>
  );
}

function HomeScreen({
  progressValue,
  hearts,
  streak,
  xp,
  gems,
  activeLessonId,
  completedLessons,
  onOpenLesson,
}: {
  progressValue: number;
  hearts: number;
  streak: number;
  xp: number;
  gems: number;
  activeLessonId: string;
  completedLessons: string[];
  onOpenLesson: (lessonId: string) => void;
}) {
  const pathWidth = 288;
  const nodeSize = 78;
  const nodeRowHeight = 104;
  const activeLessonIndex = lessonItems.findIndex((lesson) => lesson.id === activeLessonId);
  const pathProgress =
    lessonItems.length > 1 && activeLessonIndex >= 0
      ? activeLessonIndex / (lessonItems.length - 1)
      : 0;
  const pathNodes = lessonItems.map((lesson, index) => {
    const left = pathWidth / 2 + getLessonPathOffset(index, lessonItems.length);
    const top = index * nodeRowHeight;

    return {
      lesson,
      status: getLessonStatus(lesson, completedLessons, activeLessonId),
      left,
      top,
      centerY: top + nodeSize / 2,
    };
  });
  const pathHeight = (pathNodes.at(-1)?.top ?? 0) + 108;
  const pathData = buildLessonPath(pathNodes.map(({ left, centerY }) => ({ x: left, y: centerY })));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title="Home"
        right={
          <div className="flex items-center gap-2">
            <AppStatPill icon={Flame} value={`${streak} day`} tone="streak" />
            <AppStatPill icon={Heart} value={`${hearts}`} tone="heart" />
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4 sm:px-6">
        <div className="overflow-hidden rounded-[32px] border border-[var(--luma-border)] bg-[var(--luma-surface-overlay)] px-5 py-6 shadow-[0_8px_24px_rgba(20,34,22,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--luma-subtle)]">
                Unit 1
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--luma-text)]">
                Basics
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <AppStatPill icon={Zap} value={`${xp} XP`} tone="xp" />
              <AppStatPill icon={Gem} value={`${gems}`} tone="gem" />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <ProgressBar value={progressValue} />
            </div>
            <div className="rounded-full bg-[var(--luma-surface-softest)] px-3 py-1 text-xs font-medium text-[var(--luma-muted)]">
              {progressValue}%
            </div>
          </div>

          <div className="mt-6">
            <div className="relative mx-auto w-full max-w-[288px]" style={{ height: pathHeight }}>
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox={`0 0 ${pathWidth} ${pathHeight}`}
                fill="none"
                aria-hidden="true"
              >
                <path
                  d={pathData}
                  stroke="var(--luma-line)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <motion.path
                  d={pathData}
                  stroke="var(--luma-line-active)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: pathProgress }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>

              {pathNodes.map(({ lesson, status, left, top }) => (
                <div key={lesson.id} className="absolute -translate-x-1/2" style={{ left, top }}>
                  <LessonNode
                    lesson={lesson}
                    status={status}
                    onClick={() => onOpenLesson(lesson.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearnScreen({
  lesson,
  xp,
  hearts,
  onOpenLesson,
}: {
  lesson: LessonItem;
  xp: number;
  hearts: number;
  onOpenLesson: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title="Learn"
        right={
          <div className="flex items-center gap-2">
            <AppStatPill icon={Zap} value={`${xp} XP`} tone="xp" />
            <AppStatPill icon={Heart} value={`${hearts}`} tone="heart" />
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4 sm:px-6">
        <div className="flex min-h-full flex-col justify-center">
          <LessonCard>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--luma-subtle)]">Lesson</p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[var(--luma-text)]">
              {lesson.label}
            </h2>
            <p className="mt-2 text-sm text-[var(--luma-muted)]">Placeholder</p>
            <div className="mt-6 flex items-center gap-2 text-xs text-[var(--luma-muted)]">
              <span className="rounded-full bg-[var(--luma-surface-softest)] px-3 py-1.5">Basic</span>
              <span className="rounded-full bg-[var(--luma-surface-softest)] px-3 py-1.5">Sample</span>
            </div>
            <div className="mt-8">
              <PrimaryButton onClick={onOpenLesson}>Start</PrimaryButton>
            </div>
          </LessonCard>
        </div>
      </div>
    </div>
  );
}

function ListScreen() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar title="List" />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4 sm:px-6">
        <div className="overflow-hidden rounded-[24px] border border-[var(--luma-border)] bg-[var(--luma-surface)] shadow-[0_8px_24px_rgba(20,34,22,0.04)]">
          {topicItems.map((topic, index) => (
            <ListRow key={topic} label={topic} divider={index !== topicItems.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({
  hearts,
  streak,
  xp,
  gems,
}: {
  hearts: number;
  streak: number;
  xp: number;
  gems: number;
}) {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const [showSettings, setShowSettings] = useState(false);
  const profileStats = [
    { label: "XP", value: `${xp}` },
    { label: "Gems", value: `${gems}` },
    { label: "Streak", value: `${streak}` },
    { label: "Hearts", value: `${hearts}` },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Profile" />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4 sm:px-6">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-[var(--luma-border)] bg-[var(--luma-surface)] p-6 shadow-[0_8px_24px_rgba(20,34,22,0.04)]">
            <div className="flex items-center gap-4">
              <Mascot size="small" />
              <div>
                <h2 className="text-lg font-semibold text-[var(--luma-text)]">User</h2>
                <div className="mt-2 inline-flex rounded-full bg-[var(--luma-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--luma-muted)]">
                  Level 1
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {profileStats.map((stat) => (
              <ProfileStat key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>

          <div className="rounded-[24px] border border-[var(--luma-border)] bg-[var(--luma-surface)] p-4 shadow-[0_8px_24px_rgba(20,34,22,0.04)]">
            <button
              type="button"
              onClick={() => setShowSettings((current) => !current)}
              className="flex w-full items-center justify-between rounded-[20px] px-1 py-1 text-left"
              aria-expanded={showSettings}
              aria-controls="profile-settings-panel"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--luma-surface-softest)] text-[var(--luma-muted)]">
                  <Settings2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--luma-text)]">Settings</p>
                  <p className="mt-1 text-xs text-[var(--luma-muted)]">App appearance</p>
                </div>
              </div>

              <ChevronRight
                className={cn(
                  "h-4 w-4 text-[var(--luma-subtle)] transition-transform",
                  showSettings ? "rotate-90" : "rotate-0"
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {showSettings ? (
                <motion.div
                  id="profile-settings-panel"
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={transitions}
                  className="overflow-hidden"
                >
                  <div className="pt-3">
                    <ThemeSettingRow theme={theme} onToggle={toggleTheme} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutOfHeartsScreen({ onBackHome }: { onBackHome: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Hearts" />

      <div className="flex flex-1 items-center px-5 pb-8 pt-4 sm:px-6">
        <div className="w-full rounded-[28px] border border-[var(--luma-border)] bg-[var(--luma-surface)] p-6 text-center shadow-[0_8px_24px_rgba(20,34,22,0.04)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--luma-heart-soft)] text-[var(--luma-heart)]">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-[var(--luma-text)]">Out of hearts</h2>
          <p className="mt-2 text-sm text-[var(--luma-muted)]">Try again later</p>
          <div className="mt-8">
            <PrimaryButton onClick={onBackHome}>Back Home</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonScreen({
  lessonLabel,
  selectedOption,
  feedback,
  hearts,
  xp,
  onBack,
  onSelectOption,
  onCheck,
  onContinue,
}: {
  lessonLabel: string;
  selectedOption: string | null;
  feedback: FeedbackState | null;
  hearts: number;
  xp: number;
  onBack: () => void;
  onSelectOption: (option: string) => void;
  onCheck: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title={lessonLabel}
        left={
          <IconButton onClick={onBack} ariaLabel="Back">
            <ArrowLeft className="h-4 w-4" />
          </IconButton>
        }
        right={
          <div className="flex items-center gap-2">
            <AppStatPill icon={Zap} value={`${xp} XP`} tone="xp" />
            <AppStatPill icon={Heart} value={`${hearts}`} tone="heart" />
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4 sm:px-6">
        <ProgressBar value={feedback ? 84 : 56} />

        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--luma-subtle)]">
            Question
          </p>
          <h1 className="mt-3 text-[1.7rem] font-semibold tracking-[-0.03em] text-[var(--luma-text)]">
            Question title
          </h1>
          <p className="mt-2 text-sm text-[var(--luma-muted)]">Prompt goes here</p>
        </div>

        <div className="mt-8 space-y-3">
          {lessonOptions.map((option) => (
            <PlaceholderOption
              key={option}
              label={option}
              selected={selectedOption === option}
              disabled={feedback !== null}
              onClick={() => onSelectOption(option)}
            />
          ))}
        </div>

        {feedback === null ? (
          <div className="mt-8">
            <PrimaryButton onClick={onCheck} disabled={selectedOption === null}>
              Check
            </PrimaryButton>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {feedback ? <FeedbackPanel state={feedback} onContinue={onContinue} /> : null}
      </AnimatePresence>
    </div>
  );
}

function TopBar({
  title,
  left,
  right,
}: {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="shrink-0 flex items-center justify-between px-5 pb-2 pt-5 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {left ?? <MascotMark />}
        <h1 className="truncate text-base font-medium text-[var(--luma-text)]">{title}</h1>
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-[var(--luma-border-soft)]">
      <motion.div
        className="h-full rounded-full bg-[var(--luma-accent)]"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function LessonCard({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="w-full rounded-[28px] border border-[var(--luma-border)] bg-[var(--luma-surface)] p-6 text-left shadow-[0_8px_24px_rgba(20,34,22,0.04)]"
    >
      {children}
    </motion.div>
  );
}

function LessonNode({
  lesson,
  status,
  onClick,
}: {
  lesson: LessonItem;
  status: LessonStatus;
  onClick: () => void;
}) {
  const specialNode = lesson.kind !== "lesson";

  return (
    <div className="relative z-10 flex w-[96px] flex-col items-center gap-2">
      <motion.button
        type="button"
        whileHover={status === "locked" ? undefined : { y: -2 }}
        whileTap={status === "locked" ? undefined : { scale: 0.98 }}
        animate={status === "active" ? { y: [0, -1.5, 0] } : undefined}
        transition={{ duration: 0.16 }}
        onClick={onClick}
        disabled={status === "locked"}
        aria-label={`Open ${lesson.label}`}
        className={cn(
          "flex h-[78px] w-[78px] items-center justify-center rounded-full border-[3px] transition-colors",
          status === "active"
            ? "border-[var(--luma-accent-strong)] bg-[var(--luma-accent)] text-white shadow-[0_14px_28px_rgba(136,200,141,0.28)]"
            : "",
          status === "complete"
            ? "border-[var(--luma-line-active)] bg-[var(--luma-accent-soft)] text-[var(--luma-success)] shadow-[0_10px_22px_rgba(136,200,141,0.12)]"
            : "",
          status === "locked"
            ? specialNode
              ? "border-[var(--luma-locked-border)] bg-[var(--luma-surface-softest)] text-[var(--luma-locked)]"
              : "border-[var(--luma-border)] bg-[var(--luma-surface-softest)] text-[var(--luma-locked)]"
            : ""
        )}
      >
        <LessonStatusMark status={status} kind={lesson.kind} />
      </motion.button>

      <p
        className={cn(
          "text-center text-sm font-semibold tracking-[-0.01em]",
          status === "locked" ? "text-[var(--luma-locked-text)]" : "text-[var(--luma-text)]"
        )}
      >
        {lesson.label}
      </p>
    </div>
  );
}

function LessonStatusMark({
  status,
  kind,
}: {
  status: LessonStatus;
  kind: LessonItem["kind"];
}) {
  if (status === "complete") {
    return <Check className="h-6 w-6" />;
  }

  if (kind === "chest") {
    return <Gem className="h-5 w-5" />;
  }

  if (status === "active") {
    if (kind === "review") {
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/90">
          <RotateCcw className="h-3.5 w-3.5" />
        </div>
      );
    }

    return <div className="h-3.5 w-3.5 rounded-full bg-white" />;
  }

  if (kind === "review") {
    return <RotateCcw className="h-4 w-4 text-[var(--luma-locked-border)]" />;
  }

  return <Lock className="h-5 w-5" />;
}

function PlaceholderOption({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.16 }}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left transition-colors",
        selected
          ? "border-[var(--luma-line-active)] bg-[var(--luma-surface-soft)]"
          : "border-[var(--luma-border)] bg-[var(--luma-surface)]",
        disabled ? "cursor-default" : ""
      )}
    >
      <span className="text-sm font-medium text-[var(--luma-text)]">{label}</span>
      <span
        className={cn(
          "h-4 w-4 rounded-full border",
          selected
            ? "border-[var(--luma-accent)] bg-[var(--luma-accent)]"
            : "border-[var(--luma-border)] bg-[var(--luma-surface)]"
        )}
      />
    </motion.button>
  );
}

function FeedbackPanel({
  state,
  onContinue,
}: {
  state: FeedbackState;
  onContinue: () => void;
}) {
  const positive = state === "correct";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={transitions}
      className={cn(
        "mx-5 mb-6 rounded-[26px] border p-4 shadow-[0_8px_24px_rgba(20,34,22,0.04)] sm:mx-6",
        positive
          ? "border-[var(--luma-line-active)] bg-[var(--luma-surface-soft)]"
          : "border-[var(--luma-danger-border)] bg-[var(--luma-danger-surface)]"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            positive
              ? "bg-[var(--luma-surface)] text-[var(--luma-success)]"
              : "bg-[var(--luma-surface)] text-[var(--luma-danger-text)]"
          )}
        >
          {positive ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--luma-text)]">{positive ? "Complete" : "Try again"}</p>
          <p className="mt-1 text-xs text-[var(--luma-muted)]">
            {positive ? `+${LESSON_XP} XP  +${LESSON_GEMS} gems` : "-1 heart"}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </motion.div>
  );
}

function ListRow({
  label,
  divider,
  icon,
}: {
  label: string;
  divider: boolean;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-4",
        divider ? "border-b border-[var(--luma-border-soft)]" : ""
      )}
    >
      <div className="flex items-center gap-3">
        {icon ?? <span className="h-2 w-2 rounded-full bg-[var(--luma-accent)]" />}
        <span className="text-sm font-medium text-[var(--luma-text)]">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-[var(--luma-subtle)]" />
    </div>
  );
}

function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}) {
  return (
    <div className="shrink-0 border-t border-[var(--luma-border-soft)] bg-[var(--luma-surface-overlay)] px-3 py-3 backdrop-blur-sm">
      <div className="grid grid-cols-4 gap-1">
        {appTabs.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeTab;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-[18px] px-2 py-2 text-[11px] font-medium transition-colors",
                active
                  ? "bg-[var(--luma-surface-soft)] text-[var(--luma-text)]"
                  : "text-[var(--luma-muted)]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--luma-border)] bg-[var(--luma-surface)] p-4 shadow-[0_8px_24px_rgba(20,34,22,0.04)]">
      <p className="text-xs text-[var(--luma-subtle)]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--luma-text)]">{value}</p>
    </div>
  );
}

function Mascot({ size }: { size: "small" | "large" }) {
  const sizeClass = size === "large" ? "h-28 w-28" : "h-14 w-14";

  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      className={cn("relative", sizeClass)}
    >
      <div
        className="absolute left-1/2 top-0 h-[28%] w-[16%] rounded-full bg-[#91d496]"
        style={{ transform: "translateX(-70%) rotate(-30deg)" }}
      />
      <div
        className="absolute left-1/2 top-[2%] h-[24%] w-[16%] rounded-full bg-[#91d496]"
        style={{ transform: "translateX(12%) rotate(28deg)" }}
      />
      <div className="absolute bottom-0 left-1/2 h-[74%] w-[72%] -translate-x-1/2 rounded-[42%_42%_48%_48%/34%_34%_66%_66%] bg-[#a8dba6]" />
      <div className="absolute left-[37%] top-[46%] h-[6%] w-[6%] rounded-full bg-white" />
      <div className="absolute right-[37%] top-[46%] h-[6%] w-[6%] rounded-full bg-white" />
      <div className="absolute left-1/2 top-[58%] h-[4%] w-[18%] -translate-x-1/2 rounded-full border-b-2 border-white" />
    </motion.div>
  );
}

function MascotMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--luma-surface)] shadow-[0_6px_18px_rgba(20,34,22,0.04)]">
      <div className="relative h-4 w-4">
        <div
          className="absolute left-1/2 top-0 h-2 w-1 rounded-full bg-[#8dcc92]"
          style={{ transform: "translateX(-70%) rotate(-28deg)" }}
        />
        <div
          className="absolute left-1/2 top-0.5 h-2 w-1 rounded-full bg-[#8dcc92]"
          style={{ transform: "translateX(8%) rotate(22deg)" }}
        />
        <div className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-[40%_40%_45%_45%/35%_35%_65%_65%] bg-[#a8dba6]" />
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.14 }}
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center rounded-[18px] bg-[var(--luma-accent)] px-4 text-sm font-medium text-white shadow-[0_10px_24px_rgba(136,200,141,0.24)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </motion.button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-center rounded-[18px] text-sm font-medium text-[var(--luma-muted)]"
    >
      {children}
    </button>
  );
}

function IconButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--luma-surface)] text-[var(--luma-muted)] shadow-[0_6px_18px_rgba(20,34,22,0.04)]"
    >
      {children}
    </button>
  );
}

function AppStatPill({
  icon: Icon,
  value,
  tone,
}: {
  icon: typeof Flame;
  value: string;
  tone: "streak" | "xp" | "gem" | "heart";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-[0_6px_18px_rgba(20,34,22,0.04)]",
        tone === "streak" ? "bg-[var(--luma-streak-soft)] text-[var(--luma-streak)]" : "",
        tone === "xp" ? "bg-[var(--luma-xp-soft)] text-[var(--luma-xp)]" : "",
        tone === "gem" ? "bg-[var(--luma-gem-soft)] text-[var(--luma-gem)]" : "",
        tone === "heart" ? "bg-[var(--luma-heart-soft)] text-[var(--luma-heart)]" : ""
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{value}</span>
    </div>
  );
}

function ThemeSettingRow({
  theme,
  onToggle,
}: {
  theme: ThemeMode;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 rounded-[20px] bg-[var(--luma-surface-softest)] px-4 py-4 text-left transition-transform active:scale-[0.99]"
      aria-label="Toggle dark mode"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--luma-surface)] text-[var(--luma-muted)] shadow-[0_6px_18px_rgba(20,34,22,0.04)]">
          <Settings2 className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--luma-text)]">Dark Mode</p>
          <p className="mt-1 text-xs text-[var(--luma-muted)]">
            {theme === "dark" ? "On" : "Off"}
          </p>
        </div>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--luma-surface)] text-[var(--luma-muted)] shadow-[0_6px_18px_rgba(20,34,22,0.04)]">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </div>
    </button>
  );
}
