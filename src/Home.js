import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import ConversationList from "./components/ConversationListe";

function HomePage() {
  const [user,setUser] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
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

  return (
    <div className="App">
      {/* Navigation bar */}
      <Navbar />

      {/* Background image covering the entire page */}
      <div className="background-image"></div>
      {/* Content inside the background image */}
      <div className="center-container">
        {isLoggedIn ? (
          <div>
            {user.mail==="admin@gmail.com" ? (
               <div className="content">
               {/* Right-aligned text */}
               <h1 className="title1 white">
                 Bienvenue Administrarteur sur "Prêt, feu, empruntez !"
               </h1>
               <br />
               <p className="white">
                 Sur ce site tu pourras demander des objets à emprunter ou faire
                 des prêts.
               </p>
             </div>
            ): (
              <>
                {/* Liste de conversations*/}
                <ConversationList />
                {/* Contenu principal */}
                <Link to="/user/annonces" className="title1 link-button white">
                  Mes annonces
                </Link>
                <Link to="/user/demandes" className="link-button title1 white">
                  Mes demandes
                </Link>
              </>
            )}
            
          </div>
        ) : (
          <div className="content">
            {/* Right-aligned text */}
            <h1 className="title1 white">
              Bienvenue sur "Prêt, feu, empruntez !"
            </h1>
            <br />
            <p className="white">
              Sur ce site tu pourras demander des objets à emprunter ou faire
              des prêts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
