import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./components/Navbar";
import ConversationList from "./components/ConversationListe";

function ConversationPage() {
  const [idu,setIdd] = useState("");
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const { id } = useParams();
  const [otheruser,setOtherUser] = useState([]);

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur connecté depuis le stockage local
    const userId = localStorage.getItem("userId");
    if (userId) {
      setIdd(userId);
    }
  }, []);

  const fetchConversation = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3000/conversations/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching conversation with ID ${id}`);
      }
      const conversationData = await response.json();

      // Pour chaque message, effectuer un fetch pour obtenir les détails du message
      console.log("CONVDATA", conversationData);
      setConversation(conversationData);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  }, [id]);


  useEffect( () => {
    fetchConversation();
  }, [fetchConversation, id]);

  useEffect(() => {
    const getotherUser = async () => {
      var otherid = "";
      for (var i = 0; i < 2; i++) {
        if (conversation && conversation.utilisateurs[i] !== idu) {
          otherid = conversation.utilisateurs[i];
        }
      }
      try {
        const response = await fetch(`http://localhost:3000/utilisateurs/${otherid}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la vérification de la conversation existante");
        }
        setOtherUser(await response.json());
      } catch (error) {
        console.error("Erreur lors de la récupération de la conversation :", error);
      }
    };
    if (conversation) {
      getotherUser();
    }
  }, [idu, conversation]);

  // Rafraîchir la conversation toutes les 3 secondes
  useEffect(() => {
    // Définir une fonction pour rafraîchir la conversation à intervalles réguliers
    const refreshConversation = () => {
      fetchConversation();
    };
    const intervalId = setInterval(refreshConversation, 3000); // 30 secondes
    return () => clearInterval(intervalId);
  }, [fetchConversation]);

  const handleMessageSend = async () => {
    if (!newMessage.trim()) {
      // Si le message est vide, ne rien faire
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/conversations/${id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            utilisateur: localStorage.getItem("userId"), // Utiliser 'utilisateur' au lieu de 'userId'
            texte: newMessage, // Utiliser 'texte' au lieu de 'text'
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      // Réinitialiser le champ de saisie après l'envoi du message
      setNewMessage("");
      // Rafraîchir la conversation pour afficher le nouveau message
      fetchConversation();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (event) => {
    // Vérifier si la touche enfoncée est "Enter"
    if (event.key === "Enter") {
      handleMessageSend();
    }
  };

  // Fonction pour gérer le clic sur le bouton "Donner ou modifier un avis du profil"
  const handleReviewClick = () => {
    // Mettez ici le code pour afficher une boîte de dialogue pour donner ou modifier un avis du profil
    window.location.href = `/avis/utilisateur/${otheruser._id}`;
  };

  return (
    <div className="App">
      <Navbar />
      <div className="background-image"></div>
      {/* Liste de conversations*/}
      <ConversationList />
      <div className="vertical-band">
        <div className="messages-container">
          {conversation ? (
            <ul>
              {conversation.messages.map((message) => (
                <li
                  key={message._id}
                  className={
                    message.utilisateur === localStorage.getItem("userId")
                      ? "message-right"
                      : "message-left"
                  }
                >
                  <div className="message-bubble">
                    <p>{message.texte}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading...</p>
          )}
          <div className="input-container rounded-input">
            <input
              type="text"
              placeholder="Type your message here"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress} // Appeler handleMessageSend() sur la touche "Enter"
            />
            <button type="button" onClick={handleMessageSend}>
              Envoyer
            </button>
            </div>
          {/* Bouton pour donner ou modifier un avis du profil */}
          </div>
        </div>
        <div className="viewprofile">
          <h1>Profil:</h1>
          <div className="info-profile">
            <h2>Nom: {otheruser.nom}</h2>
            <h2>Prenom : {otheruser.prenom}</h2>
          </div>
          <div className="center-right">
            <button className="review-button" onClick={handleReviewClick}>
              <p>Donner un avis sur cette personne</p>
            </button>
          </div>
        </div>
    </div>
  );
}

export default ConversationPage;
