/**
 * ============================================================================
 * BRUSH ENGINE PROFESSIONNEL - Style Manga / Animation 2D
 * ============================================================================
 * Inspiré des moteurs de Clip Studio Paint, Procreate et Krita
 * Optimisé pour Canvas HTML5 avec support tablette graphique
 *
 * Fonctionnalités:
 * - Gestion de la pression (tablette graphique)
 * - Variation d'épaisseur selon vitesse/pression
 * - Lissage adaptatif du trait
 * - Interpolation Bézier pour traits fluides
 * - Anti-aliasing propre
 * - Pinceaux style manga (G-Pen, Mapping Pen, etc.)
 */

// ============================================================================
// CONFIGURATION DES PINCEAUX MANGA
// ============================================================================

export const MANGA_BRUSHES = {
    // G-Pen: Le pinceau d'encrage manga par excellence
    // Trait net avec variation d'épaisseur selon pression
    gpen: {
        id: 'gpen',
        name: 'G-Pen',
        icon: '✒️',
        category: 'ink',
        // Paramètres de base
        minSize: 0.3,        // Taille minimale (ratio)
        maxSize: 1.0,        // Taille maximale (ratio)
        // Pression
        pressureSensitivity: 0.85,  // Sensibilité à la pression
        pressureAffectsSize: true,
        pressureAffectsOpacity: false,
        // Vitesse
        velocitySensitivity: 0.3,   // Sensibilité à la vitesse
        velocityAffectsSize: true,
        // Rendu
        opacity: 1.0,
        hardness: 1.0,       // 1.0 = bord dur, 0.0 = doux
        antiAlias: true,
        // Smoothing
        smoothing: 3,        // Niveau de lissage (0-10)
        smoothingMode: 'adaptive', // 'none', 'fixed', 'adaptive'
        // Forme
        roundness: 1.0,      // 1.0 = cercle parfait
        angle: 0,
        spacing: 0.15,       // Espacement entre points (ratio de la taille)
        // Spécifique manga
        taper: {
            start: 0.2,      // Effilage début (0-1)
            end: 0.3,        // Effilage fin (0-1)
            length: 20       // Longueur de l'effilage en pixels
        }
    },

    // Mapping Pen: Trait plus fin et régulier
    mapping: {
        id: 'mapping',
        name: 'Mapping Pen',
        icon: '🖊️',
        category: 'ink',
        minSize: 0.5,
        maxSize: 1.0,
        pressureSensitivity: 0.6,
        pressureAffectsSize: true,
        pressureAffectsOpacity: false,
        velocitySensitivity: 0.2,
        velocityAffectsSize: true,
        opacity: 1.0,
        hardness: 1.0,
        antiAlias: true,
        smoothing: 4,
        smoothingMode: 'adaptive',
        roundness: 1.0,
        angle: 0,
        spacing: 0.12,
        taper: {
            start: 0.15,
            end: 0.2,
            length: 15
        }
    },

    // Pencil manga: Trait avec grain léger
    pencil: {
        id: 'pencil',
        name: 'Crayon Manga',
        icon: '✏️',
        category: 'sketch',
        minSize: 0.4,
        maxSize: 1.0,
        pressureSensitivity: 0.7,
        pressureAffectsSize: true,
        pressureAffectsOpacity: true,
        velocitySensitivity: 0.15,
        velocityAffectsSize: false,
        opacity: 0.9,
        hardness: 0.7,
        antiAlias: true,
        smoothing: 2,
        smoothingMode: 'fixed',
        roundness: 0.95,
        angle: 15,
        spacing: 0.1,
        // Texture grain
        texture: {
            enabled: true,
            density: 0.3,
            size: 0.8
        },
        taper: {
            start: 0.1,
            end: 0.15,
            length: 10
        }
    },

    // Brush doux: Pour ombres et dégradés
    softbrush: {
        id: 'softbrush',
        name: 'Brush Doux',
        icon: '🖌️',
        category: 'paint',
        minSize: 0.2,
        maxSize: 1.0,
        pressureSensitivity: 0.9,
        pressureAffectsSize: true,
        pressureAffectsOpacity: true,
        velocitySensitivity: 0.1,
        velocityAffectsSize: false,
        opacity: 0.4,
        hardness: 0.0,
        antiAlias: true,
        smoothing: 5,
        smoothingMode: 'adaptive',
        roundness: 1.0,
        angle: 0,
        spacing: 0.08,
        // Accumulation d'opacité (buildup)
        buildup: {
            enabled: true,
            rate: 0.15
        },
        taper: {
            start: 0,
            end: 0,
            length: 0
        }
    },

    // Marker: Semi-transparent, se superpose
    marker: {
        id: 'marker',
        name: 'Feutre Copic',
        icon: '🖍️',
        category: 'color',
        minSize: 0.8,
        maxSize: 1.0,
        pressureSensitivity: 0.3,
        pressureAffectsSize: false,
        pressureAffectsOpacity: true,
        velocitySensitivity: 0.05,
        velocityAffectsSize: false,
        opacity: 0.35,
        hardness: 0.5,
        antiAlias: true,
        smoothing: 3,
        smoothingMode: 'fixed',
        roundness: 0.85,
        angle: 30,
        spacing: 0.05,
        blendMode: 'multiply',
        buildup: {
            enabled: true,
            rate: 0.1
        },
        taper: {
            start: 0,
            end: 0,
            length: 0
        }
    },

    // Pixel art
    pixel: {
        id: 'pixel',
        name: 'Pixel',
        icon: '▪️',
        category: 'pixel',
        minSize: 1.0,
        maxSize: 1.0,
        pressureSensitivity: 0,
        pressureAffectsSize: false,
        pressureAffectsOpacity: false,
        velocitySensitivity: 0,
        velocityAffectsSize: false,
        opacity: 1.0,
        hardness: 1.0,
        antiAlias: false,
        smoothing: 0,
        smoothingMode: 'none',
        roundness: 1.0,
        angle: 0,
        spacing: 1.0,
        square: true,
        taper: {
            start: 0,
            end: 0,
            length: 0
        }
    },

    // Airbrush: Aérographe doux
    airbrush: {
        id: 'airbrush',
        name: 'Aérographe',
        icon: '💨',
        category: 'paint',
        minSize: 0.1,
        maxSize: 1.0,
        pressureSensitivity: 0.95,
        pressureAffectsSize: true,
        pressureAffectsOpacity: true,
        velocitySensitivity: 0.2,
        velocityAffectsSize: false,
        opacity: 0.15,
        hardness: 0.0,
        antiAlias: true,
        smoothing: 6,
        smoothingMode: 'adaptive',
        roundness: 1.0,
        angle: 0,
        spacing: 0.03,
        gradient: true,
        buildup: {
            enabled: true,
            rate: 0.08
        },
        taper: {
            start: 0,
            end: 0,
            length: 0
        }
    }
};

