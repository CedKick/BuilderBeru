#!/usr/bin/env python3
"""
DrawBeru Processor API
Receives a color image, returns template (outline) + palette JSON.
Deployed on DigitalOcean alongside other BuilderBeru services.
"""

import os
import io
import json
import uuid
import logging
import tempfile
from pathlib import Path

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image
from drawberu_core import DrawBeruProcessor

# Config
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
TEMP_DIR = tempfile.gettempdir()

app = Flask(__name__)
CORS(app, origins=[
    'https://builderberu.com',
    'https://www.builderberu.com',
    'http://localhost:5173',
    'http://localhost:5174',
])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'drawberu-processor'})


@app.route('/process', methods=['POST'])
def process_image():
    """
    POST /process
    Body: multipart/form-data with 'image' file
    Query params: n_colors (int, default 8), min_region_size (int, default 150)

    Returns JSON:
    {
        "template": "base64 PNG of outline template",
        "palette": { "1": "#hex", "2": "#hex", ... },
        "canvas_size": { "width": int, "height": int }
    }
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if not file or not file.filename:
        return jsonify({'error': 'Empty file'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': f'Unsupported format. Use: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    # Read and validate size
    file_bytes = file.read()
    if len(file_bytes) > MAX_IMAGE_SIZE:
        return jsonify({'error': f'Image too large (max {MAX_IMAGE_SIZE // 1024 // 1024}MB)'}), 400

    # Parse params
    n_colors = request.args.get('n_colors', 8, type=int)
    n_colors = max(3, min(15, n_colors))
    min_region_size = request.args.get('min_region_size', 150, type=int)
    min_region_size = max(50, min(500, min_region_size))

    # Process
    job_id = uuid.uuid4().hex[:8]
    input_path = os.path.join(TEMP_DIR, f'drawberu_in_{job_id}.png')
    output_dir = os.path.join(TEMP_DIR, f'drawberu_out_{job_id}')

    try:
        # Save input
        img = Image.open(io.BytesIO(file_bytes))

        # Limit dimensions (max 2000x2000 to avoid slow processing)
        max_dim = 2000
        if img.width > max_dim or img.height > max_dim:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        img.save(input_path)

        # Run processor
        processor = DrawBeruProcessor(
            min_region_size=min_region_size,
            max_colors=n_colors
        )

        result = processor.process_hunter_image(
            input_path=input_path,
            output_dir=output_dir,
            hunter_name=f'custom_{job_id}',
            n_colors=n_colors
        )

        # Read template (coloring outline)
        import base64
        template_path = None
        palette_path = None
        for f in result['files_generated']:
            if 'coloring.png' in f:
                template_path = f
            elif 'palette.json' in f:
                palette_path = f

        if not template_path or not os.path.exists(template_path):
            return jsonify({'error': 'Template generation failed'}), 500

        # Encode template as base64
        with open(template_path, 'rb') as tf:
            template_b64 = base64.b64encode(tf.read()).decode('utf-8')

        # Read palette
        palette = {}
        if palette_path and os.path.exists(palette_path):
            with open(palette_path, 'r') as pf:
                palette_data = json.load(pf)
                palette = palette_data.get('color_palette', {})

        # Also encode the original (resized) as reference
        with open(input_path, 'rb') as rf:
            reference_b64 = base64.b64encode(rf.read()).decode('utf-8')

        response = {
            'template': template_b64,
            'reference': reference_b64,
            'palette': palette,
            'canvas_size': {
                'width': img.width,
                'height': img.height
            },
            'colors_extracted': result['colors_extracted'],
            'regions_found': result['regions_found'],
        }

        logger.info(f"[{job_id}] Processed: {img.width}x{img.height}, {n_colors} colors, {result['regions_found']} regions")
        return jsonify(response)

    except Exception as e:
        logger.error(f"[{job_id}] Error: {str(e)}", exc_info=True)
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

    finally:
        # Cleanup temp files
        try:
            if os.path.exists(input_path):
                os.remove(input_path)
            if os.path.exists(output_dir):
                import shutil
                shutil.rmtree(output_dir, ignore_errors=True)
        except Exception:
            pass


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3006))
    app.run(host='0.0.0.0', port=port, debug=False)
