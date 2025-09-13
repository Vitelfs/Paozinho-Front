export const calculateMargemLucro = (
  precoCusto: number,
  precoVenda: number
) => {
  return ((precoVenda - precoCusto) / precoVenda) * 100;
};

export const calculateMarkup = (precoCusto: number, precoVenda: number) => {
  return ((precoVenda - precoCusto) / precoCusto) * 100;
};
