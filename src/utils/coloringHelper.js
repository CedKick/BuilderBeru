export const getCustomSkin = (hunterKey, modelId = 'default') => {
  try {
    const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
    const coloring = userData.user?.accounts?.default?.colorings?.[hunterKey]?.[modelId];
    return coloring?.preview || null;
  } catch (e) {
    console.error('Erreur chargement skin:', e);
    return null;
  }
};

export const hunterNameToKey = {
    'Ilhwan': 'ilhwan',
        'Jinah': 'jinah',
        'yuqi': 'yuqi',
        'Soyeon': 'soyeon',
        'Minnie': 'minnie',
        'Miyeon': 'miyeon',
        'Shuhua': 'shuhua',
        'Lennart Niermann': 'niermann',
        'Cha Hae-In Valkyrie': 'chae',
        'Tawata Kanae': 'kanae',
        'Seorin': 'seorin',
        'Goto Ryuji': 'goto',
        'Shimizu Akari': 'shimizu',
        'Thomas André': 'thomas',
        'Isla Wright': 'isla',
        'Gina': 'gina',
        'Esil Radiru': 'esil'
    };

export const getAllAvailableSkins = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
    const colorings = userData.user?.accounts?.default?.colorings || {};
    
    const skins = [{ id: 'default', label: 'Default', hunter: null, preview: null }];
    
    Object.entries(colorings).forEach(([hunterKey, models]) => {
      Object.entries(models).forEach(([modelId, data]) => {
        if (data.preview) {
          skins.push({
            id: `${hunterKey}-${modelId}`,
            label: `🎨 ${data.hunter || hunterKey}`,
            hunter: hunterKey,
            modelId: modelId,
            preview: data.preview
          });
        }
      });
    });
    
    return skins;
  } catch (e) {
    return [{ id: 'default', label: 'Default', hunter: null, preview: null }];
  }
};