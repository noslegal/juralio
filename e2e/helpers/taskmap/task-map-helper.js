import chaiColors from 'chai-colors'
import { checkIcicleCellDepthCounts } from '../icicle/icicle-helper'

chai.use(chaiColors)

export const taskStatusColors = {
  notRequired: '#E1DED8',
  notStarted: '#FCFBE8',
  inProgress: '#f4e1ba',
  done: '#d1e5e6',
}

export const taskStatusColorDark = {
  notStarted: '#989390',
  inProgress: '#DFA837',
  done: '#63A6A9',
}

export const checkTaskMapLevelAndDepthCounts = checks =>
  checkIcicleCellDepthCounts(checks, 'tasks', 'task-cell-test')

const ICICLE_CSS_NAME = 'icicle'

export const triggerHoverButtons = (targetCellContent, scrollHelper) => {
  
  cy.get('div')
    .contains(scrollHelper ? scrollHelper : targetCellContent)
    // .closest(`.${ICICLE_CSS_NAME}`)
    .closest('[data-test=structureItem]')
    .scrollIntoView({ offset: { top: -100 } })
  cy.get('div')
    .contains(targetCellContent)
    .closest('[data-test=structureItem]')
    .trigger('mouseover', { force: true })
    //.tick(500)
  cy.wait(1000)
}

export const showDoneTasks = () => {
  cy.get('[data-test=minimised-filters]').click({ force: true })
  cy.get('[data-test=done-checkbox]').click({ force: true })
  cy.wait(500) // Taking this out leads to issues with detached DOM elements.
  //cy.get('[data-test=status-filter-selected-text]').click({ force: true })
}

export const showNotRequiredTasks = () => {
  cy.get('[data-test=minimised-filters]').click({ force: true })
  //cy.get('[data-test=status-filter-selected-text]').click({ force: true })
  cy.get('[data-test=not-required-checkbox]').click()
  cy.wait(500) // Taking this out leads to issues with detached DOM elements.
  //cy.get('[data-test=status-filter-selected-text]').click({ force: true })
}

export const hideHoverButtons = targetCellContent => {
  cy.get('div')
    .contains(targetCellContent)
    // .closest(`.${ICICLE_CSS_NAME}`)
    .closest('[data-test=structureItem]')
    // .scrollIntoView()
    .trigger('mouseout', { force: true })
}

const confirmNewTaskCreation = newTaskName => {
  cy.backendRoute('POST', '/matter/*/workstreams/*/tasks').as('postTask')
  cy.backendRoute('/matter/*/workstreams/**').as('fetchProject')
  cy.get('[data-test=edit-name-field] input', { timeout: 10000 })
    .type(newTaskName)
    .type('{enter}')
  cy.wait('@postTask')
  cy.wait('@fetchProject')
  cy.wait(1000)
  cy.get('[data-test=edit-name-field] input', { timeout: 10000 }).type('{ESC}')
}

const cancelTaskCreation = () => {
  cy.get('[data-test=edit-name-field] input', { timeout: 10000 }).type('{ESC}')
}

export const clickHoverButton = targetButton => {
  cy.clock()
  cy.get(targetButton).eq(0).click({ force: true })
  cy.tick(500)
}

export const exerciseSiblingTaskFromHoverButtonConfirmFlow = (
  targetCellContent,
  targetButton,
  expectedStatusColor,
  newTaskName
) => {
  describe(`when using ${targetButton} for the cell containing ${targetCellContent}`, () => {
    let originalCellCount

    before(() => {
      triggerHoverButtons(targetCellContent)
      cy.get('[data-test=task-cell-test]').then(selection => {
        originalCellCount = selection.length
      })
      clickHoverButton(targetButton)
    })

    it('should display a new task cell with the correct status, containing an input field', () => {
      cy.get('[data-test=task-cell-test]').should(
        'have.length',
        originalCellCount
      )
      cy.get('[data-test=edit-name-field]').should('be.visible')
    })

    it(
      'should hide the input field when a name is given and enter is pressed',
      { retries: { runMode: 2, openMode: 2 } },
      () => {
        confirmNewTaskCreation(newTaskName)
        cy.get('[data-test=edit-name-field]').should('not.exist')
        cy.get('[data-test=task-cell-test]').should(
          'have.length',
          originalCellCount
        )
      }
    )

    after(() => {
      hideHoverButtons(targetCellContent)
    })
  })
}

export const exerciseSiblingTaskFromHoverButtonCancelFlow = (
  targetCellContent,
  targetButton,
  expectedStatusColor,
  scrollHelper
) => {
  describe(`when using ${targetButton} for the cell containing ${targetCellContent}`, () => {
    let originalCellCount

    before(() => {
      triggerHoverButtons(targetCellContent, scrollHelper)
      cy.get('[data-test=task-cell-test]').then(selection => {
        originalCellCount = selection.length
      })
      clickHoverButton(targetButton)
    })

    it('should display a new task cell with the correct status, containing an input field', () => {
      cy.get('[data-test=task-cell-test]').should(
        'have.length',
        originalCellCount + 1
      )
      cy.get('[data-test=edit-name-field]').should('be.visible')
    })

    it('should hide the new task cell containing an input field when escape is pressed', () => {
      cancelTaskCreation()
      cy.get('[data-test=task-cell-test]').should(
        'have.length',
        originalCellCount
      )
      cy.get('[data-test=edit-name-field]').should('not.exist')
    })

    after(() => {
      hideHoverButtons(targetCellContent)
    })
  })
}

export const createSubTaskViaMap = (targetCellContent, newTaskName) => {
  triggerHoverButtons(targetCellContent)
  clickHoverButton('[data-test=hover-button-right]')
  cy.get('[data-test=edit-name-field] input', { timeout: 10000 }).type(
    `${newTaskName}{Enter}`
  )
}

export const createSiblingAboveOnMap = (targetCellContent, newTaskName) =>
  createSiblingTaskViaMap(targetCellContent, 'above', newTaskName)

export const createSiblingBelowOnMap = (targetCellContent, newTaskName) =>
  createSiblingTaskViaMap(targetCellContent, 'below', newTaskName)

export const createSiblingTaskViaMap = (
  targetCellContent,
  position,
  newTaskName
) => {
  triggerHoverButtons(targetCellContent)
  clickHoverButton(`[data-test=hover-button-${position}]`)
  cy.get('[data-test=edit-name-field] input', { timeout: 10000 }).type(
    `${newTaskName}{Enter}`
  )
  cy.wait(1000)
  cy.get('[data-test=edit-name-field] input', { timeout: 10000 }).type('{Esc}')
}

export const clickTaskCellForTaskWithName = name =>
  cy
    .get('[data-test=task-cell-test]', { timeout: 30000 })
    .contains(name)
    .scrollIntoView()
    .click({ force: true })

export const getTaskCellByTaskName = name =>
  cy
    .get('[data-test=task-cell-test]', { timeout: 30000 })
    .contains(name)
    .closest('[data-test=task-cell-test]', { timeout: 30000 })

export const openMenuForSubtask = subtaskName => {
  cy.get('[data-test=task-cell-test]', { timeout: 30000 })
    .contains(subtaskName)
    .closest('[data-test=task-cell-test]', { timeout: 30000 })
    .find('[data-open-options-menu]')
    .click()
}
