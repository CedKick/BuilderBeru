import React from 'react';

const NewAccountPopup = ({
  newAccountName,
  setNewAccountName,
  setShowNewAccountPopup,
  createNewAccount
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center overflow-y-auto p-2">
       <div className="bg-gray-900 text-white p-5 rounded shadow-lg w-full max-w-md">
      <h2 className="text-lg font-semibold mb-2">Créer un nouveau compte</h2>
      <input
        type="text"
        value={newAccountName}
        onChange={(e) => setNewAccountName(e.target.value)}
        placeholder="Nom du compte"
        className="p-2 mb-4 w-full bg-gray-800 border border-gray-700 rounded"
      />
      <div className="flex justify-end gap-2">
        <button onClick={() => setShowNewAccountPopup(false)} className="bg-red-600 px-4 py-2 rounded">
          Annuler
        </button>
        <button onClick={createNewAccount} className="bg-green-600 px-4 py-2 rounded">
          Créer
        </button>
      </div>
      </div>
    </div>
  );
};

export default NewAccountPopup;