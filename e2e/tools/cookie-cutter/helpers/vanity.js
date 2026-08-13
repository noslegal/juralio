export const getArt = () => `
----  .__o
----- _-\_<,
---  (*)/'(*)`

export const getHeader = text => {
  const HEADING_CHAR = '='
  const PADDING = Array(16).join(HEADING_CHAR)

  const HEADING = Array(text.length + 3).join(HEADING_CHAR)

  return `
${PADDING}${HEADING}${PADDING}
${PADDING} ${text} ${PADDING}
${PADDING}${HEADING}${PADDING}`
}
