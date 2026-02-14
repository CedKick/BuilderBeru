import React from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0f1a] text-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">💀</div>
            <h1 className="text-2xl font-black text-red-400 mb-2">Oups... Le Monarque a crash.</h1>
            <p className="text-gray-400 text-sm mb-6">
              Une erreur inattendue s'est produite. Pas de panique, tes donnees sont en securite.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-bold hover:bg-purple-500 transition-colors"
              >
                Reessayer
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-gray-700 rounded-lg text-sm font-bold hover:bg-gray-600 transition-colors"
              >
                Retour Accueil
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
