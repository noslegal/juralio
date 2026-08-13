/* eslint-disable import/prefer-default-export */
import organisationUsersPage from '../../page/organisation/organisation_users_page'

export function enterUserDetails(
  makeOrgAdmin,
  makeMatterCreator,
  doCreate,
  firstname,
  lastname,
  username
) {
  cy.get('[data-test=first-name] input')
    .clear()
    .type(firstname || 'Juralio')
  cy.get('[data-test=last-name] input')
    .clear()
    .type(lastname || 'User')
  cy.get('[data-test=email] input')
    .clear()
    .type(username || `myTotallyUniqueUser${new Date().getTime()}@juralio.com`)

  if (makeOrgAdmin) organisationUsersPage.get.orgAdminCheckbox().click()

  if (makeMatterCreator) {
    organisationUsersPage.get.matterCreatorCheckbox().click()
  }

  if (doCreate) {
    cy.backendRoute('POST', '/users').as('postUser')
    cy.get('[data-test=create-new-user-button]').click()
    cy.wait('@postUser')
  }
}
