
import React, {Component} from 'react'
import moment from 'moment'
import Datatable from '../Datatable'
import SearchBar from '../Common/SearchBar'
import Modal from '../Modal'

export default class OperTableLogs extends Component {
  constructor() {
    super()
    this.state = {
      index: 1,
      userNameInput:'',
      tableNameInput: '',
      today: moment().format("yyyy-MM-dd"),
      startDate: null,
      endDate: null,
      operId: '',
      showDetailModal: false,
      detail: null
    }
    var self = this
    this.handleSearch = this.handleSearch.bind(this)
    this.handleDatesChange = this.handleDatesChange.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.toggleOps = this.toggleOps.bind(this)
    this.clearOps = this.clearOps.bind(this)
    this.showDetailModal = this.showDetailModal.bind(this)
    this.closeDetailModal = this.closeDetailModal.bind(this)

    this.searchBarItems = [
      {
        label: "用户名:",
        type:"text",
        props: {
          ref:(input) => {this.userNameInput = input}
        }
      },
      {
        label: "表名:",
        type:"text",
        props: {
          ref:(input) => {this.tableNameInput = input}
        }
      },
      {
        label: "操作日期:",
        type:"daterange",
        props:{
          showClearDate:true,
          onDatesChange:self.handleDatesChange,
          output:"date",
          style: {width: "100%"}
        }
      }
    ],
    this.columns = [
      {text: '操作用户', name: 'user_name', style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}},
      {text: '操作时间', name: 'oper_time', style: {maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis'}},
      {text: '操作类型', name: 'action_type', style: {maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis'}},
      {text: '操作表名', name: 'from_table', style: {maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}},
      {text: '动作', name: 'oper_log', style: {maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis'}},
      {
        text: '操作', style: {textAlign: 'center','width': '80px',}, renderDom: row => {
        return (
          <div styleName="table-ops">
            <a href="javascript:" onClick={(e) => self.toggleOps(e, row)}>操作</a>
            <div styleName={(row.oper_id == self.state.operId) ? "show-ops" : 'hidden-ops'}>
              <a href="javascript:" onClick={() => self.showDetailModal(row)}>查看详情</a>
            </div>
          </div>
        )
      }
      }
    ],
    this.detailModalColumns = [
      {
        name: 'user_name',
        text: '操作用户',
        type: 'text',
        readOnly: true
      },
      {
        name: 'from_org_code',
        text: '机构编码',
        type: 'text',
        readOnly: true
      },
      {
        name: 'oper_time',
        text: '操作时间',
        type: 'text',
        readOnly: true
      },
      {
        name: 'action_type',
        text: '操作类型',
        type: 'text',
        readOnly: true
      },
      {
        name: 'from_table',
        text: '操作表名',
        type: 'text',
        readOnly: true
      },
      {
        name: 'oper_log',
        text: '动作',
        type: 'text',
        readOnly: true,
        renderDom: row => (<span style={{wordWrap: 'break-word'}}>{row.oper_log}</span>)
      }
    ]
  }

  toggleOps(e, row) {
    e.preventDefault();
    e.stopPropagation();
    const {operId} = this.state
    if (operId == row.oper_id) {
      this.setState({operId: ''})
    } else {
      this.setState({operId: row.oper_id})
    }
  }

  clearOps() {
    if (this.state.operId) {
      this.setState({operId: ''})
    }
  }

  handleDatesChange({startDate, endDate}) {
    this.setState({startDate, endDate}, () => {
      this.handleSearch()
    })
  }

  handleSearch(index) {
    let myIndex = (typeof index == 'undefined') ? 1: index
    this.setState({index: myIndex}, () => {
      this.props.searcher({
        pageIndex: this.state.index,
        operTimeStart: this.state.startDate && this.state.startDate.format('YYYY-MM-DD 00:00:00'),
        operTimeEnd: this.state.endDate && this.state.endDate.format('YYYY-MM-DD 23:59:59'),
        userName: this.userNameInput.value,
        tableName: this.tableNameInput.value
      })
    })
  }

  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  componentWillMount() {
    window.addEventListener("click", this.clearOps)
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.clearOps);
  }

  componentDidMount() {
    this.handleSearch()
  }

  showDetailModal(row){
    this.setState({detail: {...row}, showDetailModal: true})
  }
  closeDetailModal(){
    this.setState({detail: null, showDetailModal: false})
  }

  render() {
    const {data} = this.props
    const {showDetailModal} = this.state
    return (
      <div className="component">
        <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
          <button type="submit" className="btn icon-btn btn-primary pull-right">
            <i className="fa fa-search"></i>搜索
          </button>
        </SearchBar>

        <div className="wrapper">
          <Datatable columns={this.columns} rows={data.rows} index={this.state.index} searcher={this.handleSearch}
                     total={data.total}/>
        </div>

        { showDetailModal && <Modal data={this.state.detail} columns={this.detailModalColumns} title="操作详情" closer={ this.closeDetailModal } confirm={this.closeDetailModal} /> }
      </div>
    )
  }
}
