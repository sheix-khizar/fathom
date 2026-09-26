import { supabaseAdmin } from "@/lib/supabase/server";
import EditorialDashboard from "@/components/dashboard/EditorialDashboard";
import type { EnrichedMeeting } from "@/lib/types/meetings";

// Revalidate every 10 seconds or dynamic
export const dynamic = "force-dynamic";

export default async function Home() {
  // 1. Fetch all meetings ordered by date desc
  const { data: meetings, error: meetingsError } = await supabaseAdmin
    .from("meetings")
    .select("*")
    .order("date", { ascending: false });

  if (meetingsError) {
    console.error("Database error fetching meetings on Home:", meetingsError.message);
  }

  // 2. Fetch open action items to compute counts
  const { data: openActionItems } = await supabaseAdmin
    .from("action_items")
    .select("id, meeting_id")
    .eq("completed", false);

  const countMap: Record<string, number> = {};
  openActionItems?.forEach(item => {
    countMap[item.meeting_id] = (countMap[item.meeting_id] || 0) + 1;
  });

  const enrichedMeetings: EnrichedMeeting[] = (meetings || []).map(m => ({
    ...m,
    openActionItemsCount: countMap[m.id] || 0,
  }));

  return <EditorialDashboard initialMeetings={enrichedMeetings} />;
}
