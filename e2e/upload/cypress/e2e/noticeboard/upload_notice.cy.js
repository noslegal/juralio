// import { visitNoticeboard } from '../../../../helpers/admin/admin_visit_helpers'
// import 'cypress-file-upload'

// const image = 'image.svg'
// const TEXT_256_CHARS = Array(257).join('a')

// const timestamp = new Date().toISOString()
// const title = timestamp + ' title'
// const subtitle = timestamp + ' subtitle'

// describe('upload_notice.cy', () => {
//   describe('when navigating to the noticeboard page', () => {
//     before(() => {
//       cy.login('sysadmin@juralio.com', 'Password1Password1$')
//       visitNoticeboard()
//     })

//     it('should display a header', () => {
//       cy.get('[data-test=noticeboard-header]').should('exist')
//     })

//     it('should display info helper text', () => {
//       cy.get('[data-test=noticeboard-header]').should('exist')
//     })

//     it('should display a image previewer area in the zero state', () => {
//       cy.get('[data-test=preview-image-zero-state]').should('exist')
//     })

//     it('should display an upload image button', () => {
//       cy.get('[data-test=upload-image-button]').should('exist')
//     })

//     it('should display title text field', () => {
//       cy.get('[data-test=title-text-field]').should('exist')
//     })

//     it('should display title subtext field', () => {
//       cy.get('[data-test=subtitle-text-field]').should('exist')
//     })

//     it('should display an add button', () => {
//       cy.get('[data-test=add-notice-button]').should('exist')
//     })

//     describe('when uploading a notice', () => {
//       before(() => {
//         cy.get('[data-test=noticeboard-upload]').attachFile(image)
//       })

//       it('should display the image in the image previewer', () => {
//         cy.get('[data-test=preview-image]').should('exist')
//       })

//       it('should not display the image previewer area in the zero state', () => {
//         cy.get('[data-test=preview-image-zero-state]').should('not.exist')
//       })

//       describe('when inputing the notice title', () => {
//         describe('when the title is over the limit', () => {
//           before(() => {
//             cy.get('[data-test=title-text-field]').type(TEXT_256_CHARS, {
//               delay: 0,
//             })
//           })

//           it('should display an error message', () => {
//             cy.get('[data-test=noticeboard-upload-error-text]').should(
//               'have.text',
//               'The title and secondary text have a limit of 255 characters'
//             )
//           })

//           it('should disable the Add button', () => {
//             cy.get('[data-test=add-notice-button]').should('be.disabled')
//           })
//         })

//         describe('when the title is under the limit', () => {
//           before(() => {
//             cy.get('[data-test=title-text-field]').type('{backspace}', {
//               delay: 0,
//             })
//           })

//           it('should NOT display an error message', () => {
//             cy.get('[data-test=noticeboard-upload-error-text]').should(
//               'not.exist'
//             )
//           })
//         })
//       })

//       describe('when inputing the notice subtitle', () => {
//         describe('when the subtitle is over the limit', () => {
//           before(() => {
//             cy.get('[data-test=subtitle-text-field]').type(TEXT_256_CHARS, {
//               delay: 0,
//             })
//           })

//           it('should display an error message', () => {
//             cy.get('[data-test=noticeboard-upload-error-text]').should(
//               'have.text',
//               'The title and secondary text have a limit of 255 characters'
//             )
//           })

//           it('should disable the Add button', () => {
//             cy.get('[data-test=add-notice-button]').should('be.disabled')
//           })
//         })

//         describe('when the subtitle is under the limit', () => {
//           before(() => {
//             cy.get('[data-test=subtitle-text-field]').type('{backspace}', {
//               delay: 0,
//             })
//           })

//           it('should NOT display an error message', () => {
//             cy.get('[data-test=noticeboard-upload-error-text]').should(
//               'not.exist'
//             )
//           })
//         })
//       })

//       describe('when all inputs are filled in', () => {
//         before(() => {
//           cy.get('[data-test=title-text-field] input').clear().type(title)
//           cy.get('[data-test=subtitle-text-field] input').clear().type(subtitle)
//         })
//         it('should enable the Add button', () => {
//           cy.get('[data-test=add-notice-button]').should('be.enabled')
//         })

//         describe('when the add button is clicked', () => {
//           before(() => {
//             cy.backendRoute('POST', '/noticeboard/notice').as('addNotice')
//             cy.get('[data-test=add-notice-button]').click()
//             cy.wait('@addNotice')
//             cy.wait(2000) // Wait for added notice to load on screen
//           })

//           it('should display the added slides title', () => {
//             cy.get('[data-test=slide-title]').first().should('have.text', title)
//           })

//           it('should display the added slides subtitle', () => {
//             cy.get('[data-test=slide-subtitle]')
//               .first()
//               .should('have.text', subtitle)
//           })
//         })
//       })
//     })
//   })
// })
