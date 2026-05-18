export const TABS = [
  { label: "Student Attendance", value: "attendance" },
  { label: "Dental Chair Usage", value: "usage" },
] as const;

export type TabValue = typeof TABS[number]["value"];