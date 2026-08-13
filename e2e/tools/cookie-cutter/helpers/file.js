import fs from 'fs'

export const writeToFile = (fileName, text, mode = 'w+') => {
  const buffer = new Buffer.from(text)
  fs.open(fileName, mode, function (err, f) {
    if (err) {
      return console.error(err)
    }
    fs.write(f, buffer, 0, buffer.length, null, function (err, writtenbytes) {
      if (err) {
        console.log('Cant write to file')
      }
    })
  })
}

export const readFile = (filePath, processData) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file: ', err)
      return
    }

    processData(data)
  })
}

export class createEndpointsFile {
}
