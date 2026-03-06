# 🎨 DRAWBERU - Core Image Processing System (CORRECTIONS FINALES)
# Transforme une image couleur en coloriage numéroté
# Créé par Kaisel pour le Monarque des Ombres ⚔️

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from sklearn.cluster import KMeans
from skimage import measure, morphology
import json
import os
from pathlib import Path
import logging

# Configuration logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DrawBeruProcessor:
    """
    🔮 Classe principale pour transformer les hunters colorés en coloriages
    """
    
    def __init__(self, min_region_size=100, max_colors=10):
        """
        Initialize DrawBeru processor
        
        Args:
            min_region_size (int): Taille minimum d'une région (évite micro-zones)
            max_colors (int): Nombre maximum de couleurs à extraire
        """
        self.min_region_size = min_region_size
        self.max_colors = max_colors
        logger.info("🔮 DrawBeru Processor initialized by Kaisel")
    
    def quantize_colors(self, image_array, n_colors=8):
        """
        🎨 Quantification couleurs préservant les détails fins
        
        Args:
            image_array (numpy.ndarray): Image en RGB
            n_colors (int): Nombre de couleurs à conserver
            
        Returns:
            tuple: (image_quantifiée, palette_couleurs)
        """
        logger.info(f"🎨 Quantification détaillée en {n_colors} couleurs...")
        
        # Preprocessing pour préserver les détails
        h, w, c = image_array.shape
        
        # Appliquer un léger lissage pour réduire le bruit sans perdre les contours
        smoothed = cv2.bilateralFilter(image_array, 9, 75, 75)
        
        # Reshape pour K-means
        pixels = smoothed.reshape(-1, 3)
        
        # K-means avec plus d'itérations pour une meilleure convergence
        kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=20, max_iter=500)
        kmeans.fit(pixels)
        
        # Reconstruction avec couleurs quantifiées
        labels = kmeans.labels_
        centers = kmeans.cluster_centers_.astype(int)
        quantized_pixels = centers[labels]
        quantized_image = quantized_pixels.reshape(h, w, c)
        
        # Créer palette
        palette = {}
        for i, color in enumerate(centers):
            hex_color = f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}"
            palette[i + 1] = hex_color
            
        logger.info(f"✅ Quantification détaillée terminée - {len(palette)} couleurs extraites")
        return quantized_image, palette
    
    def segment_regions(self, quantized_image):
        """
        🗺️ Segmente l'image en régions avec préservation des détails fins
        
        Args:
            quantized_image (numpy.ndarray): Image quantifiée
            
        Returns:
            tuple: (image_labelisée, couleurs_uniques)
        """
        logger.info("🗺️ Segmentation avec préservation des détails...")
        
        # Convertir en format pour labellisation
        h, w, c = quantized_image.shape
        
        # Utiliser une approche plus précise : connected components par couleur
        labeled_image = np.zeros((h, w), dtype=np.int32)
        current_label = 1
        
        # Identifier couleurs uniques
        pixels_flat = quantized_image.reshape(-1, 3)
        unique_colors = np.unique(pixels_flat, axis=0, return_inverse=False)
        
        for color in unique_colors:
            # Créer masque pour cette couleur exacte
            color_mask = np.all(quantized_image == color, axis=-1)
            
            if np.any(color_mask):
                # Utiliser connected components pour cette couleur
                # Cela préserve les détails séparés de même couleur
                labeled_color = measure.label(color_mask, connectivity=2)
                
                # Nettoyer seulement les TRÈS petites régions (pas les détails importants)
                for region in measure.regionprops(labeled_color):
                    if region.area >= max(10, self.min_region_size // 10):  # Seuil beaucoup plus bas
                        # Garder cette région
                        region_mask = (labeled_color == region.label)
                        labeled_image[region_mask] = current_label
                        current_label += 1
        
        logger.info(f"✅ Segmentation détaillée terminée - {current_label-1} régions préservées")
        return labeled_image, unique_colors
    
    def generate_outline(self, labeled_image, quantized_image, line_thickness=1):
        """
        ✏️ Génère des contours précis avec détails préservés
        
        Args:
            labeled_image (numpy.ndarray): Image avec labels de régions
            quantized_image (numpy.ndarray): Image quantifiée pour analyser les couleurs
            line_thickness (int): Épaisseur des contours
            
        Returns:
            numpy.ndarray: Image avec contours adaptatifs haute précision
        """
        logger.info("✏️ Génération des contours haute précision...")
        
        h, w = labeled_image.shape
        outline = np.ones((h, w, 3), dtype=np.uint8) * 255  # Fond blanc
        
        # Fonction pour déterminer la couleur du contour
        def is_dark_color(color):
            r, g, b = color
            brightness = (r + g + b) / 3
            return brightness < 60  # Seuil ajusté pour plus de précision
        
        # Traiter chaque région individuellement pour préserver les détails
        for region_id in np.unique(labeled_image):
            if region_id == 0:  # Skip background
                continue
                
            # Créer masque pour cette région
            mask = (labeled_image == region_id).astype(np.uint8)
            
            # Analyser la couleur de cette région
            region_pixels = quantized_image[labeled_image == region_id]
            if len(region_pixels) > 0:
                avg_color = np.mean(region_pixels, axis=0)
                contour_color = (0, 0, 0) if is_dark_color(avg_color) else (140, 140, 140)
            else:
                contour_color = (140, 140, 140)
            
            # Détection de contours avec précision maximale
            contours, _ = cv2.findContours(
                mask, 
                cv2.RETR_EXTERNAL,
                cv2.CHAIN_APPROX_NONE  # Précision maximale pour garder tous les détails
            )
            
            # Dessiner chaque contour avec précision
            for contour in contours:
                # Filtrer seulement les très petits artefacts (< 5 pixels)
                if cv2.contourArea(contour) >= 5:
                    cv2.drawContours(outline, [contour], -1, contour_color, line_thickness)
        
        logger.info("✅ Contours haute précision générés")
        return outline
    
    def create_color_legend_only(self, palette, legend_size=(400, 100)):
        """
        🎨 Crée une légende de couleurs séparée
        
        Args:
            palette (dict): Palette de couleurs
            legend_size (tuple): Taille de la légende
            
        Returns:
            numpy.ndarray: Image légende
        """
        logger.info("🎨 Création légende séparée...")
        
        w, h = legend_size
        legend_image = np.ones((h, w, 3), dtype=np.uint8) * 255
        
        # Convertir en PIL pour dessiner facilement
        pil_image = Image.fromarray(legend_image)
        draw = ImageDraw.Draw(pil_image)
        
        # Paramètres légende
        colors_per_row = min(len(palette), 8)
        square_size = 40
        start_x = (w - (colors_per_row * (square_size + 10))) // 2
        start_y = 20
        
        # Dessiner chaque couleur
        for i, (color_id, hex_color) in enumerate(palette.items()):
            x = start_x + i * (square_size + 10)
            y = start_y
            
            # Carré de couleur
            draw.rectangle(
                [x, y, x + square_size, y + square_size], 
                fill=hex_color,
                outline="#000000",
                width=2
            )
            
            # Code hex en dessous
            draw.text(
                (x + 2, y + square_size + 5), 
                hex_color, 
                fill="#000000"
            )
        
        logger.info("✅ Légende séparée créée")
        return np.array(pil_image)
    
    def quantize_colors_with_mask(self, image_array, mask, n_colors=8):
        """
        🎨 Quantification couleurs en ignorant le fond transparent
        
        Args:
            image_array (numpy.ndarray): Image RGB
            mask (numpy.ndarray): Masque des zones non-transparentes
            n_colors (int): Nombre de couleurs
            
        Returns:
            tuple: (image_quantifiée, palette)
        """
        logger.info(f"🎨 Quantification avec masque en {n_colors} couleurs...")
        
        h, w, c = image_array.shape
        
        # Extraire seulement les pixels non-transparents
        valid_pixels = image_array[mask]
        
        if len(valid_pixels) == 0:
            raise ValueError("Aucun pixel valide à traiter!")
        
        # K-means sur pixels valides uniquement
        kmeans = KMeans(n_clusters=min(n_colors, len(valid_pixels)), random_state=42, n_init=10)
        kmeans.fit(valid_pixels)
        
        # Reconstruction
        quantized_image = np.copy(image_array)
        centers = kmeans.cluster_centers_.astype(int)
        
        # Assigner chaque pixel valide à son cluster le plus proche
        labels = kmeans.predict(image_array.reshape(-1, 3))
        quantized_pixels = centers[labels].reshape(h, w, c)
        
        # Appliquer seulement aux zones non-transparentes
        quantized_image[mask] = quantized_pixels[mask]
        
        # Créer palette
        palette = {}
        for i, color in enumerate(centers):
            hex_color = f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}"
            palette[i + 1] = hex_color
            
        logger.info(f"✅ Quantification avec masque terminée - {len(palette)} couleurs")
        return quantized_image, palette
    
    def process_hunter_image(self, input_path, output_dir, hunter_name=None, n_colors=8):
        """
        🏹 Pipeline complet : Hunter coloré → Coloriage sans numéros + palette JSON
        
        Args:
            input_path (str): Chemin vers l'image hunter colorée
            output_dir (str): Dossier de sortie
            hunter_name (str): Nom du hunter (optionnel)
            n_colors (int): Nombre de couleurs à extraire
            
        Returns:
            dict: Résultats du traitement
        """
        logger.info(f"🏹 Traitement BuilderBeru de {input_path}...")
        
        # Créer dossier de sortie
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Charger l'image avec gestion transparence
        pil_image = Image.open(input_path)
        
        # Si l'image a un canal alpha (transparence)
        if pil_image.mode in ('RGBA', 'LA'):
            logger.info("🔍 Image avec transparence détectée")
            
            # Séparer les canaux RGB et Alpha
            rgb_image = pil_image.convert('RGB')
            alpha_channel = pil_image.split()[-1]
            
            # Créer un masque pour les zones non-transparentes
            alpha_array = np.array(alpha_channel)
            non_transparent_mask = alpha_array > 128
            
            # Convertir en array pour traitement
            image_array = np.array(rgb_image)
            
            # Appliquer le masque pour ignorer le fond
            masked_pixels = image_array[non_transparent_mask]
            
            if len(masked_pixels) == 0:
                raise ValueError("Image entièrement transparente!")
                
        else:
            # Image sans transparence, traitement normal
            logger.info("🔍 Image opaque, traitement standard")
            pil_image = pil_image.convert('RGB')
            image_array = np.array(pil_image)
            non_transparent_mask = np.ones(image_array.shape[:2], dtype=bool)
        
        # Nom de base pour les fichiers
        base_name = hunter_name or Path(input_path).stem
        
        # Pipeline de traitement adapté
        # 1. Quantification des couleurs (seulement zones non-transparentes)
        if 'non_transparent_mask' in locals():
            quantized, palette = self.quantize_colors_with_mask(image_array, non_transparent_mask, n_colors)
        else:
            quantized, palette = self.quantize_colors(image_array, n_colors)
        
        # 2. Segmentation des régions
        labeled, unique_colors = self.segment_regions(quantized)
        
        # 3. Génération des contours adaptatifs (noir/gris)
        final_image = self.generate_outline(labeled, quantized, line_thickness=1)
        
        # 4. PAS de placement de numéros - coloriage propre
        
        # 5. Ajout de la légende couleurs séparément
        legend_image = self.create_color_legend_only(palette)
        
        # Export des fichiers
        results = {
            'hunter_name': base_name,
            'original_size': image_array.shape,
            'colors_extracted': len(palette),
            'regions_found': len(unique_colors),
            'files_generated': []
        }
        
        # Sauvegarder coloriage propre (SANS numéros)
        coloring_path = os.path.join(output_dir, f"{base_name}_coloring.png")
        Image.fromarray(final_image).save(coloring_path)
        results['files_generated'].append(coloring_path)
        
        # Sauvegarder légende séparée
        legend_path = os.path.join(output_dir, f"{base_name}_legend.png")
        Image.fromarray(legend_image).save(legend_path)
        results['files_generated'].append(legend_path)
        
        # Sauvegarder palette JSON (IMPORTANT pour BuilderBeru)
        palette_path = os.path.join(output_dir, f"{base_name}_palette.json")
        palette_data = {
            'hunter_name': base_name,
            'hunter_type': 'ilhwan',  # À adapter selon le hunter
            'total_colors': len(palette),
            'color_palette': palette,
            'builderberu_config': {
                'coloring_enabled': True,
                'reference_image': f"{base_name}_original.png",
                'coloring_template': f"{base_name}_coloring.png",
                'color_legend': f"{base_name}_legend.png"
            },
            'generation_info': {
                'algorithm': 'DrawBeru_v1.0',
                'original_colors': len(palette),
                'regions_detected': len(unique_colors),
                'min_region_size': self.min_region_size,
                'has_transparency': pil_image.mode in ('RGBA', 'LA'),
                'generated_at': str(Path(input_path).stat().st_mtime)
            }
        }
        
        with open(palette_path, 'w', encoding='utf-8') as f:
            json.dump(palette_data, f, indent=2, ensure_ascii=False)
        results['files_generated'].append(palette_path)
        results['palette_json'] = palette_data  # Pour l'interface
        
        # Sauvegarder image quantifiée (pour debug)
        quantized_path = os.path.join(output_dir, f"{base_name}_quantized.png")
        Image.fromarray(quantized.astype(np.uint8)).save(quantized_path)
        results['files_generated'].append(quantized_path)
        
        logger.info(f"🎉 Traitement BuilderBeru terminé pour {base_name}!")
        logger.info(f"📁 {len(results['files_generated'])} fichiers générés dans {output_dir}")
        
        return results

