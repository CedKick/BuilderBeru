import { t } from 'i18next';
import frStats from '../../i18n/fr.json';
import enStats from '../../i18n/en.json';

// Fonction pour comparer sans accent
const normalize = str => {
  if (typeof str !== 'string') return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};


export function parseOcrText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const ocrTypeSynonyms = {
    casque: 'Helmet',
    heaume: 'Helmet',
    armure: 'Chest',
    robe: 'Chest',
    plastron: 'Chest',
    earrings : 'Earrings',
    torse: 'Chest',
    gants: 'Gloves',
    bottes: 'Boots',
    chaussures: 'Boots',
    collier: 'Necklace',
    necklace: 'Necklace',
    bracelet: 'Bracelet',
    ring : 'Ring',
    anneau: 'Ring',
    bague: 'Ring',
    boucles: 'Earrings',
    boucle: 'Earrings',
    armure: 'Chest',
    demon: 'Chest',
    'boots' : 'Boots',
    hat: 'Helmet',
    helmet: 'Helmet',
    'gloves' : 'Gloves',
    'body armor': 'Chest',
    'niv. 100 e': 'Earrings'

  };

  const statReverseMap = {};

  // Fusion FR + EN
  for (const [key, val] of Object.entries(enStats.stats)) {
    statReverseMap[normalize(val)] = key;
  }
  for (const [key, val] of Object.entries(frStats.stats)) {
    statReverseMap[normalize(val)] = key;
  }

  // C’est ici qu’on corrige :
  const statLabels = Object.keys(statReverseMap).sort((a, b) => b.length - a.length);

  const artifactTitleReverseMap = {};

  // Fusion FR + EN des titres d'artéfacts
  for (const [key, val] of Object.entries(enStats.titleArtifact)) {
    artifactTitleReverseMap[normalize(val)] = key;
  }
  for (const [key, val] of Object.entries(frStats.titleArtifact)) {
    artifactTitleReverseMap[normalize(val)] = key;
  }

  // Tri pour que les plus longues chaînes soient vérifiées en premier (comme les stats)
  const artifactTitles = Object.keys(artifactTitleReverseMap).sort((a, b) => b.length - a.length);



  const result = {
    type: '',
    mainStat: { stat: '', value: 0 },
    subStats: []
  };


  // 1. Trouver le type d'artefact
  const firstLine = lines[0];

  // Essaie de détecter via les synonymes OCR
  for (const [key, typeKey] of Object.entries(ocrTypeSynonyms)) {
    if (normalize(firstLine).includes(key)) {
      result.type = typeKey;
      break;
    }
  }

  if (!result.type) {
    const matchedArtifact = artifactTitles.find(title =>
      normalize(firstLine).includes(normalize(title))
    );
    if (matchedArtifact) {
      result.type = Object.keys(t('titleArtifact', { returnObjects: true })).find(
        key => normalize(t(`titleArtifact.${key}`)) === normalize(matchedArtifact)
      );
    }
  }

  // 2. Trouver la ligne de main stat + son index
  let mainStatLineIndex = -1;
  let mainStatLine = '';
  for (let i = 0; i < lines.length; i++) {
    if (statLabels.some(label =>
      normalize(lines[i]).includes(normalize(label))
    )) {
      mainStatLineIndex = i;
      mainStatLine = lines[i];
      break;
    }
  }

  if (mainStatLineIndex !== -1) {
    let label = statLabels.find(label =>
      normalize(mainStatLine).includes(normalize(label))
    );

    const ocrMainStatSynonyms = {
      'baisse': 'MP Consumption Reduction'
    };

    // 🧠 Correction avec synonymes OCR si label non trouvé
    if (!label) {
      const lowerLine = normalize(mainStatLine);
      for (const [synonym, corrected] of Object.entries(ocrMainStatSynonyms)) {
        if (lowerLine.includes(normalize(synonym))) {
          label = corrected;
          break;
        }
      }
    }
    if (label && typeof label === 'string') {
      const statKey = statReverseMap[normalize(label)];
      result.mainStat.stat = statKey;

      // 🔍 On isole uniquement la portion APRES le label
      const labelIndex = mainStatLine.toLowerCase().indexOf(label.toLowerCase());
      let rawPart = mainStatLine.slice(labelIndex + label.length).trim();

      // 🧹 Nettoyage des caractères spéciaux (comme les substats)
      const cleanOCR = (str) => {
        return str
          .replace(/[^a-zA-Z0-9+%.,\s]/g, '')
          .replace(/[\u00B0]/g, '')
          .replace(/(?<=\+)[Bb]/g, '6')
          .replace(/\b[Bb](?=\d)/g, '6')
          .replace(/\b1(?=[a-z])/gi, 'l');
      };

      rawPart = cleanOCR(rawPart);

      // 🎯 Extraction de la vraie valeur à droite du label
      let valueStr = rawPart.match(/[\d,.]+ ?%?/)?.[0] || '';

      if (label.includes('%')) {
        valueStr = valueStr.replace(',', '.');
      } else {
        valueStr = valueStr.replace(/[.,]/g, '');
      }

      result.mainStat.value = parseFloat(valueStr);
    }

    const ocrSubStatSynonyms = {
      'baisse': 'Baisse du coût de PM',
      'taux de récupération': 'Hausse du taux de récupération des PM (%)',
      'Hausse de soins (%)': 'Hausse de soins',
    };

    // 3. Substats à partir de la ligne suivante
    for (let i = mainStatLineIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      let cleanedLine = line.replace(/\(\+\d.*$/, '').trim();

      // 🧠 Tentative de matching exact
      let matchedLabel = statLabels.find(label =>
        normalize(cleanedLine).includes(normalize(label))
      );

      // 🩹 Si aucun match, on tente les synonymes OCR
      if (!matchedLabel) {
        const lowerLine = normalize(cleanedLine);
        for (const [synonym, corrected] of Object.entries(ocrSubStatSynonyms)) {
          if (lowerLine.includes(normalize(synonym))) {
            matchedLabel = corrected;
            break;
          }
        }
      }

      // 🛡️ Si vraiment rien trouvé, on skip
      if (!matchedLabel) continue;

      // 3. Réduction de la ligne pour ne garder que ce qu’il y a APRÈS le nom de la stat
      // cleanedLine = cleanedLine.slice(cleanedLine.toLowerCase().indexOf(matchedLabel.toLowerCase()) + matchedLabel.length).trim();
      cleanedLine = cleanedLine.replace(/[a-zA-Z]/g, '').trim();
      // ⚔️ Suppression du '6' isolé au début si suivi d'autres chiffres après
      if (/^6[\s]?/.test(cleanedLine) && /\d/.test(cleanedLine.slice(1))) {
        cleanedLine = cleanedLine.replace(/^6[\s]?/, '').trim();
      }
      // 🗡️ Même traitement pour un '1' douteux au début
      if (/^1[\s]?/.test(cleanedLine) && /\d/.test(cleanedLine.slice(1))) {
        cleanedLine = cleanedLine.replace(/^1[\s]?/, '').trim();
      }

      // 🗡️ Même traitement pour un '2' douteux au début
      if (/^2[\s]?/.test(cleanedLine) && /\d/.test(cleanedLine.slice(1))) {
        cleanedLine = cleanedLine.replace(/^2[\s]?/, '').trim();
      }

      // 4. Extraction du proc (ex: "+2")
      let proc = 0;
      const procMatch = cleanedLine.match(/\+([1-4])/);
      if (procMatch) {
        proc = parseInt(procMatch[1], 10);
        cleanedLine = cleanedLine.replace(procMatch[0], '').trim();
      }

      const cleanOCR = (str) => {
        return str
          .replace(/[^a-zA-Z0-9+%.,\s]/g, '')     // Caractères chelous
          .replace(/[\u00B0]/g, '')              // ° et co.
          .replace(/(?<=\+)[Bb]/g, '6')          // +B → +6
          .replace(/\b[Bb](?=\d)/g, '6')         // B en début suivi d’un chiffre → 6
          .replace(/\b1(?=[a-z])/gi, 'l');       // 1 suivi de lettres → l
      };

      cleanedLine = cleanOCR(cleanedLine);

      // 6. Extraction de la valeur
      let valueMatch = cleanedLine.match(/[\d,.]+ ?%?/);
      let valueStr = valueMatch?.[0] || '';
      valueStr = cleanOCR(valueStr).replace(',', '.');
      // 7. Traitement du . ou , selon si c’est une stat en %
      if (typeof matchedLabel === 'string') {
        if (matchedLabel.includes('%')) {
          valueStr = valueStr.replace(',', '.'); // ex : 2,5% → 2.5
        } else {
          valueStr = valueStr.replace(/[.,]/g, ''); // ex : 3.127 → 3127
        }
      }




      const value = valueStr ? parseFloat(valueStr) : 0;

      // 7. Ajout à l'objet
      result.subStats.push({
        stat: statReverseMap[normalize(matchedLabel)],
        value,
        proc
      });
       if (result.subStats.length === 4) {
    break; // On sort de la boucle dès qu'on a nos 4 substats
  }
    }
  }

  return result;
}