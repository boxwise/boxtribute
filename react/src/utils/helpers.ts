export const groupBy = <T, K extends keyof any>(
  list: T[],
  getKey: (item: T) => K
) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);

// TODO: make this environment sensitive (different url for staging/develop and production)
export const boxtributeQRCodeFormatter = (data: string) =>
  `https://staging.boxwise.co/mobile.php?barcode=${data}`;
