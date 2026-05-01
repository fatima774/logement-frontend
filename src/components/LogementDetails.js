import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const API_URL = "http://localhost:3001";

// Images de démonstration si aucun logement n'a d'image
const demoImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=60"
];

function AvisSection({ id_logement }) {
  const [avis, setAvis] = useState([]);
  const [contenu, setContenu] = useState("");
  const [note, setNote] = useState(5);

  // Récupérer le token depuis localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/avis/${id_logement}`)
      .then(res => res.json())
      .then(data => setAvis(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [id_logement]);

  const publierAvis = async () => {
    if (!token) {
      alert("Connecte-toi d'abord !");
      return;
    }
    if (!contenu.trim()) {
      alert("Écris un avis avant de publier.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/avis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id_logement, contenu, note })
      });

      if (res.ok) {
        setContenu("");
        const data = await fetch(`${API_URL}/avis/${id_logement}`).then(r => r.json());
        setAvis(Array.isArray(data) ? data : []);
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de la publication");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau lors de la publication");
    }
  };

  return (
    <div className="avis-section" style={{ marginTop: "20px" }}>
      <h4>Commentaires</h4>
      <ul>
        {avis.length === 0 ? (
          <li>Aucun avis</li>
        ) : (
          avis.map(a => (
            <li key={a.id_avis} style={{ marginBottom: "10px" }}>
              <strong>{a.nom} {a.prenom}</strong> — {a.note}/5<br />
              {a.contenu}
            </li>
          ))
        )}
      </ul>

      <textarea
        value={contenu}
        onChange={e => setContenu(e.target.value)}
        placeholder="Écris ton avis..."
        style={{ width: "100%", marginTop: "10px" }}
      />
      <select
        value={note}
        onChange={e => setNote(Number(e.target.value))}
        style={{ marginTop: "10px" }}
      >
        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <button onClick={publierAvis} style={{ marginLeft: "10px" }}>Publier</button>
    </div>
  );
}

function LogementDetails() {
  const { id } = useParams();   // récupère l’ID depuis l’URL
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/logements/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors du chargement du logement");
        return res.json();
      })
      .then(data => setDetails(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!details) return <p>Chargement...</p>;

  // Gestion des photos
  const photos = details.image
    ? [`${API_URL}/uploads/${details.image}`]
    : [demoImages[0]];

  return (
    <div style={{ padding: "20px" }}>
      <h2>{details.titre}</h2>
      <p>{details.ville} - {details.prix}€</p>
      <p>{details.description}</p>

      <h3>Photos</h3>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {photos.map((photo, idx) => (
          <img
            key={idx}
            src={photo}
            alt="Logement"
            style={{ width: "200px", margin: "10px", borderRadius: "8px", objectFit: "cover" }}
          />
        ))}
      </div>

      {/* Section Avis */}
      <AvisSection id_logement={details.id_logement} />
    </div>
  );
}

export default LogementDetails;
