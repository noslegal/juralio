import taskdetail_page from '../../page/taskdetail/taskdetail_page'

export default {
  checkNoteDetails(name, creationDate, description) {
    it('should render the task details name', () => {
      taskdetail_page.noteDetails.get.name().should('contain', name)
    })

    if (description) {
      it('should render the task details creation description', () => {
        taskdetail_page.noteDetails.get.content().should('contain', description)
      })
    }
  },

  checkAuthorDetails() {
    it('should display the authors panel', () => {
      taskdetail_page.postAuthors.get.postPeople().should('be.visible')
    })
  },

  checkAuthorCount(expectedCount) {
    it(`should have ${expectedCount} post authors`, () => {
      cy.get('body').click()
      taskdetail_page.postAuthors.get.postPeople().click(20, 20)
      cy.wait(1000)
      cy.get('[data-test=user-list-item]', { timeout: 30000 }).should(
        'have.length',
        expectedCount
      )
      cy.get('body').click()
    })
  },

  checkNoteCount(expectedCount) {
    it(`should have ${expectedCount} notes`, () => {
      cy.get('[data-test=note-listitem-name]', { timeout: 30000 }).should(
        'have.length',
        expectedCount
      )
    })
  },

  checkPrivacySwitchAndLabelisPrivateToUser(skipAdvisoryText) {
    it('should display the label "This post can only be seen by its editors and viewers"', () => {
      taskdetail_page.noteDetails.get.privacyControls
        .label()
        .should(
          'have.text',
          'This post can only be seen by its editors and viewers'
        )
    })

    if (!skipAdvisoryText) {
      it('should display the advisory text "This post can only be seen by its editors and viewers"', () => {
        taskdetail_page.noteDetails.get.privacyControls
          .label()
          .should(
            'have.text',
            'This post can only be seen by its editors and viewers'
          )
      })
    }

    it('should display the private chip', () => {
      taskdetail_page.noteDetails.get.privacyControls
        .icon()
        .should('be.visible')
    })

    it('should have the switch in the ON position', () => {
      taskdetail_page.noteDetails.get.privacyControls
        .button()
        .should('have.text', 'Restricted')
    })

    it('should have the private chip shown in the Note list item', () => {
      taskdetail_page.get
        .taskNoteListItems()
        .eq(0)
        .get('[data-test=note-listitem-private]')
        .should('have.length', 1)
    })
  },

  //For templates and overview.
  checkPrivacySwitchIsNotPresent() {
    it('should not have the private chip shown in the Note list item', () => {
      taskdetail_page.get
        .taskNoteListItems()
        .eq(0)
        .get('[data-test=note-listitem-private]')
        .should('have.length', 0)
    })

    it('should NOT display the private chip on not details', () => {
      cy.get('[data-test=post-privacy-button]').should('not.exist')
    })
  },

  checkPrivacySwitchAndLabelisMatterTeamViewable() {
    it('should display the label "Set to private"', () => {
      taskdetail_page.noteDetails.get.privacyControls
        .button()
        .should('contain.text', 'Visible')
    })

    it('should display the advisory text "Everyone in this matter can see this post"', () => {
      taskdetail_page.noteDetails.get.privacyControls
        .label()
        .should(
          'have.text',
          'This post can only be seen by its editors and viewers'
        )
    })

    it('should NOT display the private chip ', () => {
      taskdetail_page.noteDetails.get.privacyControls.icon().should('not.exist')
    })

    it('the Matter Team Viewable status is persisted so should NOT display the private chip', () => {
      taskdetail_page.noteDetails.get.privacyControls.icon().should('not.exist')
    })

    it('should NOT have the private chip shown in the Note list item', () => {
      taskdetail_page.get
        .taskNoteListItems()
        .eq(0)
        .get('[data-test=note-listitem-private]')
        .should('have.length', 0)
    })
  },
  addAuthor: (text, index = 1) => {
    cy.get('[data-test=team-search] input')
      .eq(0)
      .click({ force: true })
      .type(text)
    cy.backendRoute('POST', 'matter/*/workstreams/*/task/*/post/*/authors').as(
      'add'
    )
    taskdetail_page.postAuthors.get.searchItem().first().click()
    cy.wait('@add')
  },
}
