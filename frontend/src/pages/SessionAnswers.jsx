import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

function StatusBadge({ status }) {
  const map = {
    correct: {
      label: "Benar",
      cls: "bg-correct/10 text-correct border-correct/20",
    },
    partial: {
      label: "Parsial",
      cls: "bg-partial/10 text-partial border-partial/20",
    },
    incorrect: {
      label: "Keliru",
      cls: "bg-incorrect/10 text-incorrect border-incorrect/20",
    },
    missing: {
      label: "Kosong",
      cls: "bg-missing/10 text-missing border-missing/20",
    },
  };
  const s = map[status] ?? map.missing;
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function SessionAnswers() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [form, setForm] = useState({ student_name: "", answer_text: "" });
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API}/sessions/${id}`).then((r) => setSession(r.data));
    fetchAnswers();
  }, [id]);

  const fetchAnswers = async () => {
    const res = await axios.get(`${API}/sessions/${id}/answers/`);
    setAnswers(res.data);
  };

  const handleAdd = async () => {
    if (!form.student_name || !form.answer_text) {
      setError("Nama dan jawaban wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/sessions/${id}/answers/`, form);
      setForm({ student_name: "", answer_text: "" });
      fetchAnswers();
    } catch {
      setError("Gagal menambah jawaban.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (answerId) => {
    await axios.delete(`${API}/sessions/${id}/answers/${answerId}`);
    fetchAnswers();
  };

  const handleAnalyze = async () => {
    if (answers.length === 0) {
      setError("Tambahkan minimal satu jawaban dulu.");
      return;
    }
    setAnalyzing(true);
    setError("");
    try {
      await axios.post(`${API}/sessions/${id}/analyze/`);
      navigate(`/sessions/${id}/results`);
    } catch {
      setError("Analisis gagal. Cek koneksi dan API key.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono text-missing uppercase tracking-widest mb-1">
          Sesi #{id}
        </p>
        <h1 className="font-sora font-bold text-2xl text-white">
          {session?.name ?? "Memuat..."}
        </h1>
        {session && (
          <p className="text-xs font-mono text-gray-600 mt-2 line-clamp-2">
            {session.question}
          </p>
        )}
      </div>

      {/* Form tambah jawaban */}
      <div className="bg-surface border border-border rounded p-5 mb-6">
        <p className="text-xs font-mono text-missing uppercase tracking-widest mb-4">
          Tambah Jawaban Mahasiswa
        </p>
        <div className="flex gap-3 mb-3">
          <input
            value={form.student_name}
            onChange={(e) => setForm({ ...form, student_name: e.target.value })}
            placeholder="Nama mahasiswa"
            className="w-48 bg-surface2 border border-border rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : "+ Tambah"}
          </button>
        </div>
        <textarea
          value={form.answer_text}
          onChange={(e) => setForm({ ...form, answer_text: e.target.value })}
          rows={4}
          placeholder="Paste jawaban essay mahasiswa di sini..."
          className="w-full bg-surface2 border border-border rounded px-3 py-2.5 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
        />
        {error && (
          <p className="text-xs text-incorrect font-mono mt-2">{error}</p>
        )}
      </div>

      {/* Daftar jawaban */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-mono text-missing uppercase tracking-widest">
            Jawaban Masuk ({answers.length})
          </p>
        </div>

        {answers.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-sm font-mono border border-border rounded border-dashed">
            belum ada jawaban
          </div>
        ) : (
          <div className="space-y-3">
            {answers.map((a) => (
              <div
                key={a.id}
                className="bg-surface border border-border rounded p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-missing">
                      #{a.id}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {a.student_name}
                    </span>
                    {a.analysis_result && <StatusBadge status="correct" />}
                    {a.analysis_result && (
                      <span className="text-xs font-mono text-correct">
                        ✓ sudah dianalisis
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-xs text-gray-600 hover:text-incorrect transition-colors font-mono"
                  >
                    hapus
                  </button>
                </div>
                <p className="text-xs font-mono text-gray-500 leading-relaxed line-clamp-3">
                  {a.answer_text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tombol analisis */}
      <div className="border-t border-border pt-5">
        <button
          onClick={handleAnalyze}
          disabled={analyzing || answers.length === 0}
          className="w-full py-3 bg-accent text-white font-medium text-sm rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {analyzing
            ? "Menganalisis... (tunggu beberapa detik)"
            : `Analisis ${answers.length} Jawaban dengan AI →`}
        </button>
        <p className="text-xs text-gray-600 font-mono text-center mt-2">
          Proses analisis memakan waktu ~3–5 detik per mahasiswa
        </p>
      </div>
    </div>
  );
}
