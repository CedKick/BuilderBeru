const data_chars = {
  'ilhwan': {
      name: 'Ilhwan',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759951014/ilhwan_uncoloried_uzywyu-removebg-preview_t87rro.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759951014/ilhwan_uncoloried_uzywyu-removebg-preview_t87rro.png',
      class: 'Assassin',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack'
    },
    'minnie': {
      name: 'Minnie',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403438/Minnie_bcfolv.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403438/Minnie_bcfolv.png',
      class: 'Assassin',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Defense'
    },
      'Soyeon': {
      name: 'Soyeon',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403438/soyeon_fstvg4.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403438/soyeon_fstvg4.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Attack'
    },
      'yuqi': {
      name: 'yuqi',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403437/yuki_dqefqm.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403437/yuki_dqefqm.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'HP'
    },
  'jinah': {
      name: 'Jinah',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753869840/jinah_vrbddm.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753869067/jinah_icon_pfdee6.png',
      class: 'Support',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Defense'
    },
  'shuhua': {
      name: 'Shuhua',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751535917/Shuhua1_difnjb.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751536775/IconShuhua_njc2f2.png',
      class: 'Assassin',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Attack'
    },'miyeon': {
      name: 'Miyeon',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751496034/miyeon_ijwudx.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751496034/miyeon_ijwudx.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense'
    },
     'niermann': {
      name: 'Lennart Niermann',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749114179/niermann_arxjer.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749114267/build-niermann_phfwmu.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Defense'
    },

    'chae': {
      name: 'Cha Hae-In Valkyrie',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604309/chae_mlnz8k.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606282/icons/build-3.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Defense'
    },
    'kanae': {
      name: 'Tawata Kanae',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604318/kanae_squvh2.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606320/icons/build-18.png',
      class: 'Assassin',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'frieren': {
      name: 'Frieren',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820684/frieren_portrait_jtvtcd.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820684/frieren_portrait_jtvtcd.png',
      class: 'Support',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Defense'
    },
    'stark': {
      name: 'Stark',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820683/stark_portrait_ag5teg.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820683/stark_portrait_ag5teg.png',
      class: 'Break',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'HP'
    },
    'fern': {
      name: 'Fern',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820683/fern_portrait_vu4q7v.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820683/fern_portrait_vu4q7v.png',
      class: 'DPS',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'alicia': {
      name: 'Alicia Blanche',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604309/alicia_fzpzkf.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606278/icons/build.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Attack'
    },
    'mirei': {
      name: 'Amamiya Mirei',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604327/mirei_nb6arm.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606340/icons/build-26.png',
      class: 'Assassin',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Attack'
    },
    'baek': {
      name: 'Baek Yoonho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604214/baek_tgrbx8.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747647495/build_baek_wwcvhp.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense'
    },
    'chae-in': {
      name: 'Cha Hae In',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604308/chae-in_zafver.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606285/icons/build-4.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Attack'
    },
    'charlotte': {
      name: 'Charlotte',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604306/charlotte_bbsqv1.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606287/icons/build-5.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Defense'
    },
    'choi': {
      name: 'Choi Jong-In',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604310/choi_a4k5sl.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606289/icons/build-6.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'emma': {
      name: 'Emma Laurent',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604311/emma_vvw5lt.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606292/icons/build-7.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'HP'
    },
    'esil': {
      name: 'Esil Radiru',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604313/esil_bjzrv2.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606294/icons/build-8.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'gina': {
      name: 'Gina',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604312/gina_emzlpd.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606297/icons/build-9.png',
      class: 'Support',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'go': {
      name: 'Go Gunhee',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604312/go_e5tq0a.png',
      icon: 'build_go.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense'
    },
    'goto': {
      name: 'Goto Ryuji',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604314/goto_pirfgy.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606299/icons/build-10.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'HP'
    },
    'han': {
      name: 'Han Se-Mi',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604315/han_pfyz7e.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606304/icons/build-12.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'HP'
    },
    'harper': {
      name: 'Harper',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604316/harper_fvn1d9.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606309/icons/build-14.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'HP'
    },
    'hwang': {
      name: 'Hwang Dongsoo',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604316/Hwang_wumgnp.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606311/icons/build-15.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Defense'
    },
    'isla': {
      name: 'Isla Wright',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604215/isla_w9mnlc.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606317/icons/build-17.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Defense'
    },
    'lee': {
      name: 'Lee Bora',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604324/lee_khjilr.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606327/icons/build-21.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack'
    },
    'lim': {
      name: 'Lim Tae-Gyu',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604325/lim_gahgsq.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606332/icons/build-23.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack'
    },
    'meilin': {
      name: 'Meilin Fisher',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604218/meilin_k17bnw.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606335/icons/build-24.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP'
    },
    'min': {
      name: 'Min Byung-Gu',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604326/min_tw1eio.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606337/icons/build-25.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'HP'
    },
    'seo': {
      name: 'Seo Jiwoo',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604210/seo_qsvfhj.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606349/icons/build-30.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP'
    },
    'seorin': {
      name: 'Seorin',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604210/seorin_t7irtj.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606352/icons/build-31.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP'
    },
    'shimizu': {
      name: 'Shimizu Akari',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604212/shimizu_a3devg.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606355/icons/build-32.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'HP'
    },
    'silverbaek': {
      name: 'Silver Mane Baek Yoonho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604211/silverbaek_kg7wuz.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606357/icons/build-33.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack'
    },
    'thomas': {
      name: 'Thomas Andre',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604216/thomas_jr9x92.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606363/icons/build-35.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense'
    },
    'woo': {
      name: 'Woo Jinchul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604217/woo_pfrpik.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606367/icons/build-36.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Defense'
    },
    'yoo': {
      name: 'Yoo Soohyun',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604218/yoo_mrwt08.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606370/icons/build-37.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'anna': {
      name: 'Anna Ruiz',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604212/anna_ygnv0l.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606280/icons/build-2.png',
      class: 'Ranger',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'Attack'
    },
    'han-song': {
      name: 'Han Song-Yi',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604213/han-song_xsfzja.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606306/icons/build-13.png',
      class: 'Assassin',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'Attack'
    },
    'hwang-dongsuk': {
      name: 'Hwang Dongsuk',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604317/hwang-dongsuk_g1humr.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606314/icons/build-16.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Dark',
      scaleStat: 'HP'
    },
    'jo': {
      name: 'Jo Kyuhwan',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747689385/jojo3_tjhgu8.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747649046/jojo_vmdzhg.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Attack'
    },
    'kang': {
      name: 'Kang Taeshik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604320/kang_y6r5f4.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606322/icons/build-19.png',
      class: 'Assassin',
      grade: 'SR',
      element: 'Dark',
      scaleStat: 'Attack'
    },
    'kim-chul': {
      name: 'Kim Chul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604322/kim-chul_z9jha4.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747646719/build__kim-chul_sptghm.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Defense'
    },
    'kim-sangshik': {
      name: 'Kim Sangshik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604321/kim-sangshik_rmknpe.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606325/icons/build-20.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Wind',
      scaleStat: 'Defense'
    },
    'lee-johee': {
      name: 'Lee Johee',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604323/lee-johee_ispe3p.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606330/icons/build-22.png',
      class: 'Healer',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'HP'
    },
    'nam': {
      name: 'Nam Chae-Young',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604328/nam_rb2ogg.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606342/icons/build-27.png',
      class: 'Ranger',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'HP'
    },
    'park-beom': {
      name: 'Park Beom-Shik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604328/park-beom_er1y0k.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606345/icons/build-28.png',
      class: 'Fighter',
      grade: 'SR',
      element: 'Wind',
      scaleStat: 'Defense'
    },
    'park-heejin': {
      name: 'Park Heejin',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604307/park-heejin_tsukcl.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606347/icons/build-29.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Wind',
      scaleStat: 'Attack'
    },
    'song': {
      name: 'Song Chiyul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604215/song_usr7ja.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606359/icons/build-34.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'yoo-jinho': {
      name: 'Yoo Jinho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604221/yoo-jinho_csl27q.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606372/icons/build-38.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Defense'
    }
  };

  export { data_chars };