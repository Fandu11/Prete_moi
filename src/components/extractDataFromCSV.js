import Papa from "papaparse";

const fetchData = async () => {
  try {
    const response = await fetch("/villes_france.csv");

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des données CSV");
    }

    // Vérifier le type de contenu de la réponse
    const contentType = response.headers.get("Content-Type");

    if (!contentType || !contentType.includes("text/csv")) {
      throw new Error("Le serveur n'a pas renvoyé de fichier CSV");
    }

    const csvData = await response.text();

    // Parse CSV data using Papaparse
    const parsedData = Papa.parse(csvData, { header: false });

    // Extract specified columns for each city
    const extractedData = parsedData.data.map((row) => {
      return {
        id: row[0], // Premier élément dans la ligne CSV
        departement: row[1], // Deuxième élément dans la ligne CSV
        nom: row[5], // Sixième élément dans la ligne CSV
        code_postal: row[8], // Neuvième élément dans la ligne CSV
      };
    });

    // Afficher les données extraites
    console.log(extractedData);

    // Retourner les données extraites si nécessaire
    return extractedData;
  } catch (error) {
    console.error("Erreur lors de la récupération des données CSV :", error);
    // Gérer l'erreur en conséquence
  }
};

// Export de la fonction fetchData
export default fetchData;
