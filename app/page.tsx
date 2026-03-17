"use client";

import { useEffect, useState, useCallback } from "react";

type Comment = {
  id: string;
  topic_id: number;
  side: "pro" | "con";
  content: string;
  author: string;
  del_flg: number;
  reported_flg: number;
  created_at: string;
};

type Topic = {
  id: number;
  title: string;
  description: string | null;
  del_flg: number;
  created_at: string;
};

type AdminTab = "comments" | "topics";

// ---------- コメント管理パネル ----------

function CommentsPanel({ topicMap }: { topicMap: Map<number, string> }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden" | "reported">("reported");

  const fetchComments = useCallback(async () => {
    const res = await fetch("/api/comments");
    if (res.ok) {
      const data = await res.json();
      setComments(data as Comment[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const toggleDelFlg = async (id: string, currentFlg: number) => {
    const newFlg = currentFlg === 0 ? 1 : 0;
    const res = await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, del_flg: newFlg }),
    });
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, del_flg: newFlg } : c))
      );
    }
  };

  const filtered = comments.filter((c) => {
    if (filter === "visible") return c.del_flg === 0;
    if (filter === "hidden") return c.del_flg === 1;
    if (filter === "reported") return c.reported_flg === 1 && c.del_flg === 0;
    return true;
  });

  const reportedCount = comments.filter(
    (c) => c.reported_flg === 1 && c.del_flg === 0
  ).length;

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            { key: "reported", label: "通報済み" },
            { key: "all", label: "すべて" },
            { key: "visible", label: "表示中" },
            { key: "hidden", label: "非表示" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              filter === key
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
          >
            {label}
            {key === "reported" && reportedCount > 0 && (
              <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                {reportedCount}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-gray-400">
          {filtered.length}件
        </span>
      </div>

      {loading ? (
        <p className="py-20 text-center text-sm text-gray-400">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-sm text-gray-400">
          {filter === "reported" ? "通報済みのコメントはありません" : "コメントがありません"}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((c) => (
            <li
              key={c.id}
              className={`rounded-xl border bg-white p-4 shadow-sm ${
                c.del_flg === 1 ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.side === "pro"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.side === "pro" ? "賛成" : "反対"}
                    </span>
                    <span className="truncate text-xs text-gray-500">
                      {topicMap.get(c.topic_id) ?? `topic #${c.topic_id}`}
                    </span>
                    {c.reported_flg === 1 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                        通報済み
                      </span>
                    )}
                    {c.del_flg === 1 && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
                        非表示
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-3 text-sm leading-relaxed text-gray-800">
                    {c.content}
                  </p>
                  <p className="mt-1.5 text-xs text-gray-400">
                    {c.author} · {new Date(c.created_at).toLocaleString("ja-JP")}
                  </p>
                </div>
                <button
                  onClick={() => toggleDelFlg(c.id, c.del_flg)}
                  className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    c.del_flg === 0
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                >
                  {c.del_flg === 0 ? "非表示にする" : "表示に戻す"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// ---------- トピック管理パネル ----------

function TopicsPanel() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");

  useEffect(() => {
    fetch("/api/topics")
      .then((r) => r.json())
      .then((data) => {
        setTopics(data as Topic[]);
        setLoading(false);
      });
  }, []);

  const toggleDelFlg = async (id: number, currentFlg: number) => {
    const newFlg = currentFlg === 0 ? 1 : 0;
    const res = await fetch("/api/topics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, del_flg: newFlg }),
    });
    if (res.ok) {
      setTopics((prev) =>
        prev.map((t) => (t.id === id ? { ...t, del_flg: newFlg } : t))
      );
    }
  };

  const filtered = topics.filter((t) => {
    if (filter === "visible") return t.del_flg === 0;
    if (filter === "hidden") return t.del_flg === 1;
    return true;
  });

  return (
    <>
      <div className="mb-5 flex gap-2">
        {(["all", "visible", "hidden"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
          >
            {f === "all" ? "すべて" : f === "visible" ? "表示中" : "非表示"}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-gray-400">
          {filtered.length}件
        </span>
      </div>

      {loading ? (
        <p className="py-20 text-center text-sm text-gray-400">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-sm text-gray-400">トピックがありません</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((t) => (
            <li
              key={t.id}
              className={`rounded-xl border bg-white p-4 shadow-sm ${
                t.del_flg === 1 ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {t.del_flg === 1 && (
                    <span className="mb-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
                      非表示
                    </span>
                  )}
                  <p className="font-semibold text-gray-900">{t.title}</p>
                  {t.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {t.description}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">
                    作成日時：{new Date(t.created_at).toLocaleString("ja-JP")}
                  </p>
                </div>
                <button
                  onClick={() => toggleDelFlg(t.id, t.del_flg)}
                  className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    t.del_flg === 0
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                >
                  {t.del_flg === 0 ? "非表示にする" : "表示に戻す"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// ---------- メインページ ----------

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("comments");
  const [topicMap, setTopicMap] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    fetch("/api/topics")
      .then((r) => r.json())
      .then((data: Topic[]) => {
        const map = new Map<number, string>();
        for (const t of data) map.set(t.id, t.title);
        setTopicMap(map);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">管理者パネル</h1>
        <p className="mt-0.5 text-xs text-gray-400">
          コメント・トピックの表示/非表示、通報の確認ができます
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex gap-1 rounded-lg bg-gray-200 p-1">
          {(["comments", "topics"] as AdminTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "comments" ? "コメント管理" : "トピック管理"}
            </button>
          ))}
        </div>

        {tab === "comments" ? (
          <CommentsPanel topicMap={topicMap} />
        ) : (
          <TopicsPanel />
        )}
      </main>
    </div>
  );
}
