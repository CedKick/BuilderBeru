import { MANGA_BRUSHES } from '../BrushEngine';

// Brush types for UI - maps to MANGA_BRUSHES engine configs
export const BRUSH_TYPES = {
    pen: {
        id: 'gpen',
        name: 'G-Pen',
        icon: '\u2712\uFE0F',
        description: 'Encrage manga professionnel',
        ...MANGA_BRUSHES.gpen
    },
    pencil: {
        id: 'pencil',
        name: 'Crayon Manga',
        icon: '\u270F\uFE0F',
        description: 'Esquisse avec grain',
        ...MANGA_BRUSHES.pencil
    },
    marker: {
        id: 'marker',
        name: 'Feutre Copic',
        icon: '\uD83D\uDD8D\uFE0F',
        description: 'Coloriage semi-transparent',
        ...MANGA_BRUSHES.marker
    },
    airbrush: {
        id: 'airbrush',
        name: 'Aerographe',
        icon: '\uD83D\uDCA8',
        description: 'Degrades et ombres douces',
        ...MANGA_BRUSHES.airbrush
    },
    pixel: {
        id: 'pixel',
        name: 'Pixel',
        icon: '\u25AA\uFE0F',
        description: 'Pixel art',
        ...MANGA_BRUSHES.pixel
    },
    mapping: {
        id: 'mapping',
        name: 'Mapping Pen',
        icon: '\uD83D\uDD8A\uFE0F',
        description: 'Lignes fines et details',
        ...MANGA_BRUSHES.mapping
    },
    softbrush: {
        id: 'softbrush',
        name: 'Brush Doux',
        icon: '\uD83D\uDD8C\uFE0F',
        description: 'Ombres et degrades',
        ...MANGA_BRUSHES.softbrush
    }
};
