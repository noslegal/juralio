export const assertListItemCorrect = (parentElementSelector, index, user) => {
  cy.get(`${parentElementSelector} [data-test=user-list-item]`)
    .eq(index)
    .then($item => {
      //Avatar initials
      cy.wrap($item)
        .find('[data-test=user-avatar]')
        .should('have.text', `${user.firstname[0]}${user.lastname[0]}`)
      //Full name text
      if (index !== 0) {
        cy.wrap($item)
          .find('[data-test=name-text]')
          .should('have.text', `${user.firstname} ${user.lastname}`)
      }
    })
}

export const assertCompactUserListItemCorrect = (
  parentElementSelector,
  index,
  user
) => {
  cy.get(`${parentElementSelector} [data-test=user-list-item]`)
    .eq(index)
    .then($item => {
      //Avatar initials
      cy.wrap($item)
        .find('[data-test=user-avatar]')
        .should('have.text', `${user.firstname[0]}${user.lastname[0]}`)
    })
}

export const getMatterEditorHeader = () =>
  cy.get('[data-test=matter-editors]')
  
export const getMatterViewerHeader = () =>
  cy.get('[data-test=matter-viewers]')

export const getMatterEditorListItems = () =>
  cy.get('[data-test=matter-editors] [data-test=user-list-item]')

export const getMatterViewerListItems = () =>
  cy.get('[data-test=matter-viewers] [data-test=user-list-item]')

export const getEditorListItem = () =>
  cy.get(
    '[data-test=matter-editors] [data-test=user-list-item] [data-test=name-text]'
  )

export const getViewerListItem = () =>
  cy.get(
    '[data-test=matter-viewers] [data-test=user-list-item] [data-test=name-text]'
  )

export const assertUserListName = (list, index, user) =>
  list
    .eq(index)
    .should('have.text', `${user.firstname} ${user.lastname}`)

export const getUserAvatarDataTest = user => `[data-test=${user.firstname}-${user.lastname}]`