import { setupOrganisationWithMatter } from '../../../../helpers/labels/setup-organisation-with-matter'
import { createTask } from '../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'

describe('task_labels_display.cy', () => {
  let fixture, appPage, orgAdminUser, task
  const visitHelpers = new VisitHelpers()
  before(() => {
    setupOrganisationWithMatter().then(result => {
      organisation = result.organisationLabels.body
      orgAdminUser = result.orgAdminUser
      orgMC = result.orgMC
      fixture = result.fixture
      appPage = result.appPage
    })
  })
  describe('when viewing a task', () => {
    before(() => {
      cy.login(orgAdminUser.username).then(() => {
        appPage.visitHome()
        createTask(
          fixture.matter.id,
          fixture.projects[0].id,
          'not-started'
        ).then(res => {
          task = res
          visitHelpers.visitTaskDetails(
            fixture.matter.id,
            fixture.projects[0].id,
            task.id
          )
        })
      })
    })
    it('should not render any labels', () => {
      cy.get('[data-test=label-chip-text]').should('not.exist')
      cy.get('[data-test=add-label-button]').should('exist')
    })
    describe('when trying to add a workflow label', () => {
      before(() => {
        cy.backendRoute('GET', `/matter/${fixture.matter.id}/labels**`).as(
          'fetchLabels'
        )

        cy.get('[data-test=add-label-button]').click()
        cy.wait('@fetchLabels')
        cy.get('[data-test=label-chip-text]')
          .contains('Awaiting review')
          .click()
      })
      it('should render the workflow label', () => {
        cy.get('[data-test=label-chip-text]').should('have.length', 1)
        cy.get('[data-test=label-chip-text]').should(
          'have.text',
          'Awaiting review'
        )
      })
    })
    describe('when trying to add a risk label', () => {
      before(() => {
        cy.backendRoute('GET', `/matter/${fixture.matter.id}/labels**`).as(
          'fetchLabels'
        )

        cy.get('[data-test=add-label-button]').click()
        cy.wait('@fetchLabels')
        cy.wait(1000)
        cy.get('[data-test=label-chip-text]', { timeout: 30000 })
          .contains('Clarity')
          .click()
      })
      it('should open the colour dropdown', () => {
        cy.get('[data-test=modifier-options]').should('be.visible')
        cy.get('[data-test=modifier-option-red]').should('be.visible')
        cy.get('[data-test=modifier-option-amber]').should('be.visible')
        cy.get('[data-test=modifier-option-green]').should('be.visible')
      })
      describe('when clicking a modifier option', () => {
        before(() => {
          cy.get('[data-test=modifier-option-red]').click()
        })
        it('should close the add list', () => {
          cy.get('[data-test=modifier-options]').should('not.exist')
        })
        it('should add the risk label', () => {
          cy.get('[data-test=label-chip-text]').should('have.length', 2)
          cy.get('[data-test=label-chip-text]')
            .eq(1)
            .should('have.text', 'Clarity')
          cy.get('[data-test=label-chip]')
            .eq(1)
            .should('have.css', 'color')
            .and('eq', 'rgb(227, 27, 12)')
        })
      })
    })
    describe('when trying to add a user_defined label', () => {
      before(() => {
        cy.backendRoute('GET', `/matter/${fixture.matter.id}/labels**`).as(
          'fetchLabels'
        )

        cy.get('[data-test=add-label-button]').click()
        cy.wait('@fetchLabels')
        cy.get('[data-test=label-search-field]').find('input').type('newLabel')
      })
      it('should show me the add label option', () => {
        cy.get('[data-test=add-user-defined-label-button]').should('be.visible')
        cy.get('[data-test=add-user-defined-label-button]').should(
          'have.text',
          'Add "#newLabel" hashtag'
        )
      })
      describe('when adding a new hashtag', () => {
        before(() => {
          cy.get('[data-test=add-user-defined-label-button]').click()
        })
        it('should add the user defined label', () => {
          cy.get('[data-test=label-chip-text]').should('have.length', 3)
          cy.get('[data-test=label-chip-text]')
            .eq(2)
            .should('have.text', '#newLabel')
        })
      })
    })
    describe('when trying to remove a risk label', () => {
      before(() => {
        cy.get('[data-test=risk-modifier-button]').eq(0).click()
      })
      it('should render 3 options', () => {
        cy.get('[data-test=modifier-options]').should('be.visible')
        cy.get('[data-test=modifier-option-red]').should('not.exist')
        cy.get('[data-test=modifier-option-amber]').should('be.visible')
        cy.get('[data-test=modifier-option-green]').should('be.visible')
        cy.get('[data-test=modifier-option-remove]').should('be.visible')
      })
      describe('when clicking the remove option', () => {
        before(() => {
          cy.get('[data-test=modifier-option-remove]').click()
          cy.wait(5000)
        })
        it('should remove the risk label', () => {
          cy.get('[data-test=label-chip-text]').should('have.length', 2)
        })
      })
    })
    describe('when trying to remove a workflow label', () => {
      before(() => {
        cy.get('[data-test=label-remove-button]').eq(0).click()
      })
      it('should remove the workflow label', () => {
        cy.get('[data-test=label-chip-text]').should('have.length', 1)
        cy.get('[data-test=label-chip-text]')
          .eq(0)
          .should('have.text', '#newLabel')
      })
    })
    describe('when trying to remove a user_defined label', () => {
      before(() => {
        cy.get('[data-test=label-remove-button]').eq(0).click()
      })
      it('should remove the workflow label', () => {
        cy.get('[data-test=label-chip-text]').should('have.length', 0)
      })
    })

    describe('when trying to update a risk label', () => {
      before(() => {
        cy.backendRoute('GET', `/matter/${fixture.matter.id}/labels**`).as(
          'fetchLabels'
        )

        cy.get('[data-test=add-label-button]').click()
        cy.wait('@fetchLabels')
        cy.get('[data-test=label-chip-text]').contains('Clarity').click()
        cy.get('[data-test=modifier-option-red]').click()
        cy.get('[data-test=risk-modifier-button]').eq(0).click()
        cy.get('[data-test=modifier-option-green]').click()
      })
      it('should update the risk to be green', () => {
        cy.get('[data-test=label-chip-text]').should('have.length', 1)
        cy.get('[data-test=label-chip-text]')
          .eq(0)
          .should('have.text', 'Clarity')
        cy.get('[data-test=label-chip]')
          .eq(0)
          .should('have.css', 'color')
          .and('eq', 'rgb(12, 150, 9)')
      })
    })
    //task preview
    describe('when viewing the task preview', () => {
      before(() => {
        cy.login(orgAdminUser.username)
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        cy.get('body').type('{esc}')
        cy.get('[data-test=ftueSkipButton]').click()
        cy.wait(5000)
        cy.get('[data-test=task-cell-test]', { timeout: 30000 })
          .eq(0)
          .trigger('mouseover')
        cy.get('[data-test=task-preview-opener]').eq(0).click()
      })
      it('should show the existing labels', () => {
        cy.get('[data-test=label-chip-text]').should('have.length', 1)
        cy.get('[data-test=label-chip-text]')
          .eq(0)
          .should('have.text', 'Clarity')
        cy.get('[data-test=label-chip]')
          .eq(0)
          .should('have.css', 'color')
          .and('eq', 'rgb(12, 150, 9)')
      })
      describe('when adding a label', () => {
        before(() => {
          cy.backendRoute('GET', `/matter/${fixture.matter.id}/labels**`).as(
            'fetchLabels'
          )

          cy.get('[data-test=add-label-button]').click()
          cy.wait('@fetchLabels')
          cy.wait(1000)
          cy.get('[data-test=label-chip-text]').contains('Cost').click()
          cy.get('[data-test=modifier-option-red]').click()
        })
        it('should show the update', () => {
          cy.get('[data-test=label-chip-text]').should('have.length', 2)
          cy.get('[data-test=label-chip-text]')
            .eq(1)
            .should('have.text', 'Clarity')
          cy.get('[data-test=label-chip]')
            .eq(1)
            .should('have.css', 'color')
            .and('eq', 'rgb(12, 150, 9)')

          cy.get('[data-test=label-chip-text]')
            .eq(0)
            .should('have.text', 'Cost')
          cy.get('[data-test=label-chip]')
            .eq(0)
            .should('have.css', 'color')
            .and('eq', 'rgb(227, 27, 12)')
        })
      })
      describe('when updating a label', () => {
        before(() => {
          cy.get('.css-qqncu6-mask')
          cy.get('[data-test=risk-modifier-button]').eq(1).click()
          cy.get('[data-test=modifier-option-amber]').click()
        })
        it('should update the risk to be amber', () => {
          cy.get('[data-test=label-chip-text]').should('have.length', 2)
          cy.get('[data-test=label-chip-text]')
            .eq(1)
            .should('have.text', 'Clarity')
          cy.get('[data-test=label-chip]')
            .eq(1)
            .should('have.css', 'color')
            .and('eq', 'rgb(223, 156, 55)')
        })
      })
      describe('the task chip should show a risk colour', () => {
        before(() => {
          cy.login(orgAdminUser.username)
          visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        })

        it('should show the riskiest value', () => {
          cy.get('[data-test=riskiest-label-red]').should('exist')
        })
      })
      describe('when removing a label', () => {
        before(() => {
          cy.login(orgAdminUser.username)
          visitHelpers.visitTaskDetails(
            fixture.matter.id,
            fixture.projects[0].id,
            task.id
          )
          cy.get('[data-test=risk-modifier-button]').eq(0).click()
          cy.get('[data-test=modifier-option-remove]').click()
        })
        it('should remove the label', () => {
          cy.get('[data-test=label-chip-text]').should('have.length', 1)
        })
      })
      describe('when trying to add an inactive label', () => {
        let label
        before(() => {
          cy.login(orgAdminUser.username)
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
            method: 'POST',
            body: {
              name: 'inactive label',
              type: 'workflow',
            },
          }).then(response => {
            label = response.body
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/organisation/labels/${
                label.id
              }`,
              method: 'PATCH',
              body: { inactive: true },
            }).then(() => {
              visitHelpers.visitTaskDetails(
                fixture.matter.id,
                fixture.projects[0].id,
                task.id
              )
              cy.backendRoute(
                'GET',
                `/matter/${fixture.matter.id}/labels**`
              ).as('fetchLabels')

              cy.get('[data-test=add-label-button]').click()
              cy.wait('@fetchLabels')
              cy.wait(1000)
            })
          })
        })
        it('should not be available in the list', () => {
          cy.get('[data-test=label-chip-text]')
            .contains('inactive label')
            .should('not.exist')
        })
      })
    })
  })
})
