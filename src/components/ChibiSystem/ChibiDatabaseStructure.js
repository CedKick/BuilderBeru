// 🎮 CHIBI DATABASE STRUCTURE
// Fichier d'export combiné pour faciliter les imports
// Par Kaisel 🐉 pour le Monarque des Ombres

// Importer tout depuis ChibiDataStructure
import {
  CHIBI_RARITIES,
  CHIBI_MOODS,
  UNLOCK_METHODS,
  ChibiEntity,
  ChibiFactory,
  ChibiInteractionManager
} from './ChibiDataStructure';

// Ré-exporter tout
export {
  CHIBI_RARITIES,
  CHIBI_MOODS,
  UNLOCK_METHODS,
  ChibiEntity,
  ChibiFactory,
  ChibiInteractionManager
};

// Export par défaut pour compatibilité
export default {
  CHIBI_RARITIES,
  CHIBI_MOODS,
  UNLOCK_METHODS,
  ChibiEntity,
  ChibiFactory,
  ChibiInteractionManager
};