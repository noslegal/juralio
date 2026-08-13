import { setupOrganisationWithMatter } from '../../../../helpers/labels/setup-organisation-with-matter'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'

const cert = `-----BEGIN CERTIFICATE-----
MIID6DCCAtCgAwIBAgIUaZP8+PgmMkssQB0ZJtspaMqE9qEwDQYJKoZIhvcNAQEF
BQAwSTEUMBIGA1UECgwLSnVyYWxpbyBMdGQxFTATBgNVBAsMDE9uZUxvZ2luIElk
UDEaMBgGA1UEAwwRT25lTG9naW4gQWNjb3VudCAwHhcNMjIwMzA0MTAwMTQxWhcN
MjcwMzA0MTAwMTQxWjBJMRQwEgYDVQQKDAtKdXJhbGlvIEx0ZDEVMBMGA1UECwwM
T25lTG9naW4gSWRQMRowGAYDVQQDDBFPbmVMb2dpbiBBY2NvdW50IDCCASIwDQYJ
KoZIhvcNAQEBBQADggEPADCCAQoCggEBALa3s/ew5ny/tb5XAJcCzP05lmGX2VAx
vwUCu/dr7kH1+ZZ6oj4b2Sft4K3csiWeTWqXK86tGtEuzmy2jc8iw9SDxosNNKHO
8Hme3Q1mGfTvIJVESf2saGqsP5FNKEv4CgtE1PhKxDttdjDz8qYrLldYPdfpeoyi
xSqWdrXd2rustSJn4TpsobRduH8DHLVKRSL/LSklV+1vSdLuVAUHzrK7ek1xKOT9
+X7Y2aUXtvpsSiYrL7sJrrNn0HdrWtZcwNWn1gZH+XFpf2b0kwsCObeNwfZ5WUQp
Prb5k8QMJvVsZc3PZUUxIvzEeT3d/ensAPhzeHH51Av2XU0Kmnjx+KUCAwEAAaOB
xzCBxDAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBRPmH5WG2SJUV5XKvR5a3lBqLoX
djCBhAYDVR0jBH0we4AUT5h+VhtkiVFeVyr0eWt5Qai6F3ahTaRLMEkxFDASBgNV
BAoMC0p1cmFsaW8gTHRkMRUwEwYDVQQLDAxPbmVMb2dpbiBJZFAxGjAYBgNVBAMM
EU9uZUxvZ2luIEFjY291bnQgghRpk/z4+CYySyxAHRkm2yloyoT2oTAOBgNVHQ8B
Af8EBAMCB4AwDQYJKoZIhvcNAQEFBQADggEBAFtDavUS5UJ7pUvf7cwKUTNeCYu4
hWe9/xaCS6lzrO3zE1YMKuDut5WRHG2ZBBLgkAy6+1ID8Hj3lmj0CPhx8vMfeeiQ
xtUwjF4kMeWMNq52pLF5pSDYRXalyDndJyIhigoY2a2OkLox8YKJC0Chwg1at/+I
2P6TrN4cZE8L1z7WNDbQFvIfWDv8UR8EjUag+xYWZYRmXjGuEqz9cLHywM5Y54Cr
OLz6PHiFEujLER4L9W/nmdnmIiFHPAR/mgQC4rXVmTQeZ2QyR6eLeSZa6ziztlq1
f1pEJEkIFZ/7Xa9rQA4wZmaH+PlSnF623v8OIhtsCMyob4CqaAWc3HNn80M=
-----END CERTIFICATE-----`

let fixture, appPage, orgAdminUser, task
const visitHelpers = new VisitHelpers()
//set up saml with settings and use them to test user creation & update
describe('saml_settings.cy', () => {
  before(() => {
    setupOrganisationWithMatter().then(result => {
      organisation = result.organisationLabels.body
      orgAdminUser = result.orgAdminUser
      orgMC = result.orgMC
      fixture = result.fixture
      appPage = result.appPage
    })
    cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
      //clear saml settings
      cy.apiSpecRequest({
        url: '/api/admin/saml/settings',
        method: 'PATCH',
        body: {
          identityProviderEntityId: '',
          identityProviderSsoUrl: '',
          identityProviderCertificate: '',
          serviceProviderMetaData: '',
        },
      })
    })
  })

  describe('when visitng the saml settings', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
        visitHelpers.visitHome(false)
        cy.wait(5000)
        cy.get('[data-test=instance-management]').click()
      })
      it('should not have saml configured', () => {
        cy.get('[data-test=toggle-saml-sso]').should('not.exist')
      })
    })
    describe('when editing the settings', () => {
      before(() => {
        cy.get('[data-test=saml-settings]').click()
      })
      it('should show empty fields', () => {
        cy.get('[data-test=sso-url-field]')
          .find('input')
          .should('have.text', '')
        cy.get('[data-test=idp-issuer-field]')
          .find('input')
          .should('have.text', '')
        cy.get('[data-test=cert-field]')
          .find('textarea')
          .should('have.text', '')
      })
      describe('when entering a bad sso url', () => {
        before(() => {
          cy.get('[data-test=sso-url-field]').find('input').type('not a url')
        })
        it('should throw an error', () => {
          cy.get('[data-test=sso-url-field]')
            .find('p')
            .should('have.text', 'Invalid URL')
          cy.get('[data-test=saml-save-button]').should('be.disabled')
        })
        describe('when entering a bad idp issuer', () => {
          before(() => {
            cy.get('[data-test=idp-issuer-field]')
              .find('input')
              .type('not a url')
          })
          it('should throw an error', () => {
            cy.get('[data-test=idp-issuer-field]')
              .find('p')
              .should('have.text', 'Invalid Issuer URL')
            cy.get('[data-test=saml-save-button]').should('be.disabled')
          })
          describe('when entering a bad certificate', () => {
            before(() => {
              cy.get('[data-test=cert-field]')
                .find('textarea[aria-invalid=false]')
                .type('not a url')
            })
            it('should throw an error', () => {
              cy.get('[data-test=cert-field]')
                .find('p')
                .should('have.text', 'Invalid X.509 Certificate')
              cy.get('[data-test=saml-save-button]').should('be.disabled')
            })
            describe('when entering valid credentials', () => {
              before(() => {
                cy.get('[data-test=sso-url-field]')
                  .find('input')
                  .clear()
                  .type('http://google.com')
                cy.get('[data-test=idp-issuer-field]')
                  .find('input')
                  .clear()
                  .type('http://google.com')
                cy.get('[data-test=cert-field]')
                  .find('textarea[aria-invalid=true]')
                  .clear()
                  .type(`${cert}`)
              })
              it('should enable the save button', () => {
                cy.get('[data-test=saml-save-button]').should('not.be.disabled')
              })
            })
          })
        })
      })
    })
  })
})
