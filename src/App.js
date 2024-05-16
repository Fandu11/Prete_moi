import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Home";
import LoginPage from "./Login";
import DemandeUser from "./DemandeUsers";
import RegisterPage from "./Register";
import ProfilePage from "./Profile";
import DemandeCreatePage from "./DemandeCreate";
import DemandeUpdatePage from "./DemandeUpdate";
import RecherchePage from "./Recherche";
import AnnonceUser from "./AnnonceUsers";
import NotFoundPage from "./NotFound"; // Importez la page NotFound que vous souhaitez afficher
import AnnonceCreatePage from "./AnnonceCreate";
import AnnonceUpdatePage from "./AnnonceUpdate";
import ConversationPage from "./Conversation";
import AvisUtilisateurPage from "./AvisUtilisateur";
import ProfileUpdate from "./ProfileUpdate";
import ArticlePage from "./Article";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/user/annonces" element={<AnnonceUser />} />
        <Route path="/create/annonce" element={<AnnonceCreatePage />} />
        <Route path="/update/annonce/:id" element={<AnnonceUpdatePage />} />
        <Route path="/create/demande" element={<DemandeCreatePage />} />
        <Route path="/update/demande/:id" element={<DemandeUpdatePage />} />
        <Route path="/user/demandes" element={<DemandeUser />} />
        <Route path="/recherche" element={<RecherchePage />} />
        <Route path="/conversation/:id" element={<ConversationPage />} />
        <Route path="/avis/utilisateur/:otheruserid" element={<AvisUtilisateurPage />} />
        <Route path="/profile/update" element={<ProfileUpdate />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        {/* Ajoutez la route wildcard pour gérer les routes inexistantes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
