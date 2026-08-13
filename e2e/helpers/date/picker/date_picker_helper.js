const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const selectors = {
  PICKER_CONTAINER: '[role="dialog"]:has(.MuiPickersCalendarHeader-label)',
}

export function goToYearAndMonth(dateComponentSelector, year, month) {
  //Open the date picker
  cy.get(dateComponentSelector).eq(0).click()

  //Select year
  cy.get(selectors.PICKER_CONTAINER)
    .find('[aria-label="calendar view is open, switch to year view"]')
    .click()

  cy.get(selectors.PICKER_CONTAINER).find('button').contains(year).click()

  //Select month and date
  return cy
    .get(selectors.PICKER_CONTAINER)
    .find('.MuiPickersCalendarHeader-label')
    .invoke('text')
    .then(currentMonthYearString => {
      function getMonthNumber(monthAndYearString) {
        const monthString = monthAndYearString.split(' ')[0]
        return MONTHS.indexOf(monthString)
      }

      let currentMonthNumber = getMonthNumber(currentMonthYearString)

      //Work out delta between current month shown on date picker and target month
      let monthDelta = currentMonthNumber - (month - 1)

      //Work out whether to go forward or back months
      let goForward = false
      if (monthDelta < 0) {
        monthDelta *= -1
        goForward = true
      }

      // Select the month nav arrow by an explicit data-test hook on the picker's
      // custom Arrow buttons. The previous approaches were both fragile: a
      // positional button index broke on MUI layout changes, and the MUI icon
      // `data-testid` (KeyboardArrowRightIcon) is only emitted in dev builds —
      // it is stripped from the production build the CI e2e run is served, so
      // the selector never matched there.
      const navHook = goForward
        ? 'date-picker-next-month'
        : 'date-picker-prev-month'

      //Click necessary button x times
      for (let index = 0; index < monthDelta; index++) {
        cy.wait(1000)
        cy.get(selectors.PICKER_CONTAINER)
          .find(`[data-test="${navHook}"]`)
          .click({ force: true })
      }

      // Guard: confirm we actually landed on the target month. If a nav arrow
      // is disabled at a min/max date boundary the click is a silent no-op,
      // which would otherwise surface as a confusing failure when picking the
      // day — fail loudly here instead.
      cy.get(selectors.PICKER_CONTAINER)
        .find('.MuiPickersCalendarHeader-label')
        .should('contain.text', `${MONTHS[month - 1]} ${year}`)
    })
}

export function selectDate(dateComponentSelector, year, month, date) {
  cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*').as('patchTask')

  goToYearAndMonth(dateComponentSelector, year, month).then(() => {
    // Click target date number
    cy.wait(1000)
    cy.get(selectors.PICKER_CONTAINER)
      .find('[data-test=calendar-date]')
      // using a regex here to avoid e.g. '2015' when aiming for '20'
      .contains(new RegExp(`^${date}$`))
      .click({ force: true })
    cy.wait(1000)
  })

  // this ensures our backend request has gone through before we return
  cy.wait('@patchTask')
}

export function clearDate(dateComponentSelector) {
  cy.get(dateComponentSelector).click()
  cy.get(selectors.PICKER_CONTAINER).find('button').contains('Clear').click()
}
