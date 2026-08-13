export const print = message => {
  if (message.endsWith('\n')) message += '\n'
  console.log(message)
}
