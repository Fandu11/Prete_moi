import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.js";

function AnnonceCreatePage() {
 const [titre, setTitre] = useState("");
 const [description, setDescription] = useState("");
 const [etat, setEtat] = useState("disponible"); // Par défaut, l'état est défini comme disponible
 const [formSubmitted, setFormSubmitted] = useState(false);
 const [errorMessage, setErrorMessage] = useState("");
 const [proposeurId, setProposeurId] = useState("");
 const [photo, setPhoto] = useState(null);


 useEffect(() => {
    // Récupérer l'ID de l'utilisateur connecté depuis le stockage local
    const userId = localStorage.getItem("userId");
    if (userId) {
      setProposeurId(userId);
    }
 }, []);

 const handleSubmit = async (event) => {
  event.preventDefault();
  setFormSubmitted(true);
  // Vérification des champs obligatoires avant la soumission du formulaire
  if (titre && description && proposeurId) {
    try {
      // Convertir la photo en base64
      let photoData = null;
      if (photo) {
        const reader = new FileReader();
        reader.readAsDataURL(photo);
        reader.onloadend = () => {
          photoData = reader.result;
          // Envoi des données au serveur à l'intérieur de onloadend
          const photoData2 = photoData.split(','); 
          sendDataToServer(photoData2[1]);
        };
      } else {
        // Si aucune photo n'est sélectionnée, envoyer uniquement les autres données
        sendDataToServer(null);
      }
    } catch (error) {
      console.error("Erreur lors de la tentative de soumission :", error);
      // Afficher un message d'erreur générique en cas d'échec de la soumission
      setErrorMessage("Erreur lors de la tentative de soumission");
    }
  }
};


 const sendDataToServer = async (photoData) => {
  try {
    const response = await fetch("http://localhost:3000/annonces", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        proposeur: proposeurId,
        titre,
        date: new Date(),
        description,
        etat,
        images: photoData, // Ajouter les données de l'image encodée en base64
      }),
    });

    if (response.ok) {
      window.location.href = `/`;
    } else {
      setErrorMessage("Une erreur s'est produite. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur lors de la tentative de soumission :", error);
    alert("Votre image est au mauvais format");
  }
};


 return (
    <div className="App">
      {/* Navigation bar */}
      <Navbar />
      <div className="background-image"></div>
      <div className="center-container">
        {/* Formulaire de proposition */}
        <div className="form-container">
          <p className="title1">Proposer un article</p>
          <form onSubmit={handleSubmit} className="propose-form">
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
                Photo :
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="rounded-input"
              />
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
            <div className="form-group">
              <label>État :</label>
              <select
                value={etat}
                onChange={(e) => setEtat(e.target.value)}
                className="rounded-input"
              >
                <option value="disponible">Disponible</option>
                <option value="emprunté">Emprunté</option>
                <option value="indisponible">Indisponible</option>
              </select>
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="submit-button">
              Proposer
            </button>
          </form>
          <p className="annotation">* Champs obligatoires</p>
        </div>
      </div>
    </div>
 );
}

export default AnnonceCreatePage;