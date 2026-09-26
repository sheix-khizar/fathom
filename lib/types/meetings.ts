import type { Meeting } from "@/lib/supabase/types";

export interface EnrichedMeeting extends Meeting {
  openActionItemsCount?: number;
}
