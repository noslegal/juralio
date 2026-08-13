import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import {
  addNoteToTask,
  updateTask,
} from '../../../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('post_count_consistency.cy', () => {
  let user, fixture, appPage, user2

  before(() => {
    createUser().then(newUser => {
      user2 = newUser
    })
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'taskNoteContent',
          teamMembers: [user, user2],
          matterAdmins: [user, user2],
          projects: [
            {
              name: 'Task Note Spec',
              tasks: [
                {
                  name: 'Task With Notes',
                  tasks: [
                    {
                      name: 'Task NR Notes',
                    },
                  ],
                },
              ],
            },
            { name: 'test' },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening a Task with Notes', () => {
    describe('the post counts in the app were all correct', () => {
      before(() => {
        cy.login(user.username)
        addNoteToTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          {
            name: 'Note1',
            description: 'Planes are cool too.',
          }
        )

        cy.wait(1000 * 3) // Make sure notes display in correct order

        addNoteToTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          {
            name: 'Note2',
            description: 'Trains are wonderful machines.',
            finalised: true,
          }
        )

        addNoteToTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          {
            name: 'Note3',
            description: 'Trains are wonderful machines.',
            privatePost: true,
          }
        )

        addNoteToTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[1].id,
          {
            name: 'This is a private note.',
            description: 'Trains are wonderful machines.',
          }
        )

        updateTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[1].id,
          { status: 'task-not-required' }
        )
        visitHelpers.visitMatterOverview(fixture.matter.id)
      })

      it('the count should be correct in the matter overview', () => {
        cy.get('[data-test=post-count]', { timeout: 30000 }).should(
          'contain',
          '4'
        )
      })
      it('the count should be correct in the matter switcher', () => {
        cy.get('[data-test=matter-switcher-button]').click()
        cy.get('[data-test=workstream-chip-posts]').should('contain', '4')
      })
      it('the count should be correct in the project overview', () => {
        cy.login(user.username)
        visitHelpers.visitProjectOverview(
          fixture.matter.id,
          fixture.projects[0].id
        )
        cy.get('[data-test=post-count]', { timeout: 30000 }).should(
          'contain',
          '4'
        )
      })
      it('the count should be correct on the home screen', () => {
        cy.login(user.username)
        visitHelpers.visitHome()
        cy.get('[data-test=workstream-chip-posts]').should('contain', '4')
      })
    })
  })
})
