// src/components/ScoreCard/bdgService.js
export const validateBuildCompleteness = () => {
  const warnings = [];
  
  // Récupérer les données depuis le localStorage ou le state global
  const artifactsData = JSON.parse(localStorage.getItem('artifactsData') || '{}');
  const selectedCharacter = localStorage.getItem('selectedCharacter');
  
  // Vérifier Sung
  const sungArtifacts = Object.values(artifactsData).filter(a => a && a.mainStat);
  if (sungArtifacts.length < 8) {
    warnings.push({
      type: 'sung_incomplete',
      message: `Sung Jin-Woo n'a que ${sungArtifacts.length}/8 artifacts équipés`
    });
  }
  
  // Pour les hunters, on vérifiera plus tard quand on aura la structure
  
  return warnings;
};

export const loadBuildData = () => {
  // Charger toutes les données nécessaires
  const artifactsData = JSON.parse(localStorage.getItem('artifactsData') || '{}');
  const hunterCores = JSON.parse(localStorage.getItem('hunterCores') || '{}');
  const gemData = JSON.parse(localStorage.getItem('gemData') || '{}');
  
  return {
    artifacts: artifactsData,
    cores: hunterCores,
    gems: gemData
  };
};

export const validateScores = (scoreData, limits) => {
  const errors = [];
  
  if (scoreData.totalScore > limits.maxTotalScore) {
    errors.push('Score total dépasse la limite');
  }
  
  if (scoreData.rageCount < limits.rageCountRange.min || 
      scoreData.rageCount > limits.rageCountRange.max) {
    errors.push('Rage count hors limites');
  }
  
  return errors;
};