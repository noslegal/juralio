import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('task_description_display.cy', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'tddsp',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [
                {
                  name: 'Herbs',
                  properties: {
                    description:
                      'This is a task description.\nThis appears on another line. Double blank next.\n\nAnyone for table tennis?',
                  },
                  tasks: [
                    {
                      name: 'Another task',
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

  describe('when opening a task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Herbs')
    })

    describe('the task description is displayed', () => {
      it('displays the task description', () => {
        cy.get('[data-test="raw-text-content"]').should('exist')
        cy.get('[data-test="raw-text-content"]').should(
          'contain.text',
          'This is a task description.'
        )
        cy.get('[data-test="raw-text-content"]').should(
          'contain.text',
          'Anyone for table tennis?'
        )
      })
    })
  })

  describe('when opening a sub-task with no description', () => {
    before(() => {
      cy.get('[data-test=task-cell-test]').first().click()
    })

    describe('the placeholder task description is displayed', () => {
      it('should be visible and have text Give a description of your task... text', () => {
        cy.get('[data-test="zero-state-placeholder"]').should(
          'have.text',
          'Click to add a description'
        )
      })
    })
  })
})
