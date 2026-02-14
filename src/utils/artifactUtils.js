import setsBySlot from "../data/setsBySlot.json";

export const getSetIcon = (setName, slotName) => {

  
  const sets = setsBySlot[slotName];
 
  
  if (!sets) {
    console.warn("❌ Aucun set trouvé pour slot :", slotName);
    return null;
  }
  
  const found = sets.find((s) => {

    return s.name === setName;
  });
  

  
  const result = found?.icon || null;

  
  return result;
};
