export const handleNumericInput = (e, { allowDecimal = false, maxDecimals = 2 } = {}, onValidValue) => {
  let raw = e.target.value;

  // Nettoyage de base
  raw = raw.replace(/\s/g, '').replace(/,/g, '.');

  // Supprimer les doubles points
  const parts = raw.split('.');
  if (parts.length > 2) {
    raw = parts[0] + '.' + parts[1];
  }

  // Si les décimales sont interdites, on supprime tous les points
  if (!allowDecimal) {
    raw = raw.replace(/\./g, '');
  }

  // Limite les décimales
  if (allowDecimal && raw.includes('.')) {
    const [intPart, decPart] = raw.split('.');
    raw = intPart + '.' + decPart.slice(0, maxDecimals);
  }

  // 🔄 Si vide, on renvoie null pour indiquer un reset sans bloquer
  if (raw === '') {
    onValidValue(null); // à gérer dans ta fonction comme 0 ou "non défini"
    return;
  }

  const parsed = parseFloat(raw);
  if (!isNaN(parsed)) {
    onValidValue(parsed);
  }
};