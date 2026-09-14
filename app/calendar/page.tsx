import { getMeetings } from "@/lib/data/meetings";
import CalendarGrid from "@/components/calendar/CalendarGrid";

export default function CalendarPage() {
  const meetings = getMeetings();
  return <CalendarGrid meetings={meetings} />;
}
