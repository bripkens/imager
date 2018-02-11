export function getSrc(id) {
  return `/images/${id}`;
}

export function getSrcSet(id, resizedVersions) {
  const sourceImagePath = getSrc(id);
  return resizedVersions.map(({ width }) => `${sourceImagePath}/${width} ${width}w`).join(',\n');
}
