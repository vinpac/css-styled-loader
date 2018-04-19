# Styled css loader
Theme and use css fastly

# Getting Started

## Installation

```bash
$ npm install --save styled-css-loader
```

or

```
$ yarn add styled-css-loader
```

## Usage

```js
/* webpack-config.js */
module.exports = {
  module: {
    rules: [
      {
        test: /\.css/,
        loader: 'styled-css-loader',
      }
    ]
  }
}
```

```css
/* home.css */
.page {
  background: --colorPrimary;
}

.title {
  color: white;
}
```

```jsx
/* home.js */
import s, { sheet } from './home.css'
import compile from 'styled-css-loader/compile'

// You can also use <style>{sheet.css}</style>
const Home = () => (
  <div className={s.page}>
    <style>{compile(sheet, { colorPrimary: '#333' })}</style>
    <h1 className={s.title}>Home</h1>
  </div>
)

```

## Usage with react
```jsx
import React from 'react'
import Style, { withStyles } from 'next-styled-css'
import s, { sheet } from './home.css'

const Home = () => (
  <div>
    <Style sheet={sheet} />

  </div>
)

// Component[, sheet[, variables]]
export default withStyles(Home)
