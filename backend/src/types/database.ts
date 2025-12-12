export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface AIProfile {
  id: number;
  name: string;
  personality: string;
  description: string;
  hobbies?: string | null;
  model_type?: string | null;
  compatibility_tags?: string | null;
  user_id?: number | null;
}

export interface Match {
  id: number;
  ai1_id: number;
  ai2_id: number;
  user_id?: number | null;
}

export interface Thread {
  id: number;
  match_id: number;
}

export interface Message {
  id: number;
  thread_id: number;
  sender_ai_id: number;
  message_text: string;
  created_at: string;
}
