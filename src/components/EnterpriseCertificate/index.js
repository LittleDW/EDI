import React, {Component} from 'react'

export default class EnterpriseCertificate extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
  }

  componentWillUnmount() {
    this.props.RESET_CERTIFICATE()
  }


  componentDidMount() {
    this.props.CALL_CERTIFICATE_HOST_GET()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.CERTIFICATE.certificateUrl != null) {
      return true
    } else {
      return false
    }
  }

  render() {
    const certificateUrl = this.props.CERTIFICATE.certificateUrl
    return (
      <div className="component">
        <div className="wrapper__no-filter-form">
          {certificateUrl && <iframe width="100%" height="700" scrolling="no" frameBorder={0} marginHeight={0} marginWidth={0} src={`${certificateUrl}#/template/view/ORGANIZATION`}></iframe>}
        </div>
      </div>
    )
  }
}
