/*
Purpose: Tests overview Level A tasks are in the correct order.

Test flow:  This test does not perfectly recreate the issue (as the 'natural' order may reflect the correct order).
However the test with fix always passes so the test won't be an issue in itself. Over multiple runs it should test
the issue properly.


Date created: 20/04/22
*/

import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

const getLevelAOverviewTasks = index =>
  cy.get('[data-test=overview-phase-label]').eq(index)

describe('template_overview_task_order.cy', () => {
  let testUser,
    fixture,
    template,
    appPage,
    newTemplateName = 'Test Template'

  before(() => {
    createKnowledgeManagerUser('ZZZ')
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'Overview Spec with Multiple Tasks',
                tasks: [
                  { name: 'Task1' },
                  { name: 'Task2' },
                  { name: 'Task3' },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(testUser.username)
        createTemplate(newTemplateName, fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
          }
        )
      })
  })

  describe('when viewing the template overview', () => {
    before(() => {
      cy.login(testUser.username)
      appPage.visitTemplateOverview(template.id)
    })

    it('should display the level A tasks in the expected order', () => {
      getLevelAOverviewTasks(0).should('contain.text', 'Task1')
      getLevelAOverviewTasks(1).should('contain.text', 'Task2')
      getLevelAOverviewTasks(2).should('contain.text', 'Task3')
    })

    //   describe('when the tasks are rearranged', () => {
    //     before(() => {
    //       cy.login(testUser.username)
    //       appPage.visitTemplateTaskMap(template.id)

    // performTemplateDrag(2, generatePoint(70, 10))
    // cy.wait(1000)
    // performTemplateDrag(2, generatePoint(70, 10))
    // cy.wait(1000)
    // destinationHelper.openTemplateTaskCreateFlowFromFab()
    // cy.get('[data-test=text-prompt-text-field]').find('input').type('Order')
    // cy.get('[data-test=action-dialog-button]').click()
    //       destinationPage.get.parentTypeSelector().click()
    //       cy.wait(1000)
    //       destinationPage.get.parentTypeLevelA().click()
    //       cy.get('[data-test=action-dialog-button]').click()
    //       cy.wait(1000)

    //       cy.login(testUser.username)
    //       cy.reload()
    //       performTemplateDrag(3, generatePoint(70, 10))
    //     })

    //     describe('when viewing the template overview again', () => {
    //       before(() => {
    //         cy.login(testUser.username)
    //         appPage.visitTemplateOverview(template.id)
    //       })

    //         getLevelAOverviewTasks(0).should('contain.text', 'Task1')
    //         getLevelAOverviewTasks(1).should('contain.text', 'Task2')
    //         getLevelAOverviewTasks(2).should('contain.text', 'Task3')
    //         getLevelAOverviewTasks(3).should('contain.text', 'Order')
    //       })
    //     })
    //   })
  })
})
