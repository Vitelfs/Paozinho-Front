export const calculateMargemLucro = (
  precoCusto: number,
  precoVenda: number
) => {
  return ((Number(precoVenda) - Number(precoCusto)) / Number(precoVenda)) * 100;
};

export const calculateMarkup = (precoCusto: number, precoVenda: number) => {
  return ((Number(precoVenda) - Number(precoCusto)) / Number(precoCusto)) * 100;
};

export const phoneFormat = (phone: string) => {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};
