import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('post_tasks_invalid_tasks.cy', () => {
  let teamMember, nonTeamMember, fixture
  before(() => {
    createUser().then(createdUser => {
      nonTeamMember = createdUser

      createUser()
        .then(createdUser => {
          teamMember = createdUser
        })
        .then(() => {
          const seed = {
            matter: {
              teamMembers: [teamMember],
              matterAdmins: [teamMember],
              projects: [
                {
                  name: 'Project 1',
                  tasks: [
                    {
                      name: 'Task 1 ',
                      tasks: [{ name: 'Task 2' }, { name: 'Task 3' }],
                    },
                    { name: 'Task 4', tasks: [{ name: 'Task 5' }] },
                  ],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
    })
  })

  describe('when patching a task list as a MTM with invalid subtask ids', () => {
    it('should return BAD_REQUEST status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/tasks`,
        method: 'PATCH',
        body: {
          parentTask: fixture.tasks[0].id,
          taskOrder: [
            { id: fixture.tasks[1].id },
            { id: fixture.tasks[2].id },
            { id: fixture.tasks[3].id }, // This id is not a subtask.
          ],
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })

  describe('when patching a task list as a MTM with invalid level A ids', () => {
    it('should return BAD_REQUEST status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/tasks`,
        method: 'PATCH',
        body: {
          taskOrder: [
            { id: fixture.tasks[0].id }, // This id is a level A task.
            { id: fixture.tasks[1].id }, // This id is not a level A task.
            { id: fixture.tasks[2].id }, // This id is not a level A task.
            { id: fixture.tasks[3].id }, // This id is not a level A task.
          ],
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
