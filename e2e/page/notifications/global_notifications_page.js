const selectors = {
  BUTTON: '[data-test=notifications-header-navigation-button]',
  CHIP: '[data-test=notification-chip]',
  GLOBAL_NOTIFICATION: '[data-test=global-notification]',
  NOTIFICATION_BODY: '[data-test=global-notification-body]',
  NOTIFICATION_TITLE: '[data-test=global-notification-title]',
  ZERO_STATE: '[data-test=notifications-list-zero-state]',
}
export default {
  selectors: {
    ...selectors,
  },
  get: {
    notificationChip: () => cy.get(selectors.CHIP),
    notificationButton: () => cy.get(selectors.BUTTON),
    notifications: () => cy.get(selectors.GLOBAL_NOTIFICATION),
    zeroState: () => cy.get(selectors.ZERO_STATE),
    unreadNotifications: () => cy.get('[data-test=unread-notifications]'),
    readNotifications: () => cy.get('[data-test=read-notifications]'),
  },
}
