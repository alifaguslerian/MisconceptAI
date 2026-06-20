import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

const STATUS_CONFIG = {
  correct: {
    label: "Benar",
    bg: "bg-correct/15",
    text: "text-correct",
    border: "border-correct/25",
    dot: "bg-correct",
  },
  partial: {
    label: "Parsial",
    bg: "bg-partial/15",
    text: "text-partial",
    border: "border-partial/25",
    dot: "bg-partial",
  },
  incorrect: {
    label: "Keliru",
    bg: "bg-incorrect/15",
    text: "text-incorrect",
    border: "border-incorrect/25",
    dot: "bg-incorrect",
  },
  missing: {
    label: "Kosong",
    bg: "bg-surface2",
    text: "text-missing",
    border: "border-border",
    dot: "bg-missing",
  },
};

function HeatmapCell({ concept, status, evidence, suggestion }) {
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.missing;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`w-full h-12 rounded border ${cfg.bg} ${cfg.border} flex items-center justify-center cursor-default transition-all`}
      >
        <span className={`text-xs font-mono font-medium ${cfg.text}`}>
          {cfg.label}
        </span>
      </div>

      {/* Tooltip */}
      {hovered && (evidence || suggestion) && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-surface2 border border-border rounded p-3 shadow-xl pointer-events-none">
          <p className={`text-xs font-mono font-medium ${cfg.text} mb-1`}>
            {concept}
          </p>
          {evidence && (
            <p className="text-xs text-gray-400 mb-2 italic">"{evidence}"</p>
          )}
          {suggestion && (
            <p className="text-xs text-gray-300 leading-relaxed">
              {suggestion}
            </p>
          )}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border`}
          />
        </div>
      )}
    </div>
  );
}

function MisconceptionBadge({ type }) {
  if (!type) return null;
  const map = {
    factual_error: {
      label: "Faktual Keliru",
      cls: "bg-incorrect/10 text-incorrect border-incorrect/20",
    },
    partial_understanding: {
      label: "Parsial",
      cls: "bg-partial/10 text-partial border-partial/20",
    },
    overgeneralization: {
      label: "Overgeneralisasi",
      cls: "bg-partial/10 text-partial border-partial/20",
    },
    conceptual_confusion: {
      label: "Konfusi Konsep",
      cls: "bg-incorrect/10 text-incorrect border-incorrect/20",
    },
    missing_concept: {
      label: "Konsep Hilang",
      cls: "bg-surface2 text-missing border-border",
    },
    underestimation: {
      label: "Meremehkan",
      cls: "bg-partial/10 text-partial border-partial/20",
    },
  };
  const m = map[type] ?? {
    label: type,
    cls: "bg-surface2 text-missing border-border",
  };
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${m.cls}`}>
      {m.label}
    </span>
  );
}

