import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function OcrConfirmPopup({ parsedData, onConfirm, onCancel }) {
  const { t } = useTranslation();
  const [mainStat, setMainStat] = useState(null);
  const [subStats, setSubStats] = useState([]);
  const [type, setType] = useState('');
  const isConfirmDisabled = !type;

  const artifactTypes = Object.keys(t('titleArtifact', { returnObjects: true }));
  const statList = Object.keys(t('stats', { returnObjects: true }));

  useEffect(() => {
    if (parsedData) {
      setMainStat(parsedData.mainStat || { stat: '', value: '' });
      const padded = [...(parsedData.subStats || [])];
      while (padded.length < 4) padded.push({ stat: '', value: '', proc: 0 });
      setSubStats(padded);
      setType(parsedData.type || '');
    }
  }, [parsedData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'y' || e.key === 'Enter') && type) handleConfirm();
      if (e.key === 'n' || e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type]);

  const handleSubStatChange = (index, field, value) => {
    setSubStats(prev => {
      const updated = [...prev];
      updated[index][field] = field === 'value' || field === 'proc' ? +value : value;
      return updated;
    });
  };

  const handleConfirm = () => {
    onConfirm({ type, mainStat, subStats });
  };

  if (!mainStat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#2b1c42] text-white p-6 rounded-xl shadow-lg border border-violet-300 w-[90%] max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-center">{t("confirmStat")}</h2>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Type :</label>
          <select
            className="w-full px-3 py-2 rounded bg-[#1a1a2f] text-white"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">--</option>
            {artifactTypes.map((tKey) => (
              <option key={tKey} value={tKey}>{t(`titleArtifact.${tKey}`)}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Stat principale :</label>
          <div className="flex gap-2">
            <select
              className="w-1/2 px-2 py-1 rounded bg-[#1a1a2f] text-white"
              value={mainStat.stat}
              onChange={(e) => setMainStat(prev => ({ ...prev, stat: e.target.value }))}
            >
              <option value="">--</option>
              {statList.map((statKey) => (
                <option key={statKey} value={statKey}>{t(`stats.${statKey}`)}</option>
              ))}
            </select>
            <input
              type="number"
              className="w-1/2 px-2 py-1 rounded bg-[#1a1a2f] text-white"
              value={mainStat.value}
              onChange={(e) => setMainStat(prev => ({ ...prev, value: +e.target.value }))}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">Substats :</label>
          {subStats.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <select
                className="w-1/3 px-2 py-1 rounded bg-[#1a1a2f] text-white"
                value={s.stat}
                onChange={(e) => handleSubStatChange(i, 'stat', e.target.value)}
              >
                <option value="">--</option>
                {statList.map((statKey) => (
                  <option key={statKey} value={statKey}>{t(`stats.${statKey}`)}</option>
                ))}
              </select>
              <input
                type="number"
                className="w-1/3 px-2 py-1 rounded bg-[#1a1a2f] text-white"
                value={s.value}
                onChange={(e) => handleSubStatChange(i, 'value', e.target.value)}
              />
              <input
                type="number"
                className="w-1/3 px-2 py-1 rounded bg-[#1a1a2f] text-white"
                value={s.proc}
                onChange={(e) => handleSubStatChange(i, 'proc', e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-500 rounded"
          >
            ❌ Annuler (N)
          </button>
          <button
  onClick={handleConfirm}
  disabled={isConfirmDisabled}
  className={`px-4 py-2 rounded text-yellow transition-all duration-200
    ${isConfirmDisabled ? 'bg-gray-800 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}
  `}
>
  ✅ Confirmer (Y / Entrée)
</button>
        </div>
      </div>
    </div>
  );
}
