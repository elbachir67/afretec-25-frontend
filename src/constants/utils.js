// src/constants/utils.js

/**
 * Générer un code unique AF-XXXX
 */
export const generateCode = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AF-${num}`;
};

/**
 * Valider le format du code
 */
export const isValidCode = code => {
  const regex = /^AF-\d{4}$/;
  return regex.test(code);
};