export default function SessionResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/sessions/${id}/analyze/`)
      .then((r) => {
        setData(r.data);
        if (r.data.results.length > 0) setSelected(r.data.results[0]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-missing font-mono text-sm">
        memuat hasil analisis...
      </div>
    );

  if (!data || data.results.length === 0)
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-500 font-mono text-sm mb-4">
          Belum ada hasil analisis untuk sesi ini.
        </p>
        <button
          onClick={() => navigate(`/sessions/${id}/answers`)}
          className="text-accent text-sm font-mono hover:underline"
        >
          ← Kembali ke input jawaban
        </button>
      </div>
    );

  const concepts = data.concepts.map((c) => c.trim());

  // Build heatmap matrix: student → concept → result
  const matrix = data.results.map(r => {
    const conceptMap = {}
    r.analysis.concepts.forEach(c => {
      conceptMap[c.concept_name.trim().toLowerCase()] = c
    })
    return { student: r.student_name, conceptMap }
  })

  // Summary stats
  const allConcepts = data.results.flatMap((r) => r.analysis.concepts);
  const stats = {
    correct: allConcepts.filter((c) => c.status === "correct").length,
    partial: allConcepts.filter((c) => c.status === "partial").length,
    incorrect: allConcepts.filter((c) => c.status === "incorrect").length,
    missing: allConcepts.filter((c) => c.status === "missing").length,
  };
  const total = allConcepts.length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-missing uppercase tracking-widest mb-1">
            Hasil Analisis · Sesi #{id}
          </p>
          <h1 className="font-sora font-bold text-2xl text-white">
            {data.session_name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {data.results.length} mahasiswa · {concepts.length} konsep
          </p>
        </div>
        <button
          onClick={() => navigate(`/sessions/${id}/answers`)}
          className="text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Input Jawaban
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Benar", value: stats.correct, cls: "text-correct" },
          { label: "Parsial", value: stats.partial, cls: "text-partial" },
          { label: "Keliru", value: stats.incorrect, cls: "text-incorrect" },
          { label: "Kosong", value: stats.missing, cls: "text-missing" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-surface border border-border rounded p-4"
          >
            <p className={`font-sora font-bold text-2xl ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {s.label} · {total > 0 ? Math.round((s.value / total) * 100) : 0}%
            </p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-surface border border-border rounded p-5 mb-8 overflow-x-auto">
        <p className="text-xs font-mono text-missing uppercase tracking-widest mb-4">
          Heatmap Konsep × Mahasiswa
        </p>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left pr-4 pb-3 w-36">
                <span className="text-xs font-mono text-gray-600">
                  Mahasiswa
                </span>
              </th>
              {concepts.map((c) => (
                <th key={c} className="pb-3 px-1 min-w-28">
                  <span className="text-xs font-mono text-gray-400 block text-center leading-tight">
                    {c}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(({ student, conceptMap }) => (
              <tr key={student}>
                <td className="pr-4 py-1">
                  <button
                    onClick={() => {
                      const found = data.results.find(
                        (r) => r.student_name === student,
                      );
                      if (found) setSelected(found);
                    }}
                    className={`text-sm text-left font-medium transition-colors hover:text-accent ${
                      selected?.student_name === student
                        ? "text-accent"
                        : "text-gray-300"
                    }`}
                  >
                    {student}
                  </button>
                </td>
                {concepts.map((c) => {
                  const res = conceptMap[c.toLowerCase()]
                  return (
                    <td key={c} className="py-1 px-1">
                      <HeatmapCell
                        concept={c}
                        status={res?.status ?? "missing"}
                        evidence={res?.evidence}
                        suggestion={res?.suggestion}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-600 font-mono mt-3">
          hover cell untuk lihat evidence & saran remedial
        </p>
      </div>

      {/* Detail mahasiswa */}
      {selected && (
        <div className="bg-surface border border-border rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono text-missing uppercase tracking-widest">
              Detail · {selected.student_name}
            </p>
            <span className="text-xs font-mono text-gray-600">
              {selected.analyzed_at?.slice(0, 10)}
            </span>
          </div>

          {/* Summary */}
          <div className="bg-surface2 border border-border rounded px-4 py-3 mb-5">
            <p className="text-xs font-mono text-missing mb-1">Ringkasan AI</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {selected.analysis.summary}
            </p>
          </div>

          {/* Per-concept breakdown */}
          <div className="space-y-3">
            {selected.analysis.concepts.map((c) => {
              const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.missing;
              return (
                <div
                  key={c.concept_name}
                  className={`border ${cfg.border} rounded p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className="text-sm font-mono font-medium text-white">
                      {c.concept_name}
                    </span>
                    <span className={`text-xs font-mono ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    <MisconceptionBadge type={c.misconception_type} />
                  </div>
                  {c.evidence && (
                    <p className="text-xs text-gray-500 italic mb-1.5">
                      "{c.evidence}"
                    </p>
                  )}
                  {c.suggestion && (
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {c.suggestion}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
