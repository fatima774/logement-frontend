import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import "../components/Auth.css";

export default function VerifyEmail() {
  const [message, setMessage] = useState("Verification en cours...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("Token manquant.");
      return;
    }

    fetch(`http://localhost:3001/verify?token=${encodeURIComponent(token)}`)
      .then((res) => res.text())
      .then((msg) => setMessage(msg))
      .catch(() => setMessage("Erreur serveur"));
  }, []);

  return (
    <AppShell title="Verification de l'e-mail" backTo="/login">
      <div className="auth-card">
        <div className="auth-success">{message}</div>
      </div>
    </AppShell>
  );
}
