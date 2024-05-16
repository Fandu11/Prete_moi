// Demande.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.js";

function DemandeCreatePage() {
  const navigate = useNavigate();

  const [iddemandeur, setIdd] = useState("");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");

  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur connecté depuis le stockage local
    const userId = localStorage.getItem("userId");
    if (userId) {
      setIdd(userId);
    }
  }, []);

  const sendDataToDatabase = async (userData) => {
    try {
      const response = await fetch("http://localhost:3000/demandes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(
          "Erreur lors de l'envoi des données à la base de données."
        );
      }

      const data = await response.json();
      console.log("Données enregistrées :", data);
      return true;
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi des données à la base de données :",
        error
      );
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    // Vérification des champs obligatoires avant la soumission du formulaire
    if (titre && description) {
      try {
        // Envoi des données à la base de données
        const success = await sendDataToDatabase({
          demandeur: iddemandeur,
          titre,
          date: new Date(),
          description,
        });

        if (success) {
          alert("Demande créé avec succès !");
          // Rediriger vers la page de connexion après un délai
          setTimeout(() => {
            navigate("/create/demande");
          }, 100); // Redirige après 0.1 seconde
        } else {
          alert("Erreur lors de la création du compte.");
        }

        // Ajoutez votre logique de traitement du formulaire ici
        console.log("Titre:", titre);
        console.log("Description:", description);

        setTitre("");
        setDescription("");
      } catch (error) {
        console.error("Erreur lors du hachage du mot de passe:", error);
      }
    }
  };

  return (
    <div className="App">
      {/* Navigation bar */}
      <Navbar />
      <div className="background-image"></div>
      <div className="center-container">
        {/* Demande */}
        <div className="center-container">
          <div className="form-container">
            <p className="title1">Demande</p>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>
                  Titre :<span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="rounded-input"
                />
                {formSubmitted && !titre && (
                  <span className="error">Le titre est obligatoire</span>
                )}
              </div>
              <div className="form-group">
                <label>
                  Description :<span className="required">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-input-d"
                />
                {formSubmitted && !description && (
                  <span className="error">La description est obligatoire</span>
                )}
              </div>
              <button type="submit" className="submit-button">
                Publier votre demande
              </button>
            </form>
            <p className="annotation">* Champs obligatoires</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemandeCreatePage;
