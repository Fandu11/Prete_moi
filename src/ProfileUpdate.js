import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.js";
import fetchData from "./components/extractDataFromCSV.js";
import sha256 from "crypto-js/sha256"; // Importez la fonction de hachage SHA-256

function ProfileUpdatePage() {
  const [user, setUser] = useState(null);
  const [mail, setMail] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [telephone, setTelephone] = useState("");
  const [photo, setPhoto] = useState(null);
  const [images,setImage] = useState("");


  const [telSurAnnonces, settelSurAnnonces] = useState(false);
  const [citiesData, setCitiesData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      // URL de votre API
      const apiUrl = `http://localhost:3000/utilisateurs/${userId}`;

      // Requête GET pour récupérer les informations de l'utilisateur
      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données");
          }
          return response.json();
        })
        .then((data) => {
          setUser(data);
          setMail(data.mail);
          setLocalisation(data.localisation);
          setTelephone(data.telephone);
          if (data.photo){
            setImage(data.photo);
          }
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la récupération des informations de l'utilisateur :",
            error
          );
        });
    }
  }, []);

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

  const handleSuggestionClick = (city) => {
    setLocalisation(city.nom);
    setShowSuggestions(false);
  };

  const sendDataToServer = async (photoData) => {
    const userId = localStorage.getItem("userId");

    var hashedPassword = "";
    if (nouveauMotDePasse!==""){
      hashedPassword = sha256(nouveauMotDePasse).toString();
    }
    else{
      hashedPassword = user.motDePasse;
    }

    if (userId) {
      try {
        const response = await fetch(
          `http://localhost:3000/utilisateurs/${userId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nom: user.nom,
              prenom: user.prenom,
              mail,
              localisation,
              motDePasse:hashedPassword,
              telephone,
              telSurAnnonces:user.telSurAnnonces,
              annonces: user.annonces,
              demandes: user.demandes,
              avis: user.avis,
              photo:photoData,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Erreur lors de l'envoi des données à la base de données."
          );
        }
        else{
          alert("Modification réussi");
          setTimeout(() => {
            // Redirection vers la page /user/annonces
            window.location.href = `/profile`;
          }, 500);
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
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Vérifiez si les deux champs de mot de passe sont remplis ensemble ou vides ensemble

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
        console.error("Erreur lors du hachage du mot de passe:", error);
      }
  };

  return (
    <div className="App">
      <Navbar />
      <div className="background-image"></div>
      <div className="center-container">
        <div className="form-container">
          <p className="title1">Modifier Votre Profil</p>
          <form onSubmit={handleSubmit} className="login-form">
            { mail!=="admin@gmail.com" ? (
              <>
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
                  <label>Mail :</label>
                  <input
                    type="text"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    className="rounded-input"
                  />
                </div>
              </>) : (<></>)}
            <div className="form-group">
              <label>Nouveau Mot de passe :</label>
              <input
                type="password"
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                className="rounded-input"
              />
            </div>
            <div className="form-group">
              <label>Localisation :</label>
              <input
                type="text"
                value={localisation}
                onChange={handleInputChange}
                className="rounded-input"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-container">
                  <select
                    size={5}
                    className="rounded-input"
                    onClick={(e) => e.stopPropagation()}
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
              Mettre à jour
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileUpdatePage;
