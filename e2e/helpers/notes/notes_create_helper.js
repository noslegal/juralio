function clickFabItemWhenStable(selector) {
  cy.get(selector, { timeout: 30000 }).should('be.visible')
  cy.get(selector).then($firstNode => {
    cy.wait(300)
    cy.get(selector).then($settledNode => {
      if ($settledNode[0] !== $firstNode[0]) {
        // Still re-rendering — recurse until the node stops being replaced.
        clickFabItemWhenStable(selector)
      } else {
        cy.wrap($settledNode).click()
      }
    })
  })
}

function openFabAction(actionTest) {
  clickFabItemWhenStable('[data-test=fab-button]')
  clickFabItemWhenStable('[data-test=create-post-fab-button]')
  clickFabItemWhenStable(`[data-test=${actionTest}]`)
}

export function openCreateNote() {
  openFabAction('blank-note')
}

export function openMeetingNote() {
  openFabAction('meeting-note')
}

export function openLinkNote() {
  openFabAction('web-link')
}

export function enterNoteName(
  postName,
  skipCreate = false,
  awaitPostFetch = false,
  meeting = false
) {
  if (meeting) {
    openMeetingNote()
  } else {
    openCreateNote()
  }

  cy.get('[data-test=text-prompt-text-field]').find('input').type(postName)

  if (skipCreate) return

  if (awaitPostFetch) {
    cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/posts').as(
      'postNote'
    )
    cy.backendRoute('/matter/*/workstreams/*/task/*/post/*').as('fetchPost')
    cy.get('[data-test="action-dialog-button"]').click()
    cy.wait(['@postNote', '@fetchPost'])
    return
  }

  cy.get('[data-test="action-dialog-button"]').click()
}
