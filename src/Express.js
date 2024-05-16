const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const secretKey = "your_secret_key";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/Emprunt", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Erreur de connexion à MongoDB :"));
db.once("open", () => {
  console.log("Connecté à la base de données MongoDB");
});

// Modèle Avis
const Avis = mongoose.model("Avis", {
  date: Date,
  note: Number,
  personne: String,
  description: String,
});

// Modèle Utilisateur
const Utilisateur = mongoose.model("Utilisateur", {
  nom: String,
  prenom: String,
  mail: String,
  motDePasse: String,
  localisation: String,
  telephone: { type: String, required: false }, // Déclarer que le numéro de téléphone n'est pas obligatoire
  telSurAnnonces: Boolean,
  annonces: [{ type: mongoose.Schema.Types.ObjectId, ref: "Annonce" }],
  demandes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Demande" }],
  avis: [{ type: mongoose.Schema.Types.ObjectId, ref: "Avis" }],
  conversations: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  ],
  photo: String,
});

// Modèle Annonce
const Annonce = mongoose.model("Annonce", {
  proposeur: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" },
  titre: String,
  date: Date,
  images: String,
  description: String,
  etat: { type: String, enum: ["disponible", "emprunté", "indisponible"] },
  emprunteur: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" },
  dateEmprunt: Date,
  avis: [{ type: mongoose.Schema.Types.ObjectId, ref: "Avis" }],
});

// Modèle Demande
const Demande = mongoose.model("Demande", {
  demandeur: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" },
  titre: String,
  date: Date,
  description: String,
});

// Modèle Message
const MessageSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" },
    texte: String,
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);

// Modèle Conversation
const ConversationSchema = new mongoose.Schema({
  utilisateurs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" }],
  messages: [MessageSchema],
});

const Conversation = mongoose.model("Conversation", ConversationSchema);

module.exports = { Conversation, Message };

