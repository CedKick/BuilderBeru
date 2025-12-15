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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806322/pays1_uncolor_vbawg2.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806323/pays1_color_li1nz4.png",
        canvasSize: { width: 600, height: 600 },
        palette: {
          "1": "#dd724f",
          "2": "#f9c072",
          "3": "#973a13",
          "4": "#591d19",
          "5": "#e77c0b",
          "6": "#faab43",
          "7": "#9a243c",
          "8": "#d24424"
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806336/pays2_orig_h4inrm.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806336/pays2_uncolor_blvzlg.png",
        canvasSize: { width: 1200, height: 800 },
        palette: {
          "1": "#dd724f",
          "2": "#f9c072",
          "3": "#973a13",
          "4": "#591d19",
          "5": "#e77c0b",
          "6": "#faab43",
          "7": "#9a243c",
          "8": "#d24424"
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806366/berserk2_orig_a3nlvr.jpg",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806410/berserk2_uncolor_mwaxpw.png",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#dd724f",
          "2": "#f9c072",
          "3": "#973a13",
          "4": "#591d19",
          "5": "#e77c0b",
          "6": "#faab43",
          "7": "#9a243c",
          "8": "#d24424"
        }
      },
      second: {
        id: "default",
        name: "Guts second",
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806349/berserk1_orig_u10357.jpg",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806349/berserk1_uncolor_jaiyjd.png",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#dd724f",
          "2": "#f9c072",
          "3": "#973a13",
          "4": "#591d19",
          "5": "#e77c0b",
          "6": "#faab43",
          "7": "#9a243c",
          "8": "#d24424"
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806377/mang3_orig_h4vmdq.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806376/mang3__uncolor_sjl4gi.png",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#dd724f",
          "2": "#f9c072",
          "3": "#973a13",
          "4": "#591d19",
          "5": "#e77c0b",
          "6": "#faab43",
          "7": "#9a243c",
          "8": "#d24424"
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806428/mang5_orig_dznnxy.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806427/mang5_uncolor_frxdrq.png",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#dd724f",
          "2": "#f9c072",
          "3": "#973a13",
          "4": "#591d19",
          "5": "#e77c0b",
          "6": "#faab43",
          "7": "#9a243c",
          "8": "#d24424"
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806441/mang7_orig_nuff0y.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806436/mang7_uncolor_dv8kql.png",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#dd724f",
          "2": "#f9c072",
          "3": "#973a13",
          "4": "#591d19",
          "5": "#e77c0b",
          "6": "#faab43",
          "7": "#9a243c",
          "8": "#d24424"
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806440/mang6_orig_n4jetc.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806439/mang6_uncolor_kjtgmd.png",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#dd724f",
          "2": "#f9c072",
          "3": "#973a13",
          "4": "#591d19",
          "5": "#e77c0b",
          "6": "#faab43",
          "7": "#9a243c",
          "8": "#d24424"
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806442/mang9_orig_y8th46.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806431/mang9_uncolor_seoglc.png",
        canvasSize: { width: 800, height: 1200 },
        palette: {
          "1": "#dd724f",
          "2": "#f9c072",
          "3": "#973a13",
          "4": "#591d19",
          "5": "#e77c0b",
          "6": "#faab43",
          "7": "#9a243c",
          "8": "#d24424"
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806446/mang8_orig_xgrugz.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806435/mang8_uncolor_zt52od.png",
        canvasSize: { width: 1200, height: 800 },
        palette: {
          "1": "#dd724f",
          "2": "#f9c072",
          "3": "#973a13",
          "4": "#591d19",
          "5": "#e77c0b",
          "6": "#faab43",
          "7": "#9a243c",
          "8": "#d24424"
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806447/mang10_orig_aiybao.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806432/mang10_uncolor_u245ry.png",
        canvasSize: { width: 1200, height: 800 },
        palette: {
          "1": "#dd724f",
          "2": "#f9c072",
          "3": "#973a13",
          "4": "#591d19",
          "5": "#e77c0b",
          "6": "#faab43",
          "7": "#9a243c",
          "8": "#d24424"
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765491848/UsagiTsukino_orig_zi97t6.jpg",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765491848/UsagiTsukino_colored_ounqtz.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761071898/Juhee_orig_axshu2.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761071897/Juhee_uncoloried_enpxch.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759920073/ilhwan_orig_fm4l2o.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759951014/ilhwan_uncoloried_uzywyu-removebg-preview_t87rro.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759927874/yuki_origi_m4l9h6.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759951570/yuki_uncoloried_nyhkmc-removebg-preview_cs9qe5.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759937740/Minnie_origi_afqdqa.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759949543/Minnie_uncoloried_test_h6erxt.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759942372/kanaeWha_origi_rpqlgt.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759950925/kanaeWhat_uncoloried_qd0yb0-removebg-preview_uqzupl.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759944854/kanaePyj_origi_lbe1co.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759951683/kanaePyj_uncoloried_skpopk-removebg-preview_j44vcy.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759944005/seorin_origi_cnjynr.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759951097/seorin_uncoloried_ymcwro-removebg-preview_zq2nyf.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760095328/frieren_origi_ppc90f.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760095322/frieren_uncolored_ryjru0.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760099999/frifriArt_origi_lo50zj.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760099999/frifriArt_uncolored_edpz7k.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761126693/mousdraw_orig_kumr1q.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761126692/mousudraw_uncoloried_wkwiy1.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760092206/sarah_origi_abtdsa.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760092204/sarah_uncoloried_eq63mh.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761071898/chae_orig_kdpdml.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761071896/chae_uncoloried_eew8ey.png",
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
        reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761329588/luffyr_original_nkgvf8.png",
        template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761329579/luffy_coloring_lnwpfn.png",
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