import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('task_card_subtask_localization.cy', () => {
  let user, fixtureSingular, fixturePlural

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const taskWithSingleChildOfEachType = [
        {
          name: 'Parent',
          properties: {
            status: 'in-progress',
          },
          tasks: [
            {
              name: 'Not Started Child',
              properties: {
                status: 'not-started',
              },
            },
            {
              name: 'In Progress Child',
              properties: {
                status: 'in-progress',
              },
            },
            {
              name: 'Done Child',
              properties: {
                status: 'done',
              },
            },
          ],
        },
      ]

      const seedWithSingleChildOfEachType = {
        matter: {
          prefix: 'taskCardTest1',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project 1',
              tasks: taskWithSingleChildOfEachType,
            },
          ],
        },
      }

      fixtureSingular = generateFixture(seedWithSingleChildOfEachType)

      // const taskWithMultipleChildrenOfEachType = [
      //   {
      //     name: 'Parent',
      //     properties: {
      //       status: 'in-progress',
      //     },
      //     tasks: [
      //       {
      //         name: 'Not Started Child A',
      //         properties: {
      //           status: 'not-started',
      //         },
      //       },
      //       {
      //         name: 'Not Started Child B',
      //         properties: {
      //           status: 'not-started',
      //         },
      //       },
      //       {
      //         name: 'In Progress Child A',
      //         properties: {
      //           status: 'in-progress',
      //         },
      //       },
      //       {
      //         name: 'In Progress Child B',
      //         properties: {
      //           status: 'in-progress',
      //         },
      //       },
      //       {
      //         name: 'Done Child A',
      //         properties: {
      //           status: 'done',
      //         },
      //       },
      //       {
      //         name: 'Done Child B',
      //         properties: {
      //           status: 'done',
      //         },
      //       },
      //     ],
      //   },
      // ]

      // const seedWithMultipleChildrenOfEachType = {
      //   matter: {
      //     prefix: 'taskCardTest2',
      //     teamMembers: [user],
      //     matterAdmins: [user],
      //     projects: [
      //       {
      //         name: 'Test Project 2',
      //         tasks: taskWithMultipleChildrenOfEachType,
      //       },
      //     ],
      //   },
      // }

      // fixturePlural = generateFixture(seedWithMultipleChildrenOfEachType)
    })
  })

  describe('when opening a task with a single child of each status', () => {
    describe('When opening a task in English', () => {
      before(() => {
        cy.reload()
        //cy.frontendRoute('/locales/en.json').as('enlocalisation')
        cy.login(user.username)
        cy.visit(
          `/#/matter/${fixtureSingular.matter.id}/workstream/${fixtureSingular.projects[0].id}/task/${fixtureSingular.tasks[0].id}`
        )
        //cy.wait('@enlocalisation', { timeout: 9999 })
        cy.wait(2000)
      })

      it('should display the correct subtask headers', () => {
        cy.get('[data-test=status-header]')
          .eq(0)
          .should('have.text', 'Completed')
        cy.get('[data-test=status-header]')
          .eq(1)
          .should('have.text', 'In progress')
        cy.get('[data-test=status-header]')
          .eq(2)
          .should('have.text', 'Not started')
      })
    })

    // describe('When opening a task in French', () => {
    //   before(() => {
    //     cy.login(user.username)
    //     // cy.frontendRoute('/locales/fr.json').as('fr')
    //     cy.visit(
    //       `/#/matter/${fixtureSingular.matter.id}/workstream/${fixtureSingular.projects[0].id}/task/${fixtureSingular.tasks[0].id}?lng=fr`
    //     )
    //     //  cy.wait('@fr')
    //     cy.wait(2000)
    //     cy.get('[data-test=post-people-people-manager]').click()
    //   })

    //   it('should display the correct subtask headers', () => {
    //     cy.get('[data-test=status-header]').eq(0).should('have.text', 'Finie')
    //     cy.get('[data-test=status-header]')
    //       .eq(1)
    //       .should('have.text', 'En cours')
    //     cy.get('[data-test=status-header]')
    //       .eq(2)
    //       .should('have.text', 'Pas encore commencée')
    //   })
    // })
  })
})