// Routes pour les opérations CRUD sur les avis
app.post("/avis", async (req, res) => {
  try {
    const avis = new Avis(req.body);
    await avis.save();
    res.status(201).send(avis);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/avis", async (req, res) => {
  try {
    const avis = await Avis.find();
    res.send(avis);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/avis/:id", async (req, res) => {
  try {
    const avis = await Avis.findById(req.params.id);
    if (!avis) {
      return res.status(404).send("Avis non trouvé");
    }
    res.send(avis);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/avis/:id", async (req, res) => {
  try {
    const avis = await Avis.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!avis) {
      return res.status(404).send("Avis non trouvé");
    }
    res.send(avis);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/avis/:id", async (req, res) => {
  try {
    const avis = await Avis.findByIdAndDelete(req.params.id);
    if (!avis) {
      return res.status(404).send("Avis non trouvé");
    }
    res.send(avis);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Routes pour les opérations CRUD sur les utilisateurs
app.post("/utilisateurs", async (req, res) => {
  try {
    const {
      nom,
      prenom,
      mail,
      motDePasse,
      localisation,
      telephone,
      telSurAnnonces,
    } = req.body;

    // Vérifier si l'utilisateur existe déjà dans la base de données
    const existingUser = await Utilisateur.findOne({ mail });
    if (existingUser) {
      return res.status(400).json({
        message: "Un utilisateur avec cette adresse e-mail existe déjà",
      });
    }

    // Hacher le mot de passe avant de l'enregistrer dans la base de données
    const hashedPassword = CryptoJS.SHA256(motDePasse).toString(
      CryptoJS.enc.Hex
    );

    // Créer un nouvel utilisateur avec les données du formulaire
    const newUser = new Utilisateur({
      nom,
      prenom,
      mail,
      motDePasse: hashedPassword,
      localisation,
      telephone,
      telSurAnnonces,
    });

    // Enregistrer le nouvel utilisateur dans la base de données
    await newUser.save();

    res.status(201).json({
      message: "Utilisateur enregistré avec succès",
      utilisateur: newUser,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription de l'utilisateur :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'inscription de l'utilisateur" });
  }
});

// Récupérer tous les utilisateurs (en excluant les mots de passe)
app.get("/utilisateurs", async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find().select("-motDePasse");
    res.send(utilisateurs);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Récupérer un utilisateur par son ID (en excluant le mot de passe)
app.get("/utilisateurs/:id", async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id).select(
      "-motDePasse"
    );
    if (!utilisateur) {
      return res.status(404).send("Utilisateur non trouvé");
    }
    res.send(utilisateur);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route pour mettre à jour un utilisateur par son ID
app.put("/utilisateurs/:id", async (req, res) => {
  try {
    const utilisateurData = req.body;
    // Si le mot de passe est inclus dans les données de mise à jour, hacher-le avant de le mettre à jour dans la base de données
    if (utilisateurData.motDePasse) {
      utilisateurData.motDePasse = CryptoJS.SHA256(
        utilisateurData.motDePasse
      ).toString(CryptoJS.enc.Hex);
    }
    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      utilisateurData,
      { new: true }
    );
    if (!utilisateur) {
      return res.status(404).send("Utilisateur non trouvé");
    }
    res.send(utilisateur);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route pour supprimer un utilisateur par son ID
app.delete("/utilisateurs/:id", async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByIdAndDelete(req.params.id);
    if (!utilisateur) {
      return res.status(404).send("Utilisateur non trouvé");
    }
    res.send(utilisateur);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route de connexion
app.post("/login", async (req, res) => {
  try {
    const { mail, password } = req.body;

    // Rechercher l'utilisateur par son adresse e-mail
    const user = await Utilisateur.findOne({ mail });

    if (!user) {
      // Si l'utilisateur n'est pas trouvé, renvoyer une erreur 401
      return res.status(401).json({
        message: "Utilisateur non trouvé. Mail ou mot de passe incorrect",
      });
    }

    // Comparer le mot de passe haché stocké avec le mot de passe fourni
    const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

    if (hashedPassword !== user.motDePasse) {
      // Si les mots de passe ne correspondent pas, renvoyer une erreur 401
      return res
        .status(401)
        .json({ message: "Mail ou mot de passe incorrect" });
    }

    // Si l'authentification réussit, générer un token JWT
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });

    // Stocker le token dans un cookie sécurisé
    res.cookie("token", token, {
      httpOnly: true, // Empêche l'accès au cookie via JavaScript
      secure: true, // Ne transmettre le cookie que sur une connexion HTTPS sécurisée
      sameSite: "strict", // Limite le cookie à une utilisation dans le même site
      maxAge: 3600000, // Durée de vie du cookie en millisecondes (1 heure dans cet exemple)
      path: "/", // Chemin d'accès du cookie (racine dans cet exemple)
    });

    // Envoyer le token et l'ID de l'utilisateur dans la réponse
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    // En cas d'erreur, renvoyer une réponse 500 avec un message d'erreur
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});

// Routes pour les opérations CRUD sur les annonces
app.post("/annonces", async (req, res) => {
  try {
    const annonce = new Annonce(req.body);
    await annonce.save();
    res.status(201).send(annonce);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/annonces", async (req, res) => {
  try {
    const annonces = await Annonce.find();
    res.send(annonces);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/annonces/:id", async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) {
      return res.status(404).send("Annonce non trouvée");
    }
    res.send(annonce);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/annonces/:id", async (req, res) => {
  try {
    const annonce = await Annonce.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!annonce) {
      return res.status(404).send("Annonce non trouvée");
    }
    res.send(annonce);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/annonces/:id", async (req, res) => {
  try {
    const annonce = await Annonce.findByIdAndDelete(req.params.id);
    if (!annonce) {
      return res.status(404).send("Annonce non trouvée");
    }
    res.send(annonce);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Routes pour les opérations CRUD sur les demandes
app.post("/demandes", async (req, res) => {
  try {
    const demande = new Demande(req.body);
    await demande.save();
    res.status(201).send(demande);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/demandes", async (req, res) => {
  try {
    const demandes = await Demande.find();
    res.send(demandes);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/demandes/:id", async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id);
    if (!demande) {
      return res.status(404).send("Demande non trouvée");
    }
    res.send(demande);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/demandes/:id", async (req, res) => {
  try {
    const demande = await Demande.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!demande) {
      return res.status(404).send("Demande non trouvée");
    }
    res.send(demande);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/demandes/:id", async (req, res) => {
  try {
    const demande = await Demande.findByIdAndDelete(req.params.id);
    if (!demande) {
      return res.status(404).send("Demande non trouvée");
    }
    res.send(demande);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Routes pour les opérations CRUD sur les conversations
app.post("/conversations", async (req, res) => {
  try {
    const { utilisateurs } = req.body;
    const conversation = new Conversation({ utilisateurs });
    await conversation.save();
    res.status(201).send(conversation);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/conversations", async (req, res) => {
  try {
    const conversations = await Conversation.find();
    res.send(conversations);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/conversations/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).send("Conversation non trouvée");
    }
    res.send(conversation);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/conversations/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!conversation) {
      return res.status(404).send("Conversation non trouvée");
    }
    res.send(conversation);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/conversations/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.id);
    if (!conversation) {
      return res.status(404).send("Conversation non trouvée");
    }
    res.send(conversation);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Routes pour les opérations CRUD sur les messages d'une conversation
app.post("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const { utilisateur, texte } = req.body;
    const message = new Message({ utilisateur, texte });
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.conversationId,
      { $push: { messages: message } },
      { new: true }
    );
    if (!conversation) {
      return res.status(404).send("Conversation non trouvée");
    }
    res.status(201).send(message);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
