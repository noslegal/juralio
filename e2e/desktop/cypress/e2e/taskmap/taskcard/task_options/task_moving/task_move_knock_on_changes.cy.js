import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'

const {
  createUser,
} = require('../../../../../../../helpers/users/user_api_helper')

describe('task_move_knock_on_changes.cy', () => {
  let user, appPage, fixture
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskStatusSortingTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'project',
              tasks: [
                {
                  name: 'not-started',
                  properties: {
                    plannedStartDate: new Date(2015, 5, 5),
                    plannedEndDate: new Date(2015, 5, 9),
                  },
                },
                {
                  name: 'not-started-2',
                  properties: {
                    plannedStartDate: new Date(2015, 4, 5),
                    plannedEndDate: new Date(2015, 4, 9),
                  },
                },
                {
                  name: 'in-progress',
                  properties: {
                    actualStartDate: new Date(2015, 5, 5),
                    ActualEndDate: new Date(2015, 5, 9),
                    status: 'in-progress',
                  },
                },
                {
                  name: 'done',
                  properties: {
                    actualStartDate: new Date(2015, 4, 5),
                    actualEndDate: new Date(2015, 4, 9),
                    status: 'done',
                  },
                },
              ],
            },
            {
              name: 'project 2',
              tasks: [
                {
                  name: 'otherProjectTask',
                  properties: {
                    plannedStartDate: new Date(2015, 5, 5),
                    plannedEndDate: new Date(2015, 5, 9),
                  },
                  tasks: [
                    {
                      name: 'otherProjectTask1',
                      properties: {
                        plannedStartDate: new Date(2015, 5, 5),
                        plannedEndDate: new Date(2015, 5, 9),
                      },
                      tasks: [
                        {
                          name: 'otherProjectTask2',
                          properties: {
                            plannedStartDate: new Date(2015, 5, 5),
                            plannedEndDate: new Date(2015, 5, 9),
                          },
                          tasks: [
                            {
                              name: 'otherProjectTask3',
                              properties: {
                                plannedStartDate: new Date(2015, 5, 5),
                                plannedEndDate: new Date(2015, 5, 9),
                              },
                              tasks: [],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'project 3',
              tasks: [
                {
                  name: 'done-a',
                  properties: {
                    status: 'done',
                    // plannedStartDate: new Date(2015, 5, 5),
                    // plannedEndDate: new Date(2015, 5, 5),
                    actualStartDate: new Date(2015, 5, 5),
                    actualEndDate: new Date(2015, 5, 5),
                  },
                  tasks: [
                    {
                      name: 'done-2',
                      properties: {
                        status: 'done',
                        // plannedEndDate: new Date(2015, 5, 5),
                        actualStartDate: new Date(2015, 5, 5),
                        actualEndDate: new Date(2015, 5, 5),
                      },
                    },
                  ],
                },
                {
                  name: 'in-progress-project-3',
                  properties: {
                    status: 'in-progress',
                    // plannedStartDate: new Date(2015, 5, 1),
                    plannedEndDate: new Date(2015, 5, 1),
                    // actualStartDate: new Date(2015, 5, 1),
                    // actualEndDate: new Date(2015, 5, 1),
                  },
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
  describe('when moving a not started task to a child of a not started task', () => {
    before(() => {
      cy.reload()
      cy.login(user)
      appPage.visitTaskByName('not-started')
      cy.get('[data-test=task-card-option-menu-button]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=menu-text-move]').click()
      cy.get('[data-test=destination-selection-dropdown]').click()
      cy.get('[data-test=destination-subtask-of]').click()
      cy.get('[data-test=auto-complete-search-term]')
        .eq(0)
        .click()
        .find('input')
        .type('not-started-2')
      cy.wait(1000)
      cy.get('[data-test=search-result-list-item]', { timeout: 10000 })
        .eq(0)
        .click()
      cy.get('[data-test=action-dialog-button]').click()
    })
    //broken fix for circle
    it('should show the knock on changes', () => {
      cy.get('[data-test=task-update-chip]').should('have.length', 1)
      cy.get('[data-test=date-before]')
        .eq(0)
        .should('have.text', 'Sat 9 May 2015')
      cy.get('[data-test=date-after]')
        .eq(0)
        .should('contain.text', 'Tue 9 Jun 2015')
    })
    after(() => {
      cy.get('[data-test=cancel-dialog-button]').eq(1).click()
    })
  })
  describe('when moving a in-progress task to a child of a not started task', () => {
    before(() => {
      cy.reload()
      cy.login(user)
      appPage.visitTaskByName('in-progress')
      cy.get('[data-test=task-card-option-menu-button]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=menu-text-move]').click()
      cy.get('[data-test=destination-selection-dropdown]').click()
      cy.get('[data-test=destination-subtask-of]').click()
      cy.get('[data-test=auto-complete-search-term]')
        .eq(0)
        .click()
        .find('input')
        .type('not-started')
      cy.get('[data-test=search-result-list-item]', { timeout: 10000 })
        .eq(0)
        .click()
      cy.get('[data-test=action-dialog-button]').click()
    })
    it('should show the knock on changes', () => {
      cy.get('[data-test=task-update-chip]').should('have.length', 1)
      cy.get('[data-test=status-before]')
        .eq(0)
        .should('have.text', 'Not started')
      cy.get('[data-test=status-after]')
        .eq(0)
        .should('contain.text', 'In progress')
    })
    after(() => {
      cy.get('[data-test=cancel-dialog-button]').eq(1).click()
    })
  })
  describe('when moving a done task to a child of an not-started task', () => {
    before(() => {
      cy.reload()
      cy.login(user)
      appPage.visitTaskByName('done')
      cy.get('[data-test=task-card-option-menu-button]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=menu-text-move]').click()
      cy.get('[data-test=destination-selection-dropdown]').click()
      cy.get('[data-test=destination-subtask-of]').click()
      cy.get('[data-test=auto-complete-search-term]')
        .eq(0)
        .click()
        .find('input')
        .type('not-')
      cy.get('[data-test=search-result-list-item]', { timeout: 10000 })
        .eq(0)
        .click()
      cy.get('[data-test=action-dialog-button]').click()
    })
    it('should show the knock on changes', () => {
      cy.get('[data-test=task-update-chip]').should('have.length', 1)
      cy.get('[data-test=status-before]')
        .eq(0)
        .should('have.text', 'Not started')
      cy.get('[data-test=status-after]')
        .eq(0)
        .should('contain.text', 'In progress')
    })
    after(() => {
      cy.get('[data-test=cancel-dialog-button]').eq(1).click()
    })
  })
  describe('when moving a in-progress task to a child of an not-started task in another project', () => {
    before(() => {
      cy.reload()
      cy.login(user)
      appPage.visitTaskByName('in-progress')
      cy.get('[data-test=task-card-option-menu-button]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=menu-text-move]').click()
      cy.get('[data-test=destination-selection-dropdown]').click()
      cy.get('[data-test=destination-another-project]').click()
      cy.get('[data-test=auto-complete-search-term]')
        .eq(0)
        .click()
        .find('input')
        .type('project 2')

      cy.get('[data-test=search-result-list-item]').eq(0).click()
      cy.get('[data-test=destination-selection-dropdown]').eq(1).click()
      cy.get('[data-test=destination-subtask-of]').click()
      cy.get('[data-test=auto-complete-search-term]')
        .eq(1)
        .click()
        .find('input')
        .type('otherProjectTask3')
      cy.get('[data-test=search-result-list-item]').eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()
    })
    it('should show the knock on changes', () => {
      cy.get('[data-test=task-update-chip]').should('have.length', 4)
      cy.get('[data-test=status-before]')
        .eq(0)
        .should('have.text', 'Not started')
      cy.get('[data-test=status-after]')
        .eq(0)
        .should('contain.text', 'In progress')
    })
    after(() => {
      cy.get('[data-test=cancel-dialog-button]').eq(1).click()
    })
  })
  describe('when an update will change multiple dates', () => {
    before(() => {
      cy.reload()
      cy.login(user)
      appPage.visitTaskByName('in-progress-project-3')
      cy.get('[data-test=task-card-option-menu-button]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=menu-text-move]').click()
      cy.get('[data-test=destination-selection-dropdown]').click()
      cy.get('[data-test=destination-subtask-of]').click()
      cy.get('[data-test=auto-complete-search-term]')
        .eq(0)
        .click()
        .find('input')
        .type('done-2')
      cy.get('[data-test=search-result-list-item]').eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()
    })
    it('should show the updates', () => {
      cy.get('[data-test=task-update-chip]').should('have.length', 2)
      cy.get('[data-test=change-counter]').should(
        'contain.text',
        // 'Date changes:  3, Status changes:  2'
        'Status changes:  2'
      )
      cy.get('[data-test=status-before]').eq(0).should('have.text', 'Done')
      cy.get('[data-test=status-after]')
        .eq(0)
        .should('contain.text', 'In progress')
      cy.get('[data-test=status-before]').eq(1).should('have.text', 'Done')
      cy.get('[data-test=status-after]')
        .eq(1)
        .should('contain.text', 'In progress')
    })
  })
})
