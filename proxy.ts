import { NextRequest, NextResponse } from "next/server";

// リクエストごとに新しいインスタンスを生成する（ストリームの使い回し防止）
function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Panel", charset="UTF-8"',
    },
  });
}

// タイミング攻撃対策: 文字数が異なる場合も全文字を比較してから返す
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function proxy(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) return unauthorized();

  let credentials: string;
  try {
    credentials = atob(authHeader.slice(6));
  } catch {
    return unauthorized();
  }

  // パスワードに ":" が含まれる場合を考慮して split は最初の1つだけ
  const colonIndex = credentials.indexOf(":");
  if (colonIndex === -1) return unauthorized();

  const user = credentials.slice(0, colonIndex);
  const pass = credentials.slice(colonIndex + 1);

  const validUser = process.env.ADMIN_USER ?? "";
  const validPass = process.env.ADMIN_PASS ?? "";

  if (!safeEqual(user, validUser) || !safeEqual(pass, validPass)) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  // 静的ファイル以外の全ルートに Basic 認証をかける
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
