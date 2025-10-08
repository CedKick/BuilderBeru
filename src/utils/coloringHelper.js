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
  'Minnie': 'ilhwan',
  'Yuqi': 'Yuqi',
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