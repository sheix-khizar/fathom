import { getMeetings } from "@/lib/data/meetings";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function Home() {
  const meetings = getMeetings();
  return <DashboardClient meetings={meetings} />;
}
