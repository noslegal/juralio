import { HTTP_VERB, ROLE } from './helpers/constants'
import {
  getBody,
  getCypressTemplate,
  getExpectation,
  loginUser,
  mutateEndpoint,
} from './helpers/cypress'
import { readFile, writeToFile } from './helpers/file'
import { askQuestion } from './helpers/input'
import { print } from './helpers/utility'
import { getArt, getHeader } from './helpers/vanity'
import { INPUT_PATH } from './inputs/config'

const HTTP_VERBS = [
  HTTP_VERB.POST,
  HTTP_VERB.GET,
  HTTP_VERB.PATCH,
  // HTTP_VERB.HEAD,
  // HTTP_VERB.PUT,
  // HTTP_VERB.CONNECT,
  // HTTP_VERB.OPTIONS,
  // HTTP_VERB.TRACE,
  HTTP_VERB.DELETE,
]

let roles = [
  // ROLE.ANONYMOUS,
  ROLE.SYS_ADMIN,
  // ROLE.MATTER_CREATOR,
  // ROLE.ORG_ADMIN,
  // ROLE.KNOWLEDGE_MANAGER,
  // ROLE.MATTER_ADMIN,
  // ROLE.MATTER_EDITOR,
  //ROLE.MATTER_VIEWER,
]

const createTest = config => {
  let tests = ''
  roles.forEach(role => {
    let testBody = ''
    HTTP_VERBS.forEach(httpVerb => {
      const expectation = getExpectation(role, httpVerb, config)
      const body = JSON.stringify(getBody(role, httpVerb, config))
      testBody += `
    describe('when making a ${httpVerb} request to ${config.endpoint}', () => {
      beforeEach(() => {
        ${loginUser(role)}
      })
      it('${expectation.itText}', () => {
        makeRequest(endpoint, '${httpVerb}', ${body})
        .then(response => {
          ${expectation.expect}
        })
      })
    })
      `
    })
    let testCase = `
  describe('when as a ${role} user', () => {
    let endpoint = ''
    before(() => {
      endpoint = \`${config.endpoint}\`
    })
    ${testBody}
  })
    `
    tests += testCase
  })
  return tests
}

const getCypressFileName = cypressTestName => `${cypressTestName}.js`

const getCypressTestName = config =>
  `${config.endpoint
    .slice(1)
    .replaceAll('/', '_')
    .replaceAll('\\', '_')
    .replaceAll('?', '')
    .replaceAll('$', '')}.cy`

const writeCypressTestFile = (cypressTest, fileName) => {
  const outputPath = `../../security/cypress/e2e/cookie-cut/${fileName}`
  writeToFile(outputPath, cypressTest, 'w+')
}

const createCypressTestFile = (testName, cypressFile) => {
  const fileName = getCypressFileName(testName)
  cypressFile = cypressFile.replace('<TESTNAME>', testName)
  writeCypressTestFile(cypressFile, fileName)
}

const createCypressFilePerEndpoint = () => {
  readFile(INPUT_PATH, data => {
    let matterViewerPermissions = JSON.parse(data)
    matterViewerPermissions.forEach(config => {
      let template = getCypressTemplate()
      let tests = createTest(config)
      let cypressTest = template.replace('<TESTS>', tests)
      const testName = getCypressTestName(config)
      createCypressTestFile(testName, cypressTest)
    })
  })
}

const createCypressFileForAllEndpoints = () => {
  let tests = ''
  readFile(INPUT_PATH, data => {
    let matterViewerPermissions = JSON.parse(data)
    matterViewerPermissions.forEach(config => (tests += createTest(config)))
    let template = getCypressTemplate()
    let cypressTest = template.replace('<TESTS>', tests)
    let inputFileName = INPUT_PATH.split('/')[1].split('.')[0]
    let testName = `all_endpoints_${inputFileName}.cy`
    createCypressTestFile(testName, cypressTest)
  })
}

