import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

interface OCRReaderProps {
  onTextExtracted: (text: string) => void;
}

const OCRReader: React.FC<OCRReaderProps> = ({ onTextExtracted }) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const { data } = await Tesseract.recognize(file, 'fra');
      onTextExtracted(data.text);
    } catch (err) {
      console.error('Erreur OCR :', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
      {loading && <p>Analyse en cours...</p>}
    </div>
  );
};

export default OCRReader;
