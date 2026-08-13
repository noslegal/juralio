export function checkNotificationCount(expectedCount) {
  const plural = expectedCount > 1 ? 's' : ''
  it(`should be ${expectedCount} notification${plural} present`, () => {
    cy.get('[data-test=inbox-notification]').should(
      'have.length',
      expectedCount
    )
  })
}

export function checkTaskStatusNotification(
  index,
  projectName,
  taskName,
  eventActioneerNameDisplayed,
  expectedStatus,
  isReversion,
  isHomeInbox
) {
  checkCommonNotificationDetails(index, projectName, taskName)

  checkActioneer(index, eventActioneerNameDisplayed)

  checkTaskName(index, taskName)

  if (isHomeInbox) {
    if (expectedStatus === 'Not required') {
      checkNotificationStatement(index, `marked as ${expectedStatus}`)
    } else {
      checkNotificationStatement(index, `Status changed to ${expectedStatus}`)
    }
  } else {
    if (expectedStatus === 'Not required') {
      checkNotificationStatement(index, `marked as ${expectedStatus}`)
    } else {
      checkNotificationStatement(
        index,
        `${
          isReversion ? 'reverted status' : 'changed status'
        } to ${expectedStatus}`
      )
    }
  }
}

export function checkTaskTeamAddNotification(
  index,
  projectName,
  taskName,
  eventActioneerNameDisplayed,
  homeInbox
) {
  checkCommonNotificationDetails(index, projectName, taskName)

  checkActioneer(index, eventActioneerNameDisplayed)

  checkTaskName(index, taskName)

  checkNotificationStatementContains(
    index,
    homeInbox ? 'You were added to this task' : 'to the task team'
  )
}

export function checkTaskTeamRemoveNotification(
  index,
  projectName,
  taskName,
  eventActioneerNameDisplayed,
  homeInbox
) {
  checkCommonNotificationDetails(index, projectName, taskName)

  checkActioneer(index, eventActioneerNameDisplayed)

  checkTaskName(index, taskName)

  checkNotificationStatementContains(
    index,
    homeInbox ? 'You were removed from this task' : 'from the task team'
  )
}

export function checkTaskDateNotification(
  index,
  projectName,
  taskName,
  eventActioneerNameDisplayed,
  expectedText,
  homeInbox = false
) {
  checkCommonNotificationDetails(index, projectName, taskName)

  checkActioneer(index, eventActioneerNameDisplayed, homeInbox)

  checkTaskName(index, taskName)

  checkNotificationStatementContains(index, expectedText)
}

export function checkTaskMoveNotification(
  index,
  projectName,
  taskName,
  eventActioneerNameDisplayed,
  expectedStatement
) {
  checkCommonNotificationDetails(index, projectName, taskName)

  checkActioneer(index, eventActioneerNameDisplayed)

  checkTaskName(index, taskName)

  checkNotificationStatement(index, expectedStatement)
}

export function checkTaskCreationNotification(
  index,
  projectName,
  taskName,
  eventActioneerNameDisplayed
) {
  checkCommonNotificationDetails(index, projectName)

  checkActioneer(index, eventActioneerNameDisplayed)

  checkTaskName(index, taskName)

  checkNotificationStatement(index, 'created task')
}

function checkNotificationStatementContains(index, statement) {
  it(`Notification ${index} should render statement containing "${statement}"`, () => {
    getNotification(index)
      .find('[data-test=notification-statement]')
      .should('contain', statement)
  })
}

export function checkNoteCreationNotification(
  index,
  projectName,
  taskName,
  eventActioneerNameDisplayed,
  homeInbox = false
) {
  checkCommonNotificationDetails(index, projectName)

  checkActioneer(index, eventActioneerNameDisplayed, homeInbox)

  checkTaskName(index, taskName)

  checkNotificationStatement(
    index,
    homeInbox ? 'New post created: a new note' : 'added a note: a new note'
  )
}

export function checkNoteFinalisedNotification(
  index,
  projectName,
  taskName,
  eventActioneerNameDisplayed,
  homeInbox = false
) {
  checkCommonNotificationDetails(index, projectName)

  checkActioneer(index, eventActioneerNameDisplayed, homeInbox)

  checkTaskName(index, taskName)
}

function checkNotificationStatement(index, statement) {
  it(`Notification ${index} should render statement "${statement}"`, () => {
    getNotification(index)
      .find('[data-test=notification-statement]')
      .should('have.text', statement)
  })
}

export const checkTaskNameInNotification = (index, taskName) => {
  getNotification(index)
    .find('[data-test=notification-task-name]')
    .should('have.text', taskName)
}

export const checkNotificationTaskNames = results => {
  for (let i = 0; i < results.length; i++) {
    checkTaskNameInNotification(i, results[i])
  }
}

function checkTaskName(index, taskName) {
  it(`Notification ${index} should render task Name "${taskName}"`, () => {
    getNotification(index)
      .find('[data-test=notification-task-name]')
      .should('have.text', taskName)
  })
}

export const checkActioneer = (
  index = 0,
  eventActioneerNameDisplayed = false,
  homeInbox = false
) => {
  if (homeInbox) {
    it('should not show actioneer in home inbox', () => {
      getNotification(index)
        .find('[data-test=notification-actioneer]')
        .should('not.exist')
    })
  } else if (!eventActioneerNameDisplayed) {
    it(`Notification ${index} should render actioneer 'You'`, () => {
      getNotification(index)
        .find('[data-test=notification-actioneer]')
        .should('have.text', 'You')
    })
  }
}

function checkCommonNotificationDetails(index, projectName) {
  it(`Notification ${index} should render a subheading`, () => {
    getNotification(index)
      .find('[data-test=inbox-notification-subheading]')
      .should('be.visible')
  })
  if (projectName) {
    it(`Notification ${index} should render a project name ${projectName}`, () => {
      getNotification(index)
        .find('[data-test=inbox-notification-subheading]')
        .should('contain', projectName)
    })
  } else {
    it(`Notification ${index} should NOT render a project name`, () => {
      getNotification(index)
        .find('[data-test=notification-item-project]')
        .should('have.length', 0)
    })
  }
}

export function getNotification(index) {
  return cy
    .get('[data-test=inbox-notification-list]')
    .find('[data-test=inbox-notification]')
    .eq(index)
    .scrollIntoView()
}

export function checkNotificationCountsForUsers(visitHome, getUser, counts) {
  Object.keys(counts).forEach(k => {
    describe(`When viewing the home page as a ${k}`, () => {
      before(() => {
        cy.login(getUser(k).username)
        visitHome()
      })

      checkNotificationCount(counts[k])
    })
  })
}

export const checkInboxHeader = (title, filterSelection, partialMatchTitle) => {
  it(`Should display the header with title [${title}] and filter [${filterSelection}]`, () => {
    cy.get('[data-test=inbox-title]').should('be.visible')

    if (partialMatchTitle) {
      cy.get('[data-test=inbox-title]').should('contain.text', title)
    } else {
      cy.get('[data-test=inbox-title]').should('have.text', title)
    }

    cy.get('[data-test=selector-label]').should('be.visible')
    cy.get('[data-test=selector-label]').should('have.text', 'Inbox View')

    cy.get('[data-test=person-filter-selected-text]').should('be.visible')

    if (filterSelection) {
      cy.get('[data-test=person-filter-selected-text]').should(
        'contains.text',
        filterSelection
      )
    }
  })
}
