// eslint-disable-next-line import/prefer-default-export
export const wrapEditableTextField = (getFieldRoot, multiline, isWrapped) => ({
  readOnlyText: () =>
    getFieldRoot().find(
      !multiline ? '[data-test=read-field]' : '[data-test=raw-text-content]'
    ),
  placeholder: () => getFieldRoot().find('[data-test=zero-state-placeholder]'),
  input: () => getFieldRoot().find('input'),
  validationMessage: () => getFieldRoot().find('p.Mui-error'),
  editButton: () => getFieldRoot().find('[data-test=edit-icon]'),
  enterText: value => {
    getFieldRoot()
    getFieldRoot()
      .find(!(multiline || isWrapped) ? 'input' : 'textarea')
      .eq(0)
      .clear()
      .type(value + '{shift}{enter}')
  },
})
