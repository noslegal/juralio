// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add(
  'login',
  (username, password = Cypress.env('defaultPassword')) => {
    if (typeof username !== 'string' && !(username instanceof String)) {
      // Support being passed a full user object (as the fixture builder returns)
      // rather than a bare username string.
      username = username.username
    }

    return cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username,
          password,
        },
      })
      .its('body')
      .then(body => {
        return cy.window().then(win => {
          win.localStorage.userData = JSON.stringify({ auth: body })

          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/user`,
            method: 'GET',
          })
            .its('body')
            .then(userDetails => {
              return cy.window().then(win => {
                win.localStorage.userData = JSON.stringify({
                  auth: body,
                  details: userDetails,
                })
              })
            })
        })
      })
  }
)

Cypress.Commands.add(
  'canLogin',
  (username, password = Cypress.env('defaultPassword')) => {
    return cy
      .request({
        failOnStatusCode: false,
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username,
          password,
        },
      })
      .its('status')
      .then(status => status == 200)
  }
)

Cypress.Commands.add('logoutServerSide', () => {
  cy.request({
    url: `${Cypress.env('serverBaseUrl')}/logout`,
    method: 'POST',
    failOnStatusCode: false,
  })
})

Cypress.Commands.add('form_request', (url, formData) => {
  return cy
    .window()
    .then({ timeout: Cypress.config('responseTimeout') }, win => {
      const { userData } = win.localStorage
      let myHeaders
      if (userData) {
        myHeaders = new Headers({
          Authorization: `Bearer ${JSON.parse(userData).auth.access_token}`,
        })
      }

      return fetch(url, {
        method: 'POST',
        headers: myHeaders,
        body: formData,
      })
    })
})

Cypress.Commands.overwrite('request', (originalFn, options) => {
  return cy
    .window()
    .then({ timeout: Cypress.config('responseTimeout') }, win => {
      const { userData } = win.localStorage
      if (userData) {
        options.headers = {
          ...options.headers,
          Authorization: 'Bearer ' + JSON.parse(userData).auth.access_token,
        }
      }
      return originalFn(options)
    })
})

Cypress.Commands.add('apiSpecRequest', option => {
  return cy.request({
    ...option,
    failOnStatusCode: false,
  })
})

Cypress.Commands.add('clearUserSession', () => {
  localStorage.removeItem('userData')
})

Cypress.Commands.add('backendRoute', (p1, p2) => {
  return buildRouteForPath(p1, p2, Cypress.env('serverBaseUrl'))
})

Cypress.Commands.add('backendRouteWithUrl', (p1, url) => {
  return cy.intercept({
    method: 'GET',
    url: url,
  })
})

Cypress.Commands.add('frontendRoute', (p1, p2) => {
  return buildRouteForPath(p1, p2, Cypress.env(''))
})

function buildRouteForPath(p1, p2, basePath) {
  const method = p2 ? p1 : 'GET'
  const urlPattern = p2 ? p2 : p1

  return cy.intercept({
    method: method,
    url: `${basePath}/${
      urlPattern[0] === '/' ? urlPattern.slice(1) : urlPattern
    }`,
  })
}

// react-beautiful-dnd compatible drag & drop routines, largely derived from
// discussion in this thread: https://github.com/atlassian/react-beautiful-dnd/issues/162
const primaryButton = 0

function drag(subject) {
  const bounds = subject[0].getBoundingClientRect()
  const subjectCentreX = (bounds.left + bounds.right) * 0.5
  const subjectCentreY = (bounds.top + bounds.bottom) * 0.5
  const sloppyClickThreshold = 5

  cy.clock()
  // Hoops we need to jump through to register a mouse drag.
  cy.wrap(subject)
    .trigger('mousedown', {
      button: primaryButton,
      // Register clientX + clientY for sloppy click detection in
      // subsequent mousemove.
      clientX: subjectCentreX,
      clientY: subjectCentreY,
    })
    .trigger('mousemove', {
      button: primaryButton,
      // Make sure we pass sloppyClickThreshold detection.
      clientX: subjectCentreX + sloppyClickThreshold,
      clientY: subjectCentreY,
      force: true,
    })
    .tick(200)
}

function drop(subject, position = 'bottom') {
  const bounds = subject[0].getBoundingClientRect()
  const subjectCentreX = (bounds.left + bounds.right) * 0.5
  const verticalPlacement = 0.33
  const subjectDropLocationY =
    bounds.top * verticalPlacement + bounds.bottom * (1.0 - verticalPlacement)

  cy.wrap(subject)
    .trigger('mousemove', {
      button: primaryButton,
      force: true,
      clientX: subjectCentreX,
      clientY: subjectDropLocationY,
    })
    .tick(200)
  cy.wrap(subject).trigger('mouseup', {
    force: true,
  })
}

Cypress.Commands.add('drag', { prevSubject: 'element' }, drag)
Cypress.Commands.add('drop', { prevSubject: 'element' }, drop)

Cypress.Commands.add('dragAndDrop', (subject, target, dragIndex, dropIndex) => {
  cy.get(subject).should('be.visible', { timeout: 2000 })
  Cypress.log({
    name: 'DRAGNDROP',
    message: `Dragging element ${subject} to ${target}`,
    consoleProps: () => {
      return {
        subject: subject,
        target: target,
      }
    },
  })
  const BUTTON_INDEX = 0
  const SLOPPY_CLICK_THRESHOLD = 10
  cy.get(target)
    .eq(dropIndex)
    .then($target => {
      let coordsDrop = $target[0].getBoundingClientRect()
      cy.get(subject)
        .eq(dragIndex)
        .then(subject => {
          const coordsDrag = subject[0].getBoundingClientRect()
          cy.wrap(subject)
            .trigger('mousedown', {
              button: BUTTON_INDEX,
              force: true,
            })
            .trigger('mousemove', {
              button: BUTTON_INDEX,
              clientX: coordsDrag.x,
              clientY: coordsDrag.y,
              force: true,
            })
            .wait(1000)
          cy.get('body').trigger('mousemove', {
            button: BUTTON_INDEX,
            clientX: coordsDrop.x + SLOPPY_CLICK_THRESHOLD,
            clientY: coordsDrop.y,
            force: true,
          })
          cy.get('body')
            .trigger('mousemove', {
              button: BUTTON_INDEX,
              clientX: coordsDrop.x,
              clientY: coordsDrop.y + SLOPPY_CLICK_THRESHOLD,
              force: true,
            })
            .trigger('mouseup')
            .wait(1000)
        })
    })
})
