
import CalendarSelector from '../../components/CalendarSelector';
import React, { useState } from 'react';
export default function FinalStep({
  pseudo, setPseudo,
  score, setScore,
  videoUrl, setVideoUrl,
  level, setLevel,
  onConfirm,
  testDateRange, setTestDateRange,
  selectedElements,
  sungStats,
  sungLeftArtifact,
  sungRightArtifact,
  sungCore,
  weaponsSelected,
  sungSkills,
  sungCollapseDeath,
  sungBlessings,
  selectedHunters,
  fullSelectedHunters,
  selectedShadows
}) {
  const playerLevels = [
    'Whale', 'Dolphin','LowSpender D1', 'Free2Play D1', 'ComeBack player', 'New Player'
  ];

 const [formData, setFormData] = useState({
  testDateRange: null
});
const [guild, setGuild] = useState('');

const handleDateRange = (range) => {
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}T00:00:00`;
  };

  setTestDateRange({
    startDate: formatLocalDate(range.startDate),
    endDate: formatLocalDate(range.endDate),
  });
};

  const isYouTubeLink = (url) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);



  const isFormValid = () =>
    pseudo.trim() !== '' &&
    !isNaN(score) &&
    score.trim() !== '' &&
    isYouTubeLink(videoUrl) &&
    level !== '';

  return (
    <div className="p-4 flex flex-col gap-4 bg-gray-900 text-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold">Informations du joueur</h2>

      <input
        type="text"
        placeholder="Pseudo"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
        className="p-2 border rounded bg-gray-800"
      />
      <input
    id="guild"
    type="text"
    placeholder="Nom de la guilde"
    value={guild}
    onChange={(e) => setGuild(e.target.value)}
    className="p-2 border rounded bg-gray-800"
  />
      <input
        type="number"
        placeholder="Score"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        className="p-2 border rounded bg-gray-800"
      />
      <input
        type="text"
        placeholder="Lien vidéo YouTube"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className={`p-2 border rounded bg-gray-800 ${
          videoUrl && !isYouTubeLink(videoUrl) ? 'border-red-500' : ''
        }`}
      />
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="p-2 border rounded bg-gray-800"
      >
        <option value="">Choisis ton niveau</option>
        {playerLevels.map((lvl) => (
          <option key={lvl} value={lvl}>{lvl}</option>
        ))}
      </select>
      <CalendarSelector onSelect={handleDateRange} />

      <button
  disabled={!isFormValid()}
  onClick={() => {
 const finalData = {
  pseudo,
  score: parseInt(score, 10),
  videoUrl,
  level,
  testDateRange,
  guild,
  boss: 'Ennio',
  selectedElements,
  sungStats,
  sungLeftArtifact,
  sungRightArtifact,
  sungCore,
  weaponsSelected,
  sungSkills,
  sungBlessings,
  sungCollapseDeath,
  selectedHunters,
  fullSelectedHunters,
  selectedShadows
};

    // 1. Appel de onConfirm (comme actuellement)
    onConfirm(finalData);

    // 2. Copie dans le presse-papier
    const jsonString = JSON.stringify(finalData, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      alert('JSON copié dans le presse-papier ! 😎');
    }).catch((err) => {
      console.error('Erreur de copie', err);
      alert('Erreur lors de la copie du JSON 😢');
    });
  }}
  className={`p-2 rounded font-bold ${
    isFormValid()
      ? 'bg-yellow-400 text-black hover:bg-yellow-500'
      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
  }`}
>
  Finaliser la fiche
</button>
    </div>
  );
}