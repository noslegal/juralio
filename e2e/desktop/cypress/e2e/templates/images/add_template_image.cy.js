import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

const newTemplateName = nameGenerator.generate().spaced
describe('add_template_image.cy', () => {
  let user, fixture, newTemplate
  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_list_display.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [{}, { tasks: [{}, {}] }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })
  describe('when visiting a template ', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
      })
      visitHelpers.visitTemplates()
      cy.get('[data-test=template]').eq(0).click()
      cy.wait(5000)
    })
    it('should show the add image button', () => {
      cy.get('[data-test=template-options-button]').eq(1).click()
      cy.get('[data-test=add-image]', { timeout: 30000 }).should('be.visible')
    })
  })
  describe('when using the image searcher', () => {
    before(() => {
      cy.get('[data-test=add-image]').click()

      cy.intercept(
        {
          method: 'GET',
          url:
            'http://localhost:8080/services/unsplashproxy/search/photos?query=foxes&per_page=10&page=2&orientation=landscape',
        },
        {
          body: {
            total: 5,
            totalPages: 1,
            results: [
              {
                id: 1,
                urls: {
                  thumb:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  regular:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                },
                user: {
                  name: 'artist name',
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                },
                links: {
                  html:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  download_location:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                },
              },
              {
                id: 2,
                urls: {
                  thumb:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  regular:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                },
                user: {
                  name: 'artist name',
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                },
                links: {
                  html:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  download_location:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                },
              },
              {
                id: 3,
                urls: {
                  thumb:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  regular:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                },
                user: {
                  name: 'artist name',
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                },
                links: {
                  html:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  download_location:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                },
              },
              {
                id: 4,
                urls: {
                  thumb:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  regular:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                },

                user: {
                  name: 'artist name',
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                },
                links: {
                  html:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  download_location:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                },
              },
              {
                id: 5,
                urls: {
                  thumb:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  regular:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                },
                user: {
                  name: 'artist name',
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                },
                links: {
                  html:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  download_location:
                    'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                },
              },
            ],
          },
        }
      )
      cy.get('[data-test=unsplash-search-bar]').find('input').type('foxes')
      cy.wait(1000) //there is a debounce on this
    })
    it('should show some results', () => {
      cy.get('[data-test=unsplash-image]', { timeout: 30000 }).should(
        'have.length',
        5
      )
    })
    describe('when selecting an image', () => {
      before(() => {
        cy.get('[data-test=unsplash-image]', { timeout: 30000 }).eq(0).click()
      })
      it('should be displayed on the page', () => {
        cy.get('[data-test=background-preview]').should('be.visible')
      })
    })
    describe('when viewingthe template gallery', () => {
      before(() => {
        cy.login(user.username)

        visitHelpers.visitTemplates()
      })
      it('should show the image', () => {
        cy.get('[data-test=template]')
          .eq(0)
          .should('have.css', 'background-image')
      })
    })
    describe('when updating the image', () => {
      before(() => {
        cy.get('[data-test=template]').eq(0).click()
        cy.wait(5000)
        cy.get('[data-test=template-options-button]').eq(1).click()
        cy.get('[data-test=add-image]').click()

        cy.intercept(
          {
            method: 'GET',
            url:
              'http://localhost:8080/services/unsplashproxy/search/photos?query=foxes&per_page=10&page=2&orientation=landscape',
          },
          {
            body: {
              total: 5,
              totalPages: 1,
              results: [
                {
                  id: 1,
                  urls: {
                    thumb:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    regular:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  user: {
                    name: 'artist name',
                    links: {
                      html:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                      download_location:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    },
                  },
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                },
                {
                  id: 2,
                  urls: {
                    thumb:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    regular:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  user: {
                    name: 'artist name',
                    links: {
                      html:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                      download_location:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    },
                  },
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                },
                {
                  id: 3,
                  urls: {
                    thumb:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    regular:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  user: {
                    name: 'artist name',
                    links: {
                      html:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                      download_location:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    },
                  },
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                },
                {
                  id: 4,
                  urls: {
                    thumb:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    regular:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  user: {
                    name: 'artist name',
                    links: {
                      html:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                      download_location:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    },
                  },
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                },
                {
                  id: 5,
                  urls: {
                    thumb:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    regular:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  user: {
                    name: 'artist name',
                    links: {
                      html:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                      download_location:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    },
                  },
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                },
              ],
            },
          }
        )
        cy.get('[data-test=unsplash-search-bar]').find('input').type('foxes')
        cy.wait(1000) //there is a debounce on this
        cy.get('[data-test=unsplash-image]', { timeout: 30000 }).eq(0).click()
      })
      it('should be displayed on the page', () => {
        cy.get('[data-test=background-preview]').should('be.visible')
      })
    })
    describe('when searcing by image tag', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitTemplates()
        cy.get('[data-test=template]').eq(0).click()
        cy.wait(5000)
        cy.get('[data-test=template-options-button]').eq(1).click()
        cy.get('[data-test=add-image]').click()

        cy.intercept(
          {
            method: 'GET',
            url:
              'http://localhost:8080/services/unsplashproxy/search/photos?query=foxes&per_page=10&page=2&orientation=landscape',
          },
          {
            body: {
              total: 5,
              totalPages: 1,
              results: [
                {
                  id: 1,
                  urls: {
                    thumb:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    regular:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  user: {
                    name: 'artist name',
                    links: {
                      html:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                      download_location:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    },
                  },
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  tags: [{ title: 'fakeTag' }],
                },
                {
                  id: 2,
                  urls: {
                    thumb:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    regular:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  user: {
                    name: 'artist name',
                    links: {
                      html:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                      download_location:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    },
                  },
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },

                  tags: [{ title: 'fakeTag' }],
                },
                {
                  id: 3,
                  urls: {
                    thumb:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    regular:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  user: {
                    name: 'artist name',
                    links: {
                      html:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                      download_location:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    },
                  },
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  tags: [{ title: 'fakeTag' }],
                },
                {
                  id: 4,
                  urls: {
                    thumb:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    regular:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  user: {
                    name: 'artist name',
                    links: {
                      html:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                      download_location:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    },
                  },
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  tags: [{ title: 'fakeTag' }],
                },
                {
                  id: 5,
                  urls: {
                    thumb:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    regular:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  user: {
                    name: 'artist name',
                    links: {
                      html:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                      download_location:
                        'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    },
                  },
                  links: {
                    html:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                    download_location:
                      'https://unsplash.com/photos/q/download?ixid=q&force=true&w=640',
                  },
                  tags: [{ title: 'fakeTag' }],
                },
              ],
            },
          }
        )
        cy.get('[data-test=unsplash-search-bar]').find('input').type('foxes')
        cy.wait(1000) //there is a debounce on this
        cy.get('[data-test=unsplash-image]', { timeout: 30000 }).eq(0).click()
        visitHelpers.visitTemplates()
        cy.get('[data-test=search-filter]').find('input').type('fakeTag')
        cy.wait(1000) //there is a debounce on this
      })
      it('should filter by the tag', () => {
        cy.get('[data-test=template]').should('have.length', 1)
      })
    })
  })
})
