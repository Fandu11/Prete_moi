import React, { useState, useEffect } from "react";

function Navbar() {
  const [user,setUser] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

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
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la récupération des informations de l'utilisateur :",
            error
          );
        });
    }
  }, []);

  // Effet pour vérifier la présence du token dans le localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Si un token est présent, l'utilisateur est connecté
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Effet pour détecter les petits écrans
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768); // Mettre à jour la valeur en fonction de la largeur de l'écran
    };

    // Appeler la fonction de gestion du changement de taille d'écran une fois au chargement
    handleResize();

    // Ajouter un écouteur d'événement pour surveiller les changements de taille de l'écran
    window.addEventListener("resize", handleResize);

    // Supprimer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem("token");
    // Mettre à jour l'état de connexion
    setIsLoggedIn(false);
    // Rediriger l'utilisateur vers la page de connexion ou une autre page
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      {/* Afficher le menu déroulant à gauche si l'écran est trop petit */}
      {isSmallScreen && (
        <div className="dropdown">
          <button className="dropbtn">Menu</button>
          <div className="dropdown-content">
            <a href="/recherche">Rechercher</a>
            <a href="/create/annonce">Proposer</a>
            <a href="/create/demande">Demander</a>
          </div>
        </div>
      )}
      <div className="logo">
        <a href="/">
          <div className="logo_image"></div>
        </a>
      </div>
      {/* Afficher les liens normalement si l'écran n'est pas trop petit */}
      {!isSmallScreen && (
        <div className="links">
          <a href="/recherche">Rechercher</a>
          {isLoggedIn ? (
            <>
            {user.mail==="admin@gmail.com" ? (
              <>
                <a href="/statistique">Statistiques</a>
              </>
            ) :(
              <>
                <a href="/create/annonce">Proposer</a>
                <a href="/create/demande">Demander</a>
              </>
            )}
            </>
          ) : (
            <>
              <a href="/login">Proposer</a>
              <a href="/login">Demander</a>
            </>
          )}
        </div>
      )}
      <div className="spacer"></div>
      <div className="user-links">
        {/* Afficher les liens en fonction de l'état de connexion */}
        {isLoggedIn ? (
          <>
            <a href="/profile">Profil</a>
            <button className="abutton white" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : ( 
          <>
            <a href="/login">Se connecter</a>
            <a href="/register">S'inscrire</a>
          </>
          
        )}
      </div>
    </nav>
  );
}

export default Navbar;
