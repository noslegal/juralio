describe('sysadmin_home.cy', () => {
  const navigateToHome = () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    cy.visit('/#/')
  }

  before(navigateToHome)

  it('should display the accounts option', () => {
    cy.get('[data-test=accounts]').should('be.visible')
  })

  it('should show the correct accounts title and description', () => {
    cy.get('[data-test=accounts]').should('contain.text', 'Accounts')
    cy.get('[data-test=accounts]').should(
      'contain.text',
      'Manage a global list of accounts across all organisations'
    )
  })

  it('should show the accounts list when the accounts option is clicked', () => {
    cy.get('[data-test=accounts]').click()
    cy.get('[data-test=table-title]').should(
      'have.text',
      'All accounts across all organisations'
    )
    cy.get('[data-test=user-name-header]').should('be.visible')
  })

  it('should display organisations option', () => {
    cy.get('[data-test=organisations]').should('be.visible')
  })

  it('should show the correct organisatinos title and description', () => {
    cy.get('[data-test=organisations]').should('contain.text', 'Organisations')
    cy.get('[data-test=organisations]').should(
      'contain.text',
      'Create and (de)activate organisations and their accounts'
    )
  })

  it('should show the organisations list when the organisations option is clicked', () => {
    cy.get('[data-test=organisations]').click()
    cy.get('[data-test=organisations-table-list]').should('be.visible')
  })

  describe('when navigating to an organisation', () => {
    before(() => {
      cy.get('[data-test=organisation-list-item]').eq(0).click()
    })

    it('should show the organisation details', () => {
      cy.get('[data-test=organisation-detail]', { timeout: 30000 }).should(
        'be.visible'
      )
    })
  })
})
