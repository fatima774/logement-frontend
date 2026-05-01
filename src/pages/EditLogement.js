import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import "../components/Auth.css";
import "./AddPage.css";
import { API_URL } from "../data/api";

function isOwner(logement, authUser) {
  const uid = authUser?.id_user || authUser?.id;
  if (!uid || !logement) return false;

  return (
    String(logement.id_user) === String(uid) ||
    String(logement.user_id) === String(uid) ||
    String(logement.id_user_posteur) === String(uid) ||
    String(logement.owner_id) === String(uid)
  );
}

export default function EditLogement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authUser = JSON.parse(localStorage.getItem("authUser") || "null");

  const [titre, setTitre] = useState("");
  const [ville, setVille] = useState("");
  const [universite, setUniversite] = useState("");
  const [type, setType] = useState("");
  const [adresse, setAdresse] = useState("");
  const [prix, setPrix] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/logements/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isOwner(data, authUser)) {
          setError("Vous ne pouvez modifier que votre propre logement.");
          setLoading(false);
          return;
        }
        setTitre(data.titre || "");
        setVille(data.ville || "");
        setUniversite(data.universite || "");
        setType(data.type || "");
        setAdresse(data.adresse || "");
        setPrix(data.prix || "");
        setDescription(data.description || "");
        setCurrentImage(data.image || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Erreur lors du chargement du logement");
        setLoading(false);
      });
  }, [id, authUser]);

  if (!token) {
    navigate("/login");
    return null;
  }

  const handleFileChange = (e) => {
    setImage(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("titre", titre);
    formData.append("ville", ville);
    formData.append("universite", universite);
    formData.append("type", type);
    formData.append("adresse", adresse);
    formData.append("prix", prix);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`${API_URL}/logements/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur API");
      }

      alert("Logement modifie avec succes");
      navigate(`/logement/${id}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Modifier le logement" backTo="/mes-logements">
        <div className="app-shell-empty">Chargement...</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Modifier le logement"
      subtitle="modifiez les informations de votre logement"
      backTo={`/logement/${id}`}
    >
      <div className="auth-card add-card">
        {error ? <div className="auth-error">{error}</div> : null}

        {error === "Vous ne pouvez modifier que votre propre logement." ? null : (
          <>
            {currentImage && !image ? (
              <div className="add-preview-grid">
                <img
                  src={`${API_URL}/uploads/${currentImage}`}
                  alt="Logement actuel"
                  className="add-preview-image"
                />
              </div>
            ) : null}

            <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Titre du logement *</label>
            <input
              className="auth-input"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Titre"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ville *</label>
            <input
              className="auth-input"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Ville"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Universite</label>
            <input
              className="auth-input"
              value={universite}
              onChange={(e) => setUniversite(e.target.value)}
              placeholder="Universite"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type de logement</label>
            <input
              className="auth-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Type"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input
              className="auth-input"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Adresse"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Prix (EUR) *</label>
            <input
              className="auth-input"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="Prix"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Changer la photo</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="auth-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Description"
            />
          </div>

          <button className="auth-btn" type="submit" disabled={saving}>
            {saving ? "Modification en cours..." : "Modifier le logement"}
          </button>
            </form>
          </>
        )}
      </div>
    </AppShell>
  );
}
