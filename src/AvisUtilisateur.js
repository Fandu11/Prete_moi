import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./components/Navbar.js";

function AvisUtilisateurPage() {
    const [id,setId] = useState("");
    const [otheruser, setOtherUser] = useState(null);
    const [rating, setRating] = useState(0); // État pour la note de l'utilisateur
    const [review, setReview] = useState(""); // État pour l'avis de l'utilisateur
    const { otheruserid } = useParams(); // Récupérer l'ID de l'utilisateur depuis l'URL

    useEffect(() => {
        setId(localStorage.getItem("userId"));

        const fetchUserData = async () => {
            try {
                // Requête GET pour récupérer les informations de l'autre utilisateur
                const otherUserResponse = await fetch(`http://localhost:3000/utilisateurs/${otheruserid}`);
                if (!otherUserResponse.ok) {
                    throw new Error("Erreur lors de la récupération des données de l'autre utilisateur");
                }
                const otherUserData = await otherUserResponse.json();
                setOtherUser(otherUserData);
            } catch (error) {
                console.error("Erreur lors de la récupération des informations des utilisateurs :", error);
            }
        };

        fetchUserData();
    }, [otheruserid]); // Effectue la récupération des données chaque fois que l'ID de l'autre utilisateur change

    // Fonction pour mettre à jour la note de l'utilisateur
    const handleRatingChange = (newRating) => {
        setRating(newRating);
    };

    // Fonction pour mettre à jour l'avis de l'utilisateur
    const handleReviewChange = (event) => {
        setReview(event.target.value);
    };

    // Fonction pour envoyer l'avis et la note dans la base de données
    const handleSubmit = async () => {
        try {
            // Effectuer une requête POST vers votre API avec les données de l'avis et de la note
            const response = await fetch("http://localhost:3000/avis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    date:new Date(),
                    note: parseInt(rating),
                    personne: id,
                    description: review,
                }),
            });
            if (!response.ok) {
                throw new Error("Erreur lors de l'envoi de l'avis et de la note");
            }
            // Réinitialiser les états de la note et de l'avis après l'envoi réussi
            setRating(0);
            setReview("");
            alert("Avis envoyé avec succès !");
            // Mettre à jour la liste des avis de l'utilisateur après l'envoi réussi
            const newavis = await response.json();
            
                 // Vérifier si user est défini et s'il a une propriété conversations avant d'itérer
            if (otheruser) {
                // Mettre à jour la liste de conversations de l'utilisateur actuel
                var updatedUser = {};
                if (otheruser.avis) {
                    updatedUser = { ...otheruser, avis: [newavis,...otheruser.avis] };
                }
                else {updatedUser = { ...otheruser, avis: [newavis] };}
                setOtherUser(updatedUser);

                // Mettre à jour la base de données de l'utilisateur avec la liste de conversations mise à jour
                const updateUserResponse = await fetch(`http://localhost:3000/utilisateurs/${otheruser._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedUser),
                });
                if (!updateUserResponse.ok) {
                    throw new Error("Erreur lors de la mise à jour de l'utilisateur avec la nouvelle conversation");
                }
            }

            window.location.href = `/`;
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'avis et de la note :", error);
        }
    };

    return (
        <div className="App">
            {/* Navigation bar */}
            <Navbar />
            <div className="background-image"></div>
            <div className="center-container">
                <div className="form-container">
                    {otheruser && (
                        <div>
                            <h2>Profil de {otheruser.nom.toUpperCase()} {otheruser.prenom}</h2>
                            <p>Localisation : {otheruser.localisation}</p>
                            {/* Affichez d'autres informations de l'utilisateur si nécessaire */}
                            <div>
                                <p>Notez cet utilisateur :</p>
                                {[...Array(5)].map((_, index) => (
                                    <span
                                        key={index}
                                        onClick={() => handleRatingChange(index + 1)}
                                        style={{ cursor: "pointer", color: index < rating ? "gold" : "gray" }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <div>
                                <textarea
                                    className="avis-text"
                                    value={review}
                                    onChange={handleReviewChange}
                                    placeholder="Écrivez votre avis ici..."
                                />
                            </div>
                            <div>
                                <button onClick={handleSubmit}>Envoyer l'avis</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AvisUtilisateurPage;
