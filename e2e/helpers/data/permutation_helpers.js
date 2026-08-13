export const generateAllSubsets = (array, allowEmptySet) => {
  const subsets = []
  const subsetCount = 1 << array.length

  for (
    let subsetIndex = allowEmptySet ? 0 : 1;
    subsetIndex < subsetCount;
    ++subsetIndex
  ) {
    const current = []
    let liveElementBits = subsetIndex
    let readIndex = 0
    while (liveElementBits) {
      if ((liveElementBits & 1) === 1) {
        current.push(array[readIndex])
      }
      ++readIndex
      liveElementBits >>= 1
    }

    subsets.push(current)
  }

  return subsets
}
