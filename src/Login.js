import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.js";
import sha256 from "crypto-js/sha256"; // Importer la fonction de hachage SHA-256

function LoginPage() {
  const navigate = useNavigate();
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    // Vérification des champs obligatoires avant la soumission du formulaire
    if (mail && password) {
      try {
        // Hacher le mot de passe avant de l'envoyer pour vérification
        const hashedPassword = sha256(password).toString(); // Hacher le mot de passe avec SHA-256
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mail, password: hashedPassword }),
        });

        if (response.ok) {
          // Authentification réussie
          // Récupérer le token depuis la réponse
          const data = await response.json();
          const { token, userId } = data;
          // Stocker le token dans le localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("userId", userId);

          // Rediriger l'utilisateur vers une page de tableau de bord ou une autre page protégée
          navigate("/");
        } else {
          // Afficher un message d'erreur pour indiquer que le mail ou le mot de passe est incorrect
          setErrorMessage("Mail ou mot de passe incorrect");
        }
        console.log("Mot de passe haché:", hashedPassword); // Affichez le mot de passe haché dans la console
        // Réinitialiser les valeurs des champs après soumission du formulaire
        setPassword("");
      } catch (error) {
        console.error("Erreur lors de la tentative de connexion :", error);
        // Afficher un message d'erreur générique en cas d'échec de la connexion
        setErrorMessage("Erreur lors de la tentative de connexion");
      }
    }
  };

  return (
    <div className="App">
      {/* Navigation bar */}
      <Navbar />
      <div className="background-image"></div>
      <div className="center-container">
        {/* Formulaire de connexion */}
        <div className="form-container">
          <p className="title1">Connexion</p>
          <form onSubmit={handleSubmit} className="login-form">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-input"
              />
              {formSubmitted && !password && (
                <span className="error">Le mot de passe est obligatoire</span>
              )}
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="submit-button">
              Se connecter
            </button>
          </form>
          <p className="annotation">* Champs obligatoires</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
