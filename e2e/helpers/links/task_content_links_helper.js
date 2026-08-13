import taskdetail_page from '../../page/taskdetail/taskdetail_page'

export function checkLinkUrl(url) {
  it(`should point to the correct url ${url}`, () => {
    taskdetail_page.noteDetails.get.url.link().should('have.attr', 'href', url)
  })
}

export function getLinkInputField() {
  return cy.get('[data-test=link-url]').find('input').not('[readonly]')
}

export function enterLinkUrl(url) {
  return getLinkInputField().type(url, { delay: 100 })
}

export function populateLinkDetails(name, url) {
  cy.get('[data-test=text-prompt-text-field]')
    .find('input')
    .type(name, { delay: 50 })
  enterLinkUrl(url)
}
