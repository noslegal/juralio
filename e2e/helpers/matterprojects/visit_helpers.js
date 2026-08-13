/* eslint-disable class-methods-use-this */
import navigationPage from '../../page/navigation/navigation_page'

class VisitHelpers {
  // eslint-disable-next-line class-methods-use-this
  visitTaskDetails(matterId, projectId, taskId, forceWait, useWaits = true) {
    if (useWaits) {
      cy.backendRoute('/matter/*/workstreams/*/task/*').as('getTask')
      cy.backendRoute('/matter/*/workstreams/*/task/*/posts**').as(
        'getTaskPosts'
      )
    }
    let oldUrl
    cy.url().then(url => {
      oldUrl = url
    })
    cy.visit(
      '/#/matter/' + matterId + '/workstream/' + projectId + '/task/' + taskId
    )
    cy.url().then(newUrl => {
      if (oldUrl !== newUrl || forceWait) {
        if (useWaits) {
          cy.wait(3000)
          // there will only be a new backend task request if we've navigated to a different task
          //cy.wait(['@getTask', '@getTaskPosts'], { timeout: 12000 })
        }
      }
    })
  }

  visitTemplateTaskDetails(templateId, templateTaskId) {
    cy.backendRoute('/projecttemplates/*/tasks/*').as('getTemplateTask')
    cy.backendRoute('/projecttemplates/*/tasks/*/posts').as('getTemplatePosts')

    cy.visit(`/#/template/${templateId}/task/${templateTaskId}`)
    cy.wait(['@getTemplateTask', '@getTemplatePosts'])
  }

  // eslint-disable-next-line class-methods-use-this
  visitTaskMap(matterId, projectId, wait = true) {
    cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')
    cy.visit('/#/matter/' + matterId + '/workstream/' + projectId + '/taskmap')
    if (wait) {
      cy.wait(['@projectFetch'])
    }
    cy.get('[data-test=loading-map-progress]').should('not.exist')
    cy.wait(1000)
  }

  visitTaskList(matterId, projectId, wait = true) {
    cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')
    cy.visit('/#/matter/' + matterId + '/workstream/' + projectId + '/tasklist')
    if (wait) {
      cy.wait(['@projectFetch'])
    }
    cy.get('[data-test=loading-map-progress]').should('not.exist')
    cy.wait(1000)
  }

  visitMatterTaskMap(matterId) {
    cy.visit('/#/matter/' + matterId + '/taskmap')
    cy.get('[data-test=loading-map-progress]').should('not.exist')
    cy.wait(1000)
  }

  // eslint-disable-next-line class-methods-use-this
  visitMatter(matterId) {
    cy.backendRoute('/matter/*/workstreams').as('getProjects')
    cy.backendRoute('/matter/*/team*').as('getTeam')
    cy.backendRoute('/matter/*').as('getMatter')
    cy.visit(`/#/matteradmin/${matterId}`)
    cy.wait(['@getMatter'])
    cy.wait(2000)
  }

  visitMatterLabels(matterId) {
    cy.backendRoute('/matter/*/workstreams').as('getProjects')
    cy.backendRoute('/matter/*/team*').as('getTeam')
    cy.backendRoute('/matter/*').as('getMatter')
    cy.visit(`/#/matteradmin/${matterId}`)
    cy.wait(['@getMatter'])

    cy.backendRoute(
      'GET',
      `/matter/${matterId}/labels?includeHierarchicalLabels=true`
    ).as('fetchLabels')
    cy.wait(2000)
    cy.get('[data-test=labels]', { timeout: 30000 }).click({ timeout: 30000 })
    //cy.wait(['@fetchLabels'])
  }

  visitTemplateTaskMap(templateId) {
    cy.backendRoute('projecttemplates/*/tasks').as('projectTemplateTasks')
    cy.backendRoute('projecttemplates/*').as('projectTemplate')
    cy.visit(`/#/template/${templateId}/taskmap`)
    cy.get('[data-test=loading-map-progress]').should('not.exist')
    cy.wait(['@projectTemplate'])
    cy.wait(['@projectTemplateTasks'])
  }

  visitTemplateOverview(templateId) {
    cy.backendRoute('projecttemplates/*').as('projectTemplates')
    cy.visit(`/#/template/${templateId}/overview`)
    cy.get('[data-test=loading-map-progress]').should('not.exist')
    cy.wait(['@projectTemplates'])
    cy.wait(1000)
  }

  visitTemplates() {
    cy.backendRoute('/projecttemplates').as('templateFetch')

    let oldUrl
    cy.url().then(url => {
      oldUrl = url
    })
    cy.visit('/#/templates/')
    cy.url().then(newUrl => {
      if (oldUrl !== newUrl) {
        // there will only be a new backend templates request if we're going to a new page
        cy.wait('@templateFetch')
      }
    })
  }

  visitProjectTimeLine(matterId, projectId, useWaits = true) {
    if (useWaits) {
      cy.backendRoute('/usernotifications/**').as('fetchUserNotifications')
      cy.backendRoute('/todo/search**').as('fetchTodos')
    }

    cy.visit(`/#/matter/${matterId}/workstream/${projectId}/timeline`)

    if (useWaits) {
      cy.wait(['@fetchTodos', '@fetchUserNotifications'])
    }
  }

