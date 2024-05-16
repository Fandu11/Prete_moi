import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.js";

function DemandeUser() {
  const [demandes, setDemandes] = useState([]);
  const [demandesFiltered, setDemandesFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availability, setAvailability] = useState("Toutes");

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur connecté depuis le stockage local
    const userId = localStorage.getItem("userId");
    if (userId) {
      // Charger les demandes de l'utilisateur connecté depuis le serveur
      fetch(`http://localhost:3000/demandes?demandeur=${userId}`)
        .then((response) => response.json())
        .then((data) => {
          // Filtrer les demandes pour n'inclure que celles de l'utilisateur connecté
          const userDemandes = data.filter(
            (demande) => demande.demandeur === userId
          );
          setDemandes(userDemandes);
          setDemandesFiltered(userDemandes); // Initialiser demandesFiltered avec les demandes filtrées
        });
    }
  }, []);

  const supprimerDemande = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/demandes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.log("erreur");
      }
      // Supprimer la demande du tableau demandesFiltered
      setDemandesFiltered(
        demandesFiltered.filter((demande) => demande._id !== id)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression de la demande :", error);
    }
  };

  const modifierDemande = (id) => {
    // Rediriger l'utilisateur vers la page de modification de la demande
    window.location.href = `/update/demande/${id}`;
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value.trim().toLowerCase());
  };

  useEffect(() => {
    const filtered = demandes.filter(
      (demande) =>
        demande.titre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (availability === "Toutes" || demande.etat === availability)
    );
    setDemandesFiltered(filtered);
  }, [searchTerm, availability, demandes]);

  return (
    <div className="App">
      {/* Navigation bar */}
      <Navbar />
      {/* Arrière plan */}
      <div className="background-image"></div>
      <div className="form-container-r">
        {/* Afficher la barre de recherche */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={handleInputChange}
            className="search-input"
          />
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="availability-select"
          >
            <option value="Toutes">Toutes</option>
            <option value="disponible">Disponible</option>
            <option value="emprunté">Emprunté</option>
            <option value="indisponible">Indisponible</option>
          </select>
        </div>
        {/* Afficher les données */}
        <div className="annonces-list">
          {demandesFiltered.map((demande) => (
            <div className="annonce-card" key={demande._id}>
              <h3>{demande.titre}</h3>
              <div className="annonce-desc">
                <p>{demande.description}</p>
              </div>
              <div className="buttons-container">
                <button onClick={() => modifierDemande(demande._id)}>
                  Modifier
                </button>
                <button onClick={() => supprimerDemande(demande._id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DemandeUser;
