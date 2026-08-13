// import faker from 'faker'
// import { enableSSO } from '../../../../../helpers/admin/admin_api_helpers'
// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
// import {
//   createOrganisation,
//   sysadminAddUserToOrganisation,
// } from '../../../../../helpers/organisation/organisation_api_helper'
// import { getUserRowByUsername } from '../../../../../helpers/users/user-table-helper'
// import {
//   createMicrosoftUser,
//   createUser,
//   updateFTUE,
// } from '../../../../../helpers/users/user_api_helper'

// const visitHelpers = new VisitHelpers()

// describe('oa_organisation_edit_user_email.cy', () => {
//   let organisation, standardUser, orgAdmin, msuser
//   let newEmail = faker.internet.email().toLowerCase()

//   const visitOrgUsers = orgAdmin => {
//     cy.login(orgAdmin.username)
//     updateFTUE(orgAdmin, { hasSeenOrgAdmin: true })
//     cy.login(orgAdmin.username)
//     visitHelpers.visitOrgUsers()
//   }

//   before(() => {
//     const createStandardUser = () =>
//       createUser(undefined, true, false).then(user => (standardUser = user))
//     const createOrgAdmin = () =>
//       createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
//         user => (orgAdmin = user)
//       )
//     const createMicrosoftUserr = () =>
//       createMicrosoftUser(faker.internet.email().toLowerCase()).then(res => {
//         msuser = res
//       })
//     const associateStandardUserWithOrg = () =>
//       sysadminAddUserToOrganisation(organisation, standardUser)
//     const associateMicrosoftUserWithOrg = () =>
//       sysadminAddUserToOrganisation(organisation, msuser)
//     const associateOrgAdminWithOrg = () =>
//       sysadminAddUserToOrganisation(organisation, orgAdmin)

//     createOrganisation('test', false)
//       .then(_organisation => {
//         organisation = _organisation.body
//       })
//       .then(createStandardUser)
//       .then(createOrgAdmin)
//       .then(associateStandardUserWithOrg)
//       .then(associateOrgAdminWithOrg)
//       .then(enableSSO)
//       .then(createMicrosoftUserr)
//       .then(associateMicrosoftUserWithOrg)
//   })

//   describe("when trying to change a user's email with an existing one", () => {
//     before(() => {
//       visitOrgUsers(orgAdmin)
//       getUserRowByUsername(standardUser.username).click(0, 0)
//       cy.get('[data-test=email-field]').type(
//         `{selectall}{backspace}${orgAdmin.username}`
//       )
//       cy.get('[data-test=action-dialog-button]').click()
//     })
//     it('should show an error message', () => {
//       cy.get('[data-test=snackbar-message]', { timeout: 10000 })
//         .should('be.visible')
//         .should('contain', 'A user with this email address already exists.')
//     })
//   })

//   describe("when trying to change a user's email with a new one", () => {
//     before(() => {
//       visitOrgUsers(orgAdmin)
//       getUserRowByUsername(standardUser.username).click(0, 0)
//       cy.get('[data-test=email-field]').type(
//         `{selectall}{backspace}${newEmail}`
//       )
//       cy.get('[data-test=action-dialog-button]').click()
//     })
//     it('should show a success message', () => {
//       cy.get('[data-test=snackbar-message]', { timeout: 10000 })
//         .should('be.visible')
//         .should('contain', 'Account details updated successfully!')
//     })
//   })

//   describe('when selecting the updated user', () => {
//     before(() => {
//       visitOrgUsers(orgAdmin)
//       getUserRowByUsername(newEmail).click(0, 0)
//     })
//     it('should show their new email', () => {
//       cy.get('[data-test=email-field]')
//         .find('input')
//         .should('have.value', newEmail)
//     })
//   })

//   describe('when trying to update own email', () => {
//     before(() => {
//       visitOrgUsers(orgAdmin)
//       getUserRowByUsername(orgAdmin.username).click(0, 0)
//     })
//     it('should have a disabled email field', () => {
//       cy.get('[data-test=email-field]').find('input').should('be.disabled')
//     })
//   })

//   describe('when trying to update SSO user email', () => {
//     before(() => {
//       visitOrgUsers(orgAdmin)
//       getUserRowByUsername(msuser.username).click(0, 0)
//     })
//     it('should have a disabled email field', () => {
//       cy.get('[data-test=email-field]').find('input').should('be.disabled')
//     })
//   })
// })
