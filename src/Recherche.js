import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.js";
import fetchData from "./components/extractDataFromCSV.js";
import { useNavigate } from "react-router-dom";

function RecherchePage() {
  const local = "http://localhost:3000";
  const [user, setUser] = useState("");

  const [id, setIdd] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [availability, setAvailability] = useState("Toutes");
  const [aORd, setaord] = useState("Annonces");

  // Donnée utilisateur
  const [users, setUsers] = useState([]);

  // Donnée annonce
  const [annonces, setAnnonces] = useState([]);
  const [annoncesFiltered, setAnnoncesFiltered] = useState([]);

  // Donnée demande
  const [demandes, setDemandes] = useState([]);
  const [demandesFiltered, setDemandesFiltered] = useState([]);

  // Donnée des villes
  const [localisation, setLocalisation] = useState("");
  const [citiesData, setCitiesData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Si je suis connecté
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur connecté depuis le stockage local
    const userId = localStorage.getItem("userId");
    if (userId) {
      setIdd(userId);
    }
  }, []);

  // Récupérer l'utlisateur
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch(local + `/utilisateurs/${id}`); // Appel à la route backend
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
        const jsonData = await response.json();
        setUser(jsonData);
      } catch (error) {
        console.error(error);
      }
    };
    getUser();
  }, [id]);

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

  // Les annonces
  useEffect(() => {
    fetch(local + "/annonces")
      .then((response) => {
        if (!response.ok) {
          throw new Error("La réponse du serveur n'est pas valide");
        }
        return response.json();
      })
      .then((data) => {
        setAnnonces(data);
        setAnnoncesFiltered(data);
      })
      .catch((error) =>
        console.error("Erreur lors de la récupération des annonces :", error)
      );
  }, []);

  // Les utilisateurs
  useEffect(() => {
    fetch(local + "/utilisateurs")
      .then((response) => {
        if (!response.ok) {
          throw new Error("La réponse du serveur n'est pas valide");
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((error) =>
        console.error("Erreur lors de la récupération des annonces :", error)
      );
  }, []);

  // Les demandes
  useEffect(() => {
    fetch(local + "/demandes")
      .then((response) => {
        if (!response.ok) {
          throw new Error("La réponse du serveur n'est pas valide");
        }
        return response.json();
      })
      .then((data) => {
        setDemandes(data);
        setDemandesFiltered(data);
      })
      .catch((error) =>
        console.error("Erreur lors de la récupération des annonces :", error)
      );
  }, []);

  // Filtre de la disponibilité
  useEffect(() => {
    const filtered = annonces.filter(
      (annonce) =>
        annonce.titre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (availability === "Toutes" || annonce.etat === availability)
    );
    setAnnoncesFiltered(filtered);
  }, [searchTerm, availability, annonces]);

  // Filtrage annonces et des demandes
  useEffect(() => {
    const aORdLoc = (annonce) => {
      var loc = "";
      for (var i = 0; i < users.length; i++) {
        if (
          users[i]["_id"] === annonce.proposeur ||
          users[i]["_id"] === annonce.demandeur
        ) {
          loc = users[i]["localisation"];
        }
      }
      return loc;
    };

    if (aORd === "Annonces") {
      const filtered = annonces.filter(
        (annonce) =>
          annonce.titre.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (availability === "Toutes" || annonce.etat === availability) &&
          (localisation === "" ||
            aORdLoc(annonce)
              .toLowerCase()
              .includes(localisation.toLowerCase())) &&
          !(user._id === annonce.proposeur)
      );

      setAnnoncesFiltered(filtered);
    } else {
      const filtered = demandes.filter(
        (demande) =>
          demande.titre.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (localisation === "" ||
            aORdLoc(demande)
              .toLowerCase()
              .includes(localisation.toLowerCase())) &&
          !(user._id === demande.demandeur)
      );
      setDemandesFiltered(filtered);
    }
  }, [
    searchTerm,
    availability,
    annonces,
    demandes,
    localisation,
    aORd,
    user,
    users,
  ]);

  // Fonction pour trouver la localisation d'un object
  const aORdLoc = function (id) {
    var loc = "";
    for (var i = 0; i < users.length; i++) {
      if (users[i]["_id"] === id) {
        loc = users[i]["localisation"];
      }
    }
    return loc;
  };

  /* const getU = async (idotheruser) => {
        try {
            
          const response = await fetch(local+`/utilisateurs/${idotheruser}`); // Appel à la route backend
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
          }
          const jsonData = await response.json();
          setOtherUser(jsonData);
        } catch (error) {
          console.error(error);
        }
      };*/

  // Fonction pour vérifier si une conversation existe entre deux utilisateurs
  const checkExistingConversation = async (annonceId, annoncepropo) => {
    try {
      if (!isLoggedIn) {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        window.location.href = "/login";
        return;
      }

      // Effectuer une requête pour vérifier si une conversation existe déjà entre les deux utilisateurs
      const response = await fetch(`${local}/conversations`);
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la vérification de la conversation existante"
        );
      }
      const existingConversations = await response.json();

      console.log("Existing Conversations:", existingConversations); // Log existing conversations

      // Vérifier si une conversation existe déjà entre les deux utilisateurs
      const conversationExists = existingConversations.find(
        (conversation) =>
          conversation.utilisateurs.includes(annoncepropo) &&
          conversation.utilisateurs.includes(id)
      );

      console.log("Conversation Exists:", conversationExists); // Log conversationExists

      if (conversationExists) {
        // Si une conversation existe déjà, rediriger l'utilisateur vers la page de conversation correspondante
        const conversationId = conversationExists._id; // Supposons que l'ID de la conversation soit retourné dans la réponse JSON
        window.location.href = `/conversation/${conversationId}`;
      } else {
        // Si aucune conversation n'existe, créer une nouvelle conversation
        createConversation(annoncepropo);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de la conversation existante :",
        error
      );
    }
  };

  const updateUserConversations = async (userId, conversationId) => {
    try {
      // Récupérer l'utilisateur avec l'ID annoncepropo
      const response = await fetch(`${local}/utilisateurs/${userId}`);
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération de l'utilisateur avec l'ID annoncepropo"
        );
      }
      const userWithConversation = await response.json();

      // Mettre à jour la liste de conversations de l'utilisateur avec l'ID annoncepropo
      const updatedUser = {
        ...userWithConversation,
        conversations: userWithConversation.conversations
          ? [conversationId,...userWithConversation.conversations]
          : [conversationId],
      };

      // Mettre à jour la base de données de l'utilisateur avec la liste de conversations mise à jour
      const updateUserResponse = await fetch(
        `${local}/utilisateurs/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        }
      );

      if (!updateUserResponse.ok) {
        throw new Error(
          "Erreur lors de la mise à jour de l'utilisateur avec la nouvelle conversation"
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour des conversations de l'utilisateur avec l'ID annoncepropo :",
        error
      );
    }
  };

  const createConversation = async (annoncepropo) => {
    try {
      // Créer une nouvelle conversation
      const createConversationResponse = await fetch(`${local}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          utilisateurs: [annoncepropo, id],
        }),
      });
      if (!createConversationResponse.ok) {
        throw new Error("Erreur lors de la création de la conversation");
      }
      const newConversation = await createConversationResponse.json();

      await updateUserConversations(annoncepropo, newConversation._id);

      // Mise à jour de user
      if (user) {
        // Mettre à jour la liste de conversations de l'utilisateur actuel
        var updatedUser = {};
        if (user.conversations) {
          updatedUser = {
            ...user,
            conversations: [newConversation._id, ...user.conversations],
          };
          alert("Met à jour les conversations utilisateur.");
        } else {
          alert(
            "recréer les conversations de l'utilisateur." +
              user.nom +
              ":" +
              user.conversations
          );
          updatedUser = { ...user, conversations: [newConversation._id] };
        }
        setUser(updatedUser);

        // Mettre à jour la base de données de l'utilisateur avec la liste de conversations mise à jour
        const updateUserResponse = await fetch(`${local}/utilisateurs/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        });
        if (!updateUserResponse.ok) {
          throw new Error(
            "Erreur lors de la mise à jour de l'utilisateur avec la nouvelle conversation"
          );
        }
      }

      // Rediriger l'utilisateur vers la page de la nouvelle conversation
      console.log(`/conversation/${newConversation._id}`);
      window.location.href = `/conversation/${newConversation._id}`;
    } catch (error) {
      console.error("Erreur lors de la création de la conversation :", error);
    }
  };

  return (
    <div className="App">
      {/* Navigation bar */}
      <Navbar />
      {/* Arrière plan */}
      <div className="background-image"></div>
      <div className="form-container-r">
        <div className="search-bar">
          {/* Afficher la barre de recherche de localisation */}
          <div className="resizable-div">
            <input
              type="text"
              placeholder="Localisation"
              value={localisation}
              onChange={handleInputChange}
              className="search-input"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-container-r">
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
          </div>
          {/* Afficher la barre de recherche classique */}
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select // Liste déroulante de Disponibilité
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="availability-select"
            style={{ display: aORd === "Annonces" ? "block" : "none" }} // Conditionner le style en fonction de la valeur de aORd
          >
            <option value="Toutes">Toutes</option>
            <option value="disponible">Disponible</option>
            <option value="emprunté">Emprunté</option>
            <option value="indisponible">Indisponible</option>
          </select>

          <select // Liste déroulante demandes
            value={aORd}
            onChange={(e) => setaord(e.target.value)}
            className="availability-select"
          >
            <option value="Annonces">Annonces</option>
            <option value="Demandes">Demandes</option>
          </select>
        </div>
        {/* Afficher les recherche */}
        <div className="annonces-list">
          {aORd === "Annonces"
            ? annoncesFiltered.slice(0, 12).map((annonce) => {
                var loc = aORdLoc(annonce.proposeur);
                return (
                  <div className="annonce-card" key={annonce._id}>
                    <h3>{annonce.titre}</h3>
                    {/* Utilisez une URL de données pour afficher l'image */}
                    <img src={`data:image/jpeg;base64, ${annonce.images}`} alt={annonce.titre} className="annonce-image" />
                    <div className="annonce-desc">
                      <p>{annonce.description}</p>
                    </div>
                    <p>Disponibilité : {annonce.etat} </p>
                    <p>Localisation : {loc}</p>
                    <div style={{ display: "flex", gap: 20 }}>
                      {annonce.etat === "disponible" && (
                        <button
                          className="submit-button"
                          type="button"
                          onClick={() =>
                            checkExistingConversation(
                              annonce._id,
                              annonce.proposeur
                            )
                          }
                        >
                          Contact
                        </button>
                      )}
                      <button
                        className="submit-button"
                        type="button"
                        onClick={() => navigate(`/article/${annonce._id}`)}
                      >
                        Détails
                      </button>
                    </div>
                  </div>
                );
              })
            : demandesFiltered.slice(0, 12).map((demande) => {
                var loc = aORdLoc(demande.demandeur);
                return (
                  <div className="annonce-card" key={demande._id}>
                    <h3>{demande.titre}</h3>
                    <p>Date: {demande.date}</p>
                    <div className="annonce-desc">
                      <p>Description: {demande.description}</p>
                    </div>
                    <p>Localisation: {loc}</p>
                    <button
                      className="submit-button"
                      type="button"
                      onClick={() =>
                        checkExistingConversation(
                          demande._id,
                          demande.demandeur
                        )
                      }
                    >
                      Contact
                    </button>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

export default RecherchePage;
