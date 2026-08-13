// import createNotice from '../../../../helpers/noticeboard/notice_api_helper'
// import { visitNoticeboard } from '../../../../helpers/admin/admin_visit_helpers'
// import 'cypress-file-upload'

// const timestamp = new Date().toISOString()
// const title = timestamp + ' title'
// const subtitle = timestamp + ' subtitle'

// describe('delete_notice.cy', () => {
//   before(() => {
//     createNotice(title, subtitle)
//     cy.login('sysadmin@juralio.com', 'Password1Password1$')
//     visitNoticeboard()
//     cy.wait(3000)
//   })

//   it('should display the added slides title', () => {
//     cy.get('[data-test=slide-title]').first().should('have.text', title)
//   })

//   it('should display the added slides subtitle', () => {
//     cy.get('[data-test=slide-subtitle]').first().should('have.text', subtitle)
//   })

//   describe('when click delete icon on a notice slide', () => {
//     before(() => {
//       cy.backendRoute('DELETE', 'noticeboard/notice/*').as('deleteNotice')
//       cy.get('[data-test=slide-icon-button]').first().click()
//       cy.wait('@deleteNotice')
//       cy.wait(2000)
//     })

//     it('should no longer display the added slides title', () => {
//       cy.get('[data-test=slide-title]').should('not.have.text', title)
//     })

//     it('should no longer display the added slides subtitle', () => {
//       cy.get('[data-test=slide-subtitle]').should('not.have.text', subtitle)
//     })
//   })
// })
