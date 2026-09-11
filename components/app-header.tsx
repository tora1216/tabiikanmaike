"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Cog6ToothIcon, UserCircleIcon, XMarkIcon,
  ArrowUpOnSquareIcon, PlusIcon, PencilSquareIcon,
  ChevronUpIcon, ChevronDownIcon, TrashIcon,
} from "@heroicons/react/24/outline";
import { APP_VERSION, CHANGELOG } from "@/lib/changelog";
import { PlaceCategory, DEFAULT_PLACE_CATEGORIES, MAX_PLACE_CATEGORIES, loadPlaceCategories, savePlaceCategories } from "@/lib/categories";

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-h-[90vh] overflow-x-hidden overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-2xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="ml-2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// トップページ・旅程ページ共通のヘッダー（設定・プロフィール）
// extra: 旅程ページの「共有」ボタンなど、ページ固有の追加ボタン
// leftContent: 左側の要素を差し替えたい場合（旅程ページなどの「戻る」ボタンなど）。省略時はロゴ＋アプリ名
export function AppHeader({ extra, leftContent }: { extra?: React.ReactNode; leftContent?: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  useEffect(() => {
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    const seen = localStorage.getItem("seen_version");
    if (seen !== APP_VERSION) setHasUnread(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const openSettings = () => {
    setSettingsOpen(true);
    setHasUnread(false);
    localStorage.setItem("seen_version", APP_VERSION);
  };
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  // 設定セクション折りたたみ
  const [appSettingsCollapsed, setAppSettingsCollapsed] = useState(false);
  const [catCollapsed, setCatCollapsed] = useState(true);
  const [changelogCollapsed, setChangelogCollapsed] = useState(false);

  // カテゴリ管理
  const [placeCategories, setPlaceCategories] = useState<PlaceCategory[]>(DEFAULT_PLACE_CATEGORIES);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catEditIdx, setCatEditIdx] = useState<number | null>(null);
  const [catEditIcon, setCatEditIcon] = useState("");
  const [catEditLabel, setCatEditLabel] = useState("");
  const [catDeleteConfirm, setCatDeleteConfirm] = useState<(() => void) | null>(null);

  useEffect(() => {
    try { setPlaceCategories(loadPlaceCategories()); } catch { /* ignore */ }
  }, []);

  const moveCat = (idx: number, dir: -1 | 1) => {
    setPlaceCategories(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      savePlaceCategories(next);
      return next;
    });
  };

  const deleteCat = (idx: number) => {
    setPlaceCategories(prev => {
      const next = prev.filter((_, i) => i !== idx);
      savePlaceCategories(next);
      return next;
    });
  };

  const openCatDialog = (idx: number | null) => {
    setCatEditIcon(idx === null ? "" : placeCategories[idx].icon);
    setCatEditLabel(idx === null ? "" : placeCategories[idx].label);
    setCatEditIdx(idx);
    setCatDialogOpen(true);
  };

  const saveCat = () => {
    const label = catEditLabel.trim();
    if (!label) return;
    const icon = catEditIcon.trim() || "📍";
    setPlaceCategories(prev => {
      const next = catEditIdx === null
        ? [...prev, { icon, label }]
        : prev.map((c, i) => i === catEditIdx ? { icon, label } : c);
      savePlaceCategories(next);
      return next;
    });
    setCatDialogOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:bg-slate-800/90 dark:border-slate-700">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          {leftContent ?? (
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🐯</span>
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">旅のしおり</span>
            </Link>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openSettings}
              className="relative rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              aria-label="設定"
            >
              <Cog6ToothIcon className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
            {extra}
            <Link href="/profile" className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white">
              <UserCircleIcon className="h-7 w-7" />
            </Link>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {settingsOpen && (
        <Modal title="設定" onClose={() => setSettingsOpen(false)}>
          <div className="mt-5 space-y-5">
            {/* Add to Home Screen - only show when not installed and supported */}
            {!isInstalled && (isIOS || deferredPrompt) && (
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpOnSquareIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-bold text-slate-800 dark:text-white">ホーム画面に追加</span>
              </div>
              {isIOS ? (
                <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">1</span>
                    <span>画面下部の共有ボタン <span className="inline-flex items-baseline gap-0.5 font-semibold">(<ArrowUpOnSquareIcon className="h-3.5 w-3.5 inline" />) </span>をタップ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">2</span>
                    <span>「ホーム画面に追加」を選択</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">3</span>
                    <span>「追加」をタップして完了</span>
                  </li>
                </ol>
              ) : (
                <button
                  onClick={handleInstall}
                  className="w-full rounded-xl bg-[#22C55E] py-2.5 text-sm font-semibold text-white transition hover:bg-green-400"
                >
                  ホーム画面にインストール
                </button>
              )}
            </div>
            )}

            {/* アプリ設定 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                type="button"
                aria-label={appSettingsCollapsed ? "展開する" : "折りたたむ"}
                onClick={() => setAppSettingsCollapsed(v => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-bold text-slate-800 dark:text-white">アプリ設定</span>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${appSettingsCollapsed ? "" : "rotate-180"}`} />
              </button>
              {!appSettingsCollapsed && (
                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-300">ダークモード</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDark}
                    aria-label="ダークモード切替"
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${isDark ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isDark ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              )}
            </div>

            {/* カテゴリ管理 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                type="button"
                aria-label={catCollapsed ? "展開する" : "折りたたむ"}
                onClick={() => setCatCollapsed(v => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-bold text-slate-800 dark:text-white">カテゴリ設定</span>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${catCollapsed ? "" : "rotate-180"}`} />
              </button>
              {!catCollapsed && (
                <div className="border-t border-slate-200 px-4 pb-4 pt-3 dark:border-slate-700">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">最大{MAX_PLACE_CATEGORIES}個</span>
                    <button
                      type="button"
                      onClick={() => openCatDialog(null)}
                      disabled={placeCategories.length >= MAX_PLACE_CATEGORIES}
                      className="flex items-center gap-1 rounded-lg bg-indigo-500 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />追加
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {placeCategories.map((cat, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-700/50">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{cat.label}</span>
                        <div className="flex items-center gap-0.5">
                          <button type="button" aria-label="上へ移動" onClick={() => moveCat(idx, -1)} disabled={idx === 0} className="rounded p-1 text-slate-400 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-slate-600">
                            <ChevronUpIcon className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" aria-label="下へ移動" onClick={() => moveCat(idx, 1)} disabled={idx === placeCategories.length - 1} className="rounded p-1 text-slate-400 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-slate-600">
                            <ChevronDownIcon className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" aria-label="編集" onClick={() => openCatDialog(idx)} className="rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600">
                            <PencilSquareIcon className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" aria-label="削除" onClick={() => setCatDeleteConfirm(() => () => deleteCat(idx))} className="rounded p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPlaceCategories(DEFAULT_PLACE_CATEGORIES); savePlaceCategories(DEFAULT_PLACE_CATEGORIES); }}
                    className="mt-3 text-[11px] text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    デフォルトに戻す
                  </button>
                </div>
              )}
            </div>

            {/* バージョン・アップデート情報 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                type="button"
                aria-label={changelogCollapsed ? "展開する" : "折りたたむ"}
                onClick={() => setChangelogCollapsed(v => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">アップデート情報</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400">v{APP_VERSION}</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${changelogCollapsed ? "" : "rotate-180"}`} />
              </button>
              {!changelogCollapsed && (
                <div className="border-t border-slate-200 px-4 pb-4 pt-3 dark:border-slate-700">
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {CHANGELOG.map((entry, i) => (
                      <div key={entry.version}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${i === 0 ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>
                            v{entry.version}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{entry.title}</span>
                          <span className="ml-auto text-[10px] text-slate-400">{entry.date}</span>
                        </div>
                        <ul className="space-y-0.5 pl-2">
                          {entry.changes.map((c, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                              {c}
                            </li>
                          ))}
                        </ul>
                        {i < CHANGELOG.length - 1 && <div className="mt-3 border-b border-slate-100 dark:border-slate-700" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ─── カテゴリ削除確認ダイアログ ─────────────────────────────────────── */}
      {catDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6" onClick={() => setCatDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">カテゴリを削除</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">このカテゴリを削除しますか？</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCatDeleteConfirm(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">
                キャンセル
              </button>
              <button type="button" onClick={() => { catDeleteConfirm(); setCatDeleteConfirm(null); }} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600">
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── カテゴリ追加・編集ダイアログ ───────────────────────────────────── */}
      {catDialogOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6" onClick={() => setCatDialogOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">
              {catEditIdx === null ? "カテゴリを追加" : "カテゴリを編集"}
            </h3>
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={catEditIcon}
                  onChange={(e) => {
                    const clusters = [...new Intl.Segmenter().segment(e.target.value)]
                      .map(s => s.segment)
                      .filter(s => /\p{Extended_Pictographic}/u.test(s));
                    setCatEditIcon(clusters[0] ?? "");
                  }}
                  placeholder="🍜"
                  maxLength={2}
                  className="w-12 shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-center text-lg outline-none ring-indigo-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                <input
                  type="text"
                  value={catEditLabel}
                  onChange={(e) => setCatEditLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveCat(); }}
                  placeholder="例）ラーメン"
                  maxLength={10}
                  autoFocus
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none ring-indigo-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setCatDialogOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">
                キャンセル
              </button>
              <button type="button" onClick={saveCat} disabled={!catEditLabel.trim()} className="flex-1 rounded-xl bg-indigo-500 py-2.5 text-sm font-bold text-white hover:bg-indigo-600 disabled:opacity-40">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
