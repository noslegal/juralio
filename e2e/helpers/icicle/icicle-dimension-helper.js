const getLeftPos = element => element.getBoundingClientRect().left
const getRightPos = element =>
  element.getBoundingClientRect().left + element.getBoundingClientRect().width

export default function (viewportWidth) {
  return {
    isFullyVisibleInCentreOfViewport: element => {
      return (
        getLeftPos(element) > 0 &&
        Math.floor(getRightPos(element)) < viewportWidth + 1
      )
    },

    isPartiallyVisibleOnLeftOfViewport: element =>
      getLeftPos(element) < 0 &&
      getRightPos(element) > 0 &&
      getRightPos(element) < viewportWidth,

    isPartiallyVisibleOnRightOfViewport: element => {
      return (
        getLeftPos(element) > 0 &&
        getLeftPos(element) < viewportWidth &&
        getRightPos(element) > viewportWidth
      )
    },
  }
}
