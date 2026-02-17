// AuthModal.jsx — Login / Register modal component
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Eye, EyeOff, X, Shield } from 'lucide-react';
import { register, login } from '../utils/auth';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPwd('');
    setError('');
    setSuccess('');
    setShowPwd(false);
  };

  const switchTab = (t) => {
    setTab(t);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!username.trim() || !password) {
      setError('Pseudo et mot de passe requis');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Pseudo: 3-20 caracteres (lettres, chiffres, _)');
      return;
    }
    if (password.length < 6) {
      setError('Mot de passe: 6 caracteres minimum');
      return;
    }
    if (tab === 'register' && password !== confirmPwd) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const data = tab === 'register'
        ? await register(username, password)
        : await login(username, password);

      if (data.success) {
        setSuccess(tab === 'register' ? 'Compte cree !' : 'Connexion reussie !');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 800);
      } else {
        setError(data.error || 'Erreur inconnue');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-gradient-to-b from-[#1a1a2e] to-[#12121c]
                     rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-900/30 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">BuilderBeru</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mx-5 mb-4 rounded-lg bg-black/30 p-1">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all
                ${tab === 'login'
                  ? 'bg-purple-600/40 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-300'
                }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Connexion
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all
                ${tab === 'register'
                  ? 'bg-purple-600/40 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-300'
                }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Inscription
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
            {/* Username */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Pseudo</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="MonPseudo_42"
                maxLength={20}
                autoComplete="username"
                className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-gray-700/50
                           text-white text-sm placeholder-gray-600
                           focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20
                           transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 caracteres minimum"
                  autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-black/40 border border-gray-700/50
                             text-white text-sm placeholder-gray-600
                             focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20
                             transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (register only) */}
            {tab === 'register' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Confirmer le mot de passe</label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Retaper le mot de passe"
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-gray-700/50
                             text-white text-sm placeholder-gray-600
                             focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20
                             transition-all"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            {/* Success */}
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-green-400 bg-green-900/20 border border-green-800/30 rounded-lg px-3 py-2"
              >
                {success}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-medium text-sm transition-all
                         bg-gradient-to-r from-purple-600 to-indigo-600
                         hover:from-purple-500 hover:to-indigo-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg shadow-purple-900/30 text-white"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {tab === 'register' ? 'Creation...' : 'Connexion...'}
                </span>
              ) : (
                tab === 'register' ? "Creer mon compte" : "Se connecter"
              )}
            </button>

            {/* Info text */}
            <p className="text-[10px] text-gray-600 text-center leading-tight">
              {tab === 'register'
                ? 'Ton compte te permettra de jouer au PVP et de retrouver tes donnees sur tous tes appareils.'
                : 'Connecte-toi pour acceder au PVP et synchroniser tes donnees entre appareils.'
              }
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
