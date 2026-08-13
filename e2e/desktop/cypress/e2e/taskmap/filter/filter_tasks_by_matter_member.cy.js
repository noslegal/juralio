import { removeMatterTeamMemberByUserId } from '../../../../../helpers/matter/matter_api_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import {
  getTaskCellByTaskName,
  showDoneTasks,
} from '../../../../../helpers/taskmap/task-map-helper'
import {
  createUser,
  disableUser,
} from '../../../../../helpers/users/user_api_helper'

describe('filter_tasks_by_matter_member.cy', () => {
  let adminUser,
    meUser,
    wasInMatterUser,
    deactivatedUser,
    anotherUser,
    fixture,
    appPage

  const otherTasks = [
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ]

  let otherTasks2 = [
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ]
  //rgba(245, 228, 195, 0.5), but the value was rgba(244, 225, 186, 0.4)

  const taskCellColours = {
    'not-started': 'rgb(252, 251, 232)',
    'in-progress': 'rgb(244, 225, 186)',
    done: 'rgb(209, 229, 230)',
    undefined: 'rgb(206, 202, 237)', // Template task.
  }

  const taskCellColoursFilteredOut = {
    'not-started': 'rgba(252, 251, 232, 0.4)',
    'in-progress': 'rgba(244, 225, 186, 0.4)',
    done: 'rgba(209, 229, 230, 0.4)',
    undefined: 'rgb(206, 202, 237)', // Template task.
  }

  const taskCellColoursFilteredIn = {
    'not-started': 'rgba(219, 217, 181, 0.6)',
    'in-progress': 'rgba(223, 168, 55, 0.6)',
    done: 'rgba(99, 166, 169, 0.6)',
    undefined: 'rgb(206, 202, 237)', // Template task.
  }

  const createUser1 = () =>
    createUser().then(createdUser => (adminUser = createdUser))
  const createUser2 = () =>
    createUser().then(createdUser => (meUser = createdUser))
  const createUser3 = () =>
    createUser().then(createdUser => (wasInMatterUser = createdUser))
  const createUser4 = () =>
    createUser().then(createdUser => (deactivatedUser = createdUser))
  const createUser5 = () =>
    createUser().then(createdUser => (anotherUser = createdUser))

  const checkTaskMapHasExpectedColours = expectedTasks => {
    cy.get('[data-test=icicle-wrapper]').should(
      'have.length',
      expectedTasks.length
    )

    expectedTasks.forEach(task => {
      if (Object.keys(task).length > 0) {
        getTaskCellByTaskName(task.name).should(
          'have.css',
          'background-color',
          task.colour
        )
      }
    })
  }

  before(() => {
    createUser1()
      .then(createUser2)
      .then(createUser3)
      .then(createUser4)
      .then(createUser5)
      .then(() => {
        const seed = {
          matter: {
            prefix: 'task_status_event',
            teamMembers: [
              adminUser,
              meUser,
              wasInMatterUser,
              deactivatedUser,
              anotherUser,
            ],
            matterAdmins: [adminUser],
            projects: [
              {
                name: 'Law Project',
                tasks: [
                  {
                    name: 'not-started',
                    teamMembers: [],
                    followers: [meUser, anotherUser],
                  },
                  {
                    name: 'in-progress',
                    teamMembers: [meUser, anotherUser],
                  },
                  {
                    name: 'done',
                    teamMembers: [wasInMatterUser],
                  },
                  {
                    name: 'no assigned TTMs',
                    teamMembers: [],
                  },
                  {
                    name: '(a) only deactivated TTMs',
                    teamMembers: [deactivatedUser],
                  },
                  {
                    name: '(b) only non-matter TTMs',
                    teamMembers: [wasInMatterUser],
                  },
                  {
                    name: '(a) and (b)',
                    teamMembers: [deactivatedUser, wasInMatterUser],
                    tasks: [{}, {}, {}, {}, {}, {}, {}, {}],
                  },
                  { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        removeMatterTeamMemberByUserId(
          adminUser,
          fixture.matter.id,
          wasInMatterUser.id
        )
        disableUser(adminUser, deactivatedUser)
      })
  })

  describe('when on the task map', () => {
    before(() => {
      cy.login(meUser.username)
      appPage.visitTaskMap()
      appPage.changeTaskStatus('in-progress', 1)
      appPage.changeTaskStatus('done', 2)
      appPage.visitTaskMap()
      showDoneTasks()
      cy.get('[data-test="person-filter-selected-text"]').click()

      //// cy.get('body').click()
    })

    it('should have the task filter setting set to "Everyone"', () => {
      cy.get('[data-test=person-filter-selected-text]').should(
        'have.text',
        ' Anyone’s tasks'
      )
    })

    it('should have the task cells with normal colours', () => {
      const expected = [
        {
          name: 'not-started',
          colour: taskCellColours['not-started'],
        },
        {
          name: 'in-progress',
          colour: taskCellColours['in-progress'],
        },
        {
          name: 'done',
          colour: taskCellColours['done'],
        },
        {
          name: 'no assigned TTMs',
          colour: taskCellColours['not-started'],
        },
        {
          name: '(a) only deactivated TTMs',
          colour: taskCellColours['not-started'],
        },
        {
          name: '(b) only non-matter TTMs',
          colour: taskCellColours['not-started'],
        },
        {
          name: '(a) and (b)',
          colour: taskCellColours['not-started'],
        },
        ...otherTasks,
      ]
      checkTaskMapHasExpectedColours(expected)
    })

    describe('when the filter is set to "Your tasks"', () => {
      before(() => {
        cy.get('[data-test=person-filter-selected-text]').click()
        cy.get('[data-test=person-filter-you]').click()
      })

      it('should filter in all tasks user is either a task member OR following', () => {
        const expected = [
          {
            name: 'in-progress',
            colour: taskCellColoursFilteredIn['in-progress'],
          },
        ]
        checkTaskMapHasExpectedColours(expected)
      })
      describe('should allow you to hover over a task chip avatar', () => {
        before(() => {
          cy.get('[data-test=task-cell-assignee-chip]')
            .eq(0)
            .trigger('mouseover', { force: true })
        })
        it('should render the hover tooltip', () => {
          cy.get('[role=tooltip]').eq(0).should('be.visible')
        })
        after(() => {
          cy.get('[data-test=task-cell-assignee-chip]')
            .eq(0)
            .trigger('mouseout', { force: true })
        })
      })
    })

    describe('when the filter is set to "Everyone"', () => {
      before(() => {
        // cy.get('[data-test=person-filter-selected-text]').click()
        cy.get('[data-test=person-filter-everyone]').click()
        cy.get('[data-test=done-checkbox]').click({ force: true })
        //showDoneTasks()
        //// cy.get('body').click()
      })

      it('should have the normal colours again', () => {
        const expected = [
          {
            name: 'not-started',
            colour: taskCellColours['not-started'],
          },
          {
            name: 'in-progress',
            colour: taskCellColours['in-progress'],
          },
          {
            name: 'no assigned TTMs',
            colour: taskCellColours['not-started'],
          },
          {
            name: '(a) only deactivated TTMs',
            colour: taskCellColours['not-started'],
          },
          {
            name: '(b) only non-matter TTMs',
            colour: taskCellColours['not-started'],
          },
          {
            name: '(a) and (b)',
            colour: taskCellColours['not-started'],
          },
          ...otherTasks,
        ]
        checkTaskMapHasExpectedColours(expected)
      })
    })

    describe('when the filter is set to "Unassigned"', () => {
      before(() => {
        // cy.get('[data-test=person-filter-selected-text]').click()
        cy.get('[data-test=person-filter-unassigned]').click()
      })

      it('should filter in all tasks which have no assigned team members, OR (a) only TTMs OR (b) only TTMs who are no longer matter team members OR both (a) and (b)', () => {
        const expected = [
          {
            name: 'not-started',
            colour: taskCellColoursFilteredIn['not-started'],
          },
          {
            name: 'no assigned TTMs',
            colour: taskCellColoursFilteredIn['not-started'],
          },
          {
            name: '(a) only deactivated TTMs',
            colour: taskCellColoursFilteredIn['not-started'],
          },
          {
            name: '(a) and (b)',
            colour: taskCellColoursFilteredOut['not-started'],
          },
          ...otherTasks,
        ]
        checkTaskMapHasExpectedColours(expected)
      })
    })

    describe('when the filter is set to a specified user', () => {
      before(() => {
        //   cy.get('[data-test=person-filter-selected-text]').click()
        cy.get('[data-test=team-search]')
          .click()
          .type(anotherUser.firstname + ' ' + anotherUser.lastname)
        cy.get('[data-test=search-result-list-item]', { timeout: 5000 }).click()
      })

      it('should filter in tasks specified user is a TTM but not ones theyre following', () => {
        const expected = [
          // {
          //   name: 'not-started',
          //   colour: taskCellColoursFilteredOut['not-started'],
          // },
          {
            name: 'in-progress',
            colour: taskCellColoursFilteredIn['in-progress'],
          },
          // {
          //   name: 'no assigned TTMs',
          //   colour: taskCellColoursFilteredOut['not-started'],
          // },
          // {
          //   name: '(a) only deactivated TTMs',
          //   colour: taskCellColoursFilteredOut['not-started'],
          // },
          // {
          //   name: '(b) only non-matter TTMs',
          //   colour: taskCellColoursFilteredOut['not-started'],
          // },
          // {
          //   name: '(a) and (b)',
          //   colour: taskCellColoursFilteredOut['not-started'],
          // },
          // ...otherTasks,
        ]
        checkTaskMapHasExpectedColours(expected)
      })

      describe('when the filter menu is reopened', () => {
        before(() => {
          cy.get('[data-test=person-filter-selected-text]').click({
            force: true,
          })
        })

        it('should have the searched user at the top of the recent searches bit', () => {
          cy.get('[data-test=person-filter-recent-user]')
            .eq(0)
            .contains(`${anotherUser.firstname} ${anotherUser.lastname}`)
        })

        describe('when the filter is set to "Everyone"', () => {
          before(() => {
            cy.get('[data-test=person-filter-everyone]').click({
              force: true,
            })
            cy.get('[data-test=done-checkbox]').click({ force: true })
            // showDoneTasks()
            //// cy.get('body').click()
            cy.wait(3000)
          })
          
          it('should have not-started and in-progress filtered in and done filtered out', () => {
            const expected = [
              {
                name: 'not-started',
                colour: taskCellColours['not-started'],
              },
              {
                name: 'in-progress',
                colour: taskCellColours['in-progress'],
              },
              {
                name: 'done',
                colour: taskCellColours['done'],
              },
              {
                name: 'no assigned TTMs',
                colour: taskCellColours['not-started'],
              },
              {
                name: '(a) only deactivated TTMs',
                colour: taskCellColours['not-started'],
              },
              {
                name: '(b) only non-matter TTMs',
                colour: taskCellColours['not-started'],
              },
              {
                name: '(a) and (b)',
                colour: taskCellColours['not-started'],
              },
              ...otherTasks,
            ]
            checkTaskMapHasExpectedColours(expected)
          })
        })
      })
    })
  })
})