// ============================================================================
// CLASSE BRUSH ENGINE
// ============================================================================

export class BrushEngine {
    constructor() {
        // État du trait en cours
        this.isDrawing = false;
        this.points = [];           // Points bruts
        this.smoothedPoints = [];   // Points lissés
        this.strokeId = 0;

        // Configuration active
        this.currentBrush = MANGA_BRUSHES.gpen;
        this.size = 3;
        this.color = '#000000';
        this.opacity = 1.0;

        // État de la pression/vitesse
        this.pressure = 1.0;
        this.velocity = 0;
        this.lastTime = 0;
        this.lastPosition = null;

        // Buffer de lissage
        this.smoothingBuffer = [];
        this.smoothingBufferSize = 8;

        // Statistiques pour debug
        this.stats = {
            pointsDrawn: 0,
            avgVelocity: 0,
            avgPressure: 0
        };
    }

    // ========================================================================
    // CONFIGURATION
    // ========================================================================

    setBrush(brushId) {
        if (MANGA_BRUSHES[brushId]) {
            this.currentBrush = MANGA_BRUSHES[brushId];
        }
    }

    setSize(size) {
        this.size = Math.max(0.1, Math.min(100, size));
    }

    setColor(color) {
        this.color = color;
    }

    setOpacity(opacity) {
        this.opacity = Math.max(0, Math.min(1, opacity));
    }

    // ========================================================================
    // GESTION DU TRAIT
    // ========================================================================

