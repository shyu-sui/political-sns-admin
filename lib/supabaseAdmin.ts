import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Service Role Key を使用 — サーバーサイド（API Route）専用
// このファイルをクライアントコンポーネントから import してはいけない

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "環境変数 SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が設定されていません"
      );
    }
    _client = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _client;
}

export type Comment = {
  id: string;
  topic_id: number;
  side: "pro" | "con";
  content: string;
  author: string;
  del_flg: number;
  reported_flg: number;
  created_at: string;
};

export type Topic = {
  id: number;
  title: string;
  description: string | null;
  del_flg: number;
  created_at: string;
};
