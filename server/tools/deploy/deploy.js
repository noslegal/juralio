const fetch = require('node-fetch')

const path = require('path')
const shell = require('shelljs')
const { argv } = require('yargs')
  .env()
  .option('application', { alias: 'a' })
  .option('environment', { alias: 'e' })
  .option('circleBuildNumber', { alias: 'bn' })
  .option('release', { alias: 'l' })
  .option('timeout', { alias: 't', default: 15 })
  .option('continuousIntegration', { alias: 'ci', default: false })
  .option('production', { alias: 'p', default: false })
  .option('awsRegion', { alias: 'aws_r', default: 'eu-west-2' })

const token = process.env.CIRCLECI_TOKEN
const apiUrl = 'https://circleci.com/api/v2/'

const fetchCCI = (path, options) =>
  fetch(apiUrl + path, {
    headers: { 'Circle-Token': token, Accept: 'application/json' },
    ...(options ? options : {}),
  }).then(res => res.json())

const getPipelines = (vcs, org, repo, branch) =>
  fetchCCI(`project/${vcs}/${org}/${repo}/pipeline?branch=${branch}`)

const release = argv.release ? argv.release : argv.bamboo_deploy_release
const {
  application,
  environment,
  circleBuildNumber,
  timeout,
  continuousIntegration,
  production,
  awsRegion,
} = argv

const sendMessageToSlack = async buildInfo => {
  let body = `{
        'blocks': [
          {
            'type': 'section',
            'text': {
              'type': 'mrkdwn',
              'text': '${buildInfo.commit.subject}'
            }
          },
          {
            'type': "section",
            'text': {
              'type': "mrkdwn",
              'text': '${buildInfo.commit.body} \n\n <https://development.example.com|Development>'
            }
          }
        ]
      }`
  shell.echo(`body: ${body}`)
  fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: body,
    }
  )
}

const getBuildInformation = async circleBuildNumber => {
  const vcs = 'gh'
  const org = 'juralio'
  const repo = 'juralio-mm'
  const pipelines = await getPipelines(vcs, org, repo, 'develop')

  let p = pipelines.items.find(
    pipeline => pipeline.number === circleBuildNumber
  )

  if (p) {
    return {
      number: p.number,
      commit: {
        body: p.vcs.commit.body,
        subject: p.vcs.commit.subject,
      },
    }
  }
}

async function run() {
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
    shell.mv('../juralio.war', 'build/libs/')
  }

  const getProfile = () => (production ? '--profile prodaccess' : '')

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

  const buildInfo = await getBuildInformation(circleBuildNumber)

  shell.echo(`buildInfo: ${buildInfo}`)

  await sendMessageToSlack(buildInfo)

  shell.rm('.elasticbeanstalk/config.yml')
}

run()
