import { useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { useState } from 'react';
import OcrConfirmPopup from './OcrConfirmPopup';
import { parseOcrText } from '../utils/ocr/parseOcrText';
import { useTranslation } from 'react-i18next';



const OCRPasteListener = ({ updateArtifactFromOCR}) => {
   const { t } = useTranslation(); 
  const [parsedData, setParsedData] = useState(null);
  
  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.includes('image')) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const imageData = reader.result;
              processImage(imageData);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    const processImage = async (image) => {
      console.log("📸 OCR en cours...");

      Tesseract.recognize(image, 'eng', {
        logger: m => console.log(m), // Pour suivre la progression
      }).then(({ data: { text } }) => {
       console.log("🧠 Texte détecté par OCR :");
console.log(text);
const parsed = parseOcrText(text, t);
if (parsed) {
  console.log('Parsed envoyé à onParsed :', parsed);
  setParsedData(parsed); // Et onParsed DOIT pointer sur setParsedArtifactData
}
      }).catch(err => {
        console.error("❌ OCR failed:", err);
      });
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
  <>
    {parsedData && (
      <OcrConfirmPopup
        parsedData={parsedData}
        onConfirm={(parsedData) => {
  console.log("✅ Confirmé !", parsedData);
  updateArtifactFromOCR(parsedData); // => fonction qu'on crée
  setParsedData(null);
}}
        onCancel={() => {
          console.log("❌ Annulé");
          setParsedData(null); // cacher la popup
        }}
      />
    )}
  </>
);
};

export default OCRPasteListener;
