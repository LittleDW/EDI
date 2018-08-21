/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {isElement} from '../../utils/etc'
import myStyle from "./style.scss"
import {fromJS, is} from "immutable";

export default class Combobox extends Component {
  constructor(props) {
    super(props)
    this.state = {panelOpen: false, value: props.defaultValue || ''}
    this.closePanel = this.closePanel.bind(this)
    this.checkAll = this.checkAll.bind(this)
    this.resetState = this.resetState.bind(this)
  }

  componentWillMount() {
    window.addEventListener("click", this.closePanel)
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.closePanel);
  }

  /*componentDidUpdate(prevProps, preState) {
    const {panelOpen: newPanelOpen} = this.state
    const {options: newOptions} = this.props
    const {options} = prevProps
    if(newOptions && (newOptions.length > 0) && (!options || !options.length)){
      this.recalcSelection()
    } else if (extValue && extValue !== prevProps.extValue && extValue !== newSelection.value) {
      this.recalcSelection()
    } else if (newOptions && (newOptions.length > 0) && options && (options.length > 0)){
      let newOptionValues = newOptions.map(r=>r.value), optionValue = options.map(r=>r.value),
        mergedValues = [...new Set([...newOptionValues, ...optionValue])]
      if ((mergedValues.length != newOptions.length) || (mergedValues.length != optionValue.length)){
        this.recalcSelection()
      }
    }
    if (!is(fromJS(this.props.data), fromJS(nextProps.data))) {
      return true
    }
  }*/

  componentDidMount() {
    //this.recalcSelection()
  }

  resetState() {
    this.setState({panelOpen: false, value: ""})
  }

  /*triggerSelectionAndOnChange(selection) {
    const {onChange, disabled, allowChangeOnDisable} = this.props, self = this
    this.setState({selection}, () => {
      if ((!disabled || (disabled && allowChangeOnDisable)) && (typeof onChange === "function")) {
        let handler = setTimeout(() => {
          clearTimeout(handler)
          onChange(selection)
        })
      }
    });
  }

  recalcSelection = () => {
    const {noEmpty, options, multiple, onChange, defaultValue, extValue, disabled, allowChangeOnDisable} = this.props,
      self = this
    if (multiple) {
      if (this.state.selections.length) {
        if (options && options.length) {
          var newSelections = [].concat.apply([], this.state.selections.map((r, i) => ([].concat.apply([], options.map(t => (t.value == r.value) ? [t] : [])).length ? [r] : [])))
          if (newSelections.length != this.state.selections.length) {
            this.setState({...this.state, selections: newSelections})
          }
        } else {
          this.setState({...this.state, selections: []})
        }
      } else {
        if (defaultValue && defaultValue.length) {
          if (options && options.length) {
            var newSelections = [].concat.apply([], defaultValue.map((r, i) => ([].concat.apply([], options.map(t => (t.value == r) ? [t] : [])).length ? [r] : [])))
            this.setState({...this.state, selections: newSelections})
          } else {
            this.setState({...this.state, selections: []})
          }
        }
      }
    } else if (extValue) {
      if (options && options.length) {
        let defaultValueOption = [].concat.apply([], options.map(r => (r.value == extValue) ? [r] : []))[0] || options[0] || this.defaultOption
        this.triggerSelectionAndOnChange(defaultValueOption)
      } else {
        this.setState({...this.state, selection: this.defaultOption})
      }
    } else if (!this.state.selection.value) {
      if (defaultValue) {
        let defaultValueOption = [].concat.apply([], options.map(r => (r.value == defaultValue) ? [r] : []))[0] || options[0] || this.defaultOption
        if (options && options.length) {
          this.triggerSelectionAndOnChange(defaultValueOption)
        } else {
          this.setState({...this.state, selection: this.defaultOption})
        }
      } else if (noEmpty) {
        if (options && options.length) {
          this.triggerSelectionAndOnChange(options[0])
        } else {
          this.setState({...this.state, selection: this.defaultOption})
        }
      } else {
        this.setState({...this.state, selection: this.defaultOption})
      }
    } else if (options && options.length) {
      let newSelection = options.filter(r => (r.value == self.state.selection.value))[0]
      if (newSelection) {
        this.triggerSelectionAndOnChange(newSelection)
        return
      }
      if (defaultValue) {
        let defaultValueOption = [].concat.apply([], options.map(r => (r.value == defaultValue) ? [r] : []))[0] || options[0] || this.defaultOption
        this.triggerSelectionAndOnChange(defaultValueOption)
      } else if (noEmpty) {
        this.triggerSelectionAndOnChange(options[0])
      } else {
        this.triggerSelectionAndOnChange(this.defaultOption)
      }
    } else {
      this.triggerSelectionAndOnChange(this.defaultOption)
    }
  }*/

  handleChange = (e)=>{
    this.setState({value: this.comboInput.value},()=>{
      this.props.onChange(this.comboInput.value)
    })
  }

  handleClick = (e, row) =>{
    e.preventDefault();
    e.stopPropagation();
    const {onChange, multiple, disabled} = this.props
    if (disabled) {
      return
    }
    if (multiple) {
      let {value} = this.state, words = (typeof value == "string")? value.split(","):[];
      (value !== row.value) && !words.includes(String(row.value || "")) && this.setState({value:  `${value?`${value},`:""}${row.value}`})
    } else {
      this.setState({panelOpen: false, value: row.value})
      onChange && onChange(row.value)
    }
  }

  closePanel = (e) => {
    const {onChange, disabled} = this.props
    const {panelOpen, value} = this.state
    if (panelOpen && document.activeElement !== this.comboInput) {
      !disabled && onChange && onChange(value)
      this.setState({...this.state, panelOpen: false})
    }
  }

  openPanel = (e) => {
    const {disabled} = this.props
    const {panelOpen} = this.state
    if (disabled) {
      return
    }
    if (!panelOpen) {
      this.setState({panelOpen: true})
    }
  }

  checkAll(e) {
    e.preventDefault();
    e.stopPropagation();
    const {options} = this.props

    this.setState({value: Array.isArray(options) ? options.map(r=>r.value).join(","): ""})
  }

  renderOptions = () =>{
    const {options, multiple} = this.props
    var self = this
    return (
      <ul className="dropdown-menu">
        {multiple && <li onClick={this.checkAll}><a href="javascript:">全选</a></li>}
        {options && options.map((r, i) => (<li key={i} onClick={(e) => {self.handleClick(e, r)}} className="clearfix">
          <a href="javascript:">{r.label}</a>
        </li>))}
      </ul>
    )
  }


  render() {
    const {style, disabled, type, maxLength} = this.props
    const {panelOpen, value} = this.state
    return (
      <div style={style} className={`${myStyle["edi-combo"]} ${panelOpen ? 'open' : ''}`}>
        <input type={type || "text"} disabled={disabled} onFocus={this.openPanel} onClick={this.openPanel} value={value} onChange={this.handleChange} maxLength={maxLength} ref={(input) => {
          this.comboInput = input;
        }}/>
        <span className="caret"></span>
        {panelOpen && this.renderOptions()}
      </div>
    )
  }
}
Combobox.propTypes = {
  onChange: PropTypes.func,
  options: PropTypes.array,
  multiple: PropTypes.bool,
  noEmpty: PropTypes.bool,
  extValue: PropTypes.string
}