const createInputJsonFileFromUrlMappingsFile = () => {
  const URLMappingFiles =
    '../../../server/grails-app/controllers/server/UrlMappings.groovy'
  const regex = data => {
    const regexGetEndpoint = /"\/[^(]+/g // get endpoint
    const regexGetHttpVerb = /[A-Z]+:/g // get HTTP verb
    const lines = data.split(/\r?\n/)

    let endpointObjList = []
    let endpoint = ''
    let verbs = []
    lines.forEach(line => {
      if (!line.includes('//')) {
        let endpointRegexResult = regexGetEndpoint.exec(line)

        if (endpointRegexResult && endpointRegexResult[0].length) {
          endpoint = endpointRegexResult[0].slice(1, -1)
        }

        let verbRegexResult
        while ((verbRegexResult = regexGetHttpVerb.exec(line)) !== null) {
          if (verbRegexResult && verbRegexResult[0].length > 0) {
            verbs = [...verbs, verbRegexResult[0].slice(0, -1)]
          }
        }

        if (endpoint && verbs.length > 0) {
          endpoint = mutateEndpoint(endpoint)
          const endpointObj = {
            endpoint: endpoint,
            permissions: {
              GET: 'Client error response (400 - 499)',
              POST: 'Client error response (400 - 499)',
              PATCH: 'Client error response (400 - 499)',
              DELETE: 'Client error response (400 - 499)',
            },
          }
          endpointObjList = [...endpointObjList, endpointObj]
          if (endpoint.includes('$')) {
            writeToFile('outputs/replaceAllAutomation.txt', endpoint, 'a')
          }
          endpoint = ''
          verbs = []
        }
      }
    })
    writeToFile(
      'outputs/list_of_endpoints.json',
      `${JSON.stringify(endpointObjList)}\n`,
      'a'
    )
  }

  readFile(URLMappingFiles, regex)
}

const createVisualisation = () => {
  let tests = ''
  readFile(INPUT_PATH, data => {
    let matterViewerPermissions = JSON.parse(data)

    const redOrGreen = string => (string === 'OK' ? 'green' : 'red')

    const tableCSS = `
      
    `

    const rowCSS = `
      // display: flex;
      // justify-content: center;
    `

    const endpointCSS = `
    // display: flex;
    // justify-content: end;
    // min-width: 800px;
    `

    const verbCSS = `
      // min-width: 100px;
      // display: flex;
      // justify-content: center;
      // align-items: center;
      padding: 6px;
    `

    const title = INPUT_PATH.split('/')[1].split('.')[0]

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
    table {
      font-family: arial, sans-serif;
      border-collapse: collapse;
      width: 100%;
    }
    
    td, th {
      border: 1px solid #dddddd;
      text-align: left;
      padding: 8px;
    }
    
    tr:nth-child(even) {
      background-color: #dddddd;
    }
    </style>
    </head>
    <body>
    <h1>${title}</h1>
    `

    let htmlContent = html + '<table style="font-family: Arial;">'
    matterViewerPermissions.forEach(config => {
      htmlContent += `<tr style="${rowCSS}">
                        <td style="${endpointCSS}">${config.endpoint}</td>
                        <td style="background-color:${redOrGreen(
                          config.permissions.GET
                        )};${verbCSS}">GET</td>
                        <td style="background-color:${redOrGreen(
                          config.permissions.POST
                        )};${verbCSS}">POST</td>
                        <td style="background-color:${redOrGreen(
                          config.permissions.PATCH
                        )};${verbCSS}">PATCH</td>
                        <td style="background-color:${redOrGreen(
                          config.permissions.DELETE
                        )};${verbCSS}">DELETE</td>
                      </tr>`
    })
    htmlContent += '</table></body>'

    const outputPath = 'visualisation.html'
    writeToFile(outputPath, htmlContent, 'w+')
  })
}

const menu = () => `
What would you like to do?
1 - Create a json file from URLMappings
2 - Use an input file to create a Cypress file per endpoint
3 - Use an input file to create one Cypress file with all endpoints
4 - Visualise permissions
q - Exit
    
    Input file: ${INPUT_PATH}

Please pick an option:
  `

const processAnswer = answer => {
  answer = answer.toLowerCase()
  if (answer === 'q') {
    print('Exiting')
    process.exit(0)
  }

  switch (answer) {
    case '1': {
      writeToFile('outputs/replaceAllAutomation.txt', '', 'w+') // Wipe file
      writeToFile('outputs/list_of_endpoints.json', '', 'w+') // Wipe file
      createInputJsonFileFromUrlMappingsFile()
      break
    }
    case '2': {
      createCypressFilePerEndpoint()
      break
    }
    case '3': {
      createCypressFileForAllEndpoints()
      break
    }
    case '4': {
      createVisualisation()
      break
    }
    default: {
      print('You have not chosen a valid option.')
    }
  }
}

const runMenu = () => {
  print(`
${getHeader('Cypress cookie cutter')}
${getArt()}
---------------------------`)
  askQuestion(menu(), processAnswer)
}

const main = () => {
  runMenu(INPUT_PATH)

  // to dos
  // add in $ids to test files
  // look into making one big test file to speed up end point filling in
}
main()
