/* eslint-disable import/prefer-default-export */
export function checkIcicleCellDepthCounts(checks, itemName, testDataId) {
  let counts = ''
  let levels = ''
  let names = ''
  for (let i = 0; i < checks.length; i++) {
    counts += ' ' + checks[i].expectedCount + ','
    names += ' ' + checks[i].expectedText + ','
    levels += ' ' + String.fromCharCode(64 + checks[i].depth) + ','
  }
  it(
    'should  have [' +
      counts +
      '] ' +
      itemName +
      ' named [' +
      names +
      '] at levels [' +
      levels +
      '] respectively',
    // { retries: 2 },
    () => {
      let levelCheck
      for (let i = 0; i < checks.length; i++) {
        levelCheck = checks[i]

        if (levelCheck.expectedCount > 0) {
          cy.get('[data-test=depth-' + levelCheck.depth + '] ')
            .find('[data-test="' + testDataId + '"]')
            .its('length')
            .should('eq', levelCheck.expectedCount)

          if (levelCheck.expectedText) {
            for (let j = 0; j < levelCheck.expectedText.length; j++) {
              cy.wait(1000)
              cy.get('[data-test=depth-' + levelCheck.depth + ']')
                .find(' [data-test="' + testDataId + '"]')
                .eq(j)
                .contains(levelCheck.expectedText[j])
            }
          }
        } else {
          cy.get('[depth="' + levelCheck.depth + '"]').should('not.exist')
        }
      }
    }
  )
}

export function getCellByName(name) {
  return cy.contains(name).then(element => {
    return element.parent()
  })
}
