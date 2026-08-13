const moveDialog = {
  get: {
    destinationProjectTextField: () =>
      cy.get('[data-test=project-select-container] Input'),
    destinationTextField: () => cy.get('[data-test=task-select-base] Input'),
    destinationSelectionDropdown: () =>
      cy.get('[data-test=destination-selection-dropdown]', { timeout: 30000 }),
    destinationPrompt: () => cy.get('[data-test=destination-selection-prompt]'),
    moveButton: () => cy.get('[data-test=action-dialog-button]'),
    cancelButton: () => cy.get('[data-test=cancel-dialog-button]'),
    validationMessage: () =>
      cy.get('[data-test=move-dialog-validation-message]'),
    dialogTitle: () => cy.get('[data-test=dialog-header-title-text]'),
    destinationOption: {
      levelA: () => cy.get('[data-test=destination-level-a]'),
      newTask: () => cy.get('[data-test=destination-subtask-of]'),
      newProject: () => cy.get('[data-test=destination-another-project]'),
    },
  },
}

const optionMenu = {
  get: {
    menuButton: () => cy.get('[data-test=task-content-header-menu-button]'),
    moveMenuItem: () => cy.get('[data-test=task-card-option-menu-move]'),
    copyMenuItem: () => cy.get('[data-test=task-card-option-menu-copy]'),
    renameItem: () => cy.get('[data-test=menu-text-rename]'),
    downloadItem: () => cy.get('[data-test=menu-text-downloadword]'),
  },
}

const taskDates = {
  get: {
    actualStartDate: () =>
      cy.get('[data-test=actual-start-date]', { timeout: 10000 }),
    actualEndDate: () => cy.get('[data-test=actual-end-date]'),
    plannedStartDate: () => cy.get('[data-test=planned-start-date]'),
    plannedEndDate: () => cy.get('[data-test=planned-end-date]'),
  },
}

const noteDetails = {
  get: {
    name: () => cy.get('[data-test=note-details-name] [data-test=read-field]'),
    content: () =>
      cy.get('[data-test=notes-content-read-field]', { timeout: 30000 }),
    noteEditor: () =>
      cy.get('[data-test=notes-content-edit-field]').find('[contenteditable]'),
    detailDate: () => cy.get('[data-test=note-details-modified-date]'),
    finaliseButton: () => cy.get('[data-test=finalise-button]'),
    noteContentMenu: () =>
      cy.get('[data-test=task-content-header-menu-button]', { timeout: 10000 }),
    noteContentPlaceholder: () =>
      cy.get('[data-test=notes-content-placeholder]'),
    taskContentMenu: () =>
      cy.get('[data-test=task-content-header-menu-button]'),
    noteOptionMenu: () => cy.get('[data-test=task-note-option-menu]'),

    downloadWord: () => cy.get('[data-test=task-note-download-word]'),
    contentEditor: () =>
      cy
        .get('[data-test=note-editor-container]')
        .find('[data-test=edit-field]')
        .find('textarea')
        .eq(2),
    nameEditor: () =>
      cy
        .get('[data-test=note-details-name]')
        .find('[data-test=edit-field]')
        .find('input'),
    privacyControls: {
      switch: () => cy.get('[data-test=note-detail-private-switch]'),
      label: () => cy.get('[data-test=post-visible-to]'),
      advisoryLabel: () =>
        cy.get('[data-test=note-detail-privacy-advisory-label]'),
      icon: () => cy.get('[data-test=note-listitem-private]'),
      button: () => cy.get('[data-test=post-privacy-button]'),
      publicButton: () =>
        cy.get('[data-test=post-privacy-dropdown-set-public]'),
      privateButton: () =>
        cy.get('[data-test=post-privacy-dropdown-set-private]'),
    },
    url: {
      link: () => cy.get('[data-test=read-edit-url-link]'),
      editButton: () => cy.get('[data-test=task-link-url-edit-button]'),
      editTextField: () => cy.get('[data-test=edit-field]'),
    },
    postCloseButton: () =>
      cy.get('[data-test=task-content-header-menu-close-button]'),
  },
}

const taskContentHeader = {
  get: {
    header: () => cy.get('[data-test=task-content-header]'),
    taskName: () => cy.get('[data-test=task-name-content-header]'),
    menuButton: () => cy.get('[data-test=task-content-header-menu-button]'),
    backButton: () => cy.get('[data-test=task-content-back-header]'),
  },
}

const people = {
  followers: {
    get: {
      button: () => cy.get('[data-test=followers-button]'),
    },
  },
}

