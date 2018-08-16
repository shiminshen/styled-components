// @flow
import hoist from 'hoist-non-react-statics'
import React, { Component, createElement } from 'react'
import determineTheme from '../utils/determineTheme'
import { EMPTY_OBJECT } from '../utils/empties'
import generateDisplayName from '../utils/generateDisplayName'
import isTag from '../utils/isTag'
import hasInInheritanceChain from '../utils/hasInInheritanceChain'
import { ThemeConsumer } from './ThemeProvider'

import type { Theme } from './ThemeProvider'
import type { RuleSet, Target } from '../types'

// $FlowFixMe
class BaseStyledNativeComponent extends Component<*, *> {
  static target: Target
  static styledComponentId: string
  static attrs: Object
  static defaultProps: Object
  static inlineStyle: Object
  root: ?Object

  attrs = {}

  render() {
    return (
      <ThemeConsumer>
        {(theme?: Theme) => {
          const { forwardedRef, style, ...props } = this.props
          const { target, defaultProps } = this.constructor

          let generatedStyles
          if (theme !== undefined) {
            const themeProp = determineTheme(this.props, theme, defaultProps)
            generatedStyles = this.generateAndInjectStyles(
              themeProp,
              this.props
            )
          } else {
            generatedStyles = this.generateAndInjectStyles(
              theme || EMPTY_OBJECT,
              this.props
            )
          }

          const propsForElement = {
            ...this.attrs,
            ...props,
            style: [generatedStyles, style],
          }

          if (forwardedRef) propsForElement.ref = forwardedRef

          return createElement(target, propsForElement)
        }}
      </ThemeConsumer>
    )
  }

  buildExecutionContext(theme: any, props: any) {
    const { attrs } = this.constructor
    const context = { ...props, theme }
    if (attrs === undefined) {
      return context
    }

    this.attrs = Object.keys(attrs).reduce((acc, key) => {
      const attr = attrs[key]
      // eslint-disable-next-line no-param-reassign
      acc[key] =
        typeof attr === 'function' && !hasInInheritanceChain(attr, Component)
          ? attr(context)
          : attr
      return acc
    }, {})

    return { ...context, ...this.attrs }
  }

  generateAndInjectStyles(theme: any, props: any) {
    const { inlineStyle } = this.constructor
    const executionContext = this.buildExecutionContext(theme, props)

    return inlineStyle.generateStyleObject(executionContext)
  }

  setNativeProps(nativeProps: Object) {
    if (this.root !== undefined) {
      // $FlowFixMe
      this.root.setNativeProps(nativeProps)
    } else if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        'setNativeProps was called on a Styled Component wrapping a stateless functional component.'
      )
    }
  }
}

export default (InlineStyle: Function) => {
  const createStyledNativeComponent = (
    target: Target,
    options: Object,
    rules: RuleSet
  ) => {
    const {
      isClass = !isTag(target),
      displayName = generateDisplayName(target),
      ParentComponent = BaseStyledNativeComponent,
      attrs,
    } = options

    const inlineStyle = new InlineStyle(rules)

    class StyledNativeComponent extends ParentComponent {
      static attrs = attrs
      static displayName = displayName
      static inlineStyle = inlineStyle
      static styledComponentId = 'StyledNativeComponent'
      static target = target

      static withComponent(tag: Target) {
        const { displayName: _, componentId: __, ...optionsToCopy } = options
        const newOptions = {
          ...optionsToCopy,
          ParentComponent: StyledNativeComponent,
        }
        return createStyledNativeComponent(tag, newOptions, rules)
      }
    }

    if (isClass) {
      // $FlowFixMe
      hoist(StyledNativeComponent, target, {
        // all SC-specific things should not be hoisted
        attrs: true,
        displayName: true,
        inlineStyle: true,
        styledComponentId: true,
        target: true,
        withComponent: true,
      })
    }

    return React.forwardRef((props, ref) => (
      <StyledNativeComponent {...props} forwardedRef={ref} />
    ))
  }

  return createStyledNativeComponent
}
