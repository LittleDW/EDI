/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import SingleDatePicker from '../SingleDatePicker'
import DateRangePicker from '../DatePicker/DateRangePicker'
import Select from '../Select'
import {escCloser,isElement} from '../../utils/etc'
import myStyle from "./style.scss"

export default class InputGroup extends Component {
  constructor(props) {
    super(props)
    let {items, defaultItem, onChange} = props
    this.items = (items || []).map((s,j)=>{
      let childControl
      switch (s.type) {
        case 'date':
          childControl = <SingleDatePicker {...s.props}/>
          break;
        case 'daterange':
          childControl = <DateRangePicker {...s.props}/>
          break;
        case 'select':
          childControl = <Select {...s.props}/>;
          break;
        case 'custom':
          childControl = (typeof s.renderDom == "function")&&s.renderDom()||s.dom || '请实现自定义控件';
          break;
        default:
          childControl = <input type="text" {...s.props}/>
      }
      return {label: s.label, control: childControl, resetState: s.resetState, onChange:s.onChange}
    })
    this.state = {
      panelOpen: false,
      selection: defaultItem && this.items.find(r=>r.label == defaultItem) || this.items[0]
    }
    if(typeof onChange == "function"){
      onChange(this.state.selection)
    }
    this.defaultOption = {label: props.placeholder || "全部", value: ""}
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
    const {selection:newSelection, panelOpen: newPanelOpen} = this.state
    const {selection, panelOpen} = preState
    const {defaultItem: newDefaultItem} = this.props
    const {defaultItem} = prevProps
    if(newDefaultItem != defaultItem){
      this.setState({panelOpen: false, selection: this.items.find(r=>r.label == defaultItem)})
    }
  }

  componentDidMount() {
  }

  resetState=() =>{
    this.setState({panelOpen: false, selection: null})
  }

  closePanel=() =>{
    const {onChange, multiple, options, disabled} = this.props
    this.setState({panelOpen: false})
  }

  togglePanel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const {panelOpen} = this.state
    this.setState({panelOpen: !panelOpen},()=>{
      if(this.state.panelOpen){
        let {selection} = this.state
        if(selection){
          let {reference} = selection
          if(isElement(reference)){
            reference.scrollIntoView(false)
          }
        }
      }
    })
  }

  generateActionSelector = (item)=>{
    return (e)=>{
      e.preventDefault();
      e.stopPropagation();
      let {onChange} = this.props, {selection} = this.state
      if(selection && (selection !== item)){
        if(selection.resetState){
          selection.resetState()
        } else if (selection.control){
          if(selection.control.getWrappedInstance){
            let instance = selection.control.getWrappedInstance();
            if(instance.resetState){
             instance.resetState()
            }
          } else if(selection.control.props.resetState){
            selection.control.props.resetState()
          }
        }
      }
      this.setState({selection: item, panelOpen: false},()=>{
        if(typeof onChange == "function"){
          onChange(item);
        }
      })
    }
  }

  renderControl = ()=>{
    const {selection} = this.state
    return selection && selection.control || (<input type="text" className="form-control" disabled={true} placeholder="没有设置控件" />);
  }
  renderSelection = () =>{
    return (
      <ul className="dropdown-menu ">
        {this.items.map((r,i)=><li key={i} ref={(link) => {
          r.reference = link
        }}><a href="javascript:" onClick={this.generateActionSelector(r)}>{r.label}</a></li>)}
      </ul>
    )
  }


  render() {
    const {style} = this.props
    const {panelOpen,selection} = this.state
    let label = selection && selection.label || "切换"
    return (<div style={style} className={`input-group ${myStyle["edi-input-group"]}`}>
      <div className={`input-group-btn  ${panelOpen ? 'open' : ''}`}>
        <button type="button" className={`btn ${myStyle["edi-input-group-btn__without-border"]}`} onClick={this.togglePanel}>{label} <span className="caret"></span></button>
        {this.renderSelection()}
      </div>
      {this.renderControl()}
    </div>)
  }
}
InputGroup.propTypes = {
  defaultItem: PropTypes.string,
  items: PropTypes.array
}
