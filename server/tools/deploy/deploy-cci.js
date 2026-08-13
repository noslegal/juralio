const fs = require('fs')
const fetch = require('node-fetch')

const path = require('path')
const shell = require('shelljs')

const token = process.env.CIRCLECI_TOKEN
const apiUrl = 'https://circleci.com/api/v2/'

const vcs = 'gh'
const org = 'juralio'
const repo = 'juralio-mm'
const branch = 'develop'

const fetchCCI = (path, options) =>
  fetch(apiUrl + path, {
    headers: { 'Circle-Token': token, Accept: 'application/json' },
    ...(options ? options : {}),
  }).then(res => res.json())

const getPipelines = next_page_token => {
  const nextPageParam = next_page_token ? `&page-token=${next_page_token}` : ''
  return fetchCCI(
    `project/${vcs}/${org}/${repo}/pipeline?branch=${branch}${nextPageParam}`
  )
}

const getWorkflows = pipelineID => fetchCCI(`pipeline/${pipelineID}/workflow`)

const getWorkflowJobs = workflowID => fetchCCI(`workflow/${workflowID}/job`)

const getArtifacts = jobNumber =>
  fetchCCI(`project/${vcs}/${org}/${repo}/${jobNumber}/artifacts`)

const downloadFile = async (url, destinationPath) => {
  const res = await fetch(url, { headers: { 'Circle-Token': token } })
  const fileStream = fs.createWriteStream(destinationPath)
  return new Promise((resolve, reject) => {
    res.body.pipe(fileStream)
    res.body.on('error', err => {
      console.log(`Error downloading ${url} to ${destinationPath}`)
      reject(err)
    })
    fileStream.on('finish', resolve)
  })
}

const getLatestCompleteRun = async (next_page_token = null, loopCount = 0) => {
  let pipelines = await getPipelines(next_page_token)
  pipelines.items.sort((a, b) =>
    b.created_at < a.created_at ? -1 : a.created_at === b.created_at ? 0 : 1
  )
  if (loopCount > 50) {
    //50*20 per page = last 1000 builds
    return undefined
  }
  let competedWorkflow
  for (let p of pipelines.items) {
    const workflows = await getWorkflows(p.id)

    competedWorkflow = workflows.items.find(
      i =>
        i.status !== 'running' &&
        i.status !== 'failing' &&
        i.status !== 'failed' &&
        i.status !== 'not_run' &&
        i.status !== 'canceled' &&
        i.name == 'build'
    )
    if (competedWorkflow != undefined) {
      break
    }
  }
  if (competedWorkflow == undefined) {
    competedWorkflow = getLatestCompleteRun(
      pipelines.next_page_token,
      loopCount + 1
    )
  }
  return competedWorkflow
}

const getLatestSuccessfulWar = async outputPath => {
  const firstComplete = await getLatestCompleteRun()
  if (firstComplete) {
    const jobs = await getWorkflowJobs(firstComplete.id)

    for (let j of jobs.items) {
      if (j.name === 'build-server-war') {
        const artifacts = await getArtifacts(j.job_number)

        for (let a of artifacts.items) {
          if (a.path === 'server/build/libs/juralio.war') {
            await downloadFile(a.url, outputPath)

            return firstComplete.pipeline_number
          }
        }
      }
    }
  } else {
    console.log(
      'There have been no successful builds in the past 1000 pipelines'
    )
  }
}

const { argv } = require('yargs')
  .env()
  .option('application', { alias: 'a' })
  .option('environment', { alias: 'e' })
  .option('release', { alias: 'l' })
  .option('timeout', { alias: 't', default: 15 })
  .option('continuousIntegration', { alias: 'ci', default: false })
  .option('production', { alias: 'p', type: 'boolean', default: false })
  .option('awsRegion', { alias: 'aws_r', default: 'eu-west-2' })
  .option('awsProfile', { default: '' })

let release = argv.release ? argv.release : argv.bamboo_deploy_release
const {
  application,
  environment,
  timeout,
  continuousIntegration,
  production,
  awsRegion,
  awsProfile,
} = argv

const run = async () => {
  try {
    shell.config.verbose = true
    //move to root environment directory
    shell.cd(path.join(__dirname, '/../..'))
    // Make the config available for the appropriate application
    shell.cp(
      `.elasticbeanstalk/${application}.config.yml`,
      '.elasticbeanstalk/config.yml'
    )
    /* Ensures that when running on CI that the path of the WAR file matches the usual grails build folder. On CI the WAR
     is downloaded as an artifact on its own into the working dir and it not in its usual location.
     Doing this step here to normalise ensures we do not need to maintain a different artifact location in any of the
     config.yml files between local and CI.
  */
    if (continuousIntegration) {
      shell.mkdir('-p', 'build/libs')
      const pipelineNumber = await getLatestSuccessfulWar(
        'build/libs/juralio.war'
      )
      if (!pipelineNumber) {
        shell.echo('ERROR: Unable to identify a successful pipeline to deploy')
        shell.exit(1)
      }
      const splitReleaseNumber = release.split('.')
      splitReleaseNumber[splitReleaseNumber.length - 1] = `${pipelineNumber}-${
        splitReleaseNumber[splitReleaseNumber.length - 1]
      }`
      release = splitReleaseNumber.join('.')
      console.log(`Using release number ${release}`)
      shell.echo(`Using release number ${release}`)
    }
    const getProfile = () =>
      awsProfile
        ? `--profile ${awsProfile}`
        : production
        ? '--profile prodaccess'
        : ''
    console.log(
      `Deploy identity: production=${production} awsProfile=${awsProfile || '(none)'} profileFlag='${getProfile()}'`
    )
    if (environment.endsWith('-env')) {
      let eb_application = `${environment.substring(
        0,
        environment.length - '-env'.length
      )}-app`
      if (
        shell.exec(
          `eb init ${eb_application} --region ${awsRegion} ${getProfile()}`
        ).code !== 0
      ) {
        shell.echo('ERROR: Failed to init environment')
        shell.exit(1)
      }
    }
    // run deployment
    if (
      shell.exec(`eb use ${environment} --region ${awsRegion} ${getProfile()}`)
        .code !== 0
    ) {
      shell.echo('ERROR: Failed to set environment')
      shell.exit(1)
    }
    if (
      shell.exec(
        `eb deploy -l ${release} --timeout ${timeout} --region ${awsRegion} ${getProfile()}`
      ).code !== 0
    ) {
      shell.echo('ERROR: Failed to deploy Juralio')
      shell.exit(1)
    }
    if (
      shell.exec(
        `eb setenv JURALIO_VERSION=${release} --timeout ${timeout} --region ${awsRegion} ${getProfile()}`
      ).code !== 0
    ) {
      shell.echo('ERROR: Failed to set Juralio version')
      shell.exit(1)
    }
    shell.rm('.elasticbeanstalk/config.yml')
  } catch (e) {
    shell.echo(`Threw an error ${e}`)
    shell.exit(1)
  }
}

run()
