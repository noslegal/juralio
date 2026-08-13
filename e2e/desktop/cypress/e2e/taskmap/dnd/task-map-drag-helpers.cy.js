const offsetX = 0
const offsetY = 0

const TASKMAP_REDRAW_DELAY = 1000

export const generatePoint = (x, y) => {
  return {
    offsetX,
    offsetY,
    x,
    y,
  }
}

const doDrag = (backendRoute, cellIndex, point, options) => {
  cy.backendRoute('PATCH', backendRoute).as('updateTasks')
  cy.window().then(win => {
    cy.get('[data-test=task-cell-test]')
      .eq(cellIndex)
      .trigger('mousedown', {
        view: win,
      })
      .trigger('mousemove', {
        clientX: point.x + point.offsetX,
        clientY: point.y + point.offsetY - 117, //+ 53, // -72
      })
      .trigger('mouseup', {
        view: win,
      })
  })
  if (options.wait) {
    cy.wait('@updateTasks')
    cy.wait(TASKMAP_REDRAW_DELAY)
  }
}

export const doDragNoComplete = (cellIndex, point) => {
  cy.window().then(win => {
    cy.get('[data-test=task-cell-test]')
      .eq(cellIndex)
      .trigger('mousedown', {
        view: win,
      })
      .trigger('mousemove', {
        clientX: point.x + point.offsetX,
        clientY: point.y + point.offsetY + 53,
        // force: true,
      })
  })
}

export const performDrag = (cellIndex, point, options = { wait: true }) => {
  doDrag('/matter/*/workstreams/*/tasks*', cellIndex, point, options)
}

export const performTemplateDrag = (
  cellIndex,
  point,
  options = { wait: true }
) => {
  doDrag('/projecttemplates/*/tasks*', cellIndex, point, options)
}

export const checkTaskOrder = (startIndex, taskNames) => {
  for (let i = 0; i < taskNames.length; i++) {
    // eslint-disable-next-line no-loop-func
    it('task name is as expected', () => {
      cy.get('[data-test=task-cell-test]')
        .eq(startIndex + i)
        .should('contain', taskNames[i])
    })
  }
}
