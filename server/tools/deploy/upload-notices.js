const fs = require('fs')

const path = require('path')
const shell = require('shelljs')
const { argv } = require('yargs')
  .env()
  .option('production', { alias: 'p', default: false })

const { production } = argv

const run = async () => {
  shell.config.verbose = true

  // Move to folder with images to upload
  shell.pushd('../frontend/src/assets/images/upload-notices')

  const getProfile = () => (production ? '--profile prodaccess' : '')
  let buckets
  await shell.exec(
    //read all s3 buckets, filter to ones with jur-s3 in the name, munge the data to just be the bucket names
    `aws s3 ls ${getProfile()} | grep jur-s3- | awk \'BEGIN {RS=" ";} {print}\' | awk "NR % 3 == 0" | tr "\n" ","`,
    (err, stdout, stderr) => {
      if (stdout) {
        const buckets = stdout.split(',').filter(bucket => bucket.length)
        //List all images in folder
        fs.readdir('.', (err, files) => {
          if (err) {
            throw err
          }
          files.forEach(file => {
            buckets.forEach(bucket => {
              // Upload image to bucket
              if (
                shell.exec(
                  `aws s3 cp ${file} s3://${bucket}/juralio/noticeboard/${file} ${getProfile()}`
                ).code !== 0
              ) {
                shell.echo(
                  `ERROR: Failed to upload file ${file} to bucket ${bucket}`
                )
                shell.exit(1)
              } else {
                shell.echo(`Uploaded file ${file} to bucket ${bucket}`)
              }
            })
          })
          shell.popd()
        })
      }
    }
  )
}

run()
