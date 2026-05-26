import {
  BookOpen,
  Home,
  List,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type AppTab = "home" | "learn" | "list" | "profile";
export type LessonStatus = "complete" | "active" | "locked";
export type LessonKind = "lesson" | "review" | "chest";

export interface TabItem {
  key: AppTab;
  label: string;
  icon: LucideIcon;
}

export interface LessonItem {
  id: string;
  label: string;
  kind: LessonKind;
}

export interface ProfileStat {
  label: string;
  value: string;
}

export const appTabs: TabItem[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "learn", label: "Learn", icon: BookOpen },
  { key: "list", label: "List", icon: List },
  { key: "profile", label: "Profile", icon: UserRound },
];

export const lessonItems: LessonItem[] = [
  { id: "lesson-1", label: "Lesson 1", kind: "lesson" },
  { id: "lesson-2", label: "Lesson 2", kind: "lesson" },
  { id: "lesson-3", label: "Lesson 3", kind: "lesson" },
  { id: "review", label: "Review", kind: "review" },
  { id: "chest", label: "Chest", kind: "chest" },
];

export const lessonOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];

export const topicItems = ["Topic 1", "Topic 2", "Topic 3", "Topic 4"];

export const profileStats: ProfileStat[] = [
  { label: "Level", value: "1" },
  { label: "Streak", value: "3" },
  { label: "Points", value: "120" },
  { label: "Completed", value: "8" },
];
