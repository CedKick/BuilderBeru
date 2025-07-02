// 🎨 UPSCALER D'IMAGES POUR BERUVIAN WORLD
export function upscaleImage(imageSrc, targetSize = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Créer un canvas temporaire
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      
      // Désactiver le lissage pour garder le style pixel art
      ctx.imageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
      
      // Dessiner l'image agrandie
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, targetSize, targetSize);
      
      // Retourner l'URL de l'image agrandie
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      });
    };
    
    img.onerror = reject;
    img.src = imageSrc;
  });
}

// Cache pour éviter de recalculer les images
const imageCache = new Map();

export async function getUpscaledImage(imageSrc, targetSize = 1024) {
  const cacheKey = `${imageSrc}_${targetSize}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  
  try {
    const upscaledUrl = await upscaleImage(imageSrc, targetSize);
    imageCache.set(cacheKey, upscaledUrl);
    return upscaledUrl;
  } catch (error) {
    console.error("Erreur upscaling:", error);
    return imageSrc; // Fallback sur l'image originale
  }
}