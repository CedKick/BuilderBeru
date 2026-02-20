// src/pages/AdminMailSender.jsx
// Admin panel for composing and sending mail with rewards builder

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Plus, Trash2, Eye, X, Check, Shield } from 'lucide-react';
import { isLoggedIn, authHeaders, getAuthUser } from '../utils/auth';
import { WEAPONS } from './ShadowColosseum/equipmentData';

const MAIL_TYPES = [
  { value: 'admin', label: 'Admin', color: 'bg-red-500' },
  { value: 'system', label: 'Systeme', color: 'bg-blue-500' },
  { value: 'update', label: 'Mise a jour', color: 'bg-green-500' },
  { value: 'reward', label: 'Recompense', color: 'bg-yellow-500' },
  { value: 'personal', label: 'Personnel', color: 'bg-purple-500' },
  { value: 'faction', label: 'Faction', color: 'bg-orange-500' },
];

const HAMMER_TYPES = [
  { id: 'marteau_forge', label: 'Marteau de Forge' },
  { id: 'marteau_runique', label: 'Marteau Runique' },
  { id: 'marteau_celeste', label: 'Marteau Celeste' },
  { id: 'marteau_rouge', label: 'Marteau Rouge' },
];

export default function AdminMailSender() {
  const navigate = useNavigate();
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [subject, setSubject] = useState('');
  const [mailType, setMailType] = useState('system');
  const [message, setMessage] = useState('');

  // Rewards
  const [selectedWeapons, setSelectedWeapons] = useState([]);
  const [hammers, setHammers] = useState({});
  const [coins, setCoins] = useState(0);

  // Weapon form
  const [weaponFormId, setWeaponFormId] = useState('');
  const [weaponFormAwakening, setWeaponFormAwakening] = useState(1);

  // UI
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Auth check (kly only)
  useEffect(() => {
    const user = getAuthUser();
    if (!isLoggedIn() || !user || user.username.toLowerCase() !== 'kly') {
      alert('Acces refuse: Admin uniquement');
      navigate('/');
    }
  }, [navigate]);

  const resetForm = () => {
    setIsBroadcast(false);
    setRecipientUsername('');
    setSubject('');
    setMailType('system');
    setMessage('');
    setSelectedWeapons([]);
    setHammers({});
    setCoins(0);
    setShowPreview(false);
    setError(null);
  };

  const addWeapon = (weaponId, awakening) => {
    console.log('addWeapon called:', { weaponId, awakening });

    if (!weaponId) {
      console.log('No weaponId provided');
      return;
    }

    // Check if weapon already added
    if (selectedWeapons.find(w => w.id === weaponId)) {
      alert('Cette arme a deja ete ajoutee');
      return;
    }

    const newWeapon = { id: weaponId, awakening: awakening || 1 };
    console.log('Adding weapon:', newWeapon);
    setSelectedWeapons(prev => {
      const updated = [...prev, newWeapon];
      console.log('Updated selectedWeapons:', updated);
      return updated;
    });
  };

  const removeWeapon = (weaponId) => {
    setSelectedWeapons(prev => prev.filter(w => w.id !== weaponId));
  };

  const updateWeaponAwakening = (weaponId, awakening) => {
    setSelectedWeapons(prev => prev.map(w =>
      w.id === weaponId ? { ...w, awakening: Math.max(0, Math.min(10, awakening)) } : w
    ));
  };

  const updateHammer = (hammerId, amount) => {
    const value = Math.max(0, parseInt(amount) || 0);
    if (value === 0) {
      const newHammers = { ...hammers };
      delete newHammers[hammerId];
      setHammers(newHammers);
    } else {
      setHammers(prev => ({ ...prev, [hammerId]: value }));
    }
  };

  const validateForm = () => {
    if (!subject.trim()) {
      return 'Le sujet est requis';
    }
    if (subject.length > 100) {
      return 'Le sujet ne peut pas depasser 100 caracteres';
    }
    if (!message.trim()) {
      return 'Le message est requis';
    }
    if (message.length > 2000) {
      return 'Le message ne peut pas depasser 2000 caracteres';
    }
    if (!isBroadcast && !recipientUsername.trim()) {
      return 'Le destinataire est requis (ou cochez Diffusion)';
    }
    return null;
  };

  const buildRewardsObject = () => {
    const rewards = {};

    if (selectedWeapons.length > 0) {
      rewards.weapons = selectedWeapons;
    }

    if (Object.keys(hammers).length > 0) {
      rewards.hammers = hammers;
    }

    if (coins > 0) {
      rewards.coins = coins;
    }

    return Object.keys(rewards).length > 0 ? rewards : null;
  };

  const handleSend = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const rewards = buildRewardsObject();

      const resp = await fetch('/api/mail?action=send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          recipientUsername: isBroadcast ? null : recipientUsername.trim(),
          subject: subject.trim(),
          message: message.trim(),
          mailType,
          rewards,
        }),
      });

      const data = await resp.json();

      if (data.success) {
        setSuccess(`\u2705 Message envoye avec succes ${isBroadcast ? 'a tous les joueurs' : 'a ' + recipientUsername} !`);
        resetForm();

        // Notify to update mail badges
        window.dispatchEvent(new CustomEvent('beru-react', {
          detail: { type: 'mail-update' }
        }));
      } else {
        setError(data.message || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      console.error('Failed to send mail:', err);
      setError('Impossible d\'envoyer le message. Verifiez votre connexion.');
    } finally {
      setSending(false);
    }
  };

  const getWeaponName = (weaponId) => {
    return WEAPONS[weaponId]?.name || weaponId;
  };

  const renderPreview = () => {
    const rewards = buildRewardsObject();
    const mailTypeInfo = MAIL_TYPES.find(t => t.value === mailType) || MAIL_TYPES[0];

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0f0f1a] border border-white/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Eye size={24} />
              Apercu du message
            </h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            {/* Type badge */}
            <div className="mb-4">
              <span className={`text-sm px-3 py-1 rounded-full ${mailTypeInfo.color} text-white font-bold`}>
                {mailTypeInfo.label}
              </span>
              {isBroadcast && (
                <span className="ml-2 text-sm text-purple-400">[\u2733 Diffusion]</span>
              )}
            </div>

            {/* Recipient */}
            <div className="mb-4 text-sm text-gray-400">
              Destinataire: {isBroadcast ? 'Tous les joueurs' : recipientUsername}
            </div>

            {/* Subject */}
            <h3 className="text-xl font-bold text-white mb-4">{subject}</h3>

            {/* Message */}
            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-gray-300 whitespace-pre-wrap">{message}</p>
            </div>

            {/* Rewards */}
            {rewards && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-sm font-bold text-yellow-400 mb-3">
                  \uD83C\uDF81 Recompenses incluses
                </h4>

                {rewards.weapons && rewards.weapons.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-1">Armes:</div>
                    <ul className="list-disc list-inside text-amber-300 text-sm space-y-1">
                      {rewards.weapons.map((w, i) => (
                        <li key={i}>
                          {getWeaponName(w.id)}
                          {w.awakening > 0 && <span className="text-xs text-amber-500"> +{w.awakening}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {rewards.hammers && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-1">Marteaux:</div>
                    <ul className="list-disc list-inside text-blue-300 text-sm space-y-1">
                      {Object.entries(rewards.hammers).map(([type, amt]) => (
                        <li key={type}>
                          {type.replace('marteau_', '').replace('_', ' ')}: {amt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {rewards.coins && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Shadow Coins:</div>
                    <div className="text-purple-300 font-bold">{rewards.coins} \uD83E\uDE99</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex gap-3">
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Modifier
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoggedIn() || !getAuthUser() || getAuthUser().username.toLowerCase() !== 'kly') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 flex items-center gap-3">
            <Shield size={32} />
            Panel Admin - Envoi de Courrier
          </h1>
          <p className="text-gray-400 mt-2">
            Envoyer des messages et recompenses aux joueurs
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400">
              <Check size={20} />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <X size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-6 space-y-6">
          {/* Recipient */}
          <div>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={isBroadcast}
                onChange={(e) => setIsBroadcast(e.target.checked)}
                className="w-4 h-4 accent-purple-500"
              />
              <span className="text-sm font-semibold text-purple-400">
                Diffusion (tous les joueurs)
              </span>
            </label>

            {!isBroadcast && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Destinataire (username)
                </label>
                <input
                  type="text"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  placeholder="Ex: Shunryu"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Sujet <span className="text-red-400">*</span>
              <span className="text-xs text-gray-500 ml-2">({subject.length}/100)</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value.slice(0, 100))}
              placeholder="Titre du message"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Mail Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Type de message
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MAIL_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setMailType(type.value)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    mailType === type.value
                      ? `${type.color} text-white`
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Message <span className="text-red-400">*</span>
              <span className="text-xs text-gray-500 ml-2">({message.length}/2000)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
              placeholder="Contenu du message..."
              rows={8}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Rewards Section */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">
              \uD83C\uDF81 Recompenses (optionnel)
            </h3>

            {/* Weapons */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Armes
                {selectedWeapons.length > 0 && (
                  <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-1 rounded-full font-bold">
                    {selectedWeapons.length} ajoutée{selectedWeapons.length > 1 ? 's' : ''}
                  </span>
                )}
              </label>

              {/* Add weapon */}
              <div className="flex gap-2 mb-3">
                <select
                  value={weaponFormId}
                  onChange={(e) => setWeaponFormId(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  style={{
                    colorScheme: 'dark'
                  }}
                >
                  <option value="" style={{ backgroundColor: '#1a1a2a', color: '#9ca3af' }}>Selectionner une arme</option>
                  {Object.entries(WEAPONS).map(([id, weapon]) => (
                    <option key={id} value={id} style={{ backgroundColor: '#1a1a2a', color: 'white' }}>
                      {weapon.name} ({weapon.rarity})
                    </option>
                  ))}
                </select>

                {/* Awakening controls */}
                <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg px-2">
                  <button
                    onClick={() => setWeaponFormAwakening(Math.max(0, weaponFormAwakening - 1))}
                    className="text-white hover:text-amber-400 p-1"
                    title="Diminuer"
                  >
                    <span className="text-xl">−</span>
                  </button>
                  <span className="text-white font-bold w-12 text-center">
                    A{weaponFormAwakening}
                  </span>
                  <button
                    onClick={() => setWeaponFormAwakening(Math.min(10, weaponFormAwakening + 1))}
                    className="text-white hover:text-amber-400 p-1"
                    title="Augmenter"
                  >
                    <span className="text-xl">+</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (!weaponFormId) {
                      alert('Veuillez selectionner une arme');
                      return;
                    }
                    addWeapon(weaponFormId, weaponFormAwakening);
                    setWeaponFormId('');
                    setWeaponFormAwakening(1);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Ajouter
                </button>
              </div>

              {/* Empty state */}
              {selectedWeapons.length === 0 && (
                <div className="text-center py-4 bg-white/5 rounded-lg border border-dashed border-gray-600">
                  <p className="text-gray-500 text-sm">
                    Aucune arme ajoutée. Sélectionnez une arme et cliquez sur "Ajouter".
                  </p>
                </div>
              )}

              {/* Selected weapons list */}
              {selectedWeapons.length > 0 && (
                <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-lg p-4">
                  <div className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <Check size={16} />
                    Armes qui seront envoyées :
                  </div>
                  <div className="space-y-2">
                    {selectedWeapons.map((weapon) => (
                      <div
                        key={weapon.id}
                        className="flex items-center gap-3 bg-black/30 border border-amber-500/30 rounded-lg p-3"
                      >
                        <div className="flex-1">
                          <div className="text-amber-300 font-bold text-lg">
                            {getWeaponName(weapon.id)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300 font-semibold">Awakening:</span>
                          <input
                            type="number"
                            value={weapon.awakening}
                            onChange={(e) => updateWeaponAwakening(weapon.id, parseInt(e.target.value) || 0)}
                            min="0"
                            max="10"
                            className="w-20 bg-white/10 border border-amber-500/50 rounded px-2 py-1 text-white text-center font-bold"
                          />
                        </div>
                        <button
                          onClick={() => removeWeapon(weapon.id)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded transition-colors"
                          title="Retirer cette arme"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hammers */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Marteaux
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HAMMER_TYPES.map(hammer => (
                  <div key={hammer.id} className="flex items-center gap-2">
                    <label className="flex-1 text-sm text-gray-400">
                      {hammer.label}
                    </label>
                    <input
                      type="number"
                      value={hammers[hammer.id] || ''}
                      onChange={(e) => updateHammer(hammer.id, e.target.value)}
                      min="0"
                      placeholder="0"
                      className="w-24 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Coins */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Shadow Coins
              </label>
              <input
                type="number"
                value={coins || ''}
                onChange={(e) => setCoins(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                placeholder="0"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              onClick={() => setShowPreview(true)}
              disabled={!subject || !message}
              className="flex-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Eye size={20} />
              Apercu
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !subject || !message}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && renderPreview()}
    </div>
  );
}