def batch_process_hunters(input_directory, output_directory, n_colors=8):
    """
    🔥 Traite tous les hunters d'un dossier en lot
    
    Args:
        input_directory (str): Dossier contenant les images hunters
        output_directory (str): Dossier de sortie
        n_colors (int): Nombre de couleurs par image
    """
    logger.info(f"🔥 Traitement en lot depuis {input_directory}")
    
    processor = DrawBeruProcessor()
    supported_formats = {'.png', '.jpg', '.jpeg', '.bmp', '.webp'}
    
    input_path = Path(input_directory)
    all_results = []
    
    # Traiter chaque image du dossier
    for image_file in input_path.iterdir():
        if image_file.suffix.lower() in supported_formats:
            try:
                hunter_name = image_file.stem
                result = processor.process_hunter_image(
                    str(image_file),
                    output_directory,
                    hunter_name,
                    n_colors
                )
                all_results.append(result)
                
            except Exception as e:
                logger.error(f"❌ Erreur traitement {image_file.name}: {str(e)}")
    
    # Rapport final
    report_path = os.path.join(output_directory, "batch_report.json")
    batch_report = {
        'total_processed': len(all_results),
        'settings': {
            'colors_per_image': n_colors,
            'input_directory': str(input_directory),
            'output_directory': str(output_directory)
        },
        'results': all_results
    }
    
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(batch_report, f, indent=2, ensure_ascii=False)
    
    logger.info(f"🎉 Traitement en lot terminé! {len(all_results)} hunters traités")
    logger.info(f"📊 Rapport sauvegardé: {report_path}")
    
    return all_results

# 🎯 EXEMPLE D'UTILISATION
if __name__ == "__main__":
    # Test sur une image unique
    processor = DrawBeruProcessor(min_region_size=150, max_colors=10)
    
    # Exemple avec une image hunter
    try:
        result = processor.process_hunter_image(
            input_path="hunters/ilhwan_colored.png",  # Ton image hunter
            output_dir="output",
            hunter_name="ilhwan",
            n_colors=8
        )
        
        print("🎉 SUCCÈS! Fichiers générés:")
        for file_path in result['files_generated']:
            print(f"  📄 {file_path}")
            
    except FileNotFoundError:
        print("⚠️ Image test non trouvée. Crée le dossier 'hunters/' avec tes images!")
        
    # Exemple traitement en lot
    # batch_process_hunters("hunters_input/", "coloring_output/", n_colors=10)