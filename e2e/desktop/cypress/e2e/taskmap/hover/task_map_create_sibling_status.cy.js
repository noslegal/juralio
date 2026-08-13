import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  exerciseSiblingTaskFromHoverButtonCancelFlow,
  showDoneTasks,
  taskStatusColors,
} from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('task_map_create_sibling_status.cy', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'task_map_create_sibling_status',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'Single Done',
                  properties: { status: 'done' },
                  tasks: [
                    {
                      name: 'Single Done Child',
                      properties: { status: 'done' },
                      tasks: [
                        {
                          //  To be removed once we have a way of hiding the minimap, has been raised with design
                          name: 'Padding',
                          properties: { status: 'done' },
                        },
                      ],
                    },
                  ],
                },

                {
                  name: 'Done And In Progress',
                  properties: { status: 'in-progress' },
                  tasks: [
                    {
                      name: 'Done With In Progress Sibling',
                      properties: { status: 'done' },
                    },
                    {
                      name: 'In Progress With Done Sibling',
                      properties: { status: 'in-progress' },
                    },
                  ],
                },
                {
                  name: 'Single In Progress',
                  properties: { status: 'in-progress' },
                  tasks: [
                    {
                      name: 'Single In Progress Child',
                      properties: { status: 'in-progress' },
                    },
                  ],
                },
                {
                  name: 'In Progress And Not Started',
                  properties: { status: 'in-progress' },
                  tasks: [
                    {
                      name: 'In Progress With Not Started Sibling',
                      properties: {
                        status: 'in-progress',
                      },
                    },
                    {
                      name: 'Not Started With IP Sibling',
                      properties: {
                        status: 'not-started',
                      },
                    },
                  ],
                },
                {
                  name: 'Not Started And Done',
                  properties: { status: 'in-progress' },
                  tasks: [
                    {
                      name: 'Not Started With Done Sibling',
                      properties: {
                        status: 'not-started',
                      },
                    },
                    {
                      name: 'Done With Not Started Sibling',
                      properties: {
                        status: 'done',
                      },
                    },
                  ],
                },
                {
                  name: 'Single Not Started',
                  properties: { status: 'not-started' },
                  tasks: [
                    {
                      name: 'Single Not Started Child',
                      properties: { status: 'not-started' },
                    },
                  ],
                },
                {
                  name: 'Pairs',
                  properties: { status: 'in-progress' },
                  tasks: [
                    {
                      name: 'Not Started A',
                      properties: { status: 'not-started' },
                    },
                    {
                      name: 'Not Started B',
                      properties: { status: 'not-started' },
                    },
                    {
                      name: 'In Progress A',
                      properties: { status: 'in-progress' },
                    },
                    {
                      name: 'In Progress B',
                      properties: { status: 'in-progress' },
                    },
                    {
                      name: 'Done A',
                      properties: { status: 'done' },
                    },
                    {
                      name: 'Done B',
                      properties: { status: 'done' },
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

  describe('when navigating to the task map', () => {
    before(() => {
      cy.window().then(win => {
        win.sessionStorage.clear()
      })
      cy.login(user.username)
      cy.backendRoute('/matter/*/workstreams/**').as('projectFetch')
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
      )
      cy.wait('@projectFetch')
      cy.get('.reactour__close', { timeout: 30000 }).click()

      showDoneTasks()
    })

    const notStartedColour = taskStatusColors.notStarted
    const inProgressColour = taskStatusColors.inProgress
    const doneColour = taskStatusColors.done

    describe('when checking the status of tasks created from a single sibling', () => {
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Single Not Started Child',
        '[data-test=hover-button-top]',
        notStartedColour
      )
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Single Not Started Child',
        '[data-test=hover-button-bottom]',
        notStartedColour
      )
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Single In Progress Child',
        '[data-test=hover-button-top]',
        inProgressColour
      )
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Single In Progress Child',
        '[data-test=hover-button-bottom]',
        inProgressColour
      )
      // exerciseSiblingTaskFromHoverButtonCancelFlow(
      //   'Single Done Child',
      //   '[data-test=hover-button-top]',
      //   doneColour
      // )
      // exerciseSiblingTaskFromHoverButtonCancelFlow(
      //   'Single Done Child',
      //   '[data-test=hover-button-bottom]',
      //   doneColour
      // )
    })

    describe('when checking the status of tasks created between siblings of different statuses', () => {
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Not Started With IP Sibling',
        '[data-test=hover-button-bottom]',
        notStartedColour
      )
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Not Started With IP Sibling',
        '[data-test=hover-button-top]',
        notStartedColour
      )

      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'In Progress With Done Sibling',
        '[data-test=hover-button-bottom]',
        inProgressColour,
        'Single Done Child'
      )
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'In Progress With Done Sibling',
        '[data-test=hover-button-top]',
        inProgressColour,
        'Single Done Child'
      )

      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Done With In Progress Sibling',
        '[data-test=hover-button-bottom]',
        inProgressColour,
        'Single Done Child'
      )
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Done With In Progress Sibling',
        '[data-test=hover-button-top]',
        doneColour,
        'Single Done Child'
      )

      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Not Started With Done Sibling',
        '[data-test=hover-button-bottom]',
        notStartedColour
      )
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Not Started With Done Sibling',
        '[data-test=hover-button-top]',
        notStartedColour,
        'Single Done Child'
      )

      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Done With Not Started Sibling',
        '[data-test=hover-button-bottom]',
        notStartedColour,
        'Single Done Child'
      )
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        'Done With Not Started Sibling',
        '[data-test=hover-button-top]',
        doneColour,
        'Single Done Child'
      )
    })

    describe('when checking the status of tasks created between siblings of identical statuses', () => {
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        /^Not Started A$/,
        '[data-test=hover-button-bottom]',
        notStartedColour
      )
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        /^Not Started B$/,
        '[data-test=hover-button-top]',
        notStartedColour
      )

      // exerciseSiblingTaskFromHoverButtonCancelFlow(
      //   /^In Progress A$/,
      //   '[data-test=hover-button-bottom]',
      //   inProgressColour
      // )
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        /^In Progress B$/,
        '[data-test=hover-button-top]',
        inProgressColour
      )

      // exerciseSiblingTaskFromHoverButtonCancelFlow(
      //   /^Done A$/,
      //   '[data-test=hover-button-bottom]',
      //   doneColour
      // )
      exerciseSiblingTaskFromHoverButtonCancelFlow(
        /^Done B$/,
        '[data-test=hover-button-top]',
        doneColour
      )
    })
  })
})
