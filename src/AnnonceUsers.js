import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.js";

function AnnonceUser() {
  const [annonces, setAnnonces] = useState([]);
  const [annoncesFiltered, setAnnoncesFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availability, setAvailability] = useState("Toutes");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`http://localhost:3000/annonces?userId=${userId}`)
        .then((response) => response.json())
        .then((data) => {
          const userAnnonces = data.filter(
            (annonce) => annonce.proposeur === userId
          );
          setAnnonces(userAnnonces);
          setAnnoncesFiltered(userAnnonces);
        });
    }
  }, []);

  const supprimerAnnonce = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/annonces/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.log("erreur");
      }
      setAnnoncesFiltered(
        annoncesFiltered.filter((annonce) => annonce._id !== id)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression de l'annonce :", error);
    }
  };

  const modifierAnnonce = (id) => {
    window.location.href = `/update/annonce/${id}`;
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value.trim().toLowerCase());
  };

  useEffect(() => {
    const filtered = annonces.filter(
      (annonce) =>
        annonce.titre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (availability === "Toutes" || annonce.etat === availability)
    );
    setAnnoncesFiltered(filtered);
  }, [searchTerm, availability, annonces]);

  return (
    <div className="App">
      <Navbar />
      <div className="background-image"></div>
      <div className="form-container-r">
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
        <div className="annonces-list">
          {annoncesFiltered.map((annonce) => (
            <div className="annonce-card" key={annonce._id}>
              <h3>{annonce.titre}</h3>
              <img
                src={`data:image/jpeg;base64, ${annonce.images}`}
                alt={annonce.titre}
                className="annonce-image"
              />
              <div className="annonce-desc">
                <p>{annonce.description}</p>
              </div>
              <p>Disponibilité : {annonce.etat} </p>
              <div className="buttons-container">
                <button onClick={() => modifierAnnonce(annonce._id)}>
                  Modifier
                </button>
                <button onClick={() => supprimerAnnonce(annonce._id)}>
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

export default AnnonceUser;
