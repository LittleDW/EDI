import React, {Component} from 'react'
import PropTypes from 'prop-types'
import CSSModules from 'react-css-modules'
import style from "../../styles/modules.scss"
import AssetRelatedSelectorPage from '../Select/AssetRelatedSelectorPage'
import FundRelatedSelectorPage from '../Select/FundRelatedSelectorPage'

@CSSModules(style, {allowMultiple: true})
export default class OrgFilter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      assetOrgCode: props.session.user_type === 1 ? props.session.org_code : '',
      fundOrgCode: props.session.user_type === 2 ? props.session.org_code : ''
    }

    this.renderFundSelect = () => {
      return (
        <FundRelatedSelectorPage onChange={this.handleFundOrgChange} assetOrgCode={this.state.assetOrgCode}/>
      )
    }

    this.renderAssetSelect = () => {
      return (
        <AssetRelatedSelectorPage onChange={this.handleAssetOrgChange} fundOrgCode={this.state.fundOrgCode}/>
      )
    }

    this.handleFundOrgChange = ({value}) => {
      this.setState({
        fundOrgCode: value
      }, this.triggerPropSearch)
    }

    this.triggerPropSearch = () => {
      const {assetOrgCode, fundOrgCode} = this.state
      this.props.handleOrgChange({assetOrgCode, fundOrgCode})
    }

    this.handleAssetOrgChange = ({value}) => {
      this.setState({
        assetOrgCode: value
      }, this.triggerPropSearch)
    }
  }

  componentDidMount() {
    this.triggerPropSearch()
  }

  render() {
    const {user_type} = this.props.session
    return (
      <div className='row info-row'>
        {user_type !== 2 && <div className="col-sm-3">
          <label className="col-sm-3 filter-form__static-text">
            <span>资金方:</span>
          </label>
          <div className="col-sm-8">
            {this.renderFundSelect()}
          </div>
        </div>}
        {user_type !== 1 && <div className="col-sm-3">
          <label className="col-sm-3 filter-form__static-text">
            <span>资产方:</span>
          </label>
          <div className="col-sm-8">
            {this.renderAssetSelect()}
          </div>
        </div>}
      </div>
    )
  }

}

OrgFilter.propTypes = {
  session: PropTypes.object.isRequired,
  handleOrgChange: PropTypes.func.isRequired
}
