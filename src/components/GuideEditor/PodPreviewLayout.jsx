import React from 'react';
import { bossData } from '../../data/itemData';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';
import { elementData } from '../../data/itemData';
import SungStatsRadar from './SungStatsRadar';

export default function PodPreviewLayout({ formData }) {
  const {
    pseudo,
    score,
    videoUrl,
    level,
    sungStats,
    sungLeftArtifact,
    sungRightArtifact,
    sungCore,
    weaponsSelected,
    sungSkills,
    sungBlessings,
    sungCollapseDeath,
    selectedHunters,
    selectedShadows,
    boss = 'Ennio', // valeur par défaut
    selectedElements,

  } = formData || {};

  function extractYouTubeId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
    return match ? match[1] : null;
  }

  const bossInfo = bossData.find((b) => b.name === boss);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-xl text-white w-full">
      {/* Informations joueur */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold border-b border-purple-400 pb-1 mb-4">Joueur</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 items-start">

          {/* Colonne 1 - Pseudo / Guilde */}
          <div>
            <p><strong>Pseudo :</strong> {pseudo || 'Non renseigné'}</p>
            <p><strong>Guilde :</strong> {formData.guild || 'Non renseignée'}</p>
          </div>

          {/* Colonne 2 - Date / Score / Niveau */}
          <div>
            {formData.testDateRange ? (
              <div className="text-sm text-gray-300">
                🗓️ du <strong>{format(new Date(formData.testDateRange.startDate), 'dd MMM yyyy', { locale: fr })}</strong><br />
                au <strong>{format(new Date(formData.testDateRange.endDate), 'dd MMM yyyy', { locale: fr })}</strong>
              </div>
            ) : (
              <p className="text-sm italic text-gray-500">Date non renseignée</p>
            )}
            <p className="mt-2"><strong>Score :</strong> {score ? parseInt(score).toLocaleString('fr-FR') : 'Non renseigné'}</p>
            <p><strong>Niveau :</strong> {level || 'Non renseigné'}</p>
          </div>

          {/* Colonne 3 - Vidéo */}
          <div>
            {videoUrl ? (
              <iframe
                width="200"
                height="112"
                src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}`}
                title="Vidéo YouTube"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded"
              />
            ) : (
              <p className="text-sm italic text-gray-500">Vidéo non renseignée</p>
            )}
          </div>

          {/* Colonne 4 - Boss */}
          {/* Colonne 4 - Boss avec éléments */}
          {/* Colonne 4 - Boss avec éléments intégrés dans l'image */}
          <div className="relative w-40 h-40">
            <img loading="lazy"
              src={bossInfo?.src}
              alt={boss}
              className="w-80% h-80% rounded-md shadow-md object-cover"
            />
            {selectedElements?.length > 0 && (
              <div className="absolute bottom-11 left-1 flex gap-[1px]">
                {selectedElements.map((el, idx) => (
                  <img loading="lazy"
                    key={idx}
                    src={elementData[el.toLowerCase()]}
                    alt={el}
                    className="w-12 h-12 object-contain"
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sung Jin-Woo */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold border-b border-purple-400 pb-1 mb-1">Sung JinWoo</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 text-sm">

          {/* Col 1 – Radar Chart */}
          <div className="flex justify-center items-center">
            <div className="w-[160px] h-[160px]">
              <SungStatsRadar stats={sungStats} />
            </div>
          </div>

          {/* Col 2 – Stats & Stuff */}
          <div>
            <p className="font-bold mb-1">Stats :</p>
            <ul className="list-disc  ml-4 mb-2">
              {sungStats && Object.entries(sungStats).map(([key, val]) => (
                <li key={key}>{key} : {val}</li>
              ))}
            </ul>

            <p className="font-bold mb-1">Stuff :</p>
            <div className="flex justify-between text-center gap-1">

              {/* Gauche */}
              <div>
                {sungLeftArtifact?.map((a, i) => (
                  <img loading="lazy"
                    key={`sung-left-${i}`}
                    src={a.src}
                    alt={a.name}
                    title={a.name}
                    className="w-12 h-12 inline-block mx-[1px]"
                  />
                ))}
              </div>

              {/* Core */}
              <div>
                {sungCore && Object.values(sungCore).map((core, i) => (
                  <img loading="lazy"
                    key={`sung-core-${i}`}
                    src={core.src}
                    alt={core.name}
                    title={core.name}
                    className="w-12 h-12 inline-block mx-[1px]"
                  />
                ))}
              </div>

              {/* Droite */}
              <div>
                {sungRightArtifact?.map((a, i) => (
                  <img loading="lazy"
                    key={`sung-right-${i}`}
                    src={a.src}
                    alt={a.name}
                    title={a.name}
                    className="w-12 h-12 inline-block mx-[1px]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Col 3 – Armes / Skills / Collapse-Death */}
          <div className="flex flex-col gap-2">
  <div>
    <p className="font-bold mb-1">Armes :</p>
    <div className="flex gap-1 flex-wrap">
      {weaponsSelected?.map((w, idx) => (
        <img loading="lazy" key={idx} src={w.src} alt={w.name} className="w-26 h-26" />
      ))}
    </div>
  </div>

  <div className="flex gap-1 items-start">
    {/* Skills */}
    <div>
      <p className="font-bold mb-1">Skills :</p>
      <div className="flex gap-1 flex-wrap">
        {sungSkills?.map((s, idx) => (
          <img loading="lazy" key={idx} src={s.src} alt={s.name} title={s.name} className="w-12 h-12" />
        ))}
      </div>
    </div>

    {/* Collapse / Death */}
    <div>
      <p className="font-bold mb-1">Collapse / Death :</p>
      <div className="flex gap-2">
        <div className="text-center">
          {sungCollapseDeath?.collapse && (
            <img loading="lazy" src={sungCollapseDeath.collapse.src} alt="Collapse" className="w-12 h-12" />
          )}
        </div>
        <div className="text-center">
          {sungCollapseDeath?.death && (
            <img loading="lazy" src={sungCollapseDeath.death.src} alt="Death" className="w-12 h-12" />
          )}
        </div>
      </div>
    </div>
  </div>
</div>


          {/* Col 4 – Bénédictions */}
          <div>
            <p className="font-bold mb-1">Bénédictions :</p>
            <p className="text-xs">Offensives :</p>
            <div className="flex flex-wrap gap-1 mb-1">
              {sungBlessings?.offensive?.map((stone, idx) => (
                <img loading="lazy" key={`off-${idx}`} src={stone.src} alt={stone.name} title={stone.name} className="w-12 h-12" />
              ))}
            </div>
            <p className="text-xs">Défensives :</p>
            <div className="flex flex-wrap gap-1">
              {sungBlessings?.defensive?.map((stone, idx) => (
                <img loading="lazy" key={`def-${idx}`} src={stone.src} alt={stone.name} title={stone.name} className="w-12 h-12" />
              ))}
            </div>
          </div>
        </div>
      </div>





      {/* Hunters */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold border-b border-purple-400 pb-1 mb-1">Hunters</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedHunters.map((hunter, idx) => (
            <div key={idx} className="bg-gray-700 p-4 rounded-lg shadow-md">
              <h4 className="font-bold text-purple-300 mb-1">{hunter.name}</h4>

             {/* Artefacts */}
<div className="mb-1">
  <strong>Artefacts :</strong>
  <div className="flex gap-2 mt-1 items-center justify-between">
    {/* Bloc artefacts */}
    <div className="flex gap-2 items-center">
      {hunter.leftArtifact?.length > 0 ? (
        hunter.leftArtifact.map((a, i) => (
          <div key={`left-${i}`} className="flex flex-col items-center">
            <img loading="lazy" src={a.src} alt={a.name} className="w-20 h-20 object-contain" />
            <span className="text-xs text-center">{a.name}</span>
          </div>
        ))
      ) : (
        <span className="text-sm italic text-gray-400">Aucun (gauche)</span>
      )}

      <span className="mx-2 text-purple-400 font-bold">|</span>

      {hunter.rightArtifact?.length > 0 ? (
        hunter.rightArtifact.map((a, i) => (
          <div key={`right-${i}`} className="flex flex-col items-center">
            <img loading="lazy" src={a.src} alt={a.name} className="w-20 h-20 object-contain" />
            <span className="text-xs text-center">{a.name}</span>
          </div>
        ))
      ) : (
        <span className="text-sm italic text-gray-400">Aucun (droite)</span>
      )}
    </div>

    {/* Image du Hunter */}
    {hunter.img && (
      <div className="ml-4">
        <img loading="lazy"
          src={hunter.img}
          alt={hunter.name}
          title={hunter.name}
          className="w-30 h-30 object-contain rounded-full border shadow"
        />
      </div>
    )}
  </div>
</div>

              {/* Noyaux */}
              <div className="mb-1">
                <strong>Noyaux :</strong>
                {hunter.core ? (
                  <div className="flex gap-2 mt-1">
                    {Object.values(hunter.core)
                      .filter((c) => c?.name)
                      .map((core, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <img loading="lazy" src={core.src} alt={core.name} className="w-12 h-12 object-contain" />
                          <span className="text-xs text-center">{core.name}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <span className="text-sm italic text-gray-400 ml-2">Aucun</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ombres */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold border-b border-purple-400 pb-1 mb-1">Ombres</h3>
        {selectedShadows?.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-start">
            {selectedShadows.map((s, idx) => (
              <div key={idx} className="flex flex-col items-center text-xs">
                <img loading="lazy"
                  src={s.src}
                  alt={s.name}
                  title={s.name}
                  className="w-40 h-40 rounded shadow-md"
                />
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray-400">Aucune ombre sélectionnée</p>
        )}
      </div>


    </div>
  );
}
