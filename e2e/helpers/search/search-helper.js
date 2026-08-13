export function checkSearchResultDetails(
  index,
  name,
  description,
  location,
  subtitle
) {
  // describe(`Result ${index} is displayed.`, () => {
  it('should render a name', () => {
    cy.get('[data-test=search-result-title]').eq(index).should('be.visible')
  })

  it('should have the name', () => {
    cy.get('[data-test=search-result-title]')
      .eq(index)
      .should('have.text', name)
  })

  if (location) {
    it('should render a location', () => {
      cy.get('[data-test=search-result-location]').should('exist')
    })
    it('should render a level text', () => {
      cy.get('[data-test=search-result-location]')
        .eq(index)
        .should('contain.text', location)
    })
  }

  if (subtitle) {
    it('should render a subtitle', () => {
      cy.get('[data-test=search-result-subtitle]').should('exist')
    })
    it('should render a level text', () => {
      cy.get('[data-test=search-result-subtitle]')
        .eq(index)
        .should('contain.text', subtitle)
    })
  }

  if (description) {
    it('should render a description', () => {
      cy.get('[data-test=search-result-description]')
        .eq(index)
        .should('be.visible')
    })

    it('should render description text', () => {
      cy.get('[data-test=search-result-description]')
        .eq(index)
        .should('contain.text', description)
    })
  }
  // })
}
