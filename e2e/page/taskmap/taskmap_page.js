import VisitHelper from '../../helpers/matterprojects/visit_helpers'

const visitHelper = new VisitHelper()

export default {
  navigate: {
    task: (matterId, projectId, taskId) =>
      visitHelper.visitTaskDetails(matterId, projectId, taskId),
    map: (matterId, projectId) => visitHelper.visitTaskMap(matterId, projectId),
    road: (matterId, projectId) =>
      visitHelper.visitRoadmap(matterId, projectId),
  },
  operationMenu: {
    menuButton: () => cy.get('[data-test=task-card-option-menu-button]'),
    notStarted: () => cy.get('[data-test=menu-text]').eq(0),
    inProgress: () => cy.get('[data-test=menu-text]').eq(1),
    done: () => cy.get('[data-test=menu-text]').eq(2),
    notRequired: () => cy.get('[data-test=menu-text]').eq(3),
    menuItem: index => cy.get('[data-test=menu-text]').eq(index),
    menuItemsText: () => cy.get('[data-test=menu-text]'),
    taskCellDropDownArrow: () =>
      cy.get('[data-test=options-dropdown]', { timeout: 30000 }),
    renameMenuText: () => cy.get('[data-test=menu-text-rename]'),
    moveMenuText: () => cy.get('[data-test=menu-text-move]'),
    copyMenuText: () => cy.get('[data-test=menu-text-copy]'),
    linkMenuText: () => cy.get('[data-test=menu-text-link]'),
    archiveMenuText: () =>
      cy.get('[data-test=menu-text-archive]', { timeout: 10000 }),
    deleteMenuText: () => cy.get('[data-test=menu-text-delete]'),
  },
}
