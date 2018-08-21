import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import Select from '../Select'
import style from './style.scss'
import Dialog from '../Dialog'
import 'rc-tree/assets/index.css';
import Tree, { TreeNode } from 'rc-tree';
import UserTypeSelector from '../Select/UserTypeSelectorPage'
import { formatRoleType } from "../../utils/etc";

export default class MenuManagement extends Component {
  constructor() {
    super()
    this.state = {
      showMode: false,
      data: {},
      message: {
        func_name: '',
        func_path: '',
        page_id: '',
        func_img: '',
      },
      selectedMenu: "",
      expandedKeys: [],
      menus: [],
      confirmDelete: false,
      modalTitle: "",
      createDisabled: false,
      updateDisabled: true,
      deleteDisabled: true,
      upDisabled: true,
      downDisabled: true,
      isCreate: true,
      selectedMenuLevel: 0,
    }
    this.showMode = this.showMode.bind(this)
    this.hideMode = this.hideMode.bind(this)
    this.hideCreateMode = this.hideCreateMode.bind(this)
    this.update = this.update.bind(this)
    this.create = this.create.bind(this)
    this.delete = this.delete.bind(this)
    this.openModeToCreate = this.openModeToCreate.bind(this)
    this.openModeToEdit = this.openModeToEdit.bind(this)
    this.openDeleteConfirm = this.openDeleteConfirm.bind(this)
    this.closeDeleteConfirm = this.closeDeleteConfirm.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.initDisableButton = this.initDisableButton.bind(this)
    this.handleUserTypesChange = this.handleUserTypesChange.bind(this)
    this.upMenu = this.upMenu.bind(this)
    this.downMenu = this.downMenu.bind(this)

    var self = this

    this.modalColumns = [
      {
        title: "菜单信息"
      },
      {
        name: 'func_name',
        text: '菜单名',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.func_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.func_name == undefined) || !row.func_name) ? "必填" : ((row.func_name.length > 50) ? "菜单名不能超过50字" : null)
        }
      },
      {
        name: 'func_path',
        text: '菜单路径',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.func_path = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.func_path == undefined) || !row.func_path) ? "必填" : ((row.func_path.length > 50) ? "菜单路径不能超过50字" : null)
        }
      },
      {
        name: 'page_id',
        text: '菜单ID',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.page_id = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.page_id == undefined) || !row.page_id) ? "必填" : ((row.page_id.length > 50) ? "菜单ID不能超过50字" : null)
        }
      },
      {
        name: 'func_img',
        text: '菜单图标',
        type: 'text',
        handleChange(e){
          self.state.data.func_img = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.func_img && (row.func_img.length > 50) ? "菜单图标不能超过50字" : null)
        }
      },
      {
        name: 'func_role_type',
        text: '菜单类型',
        type: 'text',
        readOnly: true,
        renderDom: row => <UserTypeSelector onChange={this.handleUserTypesChange} noEmpty={true} extValue={row.func_role_type}/>

      },
    ]
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  componentDidMount() {
    this.handleSearch()
  }

  handleSearch() {
    this.props.RESET_MESSAGE()
    this.props.CALL_MENU_MANAGEMENT_QUERY()
  }

  hideMode() {
    this.setState({showMode: false})
  }

  hideCreateMode() {
    this.setState({showMode: false, selectedMenuLevel: this.state.selectedMenuLevel - 1})
  }

  showMode() {
    this.setState({showMode: true})
  }

  update(e) {
    e.preventDefault();
    e.stopPropagation();
    let {message} = this.state, valid = true

    this.modalColumns.map(r => {
      message[r.name] = r.validate && r.validate()
    })

    for (var props in message) {
      if (message[props]) {
        valid = false
      }
    }
    if (valid) {
      this.setState({showMode: false})
      this.props.RESET_MESSAGE()
      this.props.CALL_MENU_MANAGEMENT_UPDATE(this.state.data)
    } else {
      this.setState({message:{...message}})
    }
  }

  create(e) {
    e.preventDefault();
    e.stopPropagation();
    let {message} = this.state, valid = true

    this.modalColumns.map(r => {
      message[r.name] = r.validate && r.validate()
    })

    for (var props in message) {
      if (message[props]) {
        valid = false
      }
    }
    if (valid) {
      this.setState({showMode: false})
      this.props.RESET_MESSAGE()
      this.props.CALL_MENU_MANAGEMENT_CREATE(this.state.data)
    } else {
      this.setState({message:{...message}})
    }
  }

  delete(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.RESET_MESSAGE()
    this.props.CALL_MENU_MANAGEMENT_DELETE({func_id: this.state.selectedMenu})
    this.initDisableButton(false, true, true, true, true)
    this.setState({selectedMenu: ""})
  }

  openModeToCreate() {
    this.props.RESET_MESSAGE()
    let modalTitle = "";
    if (this.state.selectedMenu == "") {
      modalTitle = "创建根菜单"
    } else {
      modalTitle = "创建子菜单"
    }
    this.setState({
      modalTitle: modalTitle,
      showMode: true,
      isCreate: true,
      data: {
        f_func_id: this.state.selectedMenu,
      },
      selectedMenuLevel: this.state.selectedMenuLevel + 1,
    })
  }

  openModeToEdit() {
    this.props.RESET_MESSAGE()
    if (this.state.selectedMenu == "") {
      let messageSetter = this.props.SET_MESSAGE
      messageSetter("没有菜单被选中","FAIL")
    } else {
      this.setState({
        modalTitle: "修改菜单",
        showMode: true,
        isCreate: false,
        data: {...this.props.MENUS.detail}
      })
    }

  }

  openDeleteConfirm(){
    this.props.RESET_MESSAGE()
    if (this.state.selectedMenu == "") {
      let messageSetter = this.props.SET_MESSAGE
      messageSetter("没有菜单被选中","FAIL")
    } else {
      this.setState({confirmDelete: true,})
    }
  }
  closeDeleteConfirm(){
    this.setState({confirmDelete: false})
  }

  onSelect(selectedKeys, info) {

    let selectedMenu = info.node.props.eventKey;
    let pos = info.node.props.pos;
    if (info.selected) {
      this.props.RESET_MESSAGE()
      this.props.CALL_MENU_MANAGEMENT_DETAIL({func_id: selectedMenu});
      let selectedMenuLevel = 0;
      [...pos].map(r => {r==="-"?selectedMenuLevel++:selectedMenuLevel})
      if (selectedMenuLevel > 2) {
        this.initDisableButton(true, false, false, false, false)
      } else {
        this.initDisableButton(false, false, false, false, false)
      }

      this.setState({selectedMenu, selectedMenuLevel})
    } else {
      this.props.CALL_MENU_MANAGEMENT_DETAIL({func_id: ""});
      this.initDisableButton(false, true, true, true, true)
      this.setState({selectedMenu: "", selectedMenuLevel: 0})
    }
  }

  initDisableButton(createDisabled = true, updateDisabled = true, deleteDisabled = true, upDisabled = true, downDisabled = true) {
    this.setState({createDisabled, updateDisabled, deleteDisabled, upDisabled, downDisabled})
  }

  handleUserTypesChange(row) {
    this.state.data.func_role_type = row && row.value && !isNaN(row.value) ? Number(row.value) : ''
  }

  upMenu() {
    this.props.RESET_MESSAGE()
    if (this.state.selectedMenu == "") {
      let messageSetter = this.props.SET_MESSAGE
      messageSetter("没有菜单被选中","FAIL")
    } else {
      this.props.CALL_MENU_MANAGEMENT_UP({func_id: this.state.selectedMenu});
      this.setState()
    }
  }

  downMenu() {
    this.props.RESET_MESSAGE()
    if (this.state.selectedMenu == "") {
      let messageSetter = this.props.SET_MESSAGE
      messageSetter("没有菜单被选中","FAIL")
    } else {
      this.props.CALL_MENU_MANAGEMENT_DOWN({func_id: this.state.selectedMenu});
      this.setState()
    }
  }

  render() {
    const {MENUS, _buttons} = this.props
    let detail = MENUS.detail
    const loop = data => {
      return data.map((item) => {
        if (item.children && item.children.length > 0) {
          return (
            <TreeNode key={item.value} title={item.label} >
              {loop(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.value} title={item.label} />;
      });
    };
    return (
      <div className={`${style["menu-management"]}`}>
        <div className="row">
          <div className="col-md-7">
            <div className="panel panel-default">
              <div className="panel-heading">
                <div className="row">
                  <div className="col-md-3">
                    <div className="caption">
                      <h6 className="panel-title">菜单管理</h6>
                    </div>
                  </div>
                  <div className="col-md-9">
                    <div className="pull-right">
                      {Array.isArray(_buttons) && _buttons.includes("menu_management_create") &&
                      <button type="button" disabled={this.state.createDisabled}
                              className={`btn icon-btn btn-success btn-xs ${style["menu-button"]}`} onClick={() => {
                        this.openModeToCreate()
                      }}>
                        <i className="fa fa-plus"></i>创建
                      </button>
                      }
                      {Array.isArray(_buttons) && _buttons.includes("menu_management_update") &&
                      <button type="button" disabled={this.state.updateDisabled}
                              className={`btn icon-btn btn-warning btn-xs ${style["menu-button"]}`} onClick={() => {
                        this.openModeToEdit()
                      }}>
                        <i className="fa fa-pencil"></i>修改
                      </button>
                      }
                      {Array.isArray(_buttons) && _buttons.includes("menu_management_delete") &&
                      <button type="button" disabled={this.state.deleteDisabled}
                              className={`btn icon-btn btn-danger btn-xs ${style["menu-button"]}`} onClick={() => {
                        this.openDeleteConfirm()
                      }}>
                        <i className="fa fa-trash-o"></i>删除
                      </button>
                      }
                      {Array.isArray(_buttons) && _buttons.includes("menu_management_up") &&
                      <button type="button" disabled={this.state.upDisabled}
                              className={`btn icon-btn btn-info btn-xs ${style["menu-button"]}`} onClick={() => {
                        this.upMenu()
                      }}>
                        <i className="fa fa-arrow-up"></i>上移
                      </button>
                      }
                      {Array.isArray(_buttons) && _buttons.includes("menu_management_down") &&
                      <button type="button" disabled={this.state.downDisabled}
                              className={`btn icon-btn btn-info btn-xs ${style["menu-button"]}`} onClick={() => {
                        this.downMenu()
                      }}>
                        <i className="fa fa-arrow-down"></i>下移
                      </button>
                      }
                    </div>
                  </div>
                </div>

              </div>
              <div className={`panel-body ${style["menu-tree-panel"]}`}>
                <Tree
                  showLine
                  onSelect={this.onSelect}
                >
                  {loop(MENUS.menus)}
                </Tree>
              </div>
            </div>
          </div>
          <div className="col-md-5">
            <div className="panel panel-default">
              <div className="panel-heading">
                <div className="caption">
                  <h6 className="panel-title">菜单详情</h6>
                </div>
              </div>
              <div className={`panel-body ${style["menu-detail-panel"]}`}>
                <div className="row">
                  <label className={`col-sm-4 control-label`}>菜单名称</label>
                  <div className={`col-sm-8`}>{detail.func_name?detail.func_name:""}</div>
                </div>
                <div className="row">
                  <label className={`col-sm-4 control-label`}>菜单路径</label>
                  <div className={`col-sm-8`}>{detail.func_path?detail.func_path:""}</div>
                </div>
                <div className="row">
                  <label className={`col-sm-4 control-label`} style={{userSelect: 'none'}}>菜单ID</label>
                  <div className={`col-sm-8`}>{detail.page_id?detail.page_id:""}</div>
                </div>
                <div className="row">
                  <label className={`col-sm-4 control-label`}>菜单图标</label>
                  <div className={`col-sm-8`}>{detail.func_img?[<i className={`fa ${detail.func_img}`} key={detail.func_img}></i>,<span key='span'> {detail.func_img}</span>]:""}</div>
                </div>
                <div className="row">
                  <label className={`col-sm-4 control-label`}>菜单类型</label>
                  {detail.func_level === 0 && <div className={`col-sm-8`}><span>{formatRoleType(detail.func_role_type, this.props.DICTIONARY)}</span>
                  </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
        { this.state.showMode && this.state.isCreate &&
        <Modal data={this.state.data} columns={this.state.selectedMenuLevel > 1?[...this.modalColumns].splice(0, this.modalColumns.length - 1):this.modalColumns} message={this.state.message} title={this.state.modalTitle}
               closer={ this.hideCreateMode } confirm={this.create}/> }
        { this.state.showMode && !this.state.isCreate &&
        <Modal data={this.state.data} columns={this.state.selectedMenuLevel > 1?[...this.modalColumns].splice(0, this.modalColumns.length - 1):this.modalColumns} message={this.state.message} title={this.state.modalTitle}
               closer={ this.hideMode } confirm={this.update}/> }
        {this.state.confirmDelete && <Dialog confirm={(e)=>{
          this.delete(e)
          this.closeDeleteConfirm()
        }} title="请确认" closer={this.closeDeleteConfirm} size="modal-md">
          此菜单下的子菜单也会一并被删除，确定要删除选中的菜单么?
        </Dialog>}
      </div>
    )
  }
}
