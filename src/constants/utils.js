export const generateCode = () => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `AF-${digits}`;
};

export const isValidCode = code => {
  return /^AF-\d{4}$/.test(code);
};
