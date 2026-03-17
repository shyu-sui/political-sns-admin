import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// コメント一覧取得（del_flg フィルターなし — 管理者は全件見る）
export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// del_flg の更新（表示/非表示の切り替え）
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, del_flg } = body as { id: string; del_flg: number };

  if (typeof id !== "string" || (del_flg !== 0 && del_flg !== 1)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("comments")
    .update({ del_flg })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
