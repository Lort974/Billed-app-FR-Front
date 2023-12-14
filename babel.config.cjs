module.exports = {
  presets: [
    '@babel/preset-react', // Ce préréglage permet la transformation du JSX
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
}