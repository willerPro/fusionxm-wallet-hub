
export type ActivityType = "deposit" | "withdrawal" | "investment";

export interface Activity {
  id: string;
  type: ActivityType;
  amount: number;
  description: string;
  date: Date;
}
