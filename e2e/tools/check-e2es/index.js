import fs from 'fs'
import path from 'path'
import glob from 'glob'
import { sendMessageToSlackCIAlerts } from './slack_helpers'

const test_location = '../../'
const mobile_test_folder = 'mobile/'
const test_spec_suffix = '.cy.js'
const globPattern = `${test_location}**/*${test_spec_suffix}`
const globPatternMobile = `${test_location}${mobile_test_folder}**/*${test_spec_suffix}`
const Problem_Comments_Threshold = 2
const frontendUrl = 'frontend/'

const summaryMode = process.argv.length > 2 && process.argv[2] === 'summary'
const notifyMode = process.argv.length === 4 && process.argv[3] === 'notify'

let e2eAllSpecs = []
let e2eMobileSpecs = []

const e2eDetails = []
const e2eMobileDetails = []
const nameIssues = []
const mobileNameIssues = []
const filenameUsedAsNameIssues = []
const commentIssues = []
const frontendIssues = []
const waitIssues = []

let fullOutput = ''

const notifySlack = fullOutput => {
  console.log('Sending...')
  sendMessageToSlackCIAlerts(fullOutput)
  console.log('Sent')
}

const print = message => {
  message += '\n'
  fullOutput += message
  console.log(message)
}

const listSpecs = specs => {
  let output = ''
  specs.forEach(spec => (output += `\t [${spec.filename}]\n`))
  print(output)
}

const listCommentIssues = specs => {
  let output = ''
  specs.forEach(spec => (output += `\t ${spec.name} ${spec.commentedLines}\n`))
  print(output)
}

const getSpecDetails = spec => {
  let fullFilename = spec
  let filename = path.parse(spec).base
  let specName = filename.replace('.js', '')
  let contents = fs.readFileSync(fullFilename).toString()
  return {
    fullFilename,
    filename,
    specName,
    contents,
  }
}

const sortSpecs = specs => {
  const compare = (a, b) => {
    const fileA = a.filename.toUpperCase()
    const fileB = b.filename.toUpperCase()
    let comparison = 0

    if (fileA > fileB) comparison = 1
    else if (fileA < fileB) comparison = -1

    return comparison
  }
  specs.sort(compare)
}

const scanTests = () => {
  e2eAllSpecs = glob.sync(globPattern)
  e2eMobileSpecs = glob.sync(globPatternMobile)

  // Grab all the common details from all the e2es.
  e2eAllSpecs.forEach(spec => {
    const stat = fs.lstatSync(spec)
    if (stat.isFile()) e2eDetails.push(getSpecDetails(spec))
  })

  // Grab all the common details from the mobile e2es.
  e2eMobileSpecs.forEach(spec => {
    const stat = fs.lstatSync(spec)
    if (stat.isFile()) e2eMobileDetails.push(getSpecDetails(spec))
  })

  sortSpecs(e2eDetails)
  sortSpecs(e2eMobileDetails)

  // Check the name exists in the text of the file.
  e2eDetails.forEach(spec => {
    if (!spec.contents.includes(`'${spec.specName}'`)) nameIssues.push(spec)
  })

  // Check the name includes mobile if mobile test.
  e2eMobileDetails.forEach(spec => {
    if (!spec.filename.includes('mobile')) mobileNameIssues.push(spec)
  })

  // Check the file name does not exist in the text of the file.
  e2eDetails.forEach(spec => {
    if (spec.contents.includes(spec.filename)) {
      filenameUsedAsNameIssues.push(spec)
    }
  })

  // Check the number of comments in the file.
  e2eDetails.forEach(spec => {
    let commentedLines = 0
    let lines = spec.contents.split('\n')

    lines.forEach(line => {
      line = line.trim()
      if (line.indexOf('//') === 0) commentedLines++
    })

    if (commentedLines > Problem_Comments_Threshold) {
      commentIssues.push({
        name: spec.specName,
        commentedLines: commentedLines,
      })
    }
  })

  // Check for frontend Urls
  e2eDetails.forEach(spec => {
    if (spec.contents.includes(frontendUrl)) frontendIssues.push(spec)
  })

  // Check for cy.wait time operations (not server call waits)
  e2eDetails.forEach(spec => {
    if (
      spec.contents.includes('cy.wait') &&
      !spec.contents.includes("cy.wait('@")
    ) {
      waitIssues.push(spec)
    }
  })
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                               ~MAIN~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

print('E2E filescan v0.2')
print('-----------------')

scanTests()

print(
  `Found ${e2eAllSpecs.length} Spec files - ${e2eMobileSpecs.length} are mobile tests.`
)

print(`${nameIssues.length} specs where spec name does not match filename`)
if (!summaryMode) listSpecs(nameIssues)

print(
  `${mobileNameIssues.length} mobile specs where spec name does not include mobile`
)
if (!summaryMode) listSpecs(mobileNameIssues)

print(`${filenameUsedAsNameIssues.length} specs where filename occurs in file`)
if (!summaryMode) listSpecs(filenameUsedAsNameIssues)

print(`${commentIssues.length} specs with high number of comments`)
if (!summaryMode) listCommentIssues(commentIssues)

print(`${frontendIssues.length} specs using frontend in the Url`)
if (!summaryMode) listSpecs(frontendIssues)

print(`${waitIssues.length} specs using cy.wait time operations`)
if (!summaryMode) listSpecs(waitIssues)

if (notifyMode) notifySlack(fullOutput)

print('----------------------')
print('E2E filescan finished.')
process.exit(0)
