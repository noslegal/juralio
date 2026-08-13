export default {
  get: {
    todoItems: () => cy.get('[data-test=todo-item]'),
    todoList: () => cy.get('[data-test=todo-list]'),
    todoListItem: index => cy.get('[data-test=todo-item]').eq(index),
    todoListItemDateString: () =>
      cy.find('[data-test=todo-item-date]').find('[data-test=date-string]'),
    todoListItemOverdueString: () =>
      cy.find('[data-test=todo-item-date]').find('[data-test=overdue-string]'),
  },
}
