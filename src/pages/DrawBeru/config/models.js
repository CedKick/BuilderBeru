// src/pages/DrawBeru/config/models.js
export const drawBeruModels = {
  ilhwan: {
    name: "Ilhwan",
    description: "Hunter polyvalent de BuilderBeru",
    models: {
      default: {
        id: "default",
        name: "Ilhwan Classique",
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759920073/ilhwan_orig_fm4l2o.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759920073/ilhwan_uncoloried_uzywyu.png",
        canvasSize: {
          width: 450,
          height: 675
        },
        palette: {
          "1": "#F5DEB3", // Peau
          "2": "#2F2F2F", // Cheveux noirs
          "3": "#8B4513", // Marron vêtements
          "4": "#DC143C", // Rouge
          "5": "#FFFFFF", // Blanc
          "6": "#000000", // Noir
          "7": "#FFD700", // Or
          "8": "#4B0082"  // Violet
        }
      }
      // Futurs modèles d'Ilhwan :
      // casual: { ... },
      // battle: { ... },
      // summer: { ... }
    }
  },
  Yuqi: {
    name: "Yuqi",
    description: "Hunter polyvalent de BuilderBeru",
    models: {
      default: {
        id: "default",
        name: "Yuqi Classique",
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759927874/yuki_origi_m4l9h6.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759927873/yuki_uncoloried_nyhkmc.png",
        canvasSize: {
          width: 300,
          height: 450
        },
        palette: {
  "1": "#3c3331",
  "2": "#fdd8b8",
  "3": "#1c1718",
  "4": "#c48e6d",
  "5": "#070402",
  "6": "#2d2d39",
  "7": "#645249",
  "8": "#f7f1e6"
}
      }
      // Futurs modèles d'Ilhwan :
      // casual: { ... },
      // battle: { ... },
      // summer: { ... }
    }
  },

  // Futurs hunters :
  // beru: { ... },
  // tank: { ... }
};

// Helper pour récupérer un modèle spécifique
export const getModel = (hunter, modelId = 'default') => {
  return drawBeruModels[hunter]?.models[modelId] || null;
};

// Helper pour récupérer tous les modèles d'un hunter
export const getHunterModels = (hunter) => {
  return drawBeruModels[hunter]?.models || {};
};

// Helper pour récupérer la liste des hunters disponibles
export const getAvailableHunters = () => {
  return Object.keys(drawBeruModels);
};