import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.js";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [avisDetails, setAvisDetails] = useState([]);
  const navigation = useNavigate();

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
          calculateAverageRating(data.avis);
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la récupération des informations de l'utilisateur :",
            error
          );
        });
    }
  }, []);

  const calculateAverageRating = (avis) => {
    let totalRating = 0;
    const avisDetailsArray = [];

    const fetchRating = (avisId) => {
      const apiUrl = `http://localhost:3000/avis/${avisId}`;

      return fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données");
          }
          return response.json();
        })
        .then((data) => {
          totalRating += parseInt(data.note);
          avisDetailsArray.push({
            note: parseInt(data.note),
            date:data.date,
            description: data.description,
            personne: data.personne,
          });
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la récupération des informations de l'utilisateur :",
            error
          );
        });
    };

    const fetchAllRatings = () => {
      const promises = avis.map((avisId) => fetchRating(avisId));
      return Promise.all(promises);
    };

    fetchAllRatings().then(() => {
      const average = totalRating / avis.length;
      setAverageRating(parseInt(average));
      setAvisDetails(avisDetailsArray);
    });
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

  const fetchUserName = (userId) => {
    const apiUrl = `http://localhost:3000/utilisateurs/${userId}`;

    return fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
        return response.json();
      })
      .then((data) => {
        return `${data.nom} ${data.prenom}`;
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération des informations de l'utilisateur :",
          error
        );
        return "Utilisateur inconnu";
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      const updatedAvisDetails = await Promise.all(
        avisDetails.map(async (avis) => {
          const userName = await fetchUserName(avis.personne);
          return { ...avis, userName: userName };
        })
      );

      setAvisDetails(updatedAvisDetails);
    };

    fetchData();
  }, [avisDetails]);

  const handleUpdateProfile = () => {
    navigation("/profile/update");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {/* Navigation bar */}
      <Navbar />
      <div className="background-image"></div>
      <div className="center-container">
         <div className="form-container">
          <div className="pdp">
              <img
                src={user.photo? `data:image/jpeg;base64, ${user.photo}` : "/non_pdp.jpg"}
                alt={user.prenom}
                className="pdp-image"
              />
            </div>
            <div className="user-details">
              <h2>
                Profil de {user.nom.toUpperCase()} {user.prenom}
              </h2>
              <p>Adresse email : {user.mail}</p>
              <p>Localisation : {user.localisation}</p>
            </div>
            <button className="submit-button" onClick={handleUpdateProfile}>
              Mettre à jour le profil
            </button>
          </div>
          <div className="form-container" style={{ marginLeft: '10px' }}>
          {avisDetails.length > 0 ? (
            <div>
              <h3>Détails des avis :</h3>
              <p>Moyenne des avis : {renderStars(averageRating)}</p>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {avisDetails.map((avis, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    {avis.userName && <strong>Avis de :</strong>}{" "}
                    {avis.userName} <br />
                    {avis.note && (
                      <>
                        <strong>Date: </strong> {new Date(avis.date).toLocaleDateString()}  <br />
                        <strong>Note :</strong> {renderStars(avis.note)} -{" "}
                        <strong>Description :</strong> {avis.description}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>Aucun avis</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
