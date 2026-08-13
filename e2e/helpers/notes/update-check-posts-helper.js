import taskdetail_page from '../../page/taskdetail/taskdetail_page'
import noteDetailsHelper from './notes-helper'

const postDetails = taskdetail_page.noteDetails

export function updateAndCheckPostDetails() {
  it('should show the created post', () => {
    cy.get('[data-test=note-list-item-selected]').should('have.length', 1)
  })
  noteDetailsHelper.checkPrivacySwitchIsNotPresent()
  describe('when post name is edited to blank', () => {
    before(() => {
      cy.wait(5000) //Avoid snackbar
      postDetails.get.name().click('left')
      cy.wait(1000)
      postDetails.get
        .nameEditor()
        .type('{selectall}')
        .type(' {backspace}')
        .type('{enter}')
    })
    it('should show validation message "This field is required."', () => {
      cy.get('[data-test=edit-field]').contains('This field is required')
    })
    describe('when post name is entered', () => {
      before(() => {
        postDetails.get.nameEditor().type('Updated post name').type('{enter}')
      })
      noteDetailsHelper.checkNoteDetails(
        'Updated post name',
        'Last updated: Today',
        ''
      )
      it('Check that post list item has updated the name', () => {
        taskdetail_page.get
          .taskNoteListItems()
          .eq(0)
          .should('have.text', 'Updated post name')
      })

      describe('When post content added', () => {
        before(() => {
          cy.wait(1000)
          postDetails.get.noteEditor().type('Hello world!')
        })
        it('should display the note content', () => {
          postDetails.get.noteEditor().contains('Hello world!')
          cy.wait(5000)
          cy.get('[data-test=home]').click()
          cy.go('back')
        })
      })
    })
  })
}

export function checkPostDetails() {
  it('should display the note content', () => {
    postDetails.get.content().should('have.text', 'Hello world!')
  })
  noteDetailsHelper.checkNoteDetails(
    'Updated post name',
    'Last updated: Today',
    ''
  )
  it('should have the correct name in post list item', () => {
    taskdetail_page.get
      .taskNoteListItems()
      .eq(0)
      .should('have.text', 'Updated post name')
  })
}
