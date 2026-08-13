import { get } from '../../page/users/user-details-dialog-page'

export const enterFirstname = (value) => get.firstNameInput().input().clear().type(value)

export const enterLastname = (value) => get.lastNameInput().input().clear().type(value)

export const checkMatterCreatorRole = () => {
  get.matterCreatorCheckbox().check()
  get.matterCreatorCheckbox().should('be.checked')
}

export const checkOrgAdminRole = () => get.orgAdminCheckbox().check()

export const uncheckMatterCreatorRole = () => get.matterCreatorCheckbox().uncheck()

export const assertAvatarTextCorrect = (userDetails) => cy.get(`[data-test=${userDetails.firstname}-${userDetails.lastname}]`).should('exist')

export const assertDialogContentsCorrect = (user, organisation) => {
  get.dialog().should('be.visible')

  //Save button
  get.saveButton().should('be.enabled')

  //Email
  if (user.isThirdPartyUser) {
    get
      .emailInput()
      .input()
      .should('be.disabled')
      .should('have.value', user.username)
  } else {
    get
      .emailInput()
      .input()
      .should('be.enabled')
      .should('have.value', user.username)
  }
  //First name
  get.firstNameInput().input().should('have.value', user.firstname)
  //Last name
  get.lastNameInput().input().should('have.value', user.lastname)

  get
    .organisationSelectorInput()
    .input()
    .should('have.value', organisation ? `${organisation.id}` : 'NONE')
  //Avatar
  assertAvatarTextCorrect(user)
}

export const assertCheckedRolesCorrect = (roles) => {
  const hasRole = (role) => roles && roles.indexOf(role) > -1
  const getMatcher = (shouldBeChecked) => (shouldBeChecked ? 'be.checked' : 'not.be.checked')

  get.matterCreatorCheckbox().should(getMatcher(hasRole('ROLE_MATTER_CREATOR')))
  get.orgAdminCheckbox().should(getMatcher(hasRole('ROLE_ORG_ADMIN')))
}

export const assertRequiredValidationBlocksSubmission = () => {
  const assertFieldValidationApplied = (field) => {
    //Clear text
    field.input().clear()
    //Ensure validation shown
    field
      .validationMessage()
      .should('be.visible')
      .should('have.text', 'This field is required')

    //Ensure save button disabled
    get.saveButton().should('be.disabled')
    //Re-enter some text
    field.input().type('Test')
    //Ensure save button enabled
    get.saveButton().should('be.enabled')
  }

  assertFieldValidationApplied(get.firstNameInput())
  assertFieldValidationApplied(get.lastNameInput())
}
