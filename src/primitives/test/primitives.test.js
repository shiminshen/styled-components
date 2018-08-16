import 'react-primitives'
import { View } from 'react-primitives'
import React from 'react'

import styled from '../index'
import { shallow, mount } from 'enzyme'

// NOTE: These tests are copy pasted from ../native/test/native.test.js

describe('primitives', () => {
  it('should not throw an error when called with a valid element', () => {
    expect(() => styled.View``).not.toThrowError()

    const FunctionalComponent = () => <View />
    class ClassComponent extends React.Component {
      render() {
        return <View />
      }
    }
    const validComps = ['View', FunctionalComponent, ClassComponent]
    validComps.forEach(comp => {
      expect(() => {
        const Comp = styled(comp)
        mount(<Comp />)
      }).not.toThrowError()
    })
  })

  it('should throw a meaningful error when called with an invalid element', () => {
    const FunctionalComponent = () => <View />
    class ClassComponent extends React.Component {
      render() {
        return <View />
      }
    }
    const invalidComps = [
      undefined,
      null,
      123,
      [],
      <View />,
      <FunctionalComponent />,
      <ClassComponent />,
    ]
    invalidComps.forEach(comp => {
      expect(() => {
        // $FlowInvalidInputTest
        const Comp = styled(comp)
        mount(<Comp />)
        // $FlowInvalidInputTest
      }).toThrow(`Cannot create styled-component for component: ${comp}`)
    })
  })

  it('should generate inline styles', () => {
    const Comp = styled.View``
    const wrapper = mount(<Comp />)
    const view = wrapper.find('View').first()

    expect(view.prop('style')).toEqual([{}, undefined])
  })

  it('should combine inline styles and the style prop', () => {
    const Comp = styled.View`
      padding-top: 10;
    `

    const style = { opacity: 0.9 }
    const wrapper = mount(<Comp style={style} />)
    const view = wrapper.find('View').first()

    expect(view.prop('style')).toEqual([{ paddingTop: 10 }, style])
  })

  describe('attrs', () => {
    it('works fine with an empty object', () => {
      const Comp = styled.View.attrs({})``
      const wrapper = mount(<Comp />)
      const view = wrapper.find('View').first()

      expect(view.props()).toEqual({
        style: [{}, undefined],
      })
    })

    it('passes simple props on', () => {
      const Comp = styled.View.attrs({
        test: true,
      })``

      const wrapper = mount(<Comp />)
      const view = wrapper.find('View').first()

      expect(view.props()).toEqual({
        style: [{}, undefined],
        test: true,
      })
    })

    it('calls an attr-function with context', () => {
      const Comp = styled.View.attrs({
        copy: props => props.test,
      })``

      const test = 'Put that cookie down!'
      const wrapper = mount(<Comp test={test} />)
      const view = wrapper.find('View').first()

      expect(view.props()).toEqual({
        style: [{}, undefined],
        copy: test,
        test,
      })
    })

    it('merges multiple calls', () => {
      const Comp = styled.View.attrs({
        first: 'first',
        test: '_',
      }).attrs({
        second: 'second',
        test: 'test',
      })``

      const wrapper = mount(<Comp />)
      const view = wrapper.find('View').first()

      expect(view.props()).toEqual({
        style: [{}, undefined],
        first: 'first',
        second: 'second',
        test: 'test',
      })
    })

    it('merges attrs when inheriting SC', () => {
      const Parent = styled.View.attrs({
        first: 'first',
      })``

      const Child = styled(Parent).attrs({
        second: 'second',
      })``

      const wrapper = mount(<Child />)
      const view = wrapper.find('View').first()

      expect(view.props()).toEqual({
        style: [{}, [{}, undefined]],
        first: 'first',
        second: 'second',
      })
    })
  })

  describe('expanded API', () => {
    it('should attach a displayName', () => {
      const Comp = styled.View``
      expect(Comp.displayName).toBe('Styled(View)')

      const CompTwo = styled.View.withConfig({ displayName: 'Test' })``
      expect(CompTwo.displayName).toBe('Test')
    })

    it('should allow multiple calls to be chained', () => {
      const Comp = styled.View.withConfig({ displayName: 'Test1' }).withConfig({
        displayName: 'Test2',
      })``

      expect(Comp.displayName).toBe('Test2')
    })
  })
})
