import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import {
    assertPathItemContents, getTaskPathItems
} from '../../../../../helpers/tasks/task_path_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('task_card_task_path.cy', () => {
  let fixture, user, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'A1',
                  tasks: [
                    {
                      name: 'B1',
                      tasks: [
                        {
                          name: 'C1',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when on a level A task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('A1')
    })

    it('a no task path items should be displayed', () => {
      getTaskPathItems().should('have.length', 0)
    })

    describe('when at B level', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('B1')
      })

      it('1 task path item should be displayed', () => {
        getTaskPathItems().should('have.length', 1)
      })

      it('should display the expected level and reference number', () => {
        assertPathItemContents(0, 'A')
      })
    })

    describe('when at C level', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('C1')
      })

      it('2 task path items should be displayed', () => {
        getTaskPathItems().should('have.length', 2)
      })

      it('should display the expected level and reference number', () => {
        assertPathItemContents(0, 'A')
        assertPathItemContents(1, 'B')
      })
    })
  })

  describe('when clicking the J number link of a path item', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('C1')

      getTaskPathItems().eq(1).click()
    })

    it('should navigate to the expected task timeline url of the clicked path item', () => {
      cy.url().should(
        'include',
        `matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasksMappedByName['B1'].id}`
      )
    })

    it('the task card should display the correct task name', () => {
      cy.get('[data-test="task-name"]').should('contain', 'B1')
    })

    it('should display 1 path item', () => {
      getTaskPathItems().should('have.length', 1)
    })
  })
})
