import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { enterNoteName } from '../../../../../helpers/notes/notes_create_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('create_note_not_required_task.cy', () => {
  let user, fixture
  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmatternotecreate',
          teamMembers: [user],
          matterAdmins: [user],

          projects: [
            {
              name: 'p1',
              tasks: [
                { name: 'not-started', properties: { status: 'not-started' } },
                {
                  name: 'not-required',
                  properties: { status: 'task-not-required' },
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })
  describe('when trying to create a post', () => {
    before(() => {
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[1].id
      )
      enterNoteName('test')
    })
    it('should not have the not required task as an option', () => {
      cy.get('[data-test=task-search-item]').should('have.length', 1)
      cy.get('[data-test=task-search-item]')
        .eq(0)
        .should('contain.text', 'not-started')
    })
  })
})
