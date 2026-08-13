import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('task_card_note_count.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskCardTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Note Spec',
              tasks: [
                { name: 'Task Without Notes' },
                { name: 'Task With one Note' },
                { name: 'Task With two Notes' },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when visiting the taskmap', () => {
    before(() => {
      cy.login(user.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[1].id,
        { name: 'Existing note.' }
      )
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[2].id,
        { name: 'Existing note.' }
      )
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[2].id,
        { name: 'Existing note.' }
      )
      appPage.visitTaskMap()
    })
    it('should show the post counts on task cells', () => {
      cy.get('[data-test=task-cell-post-count-wrapper]').should(
        'have.length',
        2
      )
      cy.get('[data-test=task-cell-post-count-text]')
        .eq(0)
        .should('contain.text', 1)
      cy.get('[data-test=task-cell-post-count-text]')
        .eq(1)
        .should('contain.text', 2)
    })
  })
  describe('when visiting the roadmap', () => {
    before(() => {
      cy.login(user.username)

      appPage.visitRoadmap()
    })
    it('should show the post counts on task cells', () => {
      cy.get('[data-test=task-cell-post-count-wrapper]').should(
        'have.length',
        2
      )
      cy.get('[data-test=task-cell-post-count-text]')
        .eq(0)
        .should('contain.text', 1)
      cy.get('[data-test=task-cell-post-count-text]')
        .eq(1)
        .should('contain.text', 2)
    })
  })
})
