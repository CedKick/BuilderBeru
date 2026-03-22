import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../colosseum-theme.css';

const TutorialModal = ({ show, onClose }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
          className="w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-2xl border border-indigo-500/40 bg-[#0f0f2a] p-5 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Comment Jouer</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl transition-colors">&times;</button>
          </div>

          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-sm font-bold text-indigo-300 mb-2">1. Les Elements</div>
            <p className="text-normal-responsive text-gray-400 mb-2">Chaque chibi a un element. Exploite les faiblesses pour +30% de degats !</p>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-normal-responsive"><span className="text-purple-400">{'\uD83C\uDF11'} Ombre</span> &gt; <span className="text-emerald-400">{'\uD83D\uDCA8'} Vent</span></div>
              <div className="text-normal-responsive"><span className="text-red-400">{'\uD83D\uDD25'} Feu</span> &gt; <span className="text-purple-400">{'\uD83C\uDF11'} Ombre</span></div>
              <div className="text-normal-responsive"><span className="text-emerald-400">{'\uD83D\uDCA8'} Vent</span> &gt; <span className="text-amber-400">{'\uD83E\uDEA8'} Terre</span></div>
              <div className="text-normal-responsive"><span className="text-amber-400">{'\uD83E\uDEA8'} Terre</span> &gt; <span className="text-red-400">{'\uD83D\uDD25'} Feu</span></div>
              <div className="text-normal-responsive"><span className="text-blue-400">{'\uD83D\uDCA7'} Eau</span> &gt; <span className="text-red-400">{'\uD83D\uDD25'} Feu</span></div>
              <div className="text-normal-responsive"><span className="text-yellow-300">{'\u2728'} Lumiere</span> &gt; <span className="text-purple-400">{'\uD83C\uDF11'} Ombre</span></div>
            </div>
          </div>

          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-sm font-bold text-emerald-300 mb-2">2. Farming & Leveling</div>
            <div className="space-y-1 text-normal-responsive text-gray-400">
              <p>{'\u2694\uFE0F'} <b className="text-white">Combats d'etages</b> : Bats des ennemis de plus en plus forts pour gagner de l'XP, des coins et des marteaux.</p>
              <p>{'\uD83D\uDCC8'} <b className="text-white">Montee en niveau</b> : Chaque niveau donne des points de stats a repartir (PV, ATK, DEF, SPD, CRIT, RES, MANA).</p>
              <p>{'\uD83C\uDF33'} <b className="text-white">Arbre de competences</b> : Debloque des ameliorations pour les sorts de tes chibis.</p>
              <p>{'\uD83C\uDFC5'} <b className="text-white">Talents</b> : Des bonus passifs puissants. Plus tu progresses, plus tu en debloques.</p>
              <p>{'\uD83C\uDF10'} <b className="text-white">Niveau de compte</b> : Tous les 10 niveaux, choisis une stat a booster de +10 pts pour TOUS tes personnages !</p>
            </div>
          </div>

          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-sm font-bold text-amber-300 mb-2">3. Equipement</div>
            <div className="space-y-1 text-normal-responsive text-gray-400">
              <p>{'\uD83D\uDD2E'} <b className="text-white">Artefacts</b> : Forge-les dans la Boutique (rare/legendaire/mythique). Chaque piece a une stat principale et des sub-stats.</p>
              <p>{'\u2B06\uFE0F'} <b className="text-white">Amelioration</b> : Utilise des Marteaux + coins pour monter tes artefacts (max Lv20). Tous les 5 niveaux, une sub-stat est boostee !</p>
              <p>{'\uD83D\uDEE1\uFE0F'} <b className="text-white">Sets</b> : Equipe 2 ou 4 pieces du meme set pour des bonus puissants (ATK%, DEF%, SPD...).</p>
              <p>{'\u2694\uFE0F'} <b className="text-white">Armes</b> : Achete des armes dans la Boutique pour booster l'ATK de base.</p>
              <p>{'\uD83D\uDC9C'} <b className="text-white">Sets de Raid</b> : Des sets exclusifs avec des passives uniques ! Obtenus uniquement via le Raid Boss.</p>
            </div>
          </div>

          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-sm font-bold text-violet-300 mb-2">4. Mana</div>
            <div className="space-y-1 text-normal-responsive text-gray-400">
              <p>{'\uD83D\uDCA0'} <b className="text-white">Chaque sort coute de la mana</b>. Les sorts basiques sont gratuits, les sorts puissants coutent plus cher.</p>
              <p>{'\uD83D\uDD04'} <b className="text-white">Regeneration</b> : La mana remonte a chaque tour, bonus avec la SPD.</p>
              <p>{'\uD83D\uDCA1'} <b className="text-white">Astuce</b> : Investis des points en MANA ou equipe le set "Source Arcanique" pour +30% mana max et -20% cout !</p>
            </div>
          </div>

          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-sm font-bold text-red-300 mb-2">5. Raid Boss</div>
            <div className="space-y-1 text-normal-responsive text-gray-400">
              <p>{'\uD83D\uDC1C'} <b className="text-white">Le Raid est un combat en temps reel</b> contre un boss a barres de vie multiples. Compose 2 equipes de 3 combattants.</p>
              <p>{'\uD83D\uDCA5'} <b className="text-white">Rage Count (RC)</b> : Chaque barre detruite = +1 RC. Plus le RC est haut, meilleures sont les recompenses !</p>
              <p>{'\u23F1\uFE0F'} <b className="text-white">Limite</b> : 10 tentatives par jour. Utilise-les bien !</p>
              <p>{'\uD83C\uDFB9'} <b className="text-white">Sung Jinwoo</b> : Pendant le raid, utilise les touches clavier (A, Z, E, R, T) pour activer les sorts de Sung en temps reel !</p>
              <p>{'\uD83D\uDCE6'} <b className="text-white">Recompenses</b> : Coins, XP, marteaux et artefacts de sets de Raid exclusifs !</p>
            </div>
          </div>

          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-sm font-bold text-yellow-300 mb-2">6. Debloquer des Hunters</div>
            <div className="space-y-1 text-normal-responsive text-gray-400">
              <p>{'\uD83C\uDFC6'} <b className="text-white">Les Hunters</b> sont des combattants speciaux debloques en accumulant du RC total sur le Raid Boss.</p>
              <p>{'\u2B50'} <b className="text-white">Eveil</b> : Les duplicatas augmentent les etoiles d'un Hunter (+5% stats de base par etoile, max 5).</p>
              <p>{'\uD83D\uDCAA'} <b className="text-white">Objectif</b> : Farm le Raid, monte ton RC total, et debloque tous les Hunters pour avoir la meilleure equipe !</p>
            </div>
          </div>

          <button onClick={onClose}
            className="w-full py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-sm font-bold hover:bg-indigo-600/50 transition-colors">
            Compris !
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function ColosseumHeader({ title, emoji, titleColor = 'text-purple-400', backTo = '/shadow-colosseum', onBack, rightElement }) {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a15] border-b border-purple-500/20 mb-4">
        {onBack ? (
          <button onClick={onBack} className="col-btn col-btn-secondary text-sm">← Retour</button>
        ) : (
          <Link to={backTo} className="col-btn col-btn-secondary text-sm">← Retour</Link>
        )}
        <div className="flex items-center gap-2">
          {emoji && <span>{emoji}</span>}
          <span className={`font-bold ${titleColor} text-sm`}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {rightElement || <div className="w-10" />}
          <button
            onClick={() => setShowTutorial(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 border-2 border-indigo-400/50 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-transform"
            title="Comment jouer ?"
          >?</button>
        </div>
      </div>
      <TutorialModal show={showTutorial} onClose={() => setShowTutorial(false)} />
    </>
  );
}
