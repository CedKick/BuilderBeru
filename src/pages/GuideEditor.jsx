import { useState } from 'react';
import SelectorMode from '../components/GuideEditor/SelectorMode';
import FormPod from '../components/GuideEditor/FormPod';
// Plus tard : import FormBdg, FormBot...

export default function GuideEditor() {
  const [selectedMode, setSelectedMode] = useState('PoD');

  return (
    <div className="min-h-screen bg-[#0c0e1a] text-white flex flex-col items-center px-4">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Guide Editor</h1>

        <div className="flex justify-center mb-4">
          <SelectorMode selectedMode={selectedMode} setSelectedMode={setSelectedMode} />
        </div>

        {selectedMode === 'PoD' && <FormPod />}
        {/* {selectedMode === 'BdG' && <FormBdg />} */}
        {/* {selectedMode === 'BoT' && <FormBot />} */}
      </div>
    </div>
  );
}