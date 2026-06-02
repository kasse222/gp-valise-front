import { useState } from "react";
import { CheckCircle } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role: role || undefined,
          message: message || undefined,
        }),
      });
      if (res.status === 201) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.errors?.email?.[0] ?? "Une erreur est survenue.");
      }
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium">
        <CheckCircle className="h-5 w-5" />
        Inscription confirmée — on vous contacte bientôt !
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.com"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1B3A6B]"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 outline-none focus:ring-2 focus:ring-[#1B3A6B]"
      >
        <option value="">Je suis... (optionnel)</option>
        <option value="sender">Expéditeur</option>
        <option value="traveler">Voyageur</option>
        <option value="curious">Curieux</option>
      </select>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Un commentaire, une question... (optionnel)"
        rows={3}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1B3A6B] resize-none"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={!email || loading}
        className="w-full bg-[#1B3A6B] hover:bg-[#2B6CB0] disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors duration-200"
      >
        {loading ? "Envoi..." : "Rejoindre la waitlist"}
      </button>
    </div>
  );
}