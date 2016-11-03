import React from 'react'
import ThemeProvider from './ThemeProvider'

/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
export default (adapter, Component) => {
  const applyAdaptation = theme => Object.assign(
    { __originalTheme: theme }, adapter(theme)
  )
  const restoreOriginal = adaptedTheme => adaptedTheme.__originalTheme

  return props => (
    <ThemeProvider theme={applyAdaptation}>
      <Component {...props}>
        { props.children && <ThemeProvider theme={restoreOriginal}>
          { props.children }
        </ThemeProvider> }
      </Component>
    </ThemeProvider>
  )
}
