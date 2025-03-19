interface Polluant {
  polluant: string;
  statut: string;
  statut_rang: number;
}

interface Categorie {
  categorie: string;
  resume: {
    statut: string;
    statut_rang: number;
  };
  polluants: Polluant[];
}

interface Data {
  periode: string;
  tous_polluants?: {
    statut: string;
    statut_rang: number;
  };
  categories: Categorie[];
}

interface UDI {
  id: string;
  nom: string;
  communes_desservies: { nom: string; code_insee: string }[];
  data: Data[];
}

export const mockData: { [key: string]: UDI } = {
  UDI12345: {
    id: "UDI12345",
    nom: "Clermont-Ferrand Est",
    communes_desservies: [
      { nom: "Clermont-Ferrand", code_insee: "12345" },
      { nom: "Gerzay", code_insee: "67890" },
      { nom: "Aulnat", code_insee: "98765" },
    ],
    data: [
      {
        periode: "dernieres_analyses",
        tous_polluants: {
          statut: "Au moins 1 PFAS > valeur sanitaire",
          statut_rang: 1,
        },
        categories: [
          {
            categorie: "PFAS",
            resume: {
              statut: "Au moins 1 PFAS > valeur sanitaire",
              statut_rang: 1,
            },
            polluants: [
              {
                polluant: "PFOA (Acide perfluorooctanoïque)",
                statut: "Seuil sanitaire dépassé",
                statut_rang: 1,
              },
              {
                polluant: "PFNA (Acide perfluorononanoïque)",
                statut: "Seuil qualité dépassé",
                statut_rang: 2,
              },
              // Ajoutez d'autres polluants ici...
            ],
          },
          {
            categorie: "CVM",
            resume: {
              statut: "Au moins 1 PFAS > valeur sanitaire",
              statut_rang: 1,
            },
            polluants: [
              {
                polluant: "CVM_1",
                statut: "Seuil sanitaire dépassé",
                statut_rang: 1,
              },
              {
                polluant: "CVM_2",
                statut: "Seuil qualité dépassé",
                statut_rang: 2,
              },
              // Ajoutez d'autres polluants ici...
            ],
          },
          // Ajoutez d'autres catégories ici...
        ],
      },
      {
        periode: "2025",
        categories: [
          {
            categorie: "PFAS",
            resume: {
              statut: "Au moins 1 PFAS > valeur sanitaire",
              statut_rang: 1,
            },
            polluants: [
              {
                polluant: "PFOA (Acide perfluorooctanoïque)",
                statut: "Seuil sanitaire dépassé",
                statut_rang: 1,
              },
              {
                polluant: "PFNA (Acide perfluorononanoïque)",
                statut: "Seuil qualité dépassé",
                statut_rang: 2,
              },
              // Ajoutez d'autres polluants ici...
            ],
          },
          {
            categorie: "CVM",
            resume: {
              statut: "Au moins 1 PFAS > valeur sanitaire",
              statut_rang: 1,
            },
            polluants: [
              {
                polluant: "CVM_1",
                statut: "Seuil sanitaire dépassé",
                statut_rang: 1,
              },
              {
                polluant: "CVM_2",
                statut: "Seuil qualité dépassé",
                statut_rang: 2,
              },
              // Ajoutez d'autres polluants ici...
            ],
          },
          // Ajoutez d'autres catégories ici...
        ],
      },
    ],
  },
};
