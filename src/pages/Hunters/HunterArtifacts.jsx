import React, { useState, useEffect } from 'react';
import { artifactData } from '../../data/itemData';

const HunterArtifacts = ({ side, onClose, onConfirm }) => {
    const [selectedCounts, setSelectedCounts] = useState({}); // { 'Angel White': 2, ... }
    const [totalCount, setTotalCount] = useState(0);

    const filteredArtifacts = artifactData.filter((a) => a.side === side);

    const handleSelect = (artifactName) => {
        setSelectedCounts((prev) => {
            const currentCount = prev[artifactName] || 0;
            let nextCount = currentCount === 0 ? 2 : currentCount === 2 ? 4 : 0;

            const newCounts = { ...prev };
            if (nextCount === 0) {
                delete newCounts[artifactName];
            } else {
                newCounts[artifactName] = nextCount;
            }

            const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);

            setTotalCount(newTotal);
            return newCounts;
        });
    };

    const handleRemove = (artifactName) => {
        setSelectedCounts((prev) => {
            const newCounts = { ...prev };
            delete newCounts[artifactName];
            setTotalCount(Object.values(newCounts).reduce((a, b) => a + b, 0));
            return newCounts;
        });
    };

    const handleConfirm = () => {
    const selectedArtifacts = Object.entries(selectedCounts).map(([name, amount]) => {
        const artifact = artifactData.find(a => a.set === name);
        return { name, amount, src: artifact?.src || '' };
    });
    onConfirm(selectedArtifacts);
};


    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="bg-gray-900 text-white p-6 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl mb-4 font-bold text-center">Select Artifacts ({side === 'L' ? 'Left' : 'Right'})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredArtifacts.map((artifact) => {
                        const selected = selectedCounts[artifact.set] || 0;
                        return (
                            <div key={artifact.set} className="bg-gray-800 p-2 rounded-lg flex flex-col items-center">
                                <img loading="lazy"
                                    src={artifact.src}
                                    alt={artifact.set}
                                    className="w-20 h-20 cursor-pointer object-contain"
                                    onClick={() => handleSelect(artifact.set)}
                                />
                                <div className="flex gap-2 mt-2 items-center">
                                    {[2, 4].map((val) => (
                                        <div
                                            key={val}
                                            onClick={() => {
                                                setSelectedCounts((prev) => {
                                                    const newCounts = { ...prev, [artifact.set]: val };
                                                    const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);
                                                    setTotalCount(newTotal);
                                                    return newCounts;
                                                });
                                            }}
                                            className={`px-2 py-1 rounded border-2 text-sm cursor-pointer
    ${selected === val ? 'border-yellow-400' : 'border-transparent'}`}
                                        >
                                            x{val}
                                        </div>
                                    ))}
                                    {selected > 0 && (
                                        <button
                                            className="text-red-500 font-bold ml-2 text-sm"
                                            onClick={() => handleRemove(artifact.set)}
                                        >
                                            x
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center mt-6 gap-4">
                    <button
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                    >
                        Annuler
                    </button>
                    {totalCount === 4 && (
                        <button
                            onClick={handleConfirm}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                        >
                            Confirmer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HunterArtifacts;
