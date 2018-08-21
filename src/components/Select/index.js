/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {escCloser,isElement} from '../../utils/etc'
import myStyle from "./style.scss"

export default class Select extends Component {
  constructor(props) {
    super(props)
    this.state = {panelOpen: false, selection: {}, selections: []}
    this.items = []
    this.defaultOption = {label: props.placeholder || "全部", value: ""}
    this.handleClick = this.handleClick.bind(this)
    this.closePanel = this.closePanel.bind(this)
    this.togglePanel = this.togglePanel.bind(this)
    this.recalcSelection = this.recalcSelection.bind(this)
    this.checkAll = this.checkAll.bind(this)
    this.resetState = this.resetState.bind(this)
    this.triggerSelectionAndOnChange = this.triggerSelectionAndOnChange.bind(this)
    this.escCloser = escCloser(this.closePanel)
  }

  componentWillMount() {
    window.addEventListener("click", this.closePanel)
    window.addEventListener("keydown", this.escCloser)
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.closePanel);
    window.removeEventListener("keydown", this.escCloser);
  }

  componentDidUpdate(prevProps, preState) {
    const {selection: newSelection, selections: newSelections, panelOpen: newPanelOpen} = this.state
    const {selection, selections, panelOpen} = preState
    const {options: newOptions, extValue} = this.props
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

    /*if (newOptions && (newOptions.length > 0) && ((options && (options.length == 0)) || options && ([].concat.apply([], options.map((r, i) => ([].concat.apply([], newOptions.map(t => (t.value == r.value) ? [t] : [])).length ? [r] : []))).length != options.length))) {
      this.recalcSelection()
    }*/
  }

  componentDidMount() {
    this.recalcSelection()
  }

  resetState() {
    this.setState({panelOpen: false, selection: null, selections: []})
  }
  triggerSelectionAndOnChange(selection){
    const {onChange, disabled, allowChangeOnDisable} = this.props, self = this
    this.setState({selection}, ()=>{
      if((!disabled || (disabled && allowChangeOnDisable)) && (typeof onChange === "function")){
        let handler = setTimeout(()=>{
          clearTimeout(handler)
          onChange(selection)
        })
      }
    });
  }
  recalcSelection() {
    const {noEmpty, options, multiple, onChange, defaultValue, extValue, disabled, forceExtChange} = this.props, self = this
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
    } else if(extValue){
      if (options && options.length) {
        let defaultValueOption = [].concat.apply([], options.map(r => (r.value == extValue) ? [r] : []))[0] || options[0]|| this.defaultOption
        this.triggerSelectionAndOnChange(defaultValueOption)
      } else {
        this.setState({...this.state, selection: this.defaultOption})
      }
    } else if(forceExtChange){
      this.triggerSelectionAndOnChange(this.defaultOption)
    } else if(!this.state.selection || !this.state.selection.value){
      if (defaultValue) {
        let defaultValueOption = [].concat.apply([], options.map(r => (r.value == defaultValue) ? [r] : []))[0] || options[0]|| this.defaultOption
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
    } else if(options && options.length){
      let newSelection = options.filter(r=>(r.value == self.state.selection.value))[0]
      if (newSelection){
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
  }

  handleClick(e, row) {
    e.preventDefault();
    e.stopPropagation();
    const {onChange, multiple, disabled} = this.props
    if (disabled) {
      return
    }
    if (multiple) {
      let {selections} = this.state,
        includes = [].concat.apply([], selections.map((r, i) => (r.value == row.value) ? [i] : []))
      if (includes.length) {
        selections.splice(includes[0], 1)
      } else {
        selections.push(row)
      }
      this.setState({...this.state, selections})
    } else {
      this.setState({...this.state, panelOpen: false, selection: row})
      !disabled && onChange && onChange(row)
    }
  }

  closePanel() {
    const {onChange, multiple, options, disabled} = this.props
    if (this.state.panelOpen) {
      if (multiple) {
        !disabled && onChange && onChange(this.state.selections)
      }
      this.setState({...this.state, panelOpen: false})
    }
  }

  togglePanel(e) {
    const {disabled, multiple, onChange} = this.props
    const {panelOpen} = this.state
    if (disabled){
      e.preventDefault();
      e.stopPropagation();
      return
    }
    if(panelOpen){
      this.setState({panelOpen: false})
      if (multiple) {
        onChange && onChange(this.state.selections)
      }
      return
    }
    let self = this;
    setTimeout(() => {
      let panelOpen = !self.state.panelOpen
      this.setState({panelOpen: panelOpen})
      const {onChange, multiple, options} = self.props
      const {selection} = self.state
      if (multiple && !panelOpen) {
        !disabled && onChange && onChange(self.state.selections)
      }
      if (!multiple && self.items.length && selection) {
        let index = [].concat.apply([], options.map((r, i) => (r.value == selection.value) ? [i] : []))[0]
        if((index != -1) && isElement(self.items[index])){
          self.items[index].scrollIntoView(false)
        }
      }
    })
  }

  checkAll(e) {
    e.preventDefault();
    e.stopPropagation();
    let panelOpen = !this.state.panelOpen, {selections} = this.state
    const {multiple, options} = this.props
    if (multiple && !panelOpen) {
      if ([].concat.apply([], options.map(t => ([].concat.apply([], selections.map(r => (r.value == t.value) ? [r] : [])).length) ? [t] : [])).length == options.length) {
        this.setState({...this.state, selections: []})
      } else {
        this.setState({...this.state, selections: [...options]})
      }
    }
  }

  renderOptions() {
    const {noEmpty, options, multiple, optionStyle} = this.props
    let {selections,selection} = this.state
    var self = this
    return (
      <ul className="dropdown-menu" style={optionStyle}>
        {(!noEmpty && !multiple) && <li onClick={(e) => {
          self.handleClick(e, self.defaultOption)
        }}><a href="javascript:">{this.defaultOption.label}</a></li>}
        {multiple && <li onClick={this.checkAll}><a href="javascript:">全选</a></li>}
        {options && options.map((r, i) => (<li key={i} onClick={(e) => {
          self.handleClick(e, r)
        }} ref={(item) => {
          this.items[i] = item
        }} className="clearfix">
          <a
            href="javascript:">{multiple && ([].concat.apply([], selections.map(t => (r.value == t.value) ? [t] : [])).length > 0) &&
          <i className="pull-right fa fa-check"></i>}
            {!multiple && selection && (selection.value == r.value) &&
            <i className="pull-right fa fa-check"></i>}{r.label}</a></li>))}
      </ul>
    )
  }


  render() {
    const {style, multiple, disabled} = this.props
    const {panelOpen, selection, selections} = this.state
    return (
      <div style={style} className={`${myStyle["edi-select"]} ${panelOpen ? 'open' : ''}`}>
        <button type="button" disabled={disabled}
                className={`btn btn-default dropdown-toggle ${myStyle["edi-select-btn"]}`}
                onClick={this.togglePanel}>
          {!multiple ? (selection && selection.label || this.defaultOption.label) : (selections && selections.length && selections.map((r) => r.label).join(",") || this.defaultOption.label)}
          <span className="caret"></span>
                </button>
        {panelOpen && this.renderOptions()}
      </div>
    )
  }
}
Select.propTypes = {
  /*loadingLabel: PropTypes.string.isRequired,
   pageCount: PropTypes.number,
   renderItem: PropTypes.func.isRequired,
   items: PropTypes.array.isRequired,
   isFetching: PropTypes.bool.isRequired,
   onLoadMoreClick: PropTypes.func.isRequired,
   nextPageUrl: PropTypes.string*/
  onChange: PropTypes.func,
  options: PropTypes.array,
  multiple: PropTypes.bool,
  noEmpty: PropTypes.bool,
  extValue: PropTypes.string
}
