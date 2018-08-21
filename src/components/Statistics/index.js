import React from 'react'
import Statistics from './Statistics'
import AdminStatistics from './AdminStatistics'


function HOCStatistics() {
  return class HOCStatistics extends React.Component {
    constructor(props) {
      super(props);
      const {pathname, _session} = props
      this.state = {
        Period: pathname.includes('Daily') ? '0' : (pathname.includes('Weekly') ? '1' : '2'),
        Role: pathname.includes('Supply') ? '2' : '1',
        isAdmin: _session.user_type === 3
      };
    }

    render() {
      const {Period, Role, isAdmin} = this.state
      if (isAdmin){
        return (
          <AdminStatistics {...this.props} Period={Period} Role={Role}/>
        )
      } else {
        return (
          <Statistics {...this.props} Period={Period} Role={Role}/>
        )
      }
    }
  }
}
export default HOCStatistics()
