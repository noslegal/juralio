import globalNotificationsPage from '../../page/notifications/global_notifications_page'

const expectedStatusChangeText = {
  'In progress': 'was started',
  Done: 'was completed',
  'Not required': 'was marked as not required',
}

export const checkGlobalTaskStatusNotification = (
  index,
  taskName,
  matterName,
  expectedStatus
) => {
  checkGlobalCommonNotificationDetails(index, taskName)

  it(`Notification ${index} should render Matter details in title`, () => {
    getGlobalNotification(index)
      .find(globalNotificationsPage.selectors.NOTIFICATION_TITLE)
      .should('contain.text', matterName)
      .should('contain.text', 'M')
  })

  checkGlobalBodyText(index, taskName)

  checkGlobalNotificationStatement(
    index,
    `${taskName} ${expectedStatusChangeText[expectedStatus]}`
  )
}

export const checkGlobalNotificationCount = expectedCount => {
  if (expectedCount == 0) {
    it('should not show the notifications chip', () => {
      globalNotificationsPage.get.notifications().should('not.exist')
    })
  } else {
    const plural = expectedCount > 1 ? 's' : ''
    it(
      `should be ${expectedCount} notification${plural} on the bell`,
      { retries: { runMode: 3, openMode: 3 } },
      () => {
        globalNotificationsPage.get
          .notificationChip()
          .should('contain.text', expectedCount)
      }
    )

    describe('When opening the notifications panel', () => {
      before(() => {
        globalNotificationsPage.get.notificationButton().click()
      })
      it(`should be ${expectedCount} notification${plural} present`, () => {
        globalNotificationsPage.get
          .unreadNotifications()
          .children()
          .should('have.length', expectedCount)
      })
      after(() => {
        globalNotificationsPage.get.notificationButton().click()
      })
    })
  }
}

export const checkGlobalNotificationCounts = (
  unreadNotificationCount,
  totalNotificationCount
) => {
  let plural = unreadNotificationCount > 1 ? 's' : ''
  if (unreadNotificationCount > 0) {
    it(`should be ${unreadNotificationCount} notification${plural} on the bell`, () => {
      globalNotificationsPage.get
        .notificationChip()
        .should('contain.text', unreadNotificationCount, totalNotificationCount)
    })
  }

  plural = totalNotificationCount > 1 ? 's' : ''
  describe('When opening the notifications panel', () => {
    before(() => {
      globalNotificationsPage.get.notificationButton().click()
    })
    it(`should be ${totalNotificationCount} notification${plural} present`, () => {
      globalNotificationsPage.get
        .unreadNotifications()
        .children()
        .should('have.length', totalNotificationCount)
    })
    after(() => {
      globalNotificationsPage.get.notificationButton().click()
    })
  })
}

export const getGlobalNotification = index => {
  return globalNotificationsPage.get.notifications().eq(index).scrollIntoView()
}

export const checkGlobalCommonNotificationDetails = index => {
  it(`Notification ${index} should render a title`, () => {
    getGlobalNotification(index)
      .find(globalNotificationsPage.selectors.NOTIFICATION_TITLE)
      .should('be.visible')
  })
}

export const checkGlobalBodyText = (index, taskName) => {
  it(`Notification ${index} should render task Name "${taskName}"`, () => {
    getGlobalNotification(index)
      .find(globalNotificationsPage.selectors.NOTIFICATION_BODY)
      .should('contain.text', taskName)
  })
}

export const checkGlobalNotificationStatement = (index, statement) => {
  it(`Notification ${index} should render statement "${statement}"`, () => {
    getGlobalNotification(index)
      .find(globalNotificationsPage.selectors.NOTIFICATION_BODY)
      .should('have.text', statement)
  })
}

export const checkGlobalTaskTeamAddNotification = (index, taskName) => {
  checkGlobalCommonNotificationDetails(index)

  checkGlobalBodyText(index, taskName)

  checkGlobalNotificationStatement(index, 'You were added to ' + taskName)
}

export const checkGlobalTaskTeamRemoveNotification = (index, taskName) => {
  checkGlobalCommonNotificationDetails(index)

  checkGlobalBodyText(index, taskName)

  checkGlobalNotificationStatement(index, 'You were removed from ' + taskName)
}

export const checkGlobalNotificationCountsForUsers = (
  visitHome,
  getUser,
  counts
) => {
  Object.keys(counts).forEach(k => {
    describe(`When viewing the home page as a ${k}`, () => {
      before(() => {
        cy.login(getUser(k).username)
        visitHome()
      })

      checkGlobalNotificationCount(counts[k])
    })
  })
}

export const checkGlobalNoteFinalisedNotification = (index, noteName) => {
  checkGlobalCommonNotificationDetails(index, noteName)

  checkGlobalBodyText(index, noteName)
}
