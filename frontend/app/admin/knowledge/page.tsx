"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

const DOMAINS = [
  { value: "all", label: "All domains" },
  { value: "school_bullying", label: "🏫 School / College" },
  { value: "heartbreak", label: "💔 Heartbreak" },
  { value: "domestic", label: "🏠 Family Conflict" },
  { value: "financial", label: "💸 Financial Stress" },
  { value: "workplace", label: "💼 Workplace" },
];

type Doc = { name: string; domain: string; chunks: number; created_at: string };

export default function KnowledgePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [token, setToken] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [domain, setDomain] = useState("all");
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ name: string; chunks: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      setToken(data.session.access_token);
      fetchDocs(data.session.access_token);
    });
  }, []);

  async function fetchDocs(t: string) {
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge/documents`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (res.ok) setDocs(await res.json());
    setLoading(false);
  }

  async function handleUpload(file: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    setUploadResult(null);

    const form = new FormData();
    form.append("file", file);
    form.append("domain", domain);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (res.ok) {
      const data = await res.json();
      setUploadResult(data);
      fetchDocs(token);
    } else {
      const err = await res.json();
      setError(err.detail || "Upload failed");
    }
    setUploading(false);
  }

  async function handleDelete(docName: string) {
    if (!confirm(`Delete "${docName}"?`)) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge/documents/${encodeURIComponent(docName)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDocs(token);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Logo size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">Knowledge Base</p>
              <p className="text-white/60 text-xs">Upload documents to improve AI responses</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push("/admin")} className="text-white/70 hover:text-white text-xs">← Dashboard</button>
            <button onClick={() => router.push("/teen/support")} className="text-white/70 hover:text-white text-xs">Chat →</button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Upload section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Upload Document</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 block mb-2">Apply to domain</label>
              <select value={domain} onChange={e => setDomain(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                "All domains" — document will be used for every conversation
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}
            >
              {uploading ? (
                <div>
                  <div className="text-3xl mb-2 animate-spin inline-block">⚙️</div>
                  <p className="text-slate-600 text-sm font-medium">Processing document…</p>
                  <p className="text-slate-400 text-xs mt-1">Extracting text, chunking, and embedding. This may take a minute.</p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-3">📄</p>
                  <p className="text-slate-700 font-medium text-sm">Drop a file here or click to browse</p>
                  <p className="text-slate-400 text-xs mt-1">Supports PDF, TXT, MD files</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />

            {uploadResult && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                ✅ <strong>{uploadResult.name}</strong> uploaded — {uploadResult.chunks} chunks created and indexed.
              </div>
            )}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                ❌ {error}
              </div>
            )}
          </div>
        </section>

        {/* Documents list */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
            Indexed Documents ({docs.length})
          </h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Loading…</p>
          ) : docs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-slate-600 font-medium">No documents yet</p>
              <p className="text-slate-400 text-sm mt-1">Upload your first document above to enhance AI responses</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Document</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Domain</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Chunks</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Added</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📄</span>
                          <span className="font-medium text-slate-800 text-sm">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${doc.domain === "all" ? "bg-slate-100 text-slate-600" : "bg-indigo-50 text-indigo-600"}`}>
                          {DOMAINS.find(d => d.value === doc.domain)?.label ?? doc.domain}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{doc.chunks} chunks</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(doc.name)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Tips */}
        <section className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
          <h3 className="text-sm font-semibold text-indigo-800 mb-3">📚 Recommended documents to upload</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-indigo-700">
            {[
              ["All domains", "CBT thought records, DBT distress tolerance"],
              ["Workplace", "Burnout recovery guide, work boundary setting"],
              ["Heartbreak", "Healthy relationship patterns, grief stages"],
              ["Financial", "Financial anxiety management, debt stress coping"],
              ["School", "Bullying response guide, peer pressure strategies"],
              ["Family", "Conflict resolution techniques, NVC communication"],
            ].map(([domain, desc]) => (
              <div key={domain} className="flex gap-2">
                <span className="font-semibold w-24 flex-shrink-0">{domain}:</span>
                <span className="opacity-80">{desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
