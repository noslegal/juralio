import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { createTemplateFromProject } from '../../../../helpers/templates/template_helper.js'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('templates_gallery_ftue.cy', () => {
  let user, fixture, appPage
  before(() => {
    createUser('', true, true, {}, true, false, false, true).then(
      createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'templates',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'P1',
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      }
    )
  })

  describe('when templates is visited', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplates()
    })

    it('should display the templates FTUE', () => {
      cy.get('[data-test=template-ftue]', { timeout: 5000 }).should(
        'be.visible'
      )
    })

    describe('on clicking the finish later button', () => {
      before(() => {
        cy.login(user.username)
        cy.get('body').type('{esc}')
        cy.get('[data-test=ftueFinishButton]').click()
      })

      it('should no longer display the templates FTUE', () => {
        cy.get('[data-test=template-ftue]').should('not.exist')
      })

      describe('when visiting template overview', () => {
        before(() => {
          cy.login(user.username)
          cy.get('body').type('{esc}')
          createTemplateFromProject('T1', 'templates', 'P1')

          cy.get('[data-test=overview-button]', { timeout: 5000 }).click({
            force: true,
          })
        })

        it('should also not display the templates FTUE', () => {
          cy.get('[data-test=template-ftue]').should('not.exist')
        })
      })

      describe('when going back to templates page', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitTemplates()
        })

        it('should display the templates FTUE', () => {
          cy.get('[data-test=template-ftue]').should('exist')
        })
      })
    })

    describe('on clicking the skip button', () => {
      before(() => {
        cy.login(user.username)
        cy.get('body').type('{esc}')
        cy.get('[data-test=ftueSkipButton]').click()
      })

      it('should no longer display the templates FTUE', () => {
        cy.get('[data-test=template-ftue]').should('not.exist')
      })

      describe('reloading the page', () => {
        before(() => {
          cy.login(user.username)
          cy.reload()
        })

        it('should not display the templates FTUE', () => {
          cy.get('[data-test=template-ftue]').should('not.exist')
        })
      })
    })
  })
})
