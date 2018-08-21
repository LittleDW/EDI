import React, {Component} from 'react'
import Modal from '../Modal/'

class Profile extends Component {
  constructor(props) {
    super(props)
    var self = this, session = self.props.session
    this.state = {
      showMode: false,
      user_account: '',
      data: {
        old_password: '',
        new_password: '',
        confirm_password: '',
        linkman: '',
        mobile: '',
        email: '',
        user_id: '',
      },
      message: {
        old_password: '',
        new_password: '',
        confirm_password: '',
        linkman: '',
        mobile: '',
        email: '',
        user_id: '',
      }
    }
    this.visibleColumns = [
      {
        name: 'tel',
        text: '联系人电话',
        type: 'text',
        handleChange: (e) => {
          self.state.data.tel = e.target.value
        },
        validate: () => null
      },
      {
        name: 'mobile',
        text: '联系人手机',
        type: 'text',
        labelClassName: "asterisk",
        handleChange: (e) => {
          self.state.data.mobile = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.mobile == undefined) || !row.mobile)?"必填":null
        }
      },
      {
        name: 'email',
        text: '联系人邮箱',
        type: 'email',
        labelClassName: "asterisk",
        handleChange: (e) => {
          self.state.data.email = e.target.value
        },
        validate: () => {
          var row = self.state.data
          if((typeof row.email == undefined) || !row.email){
            return "必填"
          } else if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(row.email)){
            return "邮箱格式需正确"
          }
          return null
        }
      }
    ]
    this.passwordColumns = [
      {
        name: 'old_password',
        text: '原密码',
        type: 'password',
        labelClassName: "asterisk",
        handleChange: (e) => {
          self.state.data.old_password = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.old_password == undefined) || !row.old_password)?"必填":null
        }
      },
      {
        name: 'new_password',
        text: '新密码',
        type: 'password',
        labelClassName: "asterisk",
        handleChange: (e) => {
          self.state.data.new_password = e.target.value
        },
        validate: () => {
          var row = self.state.data
          if((typeof row.new_password == undefined) || !row.new_password){
            return "必填"
          } else if (row.new_password != row.confirm_password){
            return "新密码前后输入不一致"
          }
          return null
        }
      },
      {
        name: 'confirm_password',
        text: '密码确认',
        type: 'password',
        labelClassName: "asterisk",
        handleChange: (e) => {
          self.state.data.confirm_password = e.target.value
        },
        validate: () => {
          var row = self.state.data
          if((typeof row.confirm_password == undefined) || !row.confirm_password){
            return "必填"
          } else if (row.new_password != row.confirm_password){
            return "新密码前后输入不一致"
          }
          return null
        }
      }
    ]

    if (!session.sub_account){
      this.visibleColumns.splice(0,0,{
        name: 'linkman',
        text: '联系人',
        type: 'text',
        labelClassName: "asterisk",
        disabled: !session || session && (session.sub_account !== undefined),
        handleChange: (e) => {
          self.state.data.linkman = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.linkman == undefined) || !row.linkman)?"必填":null
        }
      },)
    }

    this.hideMode = this.hideMode.bind(this)
    this.showMode = this.showMode.bind(this)
    this.renderVisibleColumn = this.renderVisibleColumn.bind(this)
    this.update = this.update.bind(this)
  }

  componentWillMount() {
    let user_id, user_name, mobile, email,tel, sub_user_id, user_account, linkman, session = this.props.session
    if (session.sub_account){
      user_id = session.user_id
      sub_user_id = session.sub_account.sub_user_id
      user_name = session.sub_account.user_name
      mobile = session.sub_account.mobile
      email = session.sub_account.email
      tel = session.sub_account.tel
      user_account = `${session.user_account}:${session.sub_account.user_account}`
      linkman = session.linkman
    } else {
      user_id = session.user_id
      user_name = session.user_name
      mobile = session.mobile
      email = session.email
      tel = session.tel
      user_account = session.user_account
      linkman = session.linkman
    }
    this.setState({data: {user_id, user_name, mobile, email, tel, sub_user_id, linkman}, user_account})
  }

  renderVisibleColumn(column, i){
    const {data,message} = this.state
    return (
      <div className="form-group" key={i}>
        <label htmlFor="inputEmail3" className={`col-sm-3 control-label ${column.labelClassName || ''}`}>{column.text}</label>
        <div className="col-sm-6">
          <input type={column.type||'text'} className="form-control" placeholder={column.text} defaultValue={data[column.name]} onChange={column.handleChange} disabled={column.disabled}/>
        </div>
        {message[column.name] && <div className="col-sm-3">
          <span className="help-block">{message[column.name]}</span>
        </div>}
      </div>
    )
  }
  update(e) {
    e.preventDefault();
    e.stopPropagation();
    var self = this
    let {message} = this.state, valid = true

    if(this.state.showMode){
      this.passwordColumns.map(r=>{
        message[r.name] = r.validate()
      })
    }
    this.visibleColumns.map(r=>{
      message[r.name] = r.validate()
    })

    for(var props in message){
      if(message[props]){
        valid = false
      }
    }
    if(valid){
      this.setState({showMode: false})
      //const {old_password,new_password,confirm_password,user_name,mobile,email,user_id} = this.state.data
      this.props.resetMessage()
      this.props.callUpdateUser(this.state.data)
    } else {
      this.setState({message:{...message}})
    }
  }

  hideMode() {
    this.setState({
      showMode: false
    })
  }

  showMode() {
    let {message} = this.state, valid = true

    this.visibleColumns.map(r=>{
      message[r.name] = r.validate()
    })

    for(var props in message){
      if(message[props]){
        valid = false
      }
    }

    if(valid){
      this.setState({
        showMode: true
      })
    } else {
      this.setState({message:{...message}})
    }
  }

  render() {
    const {session, dictionary} = this.props
    const {user_account} = this.state
    let type, org, self = this
    const {user_full_name} = session
    for (let item of dictionary) {
      if (item.col_name === 'org_code' && item.para_key === session.org_code) {
        org = item.para_value
      }
      if (item.col_name === 'user_type' && item.para_key === (session.user_type + '')) {
        type = item.para_value
      }
    }
    return (
      <div className="component">
        <div className="wrapper wrapper__no-filter-form container-fluid">
          <section className="row">
            <form onSubmit={this.update} className="col-sm-8  col-sm-offset-2 form-horizontal">
              <legend>账户信息</legend>
              <div className="form-group">
                <label htmlFor="inputEmail3" className="col-sm-3 control-label">登录账号</label>
                <div className="col-sm-6">
                  <p className="form-control-static">{user_account}</p>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="inputEmail3" className="col-sm-3 control-label">用户类型</label>
                <div className="col-sm-6">
                  <p className="form-control-static">{type}</p>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="inputEmail3" className="col-sm-3 control-label">机构名称</label>
                <div className="col-sm-6">
                  <p className="form-control-static">{org}</p>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="inputEmail3" className="col-sm-3 control-label">用户全称</label>
                <div className="col-sm-6">
                  <p className="form-control-static">{user_full_name}</p>
                </div>
              </div>
              <legend>用户信息</legend>
              {this.visibleColumns.map(self.renderVisibleColumn)}
              <div className="form-group">
                <div className="col-sm-offset-3 col-sm-9 text-left">
                  <button type="button" className="btn btn-warning" onClick={ this.showMode } style={{marginRight: '10px'}}>修改密码</button>
                  <button type="submit" className="btn icon-btn btn-primary">保存</button>
                </div>
              </div>
            </form>
          </section>
        </div>
        { this.state.showMode &&
        <Modal data={this.state.data} message={this.state.message} columns={this.passwordColumns} title="密码修改" closer={ this.hideMode } confirm={this.update}/> }
      </div>
    )
  }
}

export default Profile
