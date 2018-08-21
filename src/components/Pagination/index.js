/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import myStyle from "./style.scss"
import {isMobile} from "../../utils/etc"

export default class Pagination extends Component {

  constructor() {
    super()
    this.isMobile = isMobile()
    this.pageCapacity = this.isMobile?3:5;
    this.state = {
      pages: 0,
      ceilingIndex: this.pageCapacity
    }

    this.toFirst = this.toFirst.bind(this)
    this.toLast = this.toLast.bind(this)
    this.toPrevious = this.toPrevious.bind(this)
    this.toNext = this.toNext.bind(this)
    this.toPage = this.toPage.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    //this.searchIndex = this.searchIndex.bind(this)
  }

  /*componentWillMount() {
   console.log(this.props)
   }*/
  componentDidMount() {
    this.recalcPages(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.total != this.props.total || nextProps.index < this.state.ceilingIndex - this.pageCapacity + 1) {
      this.recalcPages(nextProps)
    }
  }

  recalcPages(props) {
    try {
      this.state.pages = Math.ceil(props.total / 10)
    } catch (e) {
    }
    this.setState({ceilingIndex:Math.max(Math.min(props.index + this.pageCapacity - 1, this.state.pages), this.pageCapacity)})
  }

  toFirst() {
    if (this.props.index == 1) {
      return
    }
    this.state.ceilingIndex = Math.min(this.pageCapacity, this.state.pages)
    return this.props.searcher(1);
  }

  toLast() {
    if (this.props.index == this.state.pages) {
      return
    }
    this.state.ceilingIndex = this.state.pages
    return this.props.searcher(this.state.pages)
  }

  toPrevious() {
    if (this.props.index > 1) {
      if (this.state.ceilingIndex == this.props.index + this.pageCapacity - 1) {
        this.state.ceilingIndex--
      }
      return this.props.searcher(this.props.index - 1)
    }
    //return Promise.reject();
  }

  toNext() {
    if (this.props.index < this.state.pages) {
      if (this.state.ceilingIndex == this.props.index) {
        this.state.ceilingIndex++
      }
      return this.props.searcher(this.props.index + 1)
    }
    //return Promise.reject();
  }

  searchIndex(i) {
    //$scope.index = (typeof i == 'string') ? Number(i) : i
    return this.props.searcher(i)
  }

  toPage() {
    let myIndex = this.toPageNumberInput.value || 0
    //let myIndex = (typeof $scope.myIndex == 'string') ? Number($scope.myIndex) : $scope.myIndex
    if (isNaN(myIndex)) {
      myIndex = Number(myIndex)
    }
    if (myIndex > this.state.pages) {
      return
    }
    if (myIndex <= 0) {
      return
    }

    //let _myIndex = (typeof myIndex == 'string') ? new Number(myIndex) : myIndex;
    this.state.ceilingIndex = Math.max(Math.min(myIndex + this.pageCapacity - 1, this.state.pages), this.pageCapacity)
    return this.props.searchIndex(myIndex)
  }

  renderIndexs() {
    var results = [], self = this, looper = Math.min(this.state.pages, this.state.ceilingIndex),
      startIndex = Math.max(1, this.state.ceilingIndex - this.pageCapacity + 1)
    for (var i = startIndex; i <= looper; i++) {
      var handleSearch = (function (i) {
        return function () {
          self.searchIndex(i)
        }
      })(i)
      results.push((
        <li className={(this.props.index == i) && 'active' || ''} key={i}>
          <a href="javascript:" onClick={handleSearch}>{i}</a>
        </li>))
    }
    return results
  }

  handleSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    let value = Number(this.toPageNumberInput.value)
    if (value < 1) {
      return
    }
    if (value > this.state.pages) {
      this.toLast()
      return
    }
    if (value < Math.min(this.state.pages, this.pageCapacity)) {
      this.setState({ceilingIndex: Math.min(this.pageCapacity, this.state.pages)})
      this.props.searcher(value)
      return
    }
    this.setState({ceilingIndex: value}, () => {this.props.searcher(value)})
  }

  render() {
    const {searcher, style, index, size, total} = this.props
    return (
      <div style={style} className={myStyle["pagination-row"]}>
        <ul className="pagination">
          <li className={(this.props.index == 1) && 'disabled' || ''}>
            <a href="javascript:" onClick={this.toFirst}>{this.isMobile? <i className="fa fa-step-backward"></i>: '首页'}</a>
          </li>
          <li>
            <a href="javascript:" onClick={this.toPrevious}><i className="fa fa-angle-left"></i></a>
          </li>
          {this.renderIndexs()}
          <li>
            <a href="javascript:" onClick={this.toNext}><i className="fa fa-angle-right"></i></a>
          </li>
          <li className={(this.props.index == this.state.pages) && 'disabled' || ''}>
            <a href="javascript:" onClick={this.toLast}>{this.isMobile? <i className="fa fa-step-forward"></i>: '末页'}</a>
          </li>
        </ul>
        {/*<ul class="pagination">
         <li class="disabled"><a href="#" aria-label="Previous"><span aria-hidden="true">«</span></a></li>
         <li class="active"><a href="#">1 <span class="sr-only">(current)</span></a></li>
         <li><a disabled="true" href="#">2</a></li>
         <li><a href="#">3</a></li>
         <li><a href="#">4</a></li>
         <li><a href="#">5</a></li>
         <li><a href="#" aria-label="Next"><span aria-hidden="true">»</span></a></li>
         </ul>*/}
        <form onSubmit={this.handleSearch} className={myStyle["to-page-form"]}>
          <span>共{this.state.pages}页</span>
          <span>跳转到第:</span>
          <input type="number" placeholder="" ref={(input) => {
            this.toPageNumberInput = input;
          }}/>
          <span>页</span>
          <button className="btn btn-primary" type="submit">确定</button>
        </form>
      </div>
    )
  }
}

Pagination.propTypes = {
  index: PropTypes.number.isRequired,
  searcher: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired
}
