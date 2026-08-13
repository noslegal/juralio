/* eslint-disable import/prefer-default-export */
export const get = {
  startTimelineLabel: () => cy.get('[data-test=divider-label-start]'),
  endTimelineLabel: () => cy.get('[data-test=divider-label-end]'),
  todayLabel: () => cy.get('[data-test=today-label]'),
  taskPin: () => cy.get('[data-test=roadmap-task-pin]'),
  startPin: () => cy.get('[data-test=roadmap-start-pin]'),
  endPin: () => cy.get('[data-test=roadmap-end-pin]'),
  pinBridge: () => cy.get('[data-test=pin-bridge]'),
  datePickerStart: () => cy.get('[data-test=task-cell-date-picker-start]'),
  datePickerEnd: () => cy.get('[data-test=task-cell-date-picker-end]'),
  inProgressDatesDisplay: () => cy.get('[data-test=in-progress-display]'),
  tasks: () => cy.get('[data-test=task-cell-test  ]'),
  zerostateTitle: () => cy.get('[data-test=roadmap-zero-state-title]'),
  zerostateCaption: () => cy.get('[data-test=roadmap-zero-state-caption]'),
  miniMap: () => cy.get('[data-test=roadmap-minimap]'),
  miniMapMaximized: () => cy.get('[data-test=roadmap-minimap-maximized]'),
  miniMapMinimized: () => cy.get('[data-test=roadmap-minimap-minimized]'),
  levelIndicator: level => cy.get(`[data-test=level-inidcator-level-${level}]`),
  expandTask: () => cy.get('[data-test=expand-task-clickable-area]'),
  expandTaskActionText: () => cy.get('[data-test=expand-task-action-text]'),
  timePeriodPicker: () => cy.get('[data-test=roadmap-time-period-picker]'),
  timePeriodPickerPreviousButton: () =>
    cy.get('[data-test=time-period-previous-button]'),
  timePeriodPickerNextButton: () =>
    cy.get('[data-test=time-period-next-button]'),
  timePeriodPickerCurrentSelection: () =>
    cy.get('[data-test=time-picker-current-selection]'),
  timePeriodPickerPopover: () =>
    cy.get('[data-test=time-period-picker-popover]'),
  timePeriodPickerPopoverOption: () =>
    cy.get('[data-test=time-period-picker-option]'),
  expandAllButton: () =>
    cy.get('[data-test=roadmap-expand-collapse-button-collapsed]'),
  collapseAllButton: () =>
    cy.get('[data-test=roadmap-expand-collapse-button-expanded]'),
  pointRightChevronText: () => cy.get('[data-test=point-right-chevron-text]'),
  pointLeftChevronText: () => cy.get('[data-test=point-left-chevron-text]'),
  viewPort: () => cy.get('[data-test=roadmap-viewport]'),
  tasksWrapper: () => cy.get('[data-test=roadmap-tasks]'),
}
