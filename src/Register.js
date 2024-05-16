import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.js";
import fetchData from "./components/extractDataFromCSV.js";
import sha256 from "crypto-js/sha256"; // Importez la fonction de hachage SHA-256

function RegisterPage() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [mail, setMail] = useState("");
  const [motDePasse, setPassword] = useState(""); // Ajoutez un nouvel état pour le mot de passe
  const [localisation, setLocalisation] = useState("");
  const [telephone, setTelephone] = useState("");
  const [telSurAnnonces, settelSurAnnonces] = useState(false);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [citiesData, setCitiesData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [photo, setPhoto] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Charger les données des villes depuis le CSV lors du chargement du composant
    fetchData().then((data) => setCitiesData(data));
  }, []);

  // Gérer le changement de l'entrée de l'utilisateur
  const handleInputChange = (event) => {
    const input = event.target.value.trim().toLowerCase();
    let filteredCities = [];

    if (input.length > 0) {
      if (!isNaN(input)) {
        // Si l'entrée est un nombre, filtrer les villes par le code postal commençant par ce nombre
        filteredCities = citiesData.filter(
          (city) => city.code_postal && city.code_postal.startsWith(input)
        );

        // Trier les codes postaux filtrés par ordre croissant
        filteredCities.sort(
          (a, b) => parseInt(a.code_postal) - parseInt(b.code_postal)
        );
      } else {
        // Si l'entrée est du texte, filtrer les villes par le nom commençant par le texte
        filteredCities = citiesData.filter(
          (city) => city.nom && city.nom.toLowerCase().startsWith(input)
        );

        // Trier les villes filtrées par ordre alphabétique
        filteredCities.sort((a, b) => a.nom.localeCompare(b.nom));
      }
    }

    // Limiter le nombre de suggestions à 20
    const limitedSuggestions = filteredCities.slice(0, 1000);

    setSuggestions(limitedSuggestions);
    setShowSuggestions(true);
    setLocalisation(input);
  };

  // Gérer la sélection d'une ville depuis les suggestions
  const handleSuggestionClick = (city) => {
    setLocalisation(city.nom); // Mettre à jour la localisation avec le nom de la ville sélectionnée
    setShowSuggestions(false); // Masquer les suggestions après la sélection
  };

  const sendDataToDatabase = async (userData) => {
    try {
      const response = await fetch("http://localhost:3000/utilisateurs", {
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
    if (nom && prenom && mail && localisation && motDePasse) {
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
        console.error("Erreur lors du hachage du mot de passe:", error);
      }
    }
  };

  const sendDataToServer = async (photoData) => {
    // Hacher le mot de passe avant de l'envoyer à la base de données
    const hashedPassword = sha256(motDePasse).toString(); // Hacher le mot de passe avec SHA-256

    // Envoi des données à la base de données
    const success = await sendDataToDatabase({
      nom,
      prenom,
      mail,
      localisation,
      motDePasse: hashedPassword,
      telephone,
      telSurAnnonces,
      avis: [],
      conversations: [],
      photo: photoData
    });

    if (success) {
      alert("Compte créé avec succès !");
      // Rediriger vers la page de connexion après un délai
      setTimeout(() => {
        navigate("/login");
      }, 100); // Redirige après 0.1 seconde
    } else {
      alert("Erreur lors de la création du compte.");
    }

    // Ajoutez votre logique de traitement du formulaire ici
    console.log("Nom:", nom);
    console.log("Prénom:", prenom);
    console.log("Mail:", mail);
    console.log("Localisation:", localisation);
    console.log("Téléphone:", telephone);
    console.log("Afficher téléphone dans les annonces:", telSurAnnonces);
    console.log("Mot de passe haché:", hashedPassword); // Affichez le mot de passe haché dans la console

    // Réinitialiser les valeurs des champs après soumission du formulaire si nécessaire
    setPassword("");
  };


  return (
    <div className="App">
      {/* Navigation bar */}
      <Navbar />
      <div className="background-image"></div>
      {/* Formulaire de connexion */}

      <div className="center-container">
        <div className="form-container">
          <p className="title1">Inscription</p>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>
                Nom :<span className="required">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="rounded-input"
              />
              {formSubmitted && !nom && (
                <span className="error">Le nom est obligatoire</span>
              )}
            </div>
            <div className="form-group">
              <label>
                Prénom :<span className="required">*</span>
              </label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="rounded-input"
              />
              {formSubmitted && !prenom && (
                <span className="error">Le prénom est obligatoire</span>
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
                Mail :<span className="required">*</span>
              </label>
              <input
                type="text"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                className="rounded-input"
              />
              {formSubmitted && !mail && (
                <span className="error">Le mail est obligatoire</span>
              )}
            </div>
            <div className="form-group">
              <label>
                Mot de passe :<span className="required">*</span>
              </label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-input"
              />
              {formSubmitted && !motDePasse && (
                <span className="error">Le mot de passe est obligatoire</span>
              )}
            </div>
            <div className="form-group">
              <label>
                Localisation :<span className="required">*</span>
              </label>
              <input
                type="text"
                value={localisation}
                onChange={handleInputChange}
                className="rounded-input"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-container">
                  <select
                    size={5} // Limiter le nombre de suggestions affichées
                    className="rounded-input"
                    onClick={(e) => e.stopPropagation()} // Empêcher la propagation du clic pour éviter de fermer les suggestions lorsqu'elles sont cliquées
                  >
                    {suggestions.map((city, index) => (
                      <option
                        key={index}
                        value={city.nom}
                        onClick={() => handleSuggestionClick(city)}
                      >
                        {city.code_postal} - {city.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {formSubmitted && !localisation && (
                <span className="error">La localisation est obligatoire</span>
              )}
            </div>
            <div className="form-group">
              <label>Téléphone :</label>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="rounded-input"
              />
            </div>
            {telephone && (
              <div className="form-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={telSurAnnonces}
                    onChange={(e) => settelSurAnnonces(e.target.checked)}
                    className="hidden-input"
                  />
                  <span className="toggle-switch"></span>
                  Afficher le numéro dans les annonces
                </label>
              </div>
            )}
            <button type="submit" className="submit-button">
              S'inscrire
            </button>
          </form>
          <p className="annotation">* Champs obligatoires</p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
