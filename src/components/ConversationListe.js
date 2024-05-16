import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

function ConversationList() {
  const [showConversation, setShowConversation] = useState(false);
  const [userDetails, setUserDetails] = useState([]);
  const islogged = useRef(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const apiUrl = `http://localhost:3000/utilisateurs/${userId}`;
    if (userId) {
      if (!islogged.current) {
        fetchUserConversations(apiUrl);
        islogged.current = true;
      }
    }
  }, []);

  // Fonction pour récupérer les conversations de l'utilisateur
  const fetchUserConversations = async (apiUrl) => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des conversations");
      }
      const userData = await response.json();

      if (
        userData &&
        userData.conversations &&
        userData.conversations.length > 0
      ) {
        // Faire une boucle for pour chaque id afin de faire un fetch de la conversation
        for (const conversationId of userData.conversations) {
          try {
            const conversationResponse = await fetch(
              `http://localhost:3000/conversations/${conversationId}`
            );
            if (!conversationResponse.ok) {
              throw new Error(
                `Erreur lors de la récupération de la conversation avec l'ID ${conversationId}`
              );
            }
            const conversationDetails = await conversationResponse.json();

            // Récupérer les détails de chaque utilisateur dans la conversation
            const userDetailsPromises = conversationDetails.utilisateurs.map(
              async (userId) => {
                try {
                  const userResponse = await fetch(
                    `http://localhost:3000/utilisateurs/${userId}`
                  );
                  if (!userResponse.ok) {
                    throw new Error(
                      `Erreur lors de la récupération de l'utilisateur avec l'ID ${userId}`
                    );
                  }
                  return await userResponse.json();
                } catch (error) {
                  console.error(
                    `Erreur lors de la récupération de l'utilisateur avec l'ID ${userId}:`,
                    error
                  );
                  return null;
                }
              }
            );

            // Attendre que toutes les requêtes de détails d'utilisateur soient terminées
            const userDetails = await Promise.all(userDetailsPromises);
            console.log("Détails des utilisateurs :", userDetails);
            setUserDetails((prevDetails) => [
              ...prevDetails,
              { conversationId, userDetails },
            ]);
          } catch (error) {
            console.error(
              `Erreur lors de la récupération de la conversation avec l'ID ${conversationId}: `,
              error
            );
          }
        }
      } else {
        console.log(
          "Aucune conversation n'a été récupérée ou userData est mal formaté."
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des conversations: ",
        error
      );
    }
  };

  // Toggle la fenêtre de conversation
  const toggleConversation = () => {
    setShowConversation(!showConversation);
  };

  return (
    <div>
      <div
        className={`conversations-container ${
          showConversation ? "open" : "closing"
        }`}
      >
        {userDetails && userDetails.length > 0 ? (
          <div className="conversations-list">
            <ul>
              {userDetails.map((detail, index) => (
                <Link
                  className="conversation-lien"
                  key={index}
                  to={`/conversation/${detail.conversationId}`}
                >
                  <li className="conversation-liste">
                    <span>
                      {detail.userDetails.map((user) => (
                        <div key={user._id}>
                          {user._id !== localStorage.getItem("userId") && (
                            <>
                              {user.nom} {user.prenom}
                              <br />
                            </>
                          )}
                        </div>
                      ))}
                    </span>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        ) : (
          <div className="center-container">
            <p>Aucune conversation n'a été commencée.</p>
          </div>
        )}
      </div>
      {/* Bouton pour afficher la fenêtre de conversation */}
      <button
        className={`conversation-button ${
          showConversation ? "open" : "closing"
        }`}
        onClick={toggleConversation}
      >
        Conversations
      </button>
    </div>
  );
}

export default ConversationList;
