import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";

function DemandeUpdatePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Fetch demande data based on ID
    async function fetchDemande() {
      try {
        const response = await fetch(`http://localhost:3000/demandes/${id}`);
        if (response.ok) {
          const data = await response.json();
          // Populate form fields with fetched data
          setTitre(data.titre);
          setDescription(data.description);
        } else {
          setErrorMessage("Erreur lors du chargement de la demande.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la demande :", error);
        setErrorMessage("Erreur lors du chargement de la demande.");
      }
    }
    fetchDemande();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    // Validation des champs
    if (titre && description) {
      try {
        // Envoi des données au serveur pour mettre à jour la demande
        const response = await fetch(`http://localhost:3000/demandes/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titre,
            description,
          }),
        });

        if (response.ok) {
          // Redirection après la mise à jour réussie
          navigate("/user/demandes");
        } else {
          setErrorMessage("Une erreur s'est produite. Veuillez réessayer.");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la tentative de mise à jour de la demande :",
          error
        );
        setErrorMessage("Erreur lors de la tentative de mise à jour.");
      }
    }
  };

  return (
    <div className="App">
      <Navbar />
      <div className="background-image"></div>
      <div className="center-container">
        <div className="form-container">
          <p className="title1">Mettre à jour la demande</p>
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
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="submit-button">
              Mettre à jour la demande
            </button>
          </form>
          <p className="annotation">* Champs obligatoires</p>
        </div>
      </div>
    </div>
  );
}

export default DemandeUpdatePage;
