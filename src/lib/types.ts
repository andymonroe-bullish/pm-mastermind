export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "attendee";
  created_at: string;
}

export interface EventInfo {
  id: string;
  title: string;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  venue_name: string | null;
  description: string | null;
  additional_notes: string | null;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface ChecklistProgress {
  id: string;
  user_id: string;
  item_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface ItineraryItem {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  sort_order: number;
  created_at: string;
}

export interface EventFile {
  id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  uploaded_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}
