module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    function viteImportMetaEnv({ types: t }) {
      return {
        name: 'transform-vite-import-meta-env',
        visitor: {
          MemberExpression(path) {
            const { node } = path
            if (
              node.object.type === 'MetaProperty' &&
              node.object.meta.name === 'import' &&
              node.object.property.name === 'meta' &&
              !node.computed &&
              node.property.type === 'Identifier' &&
              node.property.name === 'env'
            ) {
              path.replaceWith(
                t.memberExpression(t.identifier('process'), t.identifier('env'))
              )
            }
          },
        },
      }
    },
  ],
}
