// src/pages/DrawBeru/config/models.js

// Configuration des thèmes avec possibilité d'ajouter des images de bannière
export const drawBeruThemes = {
  "Solo Leveling": {
    name: "Solo Leveling",
    image: null, // Ajouter l'URL de l'image plus tard
    order: 1
  },
  "Manga": {
    name: "Manga",
    image: null,
    order: 2
  },
  "Anime": {
    name: "Anime",
    image: null,
    order: 3
  },
  "Berserk": {
    name: "Berserk",
    image: null,
    order: 4
  },
  "Landscape": {
    name: "Landscape",
    image: null,
    order: 4
  },
  // Thèmes futurs
  // "Paysage": { name: "Paysage", image: null, order: 4 },
  // "Animals/Pets": { name: "Animals/Pets", image: null, order: 5 },
  // "Berserk": { name: "Berserk", image: null, order: 6 },
};

export const drawBeruModels = {
  Mountains: {
    name: "Mountains",
    description: "Mountains",
    themes: ["Landscape"],
    models: {
      default: {
        id: "default",
        name: "Mountains",
        reference: "https://api.builderberu.com/cdn/images/pays1_uncolor_vbawg2.webp",
        template: "https://api.builderberu.com/cdn/images/pays1_color_li1nz4.webp",
        canvasSize: { width: 600, height: 600 },
        palette: {
          "1": "#192004",
          "2": "#4C4D00",
          "3": "#2D5360",
          "4": "#855422",
          "5": "#6D6F60",
          "6": "#8A9593",
          "7": "#DCC097",
          "8": "#FDF3DB"
        }
      }
    }
  }, Chrismas: {
    name: "Chrismas",
    description: "Chrismas",
    themes: ["Landscape"],
    models: {
      default: {
        id: "default",
        name: "Chrismas",
        reference: "https://api.builderberu.com/cdn/images/pays2_orig_h4inrm.webp",
        template: "https://api.builderberu.com/cdn/images/pays2_uncolor_blvzlg.webp",
        canvasSize: { width: 1200, height: 800 },
        palette: {
          "1": "#1C2940",
          "2": "#7C461F",
          "3": "#54545D",
          "4": "#9D7251",
          "5": "#D87E26",
          "6": "#797C90",
          "7": "#DAB287",
          "8": "#FFF4DA"
        }
      }
    }
  }, Guts: {
    name: "Guts",
    description: "Guts",
    themes: ["Manga", "Anime", "Berserk"],
    models: {
      default: {
        id: "default",
        name: "Guts",
        reference: "https://api.builderberu.com/cdn/images/berserk2_orig_a3nlvr.webp",
        template: "https://api.builderberu.com/cdn/images/berserk2_uncolor_mwaxpw.webp",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#141415",
          "2": "#2E2E2E",
          "3": "#5E5E5F",
          "4": "#767677",
          "5": "#8E8E90",
          "6": "#A6A6A9",
          "7": "#BFBFBF",
          "8": "#EFEFEF"
        }
      },
      second: {
        id: "default",
        name: "Guts second",
        reference: "https://api.builderberu.com/cdn/images/berserk1_orig_u10357.webp",
        template: "https://api.builderberu.com/cdn/images/berserk1_uncolor_jaiyjd.webp",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#151515",
          "2": "#353535",
          "3": "#545454",
          "4": "#737373",
          "5": "#939393",
          "6": "#AAAAAA",
          "7": "#C1C1C1",
          "8": "#EFEFEF"
        }
      }
    }
  }, Brunette: {
    name: "Brunette",
    description: "Brunette",
    themes: ["Manga", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Brunette",
        reference: "https://api.builderberu.com/cdn/images/mang3_orig_h4vmdq.webp",
        template: "https://api.builderberu.com/cdn/images/mang3__uncolor_sjl4gi.webp",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#21140E",
          "2": "#3B404B",
          "3": "#825838",
          "4": "#636A7D",
          "5": "#E3813F",
          "6": "#9E969E",
          "7": "#E7AB81",
          "8": "#FFE1B4"
        }
      }
    }
  }, Shinjuku: {
    name: "Shinjuku",
    description: "Shinjuku",
    themes: ["Manga", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Shinjuku",
        reference: "https://api.builderberu.com/cdn/images/mang5_orig_dznnxy.webp",
        template: "https://api.builderberu.com/cdn/images/mang5_uncolor_frxdrq.webp",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#163D63",
          "2": "#622D28",
          "3": "#CD341C",
          "4": "#4693B3",
          "5": "#A87D6D",
          "6": "#FA8E18",
          "7": "#FFB77B",
          "8": "#D1DBCC"
        }
      }
    }
  }, BikeSurbubTokyo: {
    name: "BikeSurbubTokyo",
    description: "Cycling around Tokyo",
    themes: ["Manga", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Cycling in Japan",
        reference: "https://api.builderberu.com/cdn/images/mang7_orig_nuff0y.webp",
        template: "https://api.builderberu.com/cdn/images/mang7_uncolor_dv8kql.webp",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#1A1511",
          "2": "#623C52",
          "3": "#96551A",
          "4": "#C5585B",
          "5": "#F1682B",
          "6": "#FCA40C",
          "7": "#E69958",
          "8": "#D7AC9A"
        }
      }
    }
  }, Annapurna: {
    name: "Annapurna",
    description: "Mountains in Annapurna",
    themes: ["Manga", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Annapurna",
        reference: "https://api.builderberu.com/cdn/images/mang6_orig_n4jetc.webp",
        template: "https://api.builderberu.com/cdn/images/mang6_uncolor_kjtgmd.webp",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#2B140B",
          "2": "#123350",
          "3": "#733F25",
          "4": "#3C5987",
          "5": "#CB5027",
          "6": "#AB7F8E",
          "7": "#F79C5E",
          "8": "#FFD0AC"
        }
      }
    }
  }, GreenPark: {
    name: "GreenPark",
    description: "peace in GreenPark Seoul",
    themes: ["Manga", "Anime"],
    models: {
      default: {
        id: "default",
        name: "GreenPark",
        reference: "https://api.builderberu.com/cdn/images/mang9_orig_y8th46.webp",
        template: "https://api.builderberu.com/cdn/images/mang9_uncolor_seoglc.webp",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#1C150C",
          "2": "#974204",
          "3": "#424759",
          "4": "#8F695A",
          "5": "#D8914D",
          "6": "#F9D801",
          "7": "#F1E67F",
          "8": "#F0EBF1"
        }
      }
    }
  }, PeaceinAlpes: {
    name: "PeaceinAlpes",
    description: "Farniente at the mountains",
    themes: ["Manga", "Anime"],
    models: {
      default: {
        id: "default",
        name: "PeaceAndLove",
        reference: "https://api.builderberu.com/cdn/images/mang8_orig_xgrugz.webp",
        template: "https://api.builderberu.com/cdn/images/mang8_uncolor_zt52od.webp",
        canvasSize: { width: 1200, height: 800 },
        palette: {
          "1": "#222209",
          "2": "#586E19",
          "3": "#87A71E",
          "4": "#8D7F5C",
          "5": "#AFA274",
          "6": "#C1C24B",
          "7": "#C9BF9C",
          "8": "#F8ECCA"
        }
      }
    }
  }, MeetCat: {
    name: "MeetCat",
    description: "Rencontre d'un chat à Donghae",
    themes: ["Manga", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Meet Cat",
        reference: "https://api.builderberu.com/cdn/images/mang10_orig_aiybao.webp",
        template: "https://api.builderberu.com/cdn/images/mang10_uncolor_u245ry.webp",
        canvasSize: { width: 1200, height: 800 },
        palette: {
          "1": "#171610",
          "2": "#604D38",
          "3": "#4A6C82",
          "4": "#987F60",
          "5": "#859EAD",
          "6": "#E89768",
          "7": "#D2BCA4",
          "8": "#FEE8CF"
        }
      }
    }
  },
  UsagiTsukino: {
    name: "USagi Tsukino",
    description: "USagi Tsukino",
    themes: ["Manga", "Anime"],
    models: {
      default: {
        id: "default",
        name: "USagi Tsukino",
        reference: "https://api.builderberu.com/cdn/images/UsagiTsukino_orig_zi97t6.webp",
        template: "https://api.builderberu.com/cdn/images/UsagiTsukino_colored_ounqtz.webp",
        canvasSize: { width: 893, height: 1576 },
        palette: {
          "1": "#171b2f",
          "2": "#9d604e",
          "3": "#cda2a2",
          "4": "#f6ede6",
          "5": "#06060d",
          "6": "#3c67ba",
          "7": "#383550",
          "8": "#eb9b4e"
        }
      }
    }
  },
  Juhee: {
    name: "Juhee",
    description: "Hunter Juhee",
    themes: ["Solo Leveling", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Juhee",
        reference: "https://api.builderberu.com/cdn/images/Juhee_orig_axshu2.webp",
        template: "https://api.builderberu.com/cdn/images/Juhee_uncoloried_enpxch.webp",
        canvasSize: { width: 900, height: 600 },
        palette: {
          "1": "#778297",
          "2": "#232f3c",
          "3": "#f6c7a1",
          "4": "#544238",
          "5": "#a088a2",
          "6": "#5a6273",
          "7": "#876c72",
          "8": "#719aab"
        }
      }
    }
  },
  ilhwan: {
    name: "Ilhwan",
    description: "Hunter polyvalent de BuilderBeru",
    themes: ["Solo Leveling", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Ilhwan Classique",
        reference: "https://api.builderberu.com/cdn/images/ilhwan_orig_fm4l2o.webp",
        template: "https://api.builderberu.com/cdn/images/ilhwan_uncoloried_uzywyu-removebg-preview_t87rro.webp",
        canvasSize: { width: 450, height: 675 },
        palette: {
          "1": "#F5DEB3",
          "2": "#2F2F2F",
          "3": "#8B4513",
          "4": "#DC143C",
          "5": "#FFFFFF",
          "6": "#000000",
          "7": "#FFD700",
          "8": "#4B0082"
        }
      }
    }
  },
  Yuqi: {
    name: "Yuqi",
    description: "Hunter agile de BuilderBeru",
    themes: ["Solo Leveling", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Yuqi Classique",
        reference: "https://api.builderberu.com/cdn/images/yuki_origi_m4l9h6.webp",
        template: "https://api.builderberu.com/cdn/images/yuki_uncoloried_nyhkmc-removebg-preview_cs9qe5.webp",
        canvasSize: { width: 300, height: 450 },
        palette: {
          "1": "#3c3331",
          "2": "#fdd8b8",
          "3": "#1c1718",
          "4": "#c48e6d",
          "5": "#070402",
          "6": "#2d2d39",
          "7": "#645249",
          "8": "#f7f1e6"
        }
      }
    }
  },
  Minnie: {
    name: "Minnie",
    description: "Hunter mystérieuse de BuilderBeru",
    themes: ["Solo Leveling", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Minnie Classique",
        reference: "https://api.builderberu.com/cdn/images/Minnie_origi_afqdqa.webp",
        template: "https://api.builderberu.com/cdn/images/Minnie_uncoloried_test_h6erxt.webp",
        canvasSize: { width: 300, height: 450 },
        palette: {
          "1": "#3c3331",
          "2": "#fdd8b8",
          "3": "#1c1718",
          "4": "#c48e6d",
          "5": "#070402",
          "6": "#2d2d39",
          "7": "#645249",
          "8": "#f7f1e6"
        }
      }
    }
  },
  Kanae: {
    name: "Kanae",
    description: "Hunter élégante de BuilderBeru",
    themes: ["Solo Leveling", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Kanae What",
        reference: "https://api.builderberu.com/cdn/images/kanaeWha_origi_rpqlgt.webp",
        template: "https://api.builderberu.com/cdn/images/kanaeWhat_uncoloried_qd0yb0-removebg-preview_uqzupl.webp",
        canvasSize: { width: 1024, height: 1536 },
        palette: {
          "1": "#f9dcbf",
          "2": "#2d2928",
          "3": "#0c0d0b",
          "4": "#d79780",
          "5": "#fbfaf7",
          "6": "#9f3a47",
          "7": "#6b5a5c",
          "8": "#3c3638"
        }
      },
      second: {
        id: "second",
        name: "Kanae Pyjama",
        reference: "https://api.builderberu.com/cdn/images/kanaePyj_origi_lbe1co.webp",
        template: "https://api.builderberu.com/cdn/images/kanaePyj_uncoloried_skpopk-removebg-preview_j44vcy.webp",
        canvasSize: { width: 600, height: 760 },
        palette: {
          "1": "#9e948f",
          "2": "#161112",
          "3": "#c5babf",
          "4": "#7d5c58",
          "5": "#b2a8ac",
          "6": "#887d79",
          "7": "#c88371",
          "8": "#443435"
        }
      }
    }
  },
  Seorin: {
    name: "Seorin",
    description: "Hunter stratège de BuilderBeru",
    themes: ["Solo Leveling", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Seorin pyjama",
        reference: "https://api.builderberu.com/cdn/images/seorin_origi_cnjynr.webp",
        template: "https://api.builderberu.com/cdn/images/seorin_uncoloried_ymcwro-removebg-preview_zq2nyf.webp",
        canvasSize: { width: 408, height: 612 },
        palette: {
          "1": "#9e948f",
          "2": "#161112",
          "3": "#c5babf",
          "4": "#7d5c58",
          "5": "#b2a8ac",
          "6": "#887d79",
          "7": "#c88371",
          "8": "#443435"
        }
      }
    }
  },
  Frieren: {
    name: "Frieren",
    description: "Hunter stratège de BuilderBeru",
    themes: ["Solo Leveling", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Frieren",
        reference: "https://api.builderberu.com/cdn/images/frieren_origi_ppc90f.webp",
        template: "https://api.builderberu.com/cdn/images/frieren_uncolored_ryjru0.webp",
        canvasSize: { width: 600, height: 600 },
        palette: {
          "1": "#778297",
          "2": "#232f3c",
          "3": "#f6c7a1",
          "4": "#544238",
          "5": "#a088a2",
          "6": "#5a6273",
          "7": "#876c72",
          "8": "#719aab"
        }
      },
      second: {
        id: "second",
        name: "Frieren Art",
        reference: "https://api.builderberu.com/cdn/images/frifriArt_origi_lo50zj.webp",
        template: "https://api.builderberu.com/cdn/images/frifriArt_uncolored_edpz7k.webp",
        canvasSize: { width: 600, height: 600 },
        palette: {
          "1": "#58b3df",
          "2": "#f4f6f3",
          "3": "#15191d",
          "4": "#3e6889",
          "5": "#9cb2c4",
          "6": "#8e7c5d",
          "7": "#9adbe8",
          "8": "#478dbc",
          "9": "#384149",
          "10": "#e1c192"
        }
      }
    }
  },
  MousuCommunauty: {
    name: "MousuCommunauty",
    description: "Mousu's communauty",
    themes: ["Solo Leveling", "Anime"],
    models: {
      default: {
        id: "default",
        name: "AYAAA",
        reference: "https://api.builderberu.com/cdn/images/mousdraw_orig_kumr1q.webp",
        template: "https://api.builderberu.com/cdn/images/mousudraw_uncoloried_wkwiy1.webp",
        canvasSize: { width: 900, height: 600 },
        palette: {
          "1": "#f8e8df",
          "2": "#3c3732",
          "3": "#8c7b71",
          "4": "#b49d92",
          "5": "#1b1915",
          "6": "#60554c",
          "7": "#d79d3f",
          "8": "#cdbfb4"
        }
      }
    }
  },
  PrincesseSarah: {
    name: "Princesse Sarah",
    description: "Hunter stratège de BuilderBeru",
    themes: ["Manga", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Princesse Sarah",
        reference: "https://api.builderberu.com/cdn/images/sarah_origi_abtdsa.webp",
        template: "https://api.builderberu.com/cdn/images/sarah_uncoloried_eq63mh.webp",
        canvasSize: { width: 345, height: 391 },
        palette: {
          "1": "#778297",
          "2": "#232f3c",
          "3": "#f6c7a1",
          "4": "#544238",
          "5": "#a088a2",
          "6": "#5a6273",
          "7": "#876c72",
          "8": "#719aab"
        }
      }
    }
  },
  Chae: {
    name: "Cha Hae-In",
    description: "Hunter Cha Hae-In",
    themes: ["Solo Leveling", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Cha Hae-In",
        reference: "https://api.builderberu.com/cdn/images/chae_orig_kdpdml.webp",
        template: "https://api.builderberu.com/cdn/images/chae_uncoloried_eew8ey.webp",
        canvasSize: { width: 600, height: 900 },
        palette: {
          "1": "#778297",
          "2": "#232f3c",
          "3": "#f6c7a1",
          "4": "#544238",
          "5": "#a088a2",
          "6": "#5a6273",
          "7": "#876c72",
          "8": "#719aab"
        }
      }
    }
  },
  Luffy: {
    name: "Luffy",
    description: "Luffy",
    themes: ["Manga", "Anime"],
    models: {
      default: {
        id: "default",
        name: "Luffy",
        reference: "https://api.builderberu.com/cdn/images/luffyr_original_nkgvf8.webp",
        template: "https://api.builderberu.com/cdn/images/luffy_coloring_lnwpfn.webp",
        canvasSize: { width: 600, height: 900 },
        palette: {
          "1": "#b1cfde",
          "2": "#974931",
          "3": "#171511",
          "4": "#ebb47c",
          "5": "#2d2e2f",
          "6": "#d9e4e5",
          "7": "#b16b44",
          "8": "#5f2b1c"
        }
      }
    }
  },
};

// ⚙️ HELPERS

export const getModel = (hunter, modelId = 'default') => {
  return drawBeruModels[hunter]?.models[modelId] || null;
};

export const getHunterModels = (hunter) => {
  return drawBeruModels[hunter]?.models || {};
};

export const getAvailableHunters = () => {
  return Object.keys(drawBeruModels);
};

export const getAllModelsCount = () => {
  return Object.values(drawBeruModels).reduce((total, hunter) => {
    return total + Object.keys(hunter.models).length;
  }, 0);
};

// Helpers pour les thèmes
export const getAvailableThemes = () => {
  return Object.entries(drawBeruThemes)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, value]) => ({ id: key, ...value }));
};

export const getHuntersByTheme = (theme) => {
  if (!theme) return Object.entries(drawBeruModels);
  return Object.entries(drawBeruModels).filter(([_, hunterData]) =>
    hunterData.themes?.includes(theme)
  );
};