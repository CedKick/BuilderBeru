// Chibi affinities between pairs
// 'synergy' = bonus together, 'neutral' = normal, 'chaotic' = conflicting interactions
export const CHIBI_AFFINITIES = {
    'beru_papillon-tank': 'chaotic',
    'tank-beru_papillon': 'chaotic',
};

// Interaction dialogue lines between chibis
export const CHIBI_INTERACTIONS = {
    // Tank trolls Beru's work
    'tank_trolls_beru': [
        { from: 'tank', message: "Oups ! J'ai gliss\u00e9 sur ton beau coloriage~ \uD83D\uDC3E" },
        { from: 'tank', message: "Hehe... C'\u00e9tait trop parfait, fallait corriger \u00e7a !" },
        { from: 'tank', message: "WOUAF ! *splash sur le travail de B\u00e9ru*" },
        { from: 'tank', message: "Cette couleur est MIEUX, fais-moi confiance !" },
        { from: 'tank', message: "*roule sur le dessin* ...Oups?" },
        { from: 'tank', message: "L'art abstrait c'est SOUS-ESTIM\u00c9 !" },
        { from: 'tank', message: "Un peu de CHAOS pour \u00e9gayer tout \u00e7a~" },
        { from: 'tank', message: "B\u00e9ru colorie trop bien... \u00e7a m'\u00e9nerve !" },
        { from: 'tank', message: "*patte maladroite* C'est pas ma faute !" },
        { from: 'tank', message: "Qui a dit que le rose allait pas l\u00e0 ? MOI." },
    ],
    // Beru reacts to Tank trolling
    'beru_reacts_to_troll': [
        { from: 'beru_papillon', message: "KIII ?! Tank qu'est-ce que tu fais ?!" },
        { from: 'beru_papillon', message: "...Tu as VRAIMENT fait \u00e7a ? \uD83D\uDE24" },
        { from: 'beru_papillon', message: "Mes belles couleurs... *soupir*" },
        { from: 'beru_papillon', message: "Je vais devoir repasser derri\u00e8re... ENCORE." },
        { from: 'beru_papillon', message: "Tank... on avait dit PAS sur ma zone !" },
        { from: 'beru_papillon', message: "*flutter furieux* Tu vas voir !" },
        { from: 'beru_papillon', message: "Je... je respire... calmement..." },
        { from: 'beru_papillon', message: "C'est la TROISI\u00c8ME fois aujourd'hui !" },
        { from: 'beru_papillon', message: "Pourquoi je travaille avec ce chien..." },
        { from: 'beru_papillon', message: "*ailes qui tremblent de frustration*" },
    ],
    // Beru fixes Tank's mess
    'beru_fixes_tank': [
        { from: 'beru_papillon', message: "Bon... je r\u00e9pare \u00e7a. Comme d'habitude." },
        { from: 'beru_papillon', message: "*soupir* Au travail..." },
        { from: 'beru_papillon', message: "Un jour il apprendra... un jour." },
        { from: 'beru_papillon', message: "Pr\u00e9cision chirurgicale pour effacer le chaos~" },
        { from: 'beru_papillon', message: "Cette tache... n'a JAMAIS exist\u00e9." },
        { from: 'beru_papillon', message: "Patience est m\u00e8re de vertu... *r\u00e9pare*" },
        { from: 'beru_papillon', message: "Allez hop, on nettoie les b\u00eatises~" },
        { from: 'beru_papillon', message: "Le perfectionnisme a un prix..." },
    ],
    // Tank reacts when Beru fixes
    'tank_reacts_to_fix': [
        { from: 'tank', message: "H\u00e9 ! C'\u00e9tait de l'ART \u00e7a !" },
        { from: 'tank', message: "...Bon ok c'\u00e9tait moche. Mais QUAND M\u00caME !" },
        { from: 'tank', message: "*boude dans son coin*" },
        { from: 'tank', message: "Pfff... perfectionniste va." },
        { from: 'tank', message: "Tu verras, un jour mon style sera reconnu !" },
        { from: 'tank', message: "C'\u00e9tait du G\u00c9NIE incompris !" },
        { from: 'tank', message: "*grogne* Je recommencerai..." },
        { from: 'tank', message: "M\u00eame pas vrai que c'\u00e9tait moche !" },
    ],
    // Beru solo focused
    'beru_solo_focused': [
        { from: 'beru_papillon', message: "Cette nuance... parfaite." },
        { from: 'beru_papillon', message: "La pr\u00e9cision est un art~" },
        { from: 'beru_papillon', message: "Chaque pixel compte..." },
        { from: 'beru_papillon', message: "Kiii~ C'est beau non ?" },
        { from: 'beru_papillon', message: "L'ombre ici... oui, exactement l\u00e0." },
        { from: 'beru_papillon', message: "Mes ailes fr\u00e9missent de satisfaction~" },
    ],
    // Tank solo chaos
    'tank_solo_chaos': [
        { from: 'tank', message: "WOUAF ! *splash al\u00e9atoire*" },
        { from: 'tank', message: "Cette couleur ? Ou celle-l\u00e0 ? ...Les deux !" },
        { from: 'tank', message: "*tourne en rond* O\u00d9 colorier..." },
        { from: 'tank', message: "Hehe... personne regarde ? *splash*" },
        { from: 'tank', message: "L'impr\u00e9vu c'est la VIE !" },
        { from: 'tank', message: "Je suis un ARTISTE incompris !" },
    ],
    // Legendary messages (ultra rare 0.5%, 3-day cooldown)
    'legendary_tank': [
        { from: 'tank', message: "Hein ? \u2026 Attends\u2026 c'\u00e9tait pas une b\u00eatise ?" },
        { from: 'tank', message: "...B\u00e9ru ? T'es vraiment fort en fait." },
        { from: 'tank', message: "*regarde son travail* ...C'est... beau?" },
    ],
    'legendary_beru': [
        { from: 'beru_papillon', message: "\u2026\u2026 \u2026Merci Tank." },
        { from: 'beru_papillon', message: "Tu sais quoi ? ...Continue comme \u00e7a." },
        { from: 'beru_papillon', message: "*sourire* On fait une bonne \u00e9quipe." },
    ],
    // Emotional state messages - Tank overexcited
    'tank_overexcited': [
        { from: 'tank', message: "CHAOS IS ART ! \uD83C\uDFA8\uD83D\uDC15" },
        { from: 'tank', message: "JE SUIS UNSTOPPABLE !!!" },
        { from: 'tank', message: "ENCORE ! ENCORE ! ENCOOORE !" },
        { from: 'tank', message: "*mode destruction totale activ\u00e9*" },
    ],
    // Emotional state messages - Beru resigned
    'beru_resigned': [
        { from: 'beru_papillon', message: "Pourquoi je travaille avec ce chien..." },
        { from: 'beru_papillon', message: "*soupir infini* ...D'accord." },
        { from: 'beru_papillon', message: "Je ne ressens plus rien." },
        { from: 'beru_papillon', message: "C'est \u00e7a ma vie maintenant..." },
    ],
};

