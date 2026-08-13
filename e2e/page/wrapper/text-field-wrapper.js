export const wrapInput = getFieldRoot => ({
  input: () => getFieldRoot().find('input'),
  validationMessage: () => getFieldRoot().find('p.Mui-error'),
})
