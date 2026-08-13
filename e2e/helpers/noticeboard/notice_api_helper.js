export default function createNotice(title, subtitle) {
  const fileName = 'image.svg'
  return cy.readFile(`cypress/fixtures/${fileName}`).then(str => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    let url = `${Cypress.env('serverBaseUrl')}/noticeboard/notice`
    let file = new File([str], fileName, { type: 'image/svg+xml' })
    let formData = new FormData()
    formData.append('title', title)
    formData.append('subtitle', subtitle)
    formData.append('file', file)
    return cy.form_request(url, formData)
  })
}
