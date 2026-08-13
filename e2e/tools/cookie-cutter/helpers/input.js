const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
})

export const askQuestion = (question, callback) => {
  readline.question(question, answer => {
    callback(answer)
    readline.close()
  })
}
