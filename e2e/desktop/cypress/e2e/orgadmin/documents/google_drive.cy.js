// import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
// import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
// import {
//   createUser,
//   updateFTUE,
// } from '../../../../../helpers/users/user_api_helper'
// import documentsPage from '../../../../../page/organisation/organisation_documents_page'

// const visitHelpers = new VisitHelpers()

// describe('google_drive.cy', () => {
//   let organisation, orgadmin
//   before(() => {
//     setupOrganisationWithMatter().then(result => {
//       organisation = result.organisationLabels.body
//       orgAdminUser = result.orgAdminUser
//       orgMC = result.orgMC
//       fixture = result.fixture
//       appPage = result.appPage
//       createUser('', true, false, {
//         roles: ['ROLE_MATTER_CREATOR', 'ROLE_ORG_ADMIN'],
//       }).then(user => {
//         orgadmin = user
//         cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
//           sysadminAddUserToOrganisation(organisation, orgadmin)
//         })
//       })
//     })
//   })

//   describe('When adding a document link', () => {
//     before(() => {
//       cy.login(orgadmin)
//       visitHelpers.visitHome()
//       cy.wait(1000)
//       cy.get('body').type('{esc}')
//       cy.get('[data-test=ftueSkipButton]').click()

//       cy.get('[data-test="fab-button"]').click()
//       cy.get('[data-test="create-post-fab-button"]').click()
//       cy.get('[data-test="document-link"]').click()
//     })

//     it('the "Add from Google Drive" button should be disabled in post dialog by default', () => {
//       cy.get('[data-test="add-from-drive-button"]').should('not.exist')
//     })
//   })

//   describe('when visiting the Documents tab', () => {
//     before(() => {
//       cy.login(orgadmin)
//       updateFTUE(orgadmin, { hasSeenOrgAdmin: true })
//       cy.login(orgadmin)
//       visitHelpers.visitOrgDocuments()
//       cy.wait(1000)
//     })

//     it('should display the page correctly', () => {
//       cy.get('[data-test=panel-title]').should('have.text', 'Documents')
//       documentsPage.get
//         .switchLabel()
//         .should('have.text', 'Google Drive browsing')
//       documentsPage.get.switch().should('be.visible')
//       documentsPage.get.switchStatus().should('have.text', 'Disabled')
//       documentsPage.get
//         .switchHelperText()
//         .should(
//           'have.text',
//           'Enable people logged into Google Workspace to browse their Google Drive and select files from it when creating a Juralio post linking to that file'
//         )
//     })

//     describe('when clicking on the toggle', () => {
//       before(() => {
//         documentsPage.get.switch().click()
//       })

//       it('should allow the user to enable Google Drive browsing', () => {
//         documentsPage.get.switchStatus().should('have.text', 'Enabled')
//       })
//     })
//   })

//   describe('when creating a document/web link after enabling Google Drive browsing', () => {
//     before(() => {
//       cy.login(orgadmin)
//       visitHelpers.visitHome()
//       cy.wait(1000)

//       cy.get('[data-test="fab-button"]').click()
//       cy.get('[data-test="create-post-fab-button"]').click()
//       cy.get('[data-test="document-link"]').click()

//       cy.get('.reactour__close').click()
//     })

//     it('the "Add from Google Drive" button should be enabled in post dialogs', () => {
//       cy.get('[data-test="add-from-drive-button"]').should('be.visible')
//     })
//   })
// })