// Chibi painter configs
export const CHIBI_PAINTERS = {
    beru_papillon: {
        id: 'beru_papillon',
        name: 'B\u00e9ru-Papillon',
        entityType: 'beru',
        sprites: {
            back: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422906/alecto_up_dwahgh.png',
            front: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755423129/alecto_face_irsy6q.png'
        },
        stats: {
            endurance: 80,
            speed: 60,
            pixelPrecision: 2
        },
        pixelSize: 2,
        duration: 60,
        colorMode: 'accurate',
        movementMode: 'zone',
        inkSplash: false,
        zoneConfig: {
            minSize: 8,
            maxSize: 25,
            shapes: ['rect', 'square', 'triangle'],
        },
        messages: [
            "Kiii... mais avec gr\u00e2ce maintenant !",
            "Mes ailes chatouillent les ombres...",
            "Entre deux mondes, je danse.",
            "Un papillon de l'ombre... artistique !",
            "Mes couleurs sont aussi pr\u00e9cises que mes griffes~",
        ],
        startMessage: "C'est parti ! Je vais colorier avec pr\u00e9cision~",
        endMessage: "Mission accomplie ! \u00c0 la prochaine~",
        affinities: { tank: 'chaotic' },
        chaoticBehavior: {
            fixesOthersMess: true,
            fixChance: 0.15,
            reactionDelay: 2000,
        }
    },
    tank: {
        id: 'tank',
        name: 'Tank',
        entityType: 'tank',
        sprites: {
            back: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604462/tank_dos_bk6poi.png',
            front: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png'
        },
        stats: {
            endurance: 50,
            speed: 40,
            pixelPrecision: 5
        },
        pixelSize: 5,
        duration: 45,
        colorMode: 'troll',
        movementMode: 'random',
        inkSplash: true,
        inkSplashChance: 0.08,
        messages: [
            "Hehe... cette couleur va \u00eatre PARFAITE !",
            "*splash* Oups, c'est pas la bonne couleur ?",
            "L'art c'est subjectif, non ?",
            "TANK SMASH... avec de la peinture !",
        ],
        startMessage: "Wouaf ! Tank va t'aider... \u00e0 sa mani\u00e8re !",
        endMessage: "Hehe... c'est beau non ? ...Non ? WOUAF !",
        affinities: { beru_papillon: 'chaotic' },
        chaoticBehavior: {
            trollsOthersWork: true,
            trollChance: 0.12,
            trollRadius: 30,
            reactionDelay: 1500,
        }
    }
};

export const MAX_ACTIVE_CHIBIS = 2;
