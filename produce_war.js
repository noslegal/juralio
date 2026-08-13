const shell = require('shelljs')
const { argv } = require('yargs')
  .env()
  .option('continuousIntegration', { alias: 'ci', default: false })
  .option('imageName', { alias: 'im', default: '' })

const execOptions = {
  fatal: true,
}

const checkErrors = func => {
  if (func.code !== 0) {
    shell.exit(1)
  }
}

const { continuousIntegration, imageName } = argv

console.log('Running produce_war.js...')

/* Skipping building the front end if building on CI. The front end images is
   built in separate jobs on CI to allow parallelism, therefore their assets are
   already available before this script needs to be run on. */
if (!continuousIntegration) {
  console.log('Starting to build frontend')
  /* Build Frontend React App */
  shell.cd('frontend')
  checkErrors(shell.exec('npm install'))
  checkErrors(shell.exec('./docker-run.sh build local'))
  checkErrors(shell.exec('./docker-run.sh package local'))
  shell.cd('..')
  console.log('Finished building frontend')
}

/* Copy Javascript apps into grails web-app folder so that
   they are included in the resulting war file
*/
console.log('Starting to build server')
const publicDirectoryPath = 'src/main/webapp'
shell.cd('server')
shell.cp('-r', '../frontend/build/*', `${publicDirectoryPath}`)
shell.cp(
  '-r',
  '../frontend/maintain_bookmarks',
  `${publicDirectoryPath}/frontend`
)
shell.mv(
  '-f',
  `${publicDirectoryPath}/frontend/locales`,
  `${publicDirectoryPath}`
)

const imageNameParam = imageName ? ` ${imageName}` : ''
checkErrors(shell.exec(`./docker-run.sh build${imageNameParam}`))
checkErrors(shell.exec(`./docker-run.sh package${imageNameParam}`))
console.log('Finished building server')

shell.rm('-rf', `${publicDirectoryPath}/index.html`)
shell.rm('-rf', `${publicDirectoryPath}/assets`)
shell.rm('-rf', `${publicDirectoryPath}/frontend`)
