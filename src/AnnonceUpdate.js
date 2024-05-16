import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";

function AnnonceUpdatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [etat, setEtat] = useState("disponible");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [proposeurId, setProposeurId] = useState("");
  const [photo, setPhoto] = useState(null);
  const [images,setImage] = useState(null);

  useEffect(() => {
    // Fetch announcement data based on ID
    async function fetchAnnouncement() {
      try {
        const response = await fetch(`http://localhost:3000/annonces/${id}`);
        if (response.ok) {
          const data = await response.json();
          // Populate form fields with fetched data
          setTitre(data.titre);
          setDescription(data.description);
          setEtat(data.etat);
          setProposeurId(data.proposeur);
          setImage(data.images);
        } else {
          setErrorMessage(
            "Une erreur s'est produite lors du chargement de l'annonce."
          );
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'annonce :", error);
        setErrorMessage("Erreur lors du chargement de l'annonce.");
      }
    }
    fetchAnnouncement();
  }, [id]);

  const sendDataToServer = async (photoData) => {
    try {
      // Envoi des données au serveur pour mettre à jour l'annonce
      const response = await fetch(`http://localhost:3000/annonces/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titre,
          description,
          etat,
          images:photoData,
        }),
      });

      if (response.ok) {
        // Rediriger vers une autre page ou effectuer une action appropriée
        alert("Modification réussi");
        setTimeout(() => {
          // Redirection vers la page /user/annonces
          navigate("/user/annonces");
        }, 500); // 0.5 secondes de délai
        // Peut-être une page de confirmation de mise à jour
      } else {
        // Afficher un message d'erreur en cas d'échec de la requête
        setErrorMessage("Une erreur s'est produite. Veuillez réessayer.");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la tentative de mise à jour de l'annonce :",
        error
      );
      // Afficher un message d'erreur générique en cas d'échec de la soumission
      setErrorMessage(
        "Erreur lors de la tentative de mise à jour de l'annonce."
      );
    }
  };

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
          sendDataToServer(images);
        }
      } catch (error) {
        console.error("Erreur lors de la tentative de soumission :", error);
        // Afficher un message d'erreur générique en cas d'échec de la soumission
        setErrorMessage("Erreur lors de la tentative de soumission");
      }
    }
  };

  return (
    <div className="App">
      <Navbar />
      <div className="background-image"></div>
      {/* Formulaire de mise à jour */}
      <div className="center-container">
        <div className="form-container">
          <p className="title1">Mettre à jour l'annonce</p>
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
              Mettre à jour
            </button>
          </form>
          <p className="annotation">* Champs obligatoires</p>
        </div>
      </div>
    </div>
  );
}

export default AnnonceUpdatePage;