  visitMatterTimeLine(matterId, useWaits = true) {
    if (useWaits) {
      cy.backendRoute('/usernotifications/**').as('fetchUserNotifications')
      cy.backendRoute('/todo/search**').as('fetchTodos')
    }

    cy.visit(`/#/matter/${matterId}/timeline`)

    if (useWaits) {
      cy.wait(['@fetchTodos', '@fetchUserNotifications'])
    }
  }

  visitTaskTimeLine(matterId, projectId, taskId, isMobile) {
    if (!isMobile) {
      cy.backendRoute('/usernotifications/**').as('fetchUserNotifications')
      cy.backendRoute('/todo/search**').as('fetchTodos')
    }

    cy.visit(
      `/#/matter/${matterId}/workstream/${projectId}/task/${taskId}/timeline`
    )

    if (!isMobile) {
      cy.wait(['@fetchTodos', '@fetchUserNotifications'])
    }
  }

  // eslint-disable-next-line class-methods-use-this
  visitHome(wait = true) {
    cy.backendRoute('/user/*/todo**').as('fetchTodos')
    cy.backendRoute('/matters**').as('fetchMattersLimit')
    cy.visit('/#/home')
    if (wait) {
      cy.wait(['@fetchTodos', '@fetchMattersLimit'])
      cy.wait(2000)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  visitHomeViaNavigation() {
    navigationPage.get.homeOption().click()
  }

  // eslint-disable-next-line class-methods-use-this
  visitOrgUsers() {
    cy.backendRoute('/organisation').as('getOrganisation')
    cy.visit('/#/organisation/accounts')
    cy.wait('@getOrganisation')
    cy.get('[data-test=accounts-content]').should('be.visible')
  }

  // eslint-disable-next-line class-methods-use-this
  visitOrgCosts() {
    cy.backendRoute('/organisation/costs').as('getOrganisationCosts')
    cy.visit('/#/organisation/costs')
    cy.wait('@getOrganisation')
    cy.get('[data-test=organisation-costs-container]').should('be.visible')
  }

  // eslint-disable-next-line class-methods-use-this
  visitOrgMatters() {
    cy.visit('/#/organisation/accounts')
    cy.wait(5000)
    cy.get('[data-test=matters]', { timeout: 30000 }).click()
    cy.wait(1000)
  }

  visitOrgDocuments() {
    cy.visit('/#/organisation/accounts')
    cy.wait(5000)
    cy.get('[data-test=settings]', { timeout: 30000 }).click()
  }

  // eslint-disable-next-line class-methods-use-this
  visitOrgLabels() {
    cy.visit('/#/organisation/accounts')
    cy.wait(1000)
    cy.backendRoute(
      'GET',
      '/organisation/labels?includeHierarchicalLabels=true'
    ).as('fetchLabels')
    cy.get('[data-test=labels]', { timeout: 30000 }).click({ timeout: 30000 })
    cy.wait('@fetchLabels')
  }

  // eslint-disable-next-line class-methods-use-this
  visitUsers() {
    cy.visit('/#/users')
  }

  // eslint-disable-next-line class-methods-use-this
  visitOrganisation() {
    cy.visit('/#/organisation/accounts')
  }

  visitOrganisationBilling() {
    cy.visit('/#/organisation/billing')
  }

  // eslint-disable-next-line class-methods-use-this
  visitOrganisations() {
    cy.backendRoute('/organisations').as('getOrganisations')
    cy.visit('/#/organisations')
    cy.wait('@getOrganisations')
  }

  visitProjectOverview(matterId, projectId) {
    cy.visit(`/#/matter/${matterId}/workstream/${projectId}/overview`)
    cy.wait(1000)
  }

  visitProjectOverviewTasks(matterId, projectId) {
    cy.visit(`/#/matter/${matterId}/workstream/${projectId}/overview/tasks`)
    cy.wait(1000)
  }

  visitProjectOverviewPeople(matterId, projectId) {
    cy.visit(`/#/matter/${matterId}/workstream/${projectId}/overview/people`)
    cy.wait(1000)
  }

  visitMatterOverview(matterId) {
    cy.visit(`/#/matter/${matterId}/overview`)
    cy.wait(1000)
  }

  visitArchiveTable(user, matterId) {
    cy.login(user.username)
    cy.backendRoute('/matter/*').as('getMatter')
    cy.visit(`/#/matteradmin/${matterId}`)
    cy.wait(['@getMatter'])
    cy.wait(1000)
    cy.get('[data-test=archive]').click()
  }

  visitLogin() {
    cy.visit('/#/login')
    cy.wait(1000)
  }

  visitRoadmap(matterId, projectId) {
    cy.visit(`/#/matter/${matterId}/workstream/${projectId}/roadmap`)
    cy.wait(1000)
  }

  visitMatterRoadmap(matterId) {
    cy.visit(`/#/matter/${matterId}/roadmap`)
    cy.wait(1000)
  }

  visitPersonalSettings() {
    cy.visit('/#/personalSettings')
    cy.wait(1000)
  }

  visitHowToUseJuralio() {
    cy.visit('/#/how-to-use')
    cy.wait(1000)
  }
}

export default VisitHelpers
