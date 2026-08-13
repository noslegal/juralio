import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  clickHoverButton,
  getTaskCellByTaskName,
  triggerHoverButtons,
} from '../../../../helpers/taskmap/task-map-helper'
import { enterTaskName } from '../../../../helpers/tasks/task_create_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('milestone_behaviour.cy', () => {
  let user, fixture

  const MILESTONE_NAME_LEVEL_A = 'i am a milestone at level a'
  const MILESTONE_NAME_SUBTASK = 'i am a milestone at subtask level'
  const TASK_NAME = 'i am a task'

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'milestone_behaviour',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'workstream',
              tasks: [
                {
                  name: MILESTONE_NAME_LEVEL_A,
                  properties: {
                    isMilestone: true,
                    status: 'done',
                  },
                },
                {
                  name: TASK_NAME,
                  tasks: [
                    {
                      name: MILESTONE_NAME_SUBTASK,
                      properties: {
                        isMilestone: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })
  describe('when visiting level a task details', () => {
    before(() => {
      cy.login(user)
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id
      )
    })
    it('should show the milestone indicator', () => {
      cy.get('[data-test=task-header-jur-number]').should(
        'contain.text',
        'A-milestone'
      )
    })
  })
  describe('when visiting level a task details', () => {
    before(() => {
      cy.login(user)
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[2].id
      )
    })
    it('should show the milestone indicator', () => {
      cy.get('[data-test=task-header-jur-number]').should(
        'contain.text',
        'B-milestone'
      )
    })
  })
})
