/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import SingleDatePicker from '../SingleDatePicker'
import DateRangePicker from '../DatePicker/DateRangePicker'
import Select from '../Select'
import InputGroup from './InputGroup'
import style from './style.scss'
import CSSModules from 'react-css-modules'

@CSSModules(style, {allowMultiple: true})
export default class SearchBar extends Component {
  constructor(props){
    super(props)
    this.renderInput = (column)=>{
      return  <input type="text" {...column.props}/>
    }
    this.renderDatePicker = (column)=>{
      return  <SingleDatePicker {...column.props}/>
    }
    this.renderSelect = (column)=>{
      return <Select {...column.props}/>
    }


  }
  componentWillMount() {

  }

  componentWillUnmount() {

  }
  render() {
    const {items,searcher} = this.props
    const self = this
    return (
      <form styleName="table-infos" onSubmit={searcher}>
        <div className="clearfix" styleName="form-control-part">
          {
            items.map((r,i)=>{
              let control
              switch (r.type) {
                case 'date':
                  control = <SingleDatePicker {...r.props}/>
                  break;
                case 'daterange':
                  control = <DateRangePicker {...r.props}/>
                  break;
                case 'select':
                  control = <Select {...r.props}/>;
                  break;
                case 'custom':
                  control = (typeof r.renderDom == "function")&&r.renderDom()||r.dom || '请实现自定义控件';
                  break;
                case 'group':
                  control = <InputGroup {...r.props} onChange={(item)=>{
                    if(item){
                      r.label = `${item.label}:`;
                    } else {
                      r.label = "请选择控件";
                    }
                    if(typeof item.onChange == "function"){
                      let result = item.onChange(item)
                      if(result && result.constructor && (result.constructor.name == "Promise")){
                        result.then(self.forceUpdate);
                      } else {
                        self.forceUpdate()
                      }
                    } else {
                      self.forceUpdate()
                    }
                  }}/>
                  break;
                default:
                  control = <input type="text" {...r.props}/>
              }

              if(r.type != "group"){
                return (<div className="form-group" styleName="item" key={i}>
                  <label>{r.label}</label>
                  <div styleName="form-control">
                    {control}
                  </div>
                </div>)
              } else {
                return (<div className="form-group" styleName="item" key={i}>
                  {control}
                </div>)
              }
            })
          }
        </div>
        <div className="clearfix" styleName="btn-part">
          {this.props.children}
        </div>
      </form>
    )
  }
}
SearchBar.propTypes = {
  defaultData: PropTypes.object,
  items: PropTypes.array.isRequired,
  searcher: PropTypes.func,
}