    /**
     * Démarre un nouveau trait
     * @param {number} x - Position X
     * @param {number} y - Position Y
     * @param {number} pressure - Pression (0-1), défaut 1.0 pour souris
     * @param {number} tiltX - Inclinaison X (optionnel)
     * @param {number} tiltY - Inclinaison Y (optionnel)
     */
    startStroke(x, y, pressure = 1.0, tiltX = 0, tiltY = 0) {
        this.isDrawing = true;
        this.strokeId++;
        this.points = [];
        this.smoothedPoints = [];
        this.smoothingBuffer = [];
        this.lastTime = performance.now();
        this.lastPosition = { x, y };
        this.velocity = 0;

        // Premier point
        const point = this.createPoint(x, y, pressure, tiltX, tiltY, 0);
        this.points.push(point);
        this.smoothingBuffer.push({ x, y });

        return point;
    }

    /**
     * Ajoute un point au trait
     */
    addPoint(x, y, pressure = 1.0, tiltX = 0, tiltY = 0) {
        if (!this.isDrawing) return null;

        const now = performance.now();
        const deltaTime = now - this.lastTime;

        // Calcul de la vitesse
        const dx = x - this.lastPosition.x;
        const dy = y - this.lastPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.velocity = deltaTime > 0 ? distance / deltaTime : 0;

        // Créer le point
        const point = this.createPoint(x, y, pressure, tiltX, tiltY, this.velocity);
        this.points.push(point);

        // Ajouter au buffer de lissage
        this.smoothingBuffer.push({ x, y });
        const bufferSize = this.getAdaptiveSmoothingSize();
        while (this.smoothingBuffer.length > bufferSize) {
            this.smoothingBuffer.shift();
        }

        // Mettre à jour l'état
        this.lastTime = now;
        this.lastPosition = { x, y };

        return point;
    }

    /**
     * Termine le trait
     */
    endStroke() {
        this.isDrawing = false;
        const stroke = {
            id: this.strokeId,
            points: [...this.points],
            brush: this.currentBrush.id,
            size: this.size,
            color: this.color,
            opacity: this.opacity
        };

        // Reset
        this.smoothingBuffer = [];

        return stroke;
    }

    /**
     * Crée un point avec toutes les métadonnées
     */
    createPoint(x, y, pressure, tiltX, tiltY, velocity) {
        const brush = this.currentBrush;

        // Calcul de la taille effective
        let effectiveSize = this.size;

        // Effet de la pression sur la taille
        if (brush.pressureAffectsSize) {
            const pressureFactor = this.applyPressureCurve(pressure, brush.pressureSensitivity);
            const sizeRange = brush.maxSize - brush.minSize;
            effectiveSize *= brush.minSize + (sizeRange * pressureFactor);
        }

        // Effet de la vitesse sur la taille (inverse: plus rapide = plus fin)
        if (brush.velocityAffectsSize && velocity > 0) {
            const velocityFactor = Math.min(1, velocity * brush.velocitySensitivity);
            effectiveSize *= 1 - (velocityFactor * 0.5);
        }

        // Calcul de l'opacité effective
        let effectiveOpacity = this.opacity * brush.opacity;

        if (brush.pressureAffectsOpacity) {
            effectiveOpacity *= this.applyPressureCurve(pressure, brush.pressureSensitivity);
        }

        return {
            x,
            y,
            pressure,
            tiltX,
            tiltY,
            velocity,
            size: effectiveSize,
            opacity: effectiveOpacity,
            timestamp: performance.now()
        };
    }

    // ========================================================================
    // LISSAGE ET INTERPOLATION
    // ========================================================================

    /**
     * Calcule la taille du buffer de lissage adaptatif
     * Plus on dessine lentement, plus le lissage est fort
     */
    getAdaptiveSmoothingSize() {
        const brush = this.currentBrush;

        if (brush.smoothingMode === 'none') return 1;
        if (brush.smoothingMode === 'fixed') return Math.max(2, brush.smoothing);

        // Mode adaptatif: ajuste selon la vitesse
        const baseSize = brush.smoothing;
        const velocityFactor = Math.max(0.3, 1 - (this.velocity * 0.5));
        return Math.max(2, Math.floor(baseSize * velocityFactor * 1.5));
    }

    /**
     * Applique le lissage au point courant
     * Utilise une moyenne pondérée des derniers points
     */
    getSmoothPosition() {
        if (this.smoothingBuffer.length === 0) return null;
        if (this.smoothingBuffer.length === 1) return this.smoothingBuffer[0];

        let totalWeight = 0;
        let sumX = 0;
        let sumY = 0;

        // Moyenne pondérée: les points récents ont plus de poids
        this.smoothingBuffer.forEach((point, index) => {
            // Poids exponentiel
            const weight = Math.pow(index + 1, 1.5);
            sumX += point.x * weight;
            sumY += point.y * weight;
            totalWeight += weight;
        });

        return {
            x: sumX / totalWeight,
            y: sumY / totalWeight
        };
    }

