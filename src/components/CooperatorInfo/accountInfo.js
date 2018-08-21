import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Datatable from '../Datatable'
import SearchBar from '../Common/SearchBar'
import AssetUserFromSelectorPage from '../Select/AssetUserFromSelectorPage'
import FundRelatedUserFromSelectorPage from '../Select/FundRelatedUserFromSelectorPage'
import {FormatOrgCode} from '../Formatter'

export default class CooperatorInfo extends Component {
  static propTypes = {
    _SESSION: PropTypes.object.isRequired,
    COOPERATOR_ACCOUNTS: PropTypes.object.isRequired,
    CALL_COOPERATOR_ACCOUNT_INFO_QUERY: PropTypes.func.isRequired,
    RESET_COOPERATOR_ACCOUNT_INFO: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      index: 1,
      borrowType: "A",
      assetOrgCode: "",
      fundOrgCode: "",
    }

    var self = this, {org_code, user_type} = props._SESSION
    this.tableColumns = [
      {
        text: '开户时间',
        name: 'account_time',
        style: {maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '借款人',
        name: 'borrow_name',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '借款人证件号',
        name: 'borrow_certificate_no',
        style: {maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '开户银行',
        name: 'borrow_bank',
        style: {overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '银行卡号',
        name: 'borrow_card_no',
        style: {maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '银行手机预留号',
        name: 'borrow_phone',
        style: {maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '资金方',
        name: 'fund_org_code',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'},
        renderDom: row => <FormatOrgCode value={row.fund_org_code}/>
      },
      {
        text: '开户状态',
        name: 'account_status',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
    ]

    this.searchBarItems = [
      {
        label: "借款人证件号:",
        type:"group",
        props:{
          items:[
            {
              label: "证件号",
              type:"text",
              props:{
                ref:(input) => {self.idCardInput = input},
              },
              resetState: ()=>{
                if(self.idCardInput){
                  self.idCardInput.value = ""
                }
              },
              onChange: ()=>{
                self.setState({borrowType:"A"})
              }
            },
            {
              label: "营业执照号",
              type:"text",
              props:{
                ref:(input) => {self.businessLienceInput = input},
              },
              resetState: ()=>{
                if(self.businessLienceInput){
                  self.businessLienceInput.value = ""
                }
              },
              onChange: ()=>{
                self.setState({borrowType:"B"})
              }
            },
          ]
        }
      },
    ]

    if(user_type === 1){
      this.searchBarItems.push({
        label: "资金方:",
        type: "custom",
        dom: <FundRelatedUserFromSelectorPage assetOrgCode={org_code} onChange={this.handleFundOrgChange} userFrom={"1"}/>
      })
    } else if (user_type === 3){
      this.searchBarItems = [
        ...this.searchBarItems,
        {
          label: "资产方:",
          type: "custom",
          dom: <AssetUserFromSelectorPage onChange={this.handleAssetOrgChange} userFrom={"1"}/>
        },
        {
          label: "资金方:",
          type: "custom",
          renderDom: ()=>{
            let {assetOrgCode} = self.state
            return <FundRelatedUserFromSelectorPage onChange={this.handleFundOrgChange} assetOrgCode={assetOrgCode} userFrom={"1"} allowEmpty/>
          }
        }
      ]
    }
  }

  handleAssetOrgChange = (row) => {
    this.setState({assetOrgCode: row.value, index: 1}, this.handleSearch)
  }
  handleFundOrgChange = (row) => {
    this.setState({fundOrgCode: row.value, index: 1}, this.handleSearch)
  }

  componentWillMount() {

  }

  componentWillUnmount() {
    this.props.RESET_COOPERATOR_ACCOUNT_INFO()
  }

  componentDidMount() {
    //this.handleSearch()
  }

  handleSearch = (index) =>{
    let myIndex = (typeof index == 'undefined') ? 1: index,
      {index: currentIndex, assetOrgCode, fundOrgCode, borrowType} = this.state,
      {user_type} = this.props._SESSION,
      mySearch = ()=>{
        return this.props.CALL_COOPERATOR_ACCOUNT_INFO_QUERY({
          pageIndex: myIndex,
          assetOrgCode,
          fundOrgCode,
          borrowType,
          borrowCertificateNo: this.idCardInput && this.idCardInput.value || this.businessLienceInput && this.businessLienceInput.value,
        })
      }
    if(this.idCardInput && this.idCardInput.value || this.businessLienceInput && this.businessLienceInput.value){
      if((user_type === 3) && assetOrgCode || (user_type === 1)){
        if(index !== currentIndex){
          this.setState({index:myIndex},mySearch)
        } else {
          return mySearch()
        }
      } else {
        this.props.SET_MESSAGE("请指定资产方机构","FAIL")
      }
    } else {
      this.props.SET_MESSAGE("身份证号或营业证号不能为空","FAIL")
    }

  }

  onSearch = (e) =>{
    e.preventDefault();
    e.stopPropagation();
    /*if(this.idCardInput && this.idCardInput.value || this.businessLienceInput && this.businessLienceInput.value){
      return this.handleSearch();
    } else{
      this.props.SET_MESSAGE("身份证号或营业证号不能为空","FAIL")
    }*/
    return this.handleSearch();
  }

  render() {
    const {COOPERATOR_ACCOUNTS} = this.props
    const {working} = COOPERATOR_ACCOUNTS
    return (
      <div className="component">
        <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
          <button type="submit" className="btn icon-btn btn-primary pull-left">
            <i className="fa fa-search"></i>查询
          </button>
        </SearchBar>
        <div className="wrapper">
          <Datatable columns={ this.tableColumns} rows={ COOPERATOR_ACCOUNTS.rows } index={ this.state.index }
                     searcher={ this.handleSearch } total={COOPERATOR_ACCOUNTS.total}
          />
          <div className="wrapper__content-tips">
            <p>
              * 个人借款用户：请查询借款人证件号<br/>
              * 企业借款用户：请查询借款人营业执照号
            </p>
          </div>
        </div>
      </div>
    )
  }
}