const postAuthors = {
  get: {
    postPeople: () => cy.get('[data-test=post-people-people-manager]'),
    addAuthor: () => cy.get('[data-test=post-people-add-people-button]'),
    author: user =>
      cy.get(`[data-test=user-avatar-${user.firstname}-${user.lastname}]`),
    avatar: () => cy.get('[data-test=post-people-users-control-avatar]'),
    searchMatterPeople: () => cy.get('[data-test=team-search]'),
    searchItem: () => cy.get('[data-test=search-result-list-item]'),
  },
}
const meetingAttendees = {
  get: {
    container: () => cy.get('[data-test=meeting-note-people-people-manager]'),
    addAttendee: () =>
      cy.get('[data-test=meeting-note-people-add-people-button]', {
        timeout: 30000,
      }),
    removeAttendee: () => cy.get('[data-test=delete-icon]'),
    attendee: firstName => cy.get(`[data-test=user-avatar-${firstName}]`),
    avatar: () =>
      cy.get('[data-test=meeting-note-people-users-control-avatar]'),
    searchMatterPeople: () => cy.get('[data-test=team-search]'),
    searchItem: () => cy.get('[data-test=search-result-list-item]'),
    listName: () => cy.get('[data-test=meeting-note-people-user-avatar-name]'),
  },
}

export default {
  get: {
    jurNumber: () => cy.get('[data-test=task-header-jur-number]'),
    milestoneIcon: () => cy.get('[data-test=milestone-icon]'),
    taskCard: () => cy.get('[data-test=task-card-top-bar]'),
    taskCardContent: () => cy.get('[data-test=task-name-full-panel]'),
    optionMenuButton: () => cy.get('[data-test=task-card-option-menu-button]'),
    templateOptionMenuButton: () =>
      cy.get('[data-test=template-card-option-menu-button]', {
        timeout: 30000,
      }),
    taskDetailName: () => cy.get('[data-test=read-field]', { timeout: 12000 }),
    taskDetailNameInput: () =>
      cy
        .get('[data-test=edit-field]')
        .find('textarea')
        .not('[aria-hidden]')
        .first(),
    noteDetailName: () => cy.get('[data-test=note-details-name]'),
    taskLevel: () => cy.get('[data-test=task-level-letter]').eq(-1),
    taskLevels: () => cy.get('[data-test=task-level-letter]'),
    taskReferenceNumberOnCard: () =>
      cy.get('[data-test=task-header-jur-number]'),
    taskReferenceText: () => cy.get('[data-test=task-reference-text]'),
    taskNameFullPanel: () => cy.get('[data-test=task-name-full-panel]'),
    subTasks: () => cy.get('[data-test=task-cell-test]', { timeout: 60000 }),
    notStartedSubTasks: () =>
      cy.get('[data-test=not-started-tasks] [data-test=task-cell-test]'),
    mobilePostListDrawer: () => cy.get('[data-test=mobile-post-drawer-header]'),
    taskNoteListItems: () =>
      cy.get('[data-test=note-listitem-name]', { timeout: 30000 }),
    taskNoteListItemsCreators: () =>
      cy.get('[data-test=note-listitem-creator]'),
    taskNoteListItemsCreationDate: () =>
      cy.get('[data-test=note-listitem-creation-date]'),
    taskNoteListItemsFinalisedDate: () =>
      cy.get('[data-test=note-listitem-finalised-date]'),
    noNotesPrompt: () => cy.get('[data-test=zero-state-title]'),
    noNotesCaption: () => cy.get('[data-test=zero-state-caption]'),
    noNoteSelectedDetailPrompt: () =>
      cy.get('[data-test=no-note-selected-detail-prompt]'),
    subtaskAddButton: () => cy.get('[data-test=create-subtask-button]'),
    editDescription: () => cy.get('[data-test=task-description-edit-button]'),
    descriptionField: () => cy.get('[data-test=task-description]'),
    descriptionZeroStatePlaceholder: () =>
      cy
        .get('[data-test=task-description]', { timeout: 30000 })
        .find('[data-test=zero-state-placeholder]', { timeout: 30000 }),
    saveButton: () => cy.get('[data-test=save-post-button]'),
  },
  postAuthors: postAuthors,
  meetingAttendees: meetingAttendees,
  moveDialog: moveDialog,
  optionMenu: optionMenu,
  noteDetails: noteDetails,
  taskContentHeader: taskContentHeader,
  people: people,
  taskDates: taskDates,
}
