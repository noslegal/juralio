export default function getLocationParams(param) {
  return cy.location().then((loc) => {
    let url = loc.hash

    let urlObject = url.split('/')
    let paramIndex = urlObject.indexOf(param)

    if (paramIndex === -1) return undefined
    return parseInt(urlObject[paramIndex + 1], 10) || undefined
  })
}
