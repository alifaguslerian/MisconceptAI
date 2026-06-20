import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

export default function SessionNew() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    question: "",
    ideal_answer: "",
    concepts: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.question || !form.ideal_answer || !form.concepts) {
      setError("Semua field wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/sessions/`, form);
      navigate(`/sessions/${res.data.id}/answers`);
    } catch (e) {
      setError("Gagal membuat sesi. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono text-missing uppercase tracking-widest mb-1">
          Sesi Baru
        </p>
        <h1 className="font-sora font-bold text-2xl text-white">
          Buat Sesi Analisis
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Isi soal, konsep yang diuji, dan jawaban ideal sebagai acuan analisis
          AI.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Nama Sesi */}
        <div>
          <label className="block text-xs font-mono text-missing uppercase tracking-widest mb-2">
            Nama Sesi
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="cth: Kuis Rekursi Minggu 3"
            className="w-full bg-surface2 border border-border rounded px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Soal Essay */}
        <div>
          <label className="block text-xs font-mono text-missing uppercase tracking-widest mb-2">
            Soal Essay
          </label>
          <textarea
            name="question"
            value={form.question}
            onChange={handleChange}
            rows={3}
            placeholder="Tuliskan soal essay yang diberikan kepada mahasiswa..."
            className="w-full bg-surface2 border border-border rounded px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        {/* Konsep */}
        <div>
          <label className="block text-xs font-mono text-missing uppercase tracking-widest mb-2">
            Konsep yang Diuji
          </label>
          <input
            name="concepts"
            value={form.concepts}
            onChange={handleChange}
            placeholder="rekursi, base case, stack overflow, call stack"
            className="w-full bg-surface2 border border-border rounded px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors font-mono"
          />
          <p className="text-xs text-gray-600 mt-1.5">
            Pisahkan dengan koma. Urutan menentukan kolom heatmap.
          </p>
        </div>

        {/* Jawaban Ideal */}
        <div>
          <label className="block text-xs font-mono text-missing uppercase tracking-widest mb-2">
            Jawaban Ideal
          </label>
          <textarea
            name="ideal_answer"
            value={form.ideal_answer}
            onChange={handleChange}
            rows={5}
            placeholder="Tuliskan jawaban ideal / kunci jawaban yang akan dijadikan acuan AI..."
            className="w-full bg-surface2 border border-border rounded px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors resize-none font-mono text-xs leading-relaxed"
          />
        </div>

        {/* Error */}
        {error && <p className="text-xs text-incorrect font-mono">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-accent text-white font-medium text-sm rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Membuat sesi..." : "Buat Sesi & Lanjut Input Jawaban →"}
        </button>
      </div>
    </div>
  );
}