    /**
     * Interpolation par courbe de Bézier cubique
     * Génère des points intermédiaires pour un trait fluide
     */
    interpolateBezier(p0, p1, p2, p3, numPoints = 10) {
        const points = [];

        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const t2 = t * t;
            const t3 = t2 * t;
            const mt = 1 - t;
            const mt2 = mt * mt;
            const mt3 = mt2 * mt;

            points.push({
                x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
                y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
                t: t
            });
        }

        return points;
    }

    /**
     * Interpolation linéaire simple avec espacement contrôlé
     */
    interpolateLinear(p1, p2, spacing) {
        const points = [];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < spacing) {
            return [p2];
        }

        const steps = Math.ceil(distance / spacing);
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            points.push({
                x: p1.x + dx * t,
                y: p1.y + dy * t,
                t: t,
                // Interpoler aussi la taille et l'opacité
                size: p1.size + (p2.size - p1.size) * t,
                opacity: p1.opacity + (p2.opacity - p1.opacity) * t
            });
        }

        return points;
    }

    /**
     * Interpolation avec Catmull-Rom spline
     * Plus naturel que Bézier pour le dessin à main levée
     */
    interpolateCatmullRom(points, numSegments = 5) {
        if (points.length < 4) return points;

        const result = [];

        for (let i = 0; i < points.length - 3; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const p2 = points[i + 2];
            const p3 = points[i + 3];

            for (let j = 0; j < numSegments; j++) {
                const t = j / numSegments;
                const t2 = t * t;
                const t3 = t2 * t;

                // Coefficients Catmull-Rom
                const x = 0.5 * (
                    (2 * p1.x) +
                    (-p0.x + p2.x) * t +
                    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
                );

                const y = 0.5 * (
                    (2 * p1.y) +
                    (-p0.y + p2.y) * t +
                    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                    (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
                );

                result.push({ x, y, t });
            }
        }

        // Ajouter le dernier point
        result.push(points[points.length - 1]);

        return result;
    }

    // ========================================================================
    // RENDU
    // ========================================================================

    /**
     * Dessine un point unique sur le canvas
     */
    drawPoint(ctx, point, brush = null) {
        brush = brush || this.currentBrush;

        ctx.save();

        // Configuration de base
        ctx.globalAlpha = point.opacity;
        ctx.fillStyle = this.color;

        // Blend mode
        if (brush.blendMode === 'multiply') {
            ctx.globalCompositeOperation = 'multiply';
        }

        const size = point.size;
        const x = point.x;
        const y = point.y;

        // Désactiver l'anti-aliasing pour pixel art
        if (brush.antiAlias === false) {
            ctx.imageSmoothingEnabled = false;
        }

        // Forme carrée (pixel art)
        if (brush.square) {
            const pixelSize = Math.max(1, Math.floor(size));
            ctx.fillRect(
                Math.floor(x - pixelSize / 2),
                Math.floor(y - pixelSize / 2),
                pixelSize,
                pixelSize
            );
        }
        // Gradient (airbrush)
        else if (brush.gradient) {
            const gradientRadius = size * 2;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, gradientRadius);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.3, this.hexToRgba(this.color, 0.6));
            gradient.addColorStop(0.6, this.hexToRgba(this.color, 0.2));
            gradient.addColorStop(1, this.hexToRgba(this.color, 0));
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, gradientRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        // Bord doux (softbrush)
        else if (brush.hardness < 1) {
            const innerRadius = size * brush.hardness;
            const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, size);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, this.hexToRgba(this.color, 0));
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        // Texture (pencil)
        else if (brush.texture?.enabled) {
            this.drawTexturedPoint(ctx, x, y, size, brush);
        }
        // Cercle dur (G-Pen, mapping)
        else {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Dessine un point avec texture (crayon)
     */
    drawTexturedPoint(ctx, x, y, size, brush) {
        const density = brush.texture?.density || 0.3;
        const texSize = brush.texture?.size || 0.8;
        const numDots = Math.max(3, Math.floor(size * density * 3));

        for (let i = 0; i < numDots; i++) {
            const offsetX = (Math.random() - 0.5) * size * texSize;
            const offsetY = (Math.random() - 0.5) * size * texSize;
            const dotSize = size * (0.3 + Math.random() * 0.4);

            ctx.globalAlpha = (0.5 + Math.random() * 0.5) * this.opacity * brush.opacity;
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Dessine un trait complet avec interpolation
     */
    drawStroke(ctx, lastPoint, currentPoint) {
        const brush = this.currentBrush;
        const spacing = Math.max(0.5, this.size * brush.spacing);

        // Interpoler les points
        const interpolated = this.interpolateLinear(lastPoint, currentPoint, spacing);

        // Dessiner chaque point interpolé
        interpolated.forEach(point => {
            this.drawPoint(ctx, {
                x: point.x,
                y: point.y,
                size: point.size !== undefined ? point.size : currentPoint.size,
                opacity: point.opacity !== undefined ? point.opacity : currentPoint.opacity
            }, brush);
        });

        return interpolated.length;
    }

    /**
     * Applique l'effilage (taper) au début/fin du trait
     */
    applyTaper(points, taperConfig) {
        if (!taperConfig || (taperConfig.start === 0 && taperConfig.end === 0)) {
            return points;
        }

        const totalLength = this.calculateStrokeLength(points);
        let currentLength = 0;

        return points.map((point, index) => {
            if (index > 0) {
                const dx = point.x - points[index - 1].x;
                const dy = point.y - points[index - 1].y;
                currentLength += Math.sqrt(dx * dx + dy * dy);
            }

            let sizeMod = 1;

            // Effilage début
            if (taperConfig.start > 0 && currentLength < taperConfig.length) {
                const t = currentLength / taperConfig.length;
                sizeMod *= taperConfig.start + (1 - taperConfig.start) * this.easeOutQuad(t);
            }

            // Effilage fin
            const remainingLength = totalLength - currentLength;
            if (taperConfig.end > 0 && remainingLength < taperConfig.length) {
                const t = remainingLength / taperConfig.length;
                sizeMod *= taperConfig.end + (1 - taperConfig.end) * this.easeOutQuad(t);
            }

            return {
                ...point,
                size: point.size * sizeMod
            };
        });
    }

    /**
     * Calcule la longueur totale d'un trait
     */
    calculateStrokeLength(points) {
        let length = 0;
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        return length;
    }

    // ========================================================================
    // UTILITAIRES
    // ========================================================================

    /**
     * Applique une courbe à la pression pour un meilleur contrôle
     * Courbe S pour une réponse plus naturelle
     */
    applyPressureCurve(pressure, sensitivity) {
        // Courbe S douce
        const adjusted = pressure * sensitivity + (1 - sensitivity) * 0.5;
        return Math.pow(adjusted, 1.5);
    }

    /**
     * Ease out quadratique pour l'effilage
     */
    easeOutQuad(t) {
        return t * (2 - t);
    }

    /**
     * Convertit hex en rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Récupère la pression d'un PointerEvent
     * Retourne 1.0 par défaut pour souris
     */
    static getPressure(event) {
        if (event.pointerType === 'pen' && event.pressure > 0) {
            return event.pressure;
        }
        // Pour souris, simuler une pression moyenne
        if (event.buttons > 0) {
            return 0.7;
        }
        return 1.0;
    }

    /**
     * Récupère le tilt d'un PointerEvent
     */
    static getTilt(event) {
        return {
            x: event.tiltX || 0,
            y: event.tiltY || 0
        };
    }
}

// ============================================================================
// FACTORY POUR CRÉER DES CONFIGURATIONS PERSONNALISÉES
// ============================================================================

export function createCustomBrush(baseBrushId, overrides = {}) {
    const baseBrush = MANGA_BRUSHES[baseBrushId] || MANGA_BRUSHES.gpen;
    return {
        ...baseBrush,
        ...overrides,
        id: overrides.id || `${baseBrushId}_custom`,
        taper: {
            ...baseBrush.taper,
            ...(overrides.taper || {})
        },
        texture: baseBrush.texture ? {
            ...baseBrush.texture,
            ...(overrides.texture || {})
        } : undefined,
        buildup: baseBrush.buildup ? {
            ...baseBrush.buildup,
            ...(overrides.buildup || {})
        } : undefined
    };
}

// ============================================================================
// EXPORT PAR DÉFAUT
// ============================================================================

export default BrushEngine;
