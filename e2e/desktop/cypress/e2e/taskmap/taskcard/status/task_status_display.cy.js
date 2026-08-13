import chaiColors from 'chai-colors'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../../../helpers/users/user_api_helper'

chai.use(chaiColors)

const getTaskStatusText = () => cy.get('[data-test=task-header-status-text]')
const visitHelpers = new VisitHelpers()
describe('task_status_display.cy', () => {
  let user, fixture, appPage

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
    createUser().then(createdUser => {
      user = createdUser
      updateFTUE(user, { hasSeenMatterAdmin: true })
      const seed = {
        matter: {
          prefix: 'taskStatusDisplayTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'task1',
                },
                {
                  name: 'task2',
                  properties: {
                    status: 'in-progress',
                  },
                },
                {
                  name: 'task3',
                  properties: {
                    status: 'done',
                  },
                },
                {
                  name: 'task4',
                  properties: {
                    status: 'task-not-required',
                  },
                },
              ],
            },
            {
              tasks: [
                {
                  name: 'grandparent 1',
                  properties: { status: 'done' },
                  tasks: [{ name: 'parent 1', properties: { status: 'done' } }],
                },
                {
                  name: 'grandparent 2',
                  properties: { status: 'done' },
                  tasks: [{ name: 'parent 2', properties: { status: 'done' } }],
                },
                {
                  name: ' will be move grandchild',
                  properties: { status: 'in-progress' },
                },
                {
                  name: ' will be archive grandchild',
                  properties: { status: 'in-progress' },
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

  describe('when opening a NOT STARTED task', () => {
    before('setup', () => {
      cy.login(user.username)
      appPage.visitTaskByName('task1')
    })

    it('displays the task status', () => {
      getTaskStatusText().should('have.text', 'Not started')
    })

    it('is the correct colour for the status', () => {
      cy.get('[data-test=task-details-layout]')
        .should('have.css', 'background-color')
        .and('be.colored', '#fcfbe8')
    })
  })

  describe('when opening an IN PROGRESS task', () => {
    before('setup', () => {
      cy.login(user.username)
      appPage.visitTaskByName('task2')
    })

    it('displays the task status', () => {
      getTaskStatusText().should('have.text', 'In progress')
    })

    it('is the correct colour for the status', () => {
      cy.get('[data-test=task-details-layout]')
        .should('have.css', 'background-color')
        .and('be.colored', '#f4e1ba')
    })
  })

  describe('when opening a DONE task', () => {
    before('setup', () => {
      cy.login(user.username)
      appPage.visitTaskByName('task3')
    })

    it('displays the task status', () => {
      getTaskStatusText().should('have.text', 'Done')
    })

    it('is the correct colour for the status', () => {
      cy.get('[data-test=task-details-layout]')
        .should('have.css', 'background-color')
        .and('be.colored', '#d1e5e6')
    })
  })

  describe('when opening a NOT REQUIRED task', () => {
    before('setup', () => {
      cy.login(user.username)
      appPage.visitTaskByName('task4')
    })

    it('displays the task status', () => {
      getTaskStatusText().should('have.text', 'Not required')
    })

    it('is the correct colour for the status', () => {
      cy.get('[data-test=task-details-layout]')
        .should('have.css', 'background-color')
        .and('be.colored', '#e1ded8')
    })
  })
  describe('when moving a task to the child of a done task', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[1].id)
      cy.get('.reactour__close').click()

      cy.get('[data-test=minimised-filters]').click({ force: true })
      cy.get('[data-test=done-checkbox]').click()
      cy.get('body').click()
      cy.get('[data-test=task-cell-test]', { timeout: 10000 }).should(
        'have.length',
        6
      )
      // performDrag(3, generatePoint(7000, 7000), { wait: false })
      // cy.get('[data-test=enterMoveMode]').click()
      // cy.get('[data-test=move-button-right]').eq(3).click()
    })
    // it('should ask the user to confirm the changes that will occur', () => {
    //   cy.get('[data-test=task-update-chip]').should('have.length', 2)
    //   cy.get('[data-test=status-before]').eq(0).should('have.text', 'Done')
    //   cy.get('[data-test=status-after]')
    //     .eq(0)
    //     .should('contain.text', 'In progress')
    //   cy.get('[data-test=status-before]').eq(1).should('have.text', 'Done')
    //   cy.get('[data-test=status-after]')
    //     .eq(1)
    //     .should('contain.text', 'In progress')
    // })

    describe('after confirming the move', () => {
      // before(() => {
      //   cy.backendRoute('POST', '/matter/*/projects/*/task/*/move').as(
      //     'taskMove'
      //   )
      //   cy.get('[data-test=action-dialog-button]').click()
      //   cy.wait('@taskMove')
      //   cy.wait(3000)
      // })

      describe('when unarchiving a task', () => {
        before(() => {
          cy.get('[data-test=options-dropdown]', { timeout: 10000 })
            .eq(5)
            .click()
          cy.get('[data-test=task-card-option-menu-more]').click()
          cy.get('[data-test=task-card-option-menu-archive]').click()
          clickArchiveTask()
          visitHelpers.visitArchiveTable(user, fixture.matter.id)
          cy.wait(2000)
          cy.get('[data-test^=Restore]', { timeout: 10000 }).click()
          cy.get('[data-test=radio-new]').click()
          cy.get('[data-test=auto-complete-search-term]').eq(0).click()
          cy.wait(5000)
          cy.get('[data-test=auto-complete-search-term]')
            .eq(0)
            .find('input')
            .type(fixture.projects[1].name)
          cy.get('[data-test=workstream-item-name]')
            .contains(fixture.projects[1].name)
            .click()
          cy.get('[data-test=destination-selection-dropdown]').click()
          cy.get('[data-test=destination-subtask-of]').click()
          cy.get('[data-test=auto-complete-search-term]').eq(0).click()
          cy.get('[data-test=auto-complete-search-term]')
            .eq(1)
            .find('input')
            .type('parent 2')
          cy.get('[data-test=task-search-item]').contains('parent 2').click()
          cy.wait(2000)
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait(5000)
          cy.get('[data-test=action-dialog-button]').eq(1).click()
          visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[1].id)
          cy.get('[data-test=action-dialog-button]').eq(0).click()

          // cy.get('[data-test=status-filter-selected-text]').click()
          cy.get('[data-test=minimised-filters]').click({ force: true })

          //cy.get('[data-test=done-checkbox]').click()
          // // cy.get('body').click()
          cy.wait(2000)
        })
        it('should update the parent and grandparent status', () => {
          cy.get('[data-test=task-cell-test]')
            .eq(2)
            .should('have.css', 'background-color', 'rgb(244, 225, 186)')
          cy.get('[data-test=task-cell-test]', { timeout: 10000 })
            .eq(4)
            .should('have.css', 'background-color', 'rgb(244, 225, 186)')
        })
      })

      describe('when unarchiving another task', () => {
        before(() => {
          cy.get('body').click()
          cy.wait(1000)
          cy.get('[data-test=options-dropdown]', { timeout: 10000 })
            .eq(4)
            .click()
          cy.get('[data-test=task-card-option-menu-more]').click()
          cy.get('[data-test=task-card-option-menu-archive]').click()
          cy.wait(1000)
          clickArchiveTask()
          cy.wait(1000)

          visitHelpers.visitArchiveTable(user, fixture.matter.id)

          cy.get('[data-test^=Restore]', { timeout: 10000 }).eq(0).click()

          cy.get('[data-test=radio-new]').click()
          cy.get('[data-test=auto-complete-search-term]').eq(0).click()
          cy.get('[data-test=auto-complete-search-term]')
            .eq(0)
            .find('input')
            .type(fixture.projects[1].name)
          cy.get('[data-test=workstream-item-name]')
            .contains(fixture.projects[1].name)
            .click()
          cy.get('[data-test=destination-selection-dropdown]').click()
          cy.get('[data-test=destination-subtask-of]').click()
          cy.get('[data-test=auto-complete-search-term]').eq(0).click()
          cy.get('[data-test=auto-complete-search-term]')
            .eq(1)
            .find('input')
            .type('parent 2')
          cy.get('[data-test=task-search-item]').contains('parent 2').click()
          cy.get('[data-test=action-dialog-button]').click()

          visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[1].id)
          cy.get('[data-test="timeline-navigation-button"]').click({ force: true })
          cy.get('[data-test="taskmap-navigation"]').click()
          // cy.get('[data-test=minimised-filters]').click({ force: true })

          // cy.get('[data-test=not-started-checkbox]').click()
          // cy.get('body').click()
          cy.wait(2000)
        })
        it('should retain parent status of done', () => {
          cy.get('[data-test=task-cell-test]')
            .eq(1)
            .should('have.css', 'background-color', 'rgb(244, 225, 186)')
          cy.get('[data-test=task-cell-test]', { timeout: 10000 })
            .eq(3)
            .should('have.css', 'background-color', 'rgb(244, 225, 186)')
        })
      })
    })
  })
})

function clickArchiveTask() {
  cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/archive').as(
    'taskArchive'
  )
  cy.get('[data-test=action-dialog-button]').click()
  cy.wait('@taskArchive')
}
