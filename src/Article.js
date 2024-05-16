import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.js";
import { useParams } from "react-router-dom";

function ArticlePage() {
  const [iduser, setId] = useState("");
  const [annonce, setAnnonce] = useState(null);
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [avisDetails, setAvisDetails] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fonction pour récupérer les informations de l'utilisateur à partir de son ID
  const fetchUserData = async (userId) => {
    try {
      const userResponse = await fetch(`http://localhost:3000/utilisateurs/${userId}`);
      if (!userResponse.ok) {
        throw new Error(`Erreur lors de la récupération des données de l'utilisateur avec l'ID ${userId}`);
      }
      const userData = await userResponse.json();
      return userData;
    } catch (error) {
      console.error("Erreur lors de la récupération des informations de l'utilisateur :", error);
      return null;
    }
  };

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

  useEffect(() => {
    setId(localStorage.getItem("userId"));

    const fetchUserData = async () => {
      try {
        const annonceResponse = await fetch(
          `http://localhost:3000/annonces/${id}`
        );
        if (!annonceResponse.ok) {
          throw new Error(
            "Erreur lors de la récupération des données de l'autre utilisateur"
          );
        }
        const annonceData = await annonceResponse.json();
        setAnnonce(annonceData);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des informations des utilisateurs :",
          error
        );
        setAnnonce(null);
      }
    };

    fetchUserData();
  }, [id]);

  useEffect(() => {
    if (annonce && annonce.avis && annonce.avis.length > 0) {
      const fetchAvisData = async (avisIds) => {
        try {
          // Créez un ensemble pour stocker les IDs uniques des avis
          const uniqueAvisIds = new Set(avisIds);

          // Récupérez les détails des avis pour chaque ID unique
          const avisDetailsPromises = Array.from(uniqueAvisIds).map(
            async (avisId) => {
              const avisResponse = await fetch(
                `http://localhost:3000/avis/${avisId}`
              );
              if (!avisResponse.ok) {
                throw new Error(
                  `Erreur lors de la récupération des données de l'avis avec l'ID ${avisId}`
                );
              }
              const avisData = await avisResponse.json();
              const userData = await fetchUserData(avisData.personne);
              return { ...avisData, nom: userData.nom, prenom: userData.prenom };
            }
          );

          // Attendez que toutes les requêtes de détails d'avis se terminent
          const avisDetailsData = await Promise.all(avisDetailsPromises);
          setAvisDetails(avisDetailsData);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des informations de l'avis :",
            error
          );
        }
      };

      // Limitez le nombre d'avis à 5
      const limitedAvisIds = annonce.avis.slice(0, 5);
      fetchAvisData(limitedAvisIds);
    }
  }, [annonce]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleReviewChange = (event) => {
    setReview(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3000/avis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: new Date(),
          note: parseInt(rating),
          personne: iduser,
          description: review,
        }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de l'avis et de la note");
      }
      setRating(0);
      setReview("");
      alert("Avis envoyé avec succès !");
      const newAvis = await response.json();
      if (annonce) {
        const updatedAnnonce = {
          ...annonce,
          avis: [newAvis, ...annonce.avis],
        };
        setAnnonce(updatedAnnonce);
        const updateUserResponse = await fetch(
          `http://localhost:3000/annonces/${annonce._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedAnnonce),
          }
        );
        if (!updateUserResponse.ok) {
          throw new Error(
            "Erreur lors de la mise à jour de l'annonce avec le nouvel avis"
          );
        }
      }
      window.location.href = `/article/${id}`;
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'avis et de la note :", error);
    }
  };

  const renderStars = (note) => {
    const starCount = Math.round(note);
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < starCount) {
        stars.push(<span key={i}>&#9733;</span>); // Étoile pleine
      } else {
        stars.push(<span key={i}>&#9734;</span>); // Étoile vide
      }
    }

    return stars;
  };

  if (annonce === null) {
    return (
      <div className="App">
        <Navbar />
        <div className="background-image"></div>
        <div className="center-container">
          <div className="form-container">
            <h1>Annonce</h1>
            <p>Chargement en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <div className="background-image"></div>
      <div className="center-container">
        <div className="annonces_all_avis">
          <h3>Avis sur cette annonce :</h3>
          {avisDetails.length > 0 ? (
            avisDetails.map((avis, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  margin: "5px",
                  border: "2px solid #000",
                  borderRadius: "5px",
                  overflow: "hidden",
                  alignItems: "center",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "10px",
                }}
              >
                <div>
                  <strong>Avis de :</strong> {avis.nom} {avis.prenom} <br />
                  <strong>Date: </strong> {new Date(avis.date).toLocaleDateString()}  <br />
                  <strong>Note :</strong> {renderStars(avis.note)}
                </div>
                <div className="annonce-desc" style={{ height: "50px" }}>
                  <strong></strong> {avis.description}
                </div>
              </div>
            ))
          ) : (
            <p>Aucun avis disponible pour cette annonce.</p>
          )}
        </div>

        <div className="annonce-card">
          <h1>Annonce</h1>
          <h2>Titre {annonce.titre}</h2>
          <p>Date : {new Date(annonce.date).toLocaleDateString()}</p>
          <div className="annonce-desc">
            <p>{annonce.description}</p>
          </div>
          <hr
            style={{
              display: "flex",
              width: "90%",
              height: "2px",
              backgroundColor: "black",
              borderRadius: "2px",
              border: "none",
            }}
          />
          {isLoggedIn && (
            <>
              <p>Notez cette annonce :</p>
              <div>
                {[...Array(5)].map((_, index) => (
                  <span
                    key={index}
                    onClick={() => handleRatingChange(index + 1)}
                    style={{
                      cursor: "pointer",
                      color: index < rating ? "gold" : "gray",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                className="annonce-desc"
                value={review}
                onChange={handleReviewChange}
                placeholder="Écrivez votre avis ici..."
              />
              <button className="submit-button" onClick={handleSubmit}>
                Envoyer l'avis
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticlePage;
