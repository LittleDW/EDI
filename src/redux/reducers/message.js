/**
 * 作者：石奇峰
 * 功能：Edi的reducer，负责message的统一处理
 * */

import {ACTIONS} from "../actions";

const message = (state = null, action) => {
  const {type, error, response, message, messageType} = action

  switch (type) {
    case ACTIONS.RESET_MESSAGE:
      return null
    case "SET_MESSAGE":
      return {type: messageType, text: message}
    case "SELECT_MENU":
      return state
    case ACTIONS.CALL_ORDER.types.fail:
      return {type: "FAIL", text: error || "平台订单搜索失败"}
    case ACTIONS.CALL_ORDER.types.request:
      return {type: "INFO", text: "平台订单搜索中..."}
    case ACTIONS.CALL_ORDER.types.success:
      return null
    case ACTIONS.CALL_CORP_ORDER.types.fail:
      return {type: "FAIL", text: error || "平台订单搜索失败"}
    case ACTIONS.CALL_CORP_ORDER.types.request:
      return {type: "INFO", text: "平台订单搜索中..."}
    case ACTIONS.CALL_CORP_ORDER.types.success:
      return null
    case ACTIONS.CALL_REPAYMENT.types.fail:
      return {type: "FAIL", text: error || "兑付单搜索失败"}
    case ACTIONS.CALL_REPAYMENT.types.request:
      return {type: "INFO", text: "兑付单搜索中..."}
    case ACTIONS.CALL_REPAYMENT.types.success:
      return null
    case ACTIONS.CALL_ASSET_ACCOUNT.types.fail:
      return {type: "FAIL", text: error || "资产到账搜索失败"}
    case ACTIONS.CALL_ASSET_ACCOUNT.types.request:
      return {type: "INFO", text: "资产到账搜索中..."}
    case ACTIONS.CALL_ASSET_ACCOUNT.types.success:
      return null
    case ACTIONS.CALL_CORP_ORDER_CREDIT.types.fail:
    case ACTIONS.CALL_ORDER_CREDIT.types.fail:
      return {type: "FAIL", text: error || "授信信息搜索失败"}
    case ACTIONS.CALL_CORP_ORDER_CREDIT.types.request:
    case ACTIONS.CALL_ORDER_CREDIT.types.request:
      return {type: "INFO", text: "授信信息搜索中..."}
    case ACTIONS.CALL_CORP_ORDER_CREDIT.types.success:
    case ACTIONS.CALL_ORDER_CREDIT.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_ORDER_REPAYMENT.types.fail:
      return {type: "FAIL", text: error || "兑付单明细搜索失败"}
    case ACTIONS.CALL_ORDER_REPAYMENT.types.request:
      return {type: "INFO", text: "兑付单明细搜索中..."}
    case ACTIONS.CALL_ORDER_REPAYMENT.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_ORDER_VOUCHER.types.fail:
      return {type: "FAIL", text: error || "资料明细搜索失败"}
    case ACTIONS.CALL_ORDER_VOUCHER.types.request:
      return {type: "INFO", text: "资料明细搜索中..."}
    case ACTIONS.CALL_ORDER_VOUCHER.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_FILTER_ORDER_VOUCHER.types.fail:
      return {type: "FAIL", text: error || "资料明细搜索失败"}
    case ACTIONS.CALL_FILTER_ORDER_VOUCHER.types.request:
      return {type: "INFO", text: "资料明细搜索中...订单较多可能时间较长"}
    case ACTIONS.CALL_FILTER_ORDER_VOUCHER.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_FILTER_CORP_ORDER_VOUCHER.types.fail:
      return {type: "FAIL", text: error || "企业资料明细搜索失败"}
    case ACTIONS.CALL_FILTER_CORP_ORDER_VOUCHER.types.request:
      return {type: "INFO", text: "企业资料明细搜索中...订单较多可能时间较长"}
    case ACTIONS.CALL_FILTER_CORP_ORDER_VOUCHER.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_ORDER_CONTRACT.types.fail:
      return {type: "FAIL", text: error || "合同明细搜索失败"}
    case ACTIONS.CALL_ORDER_CONTRACT.types.request:
      return {type: "INFO", text: "合同明细搜索中..."}
    case ACTIONS.CALL_ORDER_CONTRACT.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_ORDER_SERVICE.types.fail:
      return {type: "FAIL", text: error || "服务费明细搜索失败"}
    case ACTIONS.CALL_ORDER_SERVICE.types.request:
      return {type: "INFO", text: "服务费明细搜索中..."}
    case ACTIONS.CALL_ORDER_SERVICE.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_ORDER_PAYMENT.types.fail:
      return {type: "FAIL", text: error || "到账明细搜索失败"}
    case ACTIONS.CALL_ORDER_PAYMENT.types.request:
      return {type: "INFO", text: "到账明细搜索中..."}
    case ACTIONS.CALL_ORDER_PAYMENT.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_ORDER_ADVANCE.types.fail:
      return {type: "FAIL", text: error || "垫付明细搜索失败"}
    case ACTIONS.CALL_ORDER_ADVANCE.types.request:
      return {type: "INFO", text: "垫付明细搜索中..."}
    case ACTIONS.CALL_ORDER_ADVANCE.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_ORDER_ACCOUNT.types.fail:
      return {type: "FAIL", text: error || "出账明细搜索失败"}
    case ACTIONS.CALL_ORDER_ACCOUNT.types.request:
      return {type: "INFO", text: "出账明细搜索中..."}
    case ACTIONS.CALL_ORDER_ACCOUNT.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_ORDER_CHECK_RESULT_MATCH.types.fail :
      return {type: "FAIL", text: error || "审核结果匹配失败"}
    case ACTIONS.CALL_ORDER_CHECK_RESULT_MATCH.types.request :
      return {type: "INFO", text: error || "审核结果匹配中..."}
    case ACTIONS.CALL_ORDER_CHECK_RESULT_MATCH.types.success :
      if (response.ngHeaders) {
        return {type: "FAIL", text: error || "审核结果表头匹配失败，请自行映射"}
      } else if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "审核结果数据校验失败"}
      } else if (!response.matched || !response.matched.length){
        return {type: "FAIL", text: error || "审核结果没有有效数据"}
      }
      return {type: "SUCCESS", text: error || "审核结果匹配成功"}
    case ACTIONS.CALL_ORDER_CHECK_RESULT_CREATE.types.fail :
      return {type: "FAIL", text: error || "审核结果上传失败"}
    case ACTIONS.CALL_ORDER_CHECK_RESULT_CREATE.types.request :
      return {type: "INFO", text: error || "审核结果上传中..."}
    case ACTIONS.CALL_ORDER_CHECK_RESULT_CREATE.types.success :
      if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "审核结果有失败记录"}
      } else {
        return {type: "SUCCESS", text: error || "审核结果上传成功"}
      }
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_MATCH.types.fail :
      return {type: "FAIL", text: error || "出账明细匹配失败"}
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_MATCH.types.request :
      return {type: "INFO", text: error || "出账明细匹配中..."}
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_MATCH.types.success :
      if (response.ngHeaders) {
        return {type: "FAIL", text: error || "出账明细表头匹配失败，请自行映射"}
      } else if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "出账明细数据校验失败"}
      } else if (!response.matched || !response.matched.length){
        return {type: "FAIL", text: error || "出账明细没有有效数据"}
      }
      return {type: "SUCCESS", text: error || "出账明细匹配成功"}
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_CREATE.types.fail :
      return {type: "FAIL", text: error || "出账明细上传失败"}
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_CREATE.types.request :
      return {type: "INFO", text: error || "出账明细上传中..."}
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_CREATE.types.success :
      if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "出账明细有失败记录"}
      } else {
        return {type: "SUCCESS", text: error || "出账明细上传成功"}
      }
    case ACTIONS.CALL_CORP_ORDER_REPAYMENT.types.fail:
      return {type: "FAIL", text: error || "兑付单明细搜索失败"}
    case ACTIONS.CALL_CORP_ORDER_REPAYMENT.types.request:
      return {type: "INFO", text: "兑付单明细搜索中..."}
    case ACTIONS.CALL_CORP_ORDER_REPAYMENT.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_CORP_ORDER_VOUCHER.types.fail:
      return {type: "FAIL", text: error || "资料明细搜索失败"}
    case ACTIONS.CALL_CORP_ORDER_VOUCHER.types.request:
      return {type: "INFO", text: "资料明细搜索中..."}
    case ACTIONS.CALL_CORP_ORDER_VOUCHER.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_CORP_ORDER_CONTRACT.types.fail:
      return {type: "FAIL", text: error || "合同明细搜索失败"}
    case ACTIONS.CALL_CORP_ORDER_CONTRACT.types.request:
      return {type: "INFO", text: "合同明细搜索中..."}
    case ACTIONS.CALL_CORP_ORDER_CONTRACT.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_CORP_ORDER_SERVICE.types.fail:
      return {type: "FAIL", text: error || "服务费明细搜索失败"}
    case ACTIONS.CALL_CORP_ORDER_SERVICE.types.request:
      return {type: "INFO", text: "服务费明细搜索中..."}
    case ACTIONS.CALL_CORP_ORDER_SERVICE.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_CORP_ORDER_PAYMENT.types.fail:
      return {type: "FAIL", text: error || "到账明细搜索失败"}
    case ACTIONS.CALL_CORP_ORDER_PAYMENT.types.request:
      return {type: "INFO", text: "到账明细搜索中..."}
    case ACTIONS.CALL_CORP_ORDER_PAYMENT.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_CORP_ORDER_ADVANCE.types.fail:
      return {type: "FAIL", text: error || "垫付明细搜索失败"}
    case ACTIONS.CALL_CORP_ORDER_ADVANCE.types.request:
      return {type: "INFO", text: "垫付明细搜索中..."}
    case ACTIONS.CALL_CORP_ORDER_ADVANCE.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT.types.fail:
      return {type: "FAIL", text: error || "出账明细搜索失败"}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT.types.request:
      return {type: "INFO", text: "出账明细搜索中..."}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      return null
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_MATCH.types.fail :
      return {type: "FAIL", text: error || "审核结果匹配失败"}
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_MATCH.types.request :
      return {type: "INFO", text: error || "审核结果匹配中..."}
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_MATCH.types.success :
      if (response.ngHeaders) {
        return {type: "FAIL", text: error || "审核结果表头匹配失败，请自行映射"}
      } else if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "审核结果数据校验失败"}
      } else if (!response.matched || !response.matched.length){
        return {type: "FAIL", text: error || "审核结果没有有效数据"}
      }
      return {type: "SUCCESS", text: error || "审核结果匹配成功"}
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_CREATE.types.fail :
      return {type: "FAIL", text: error || "审核结果上传失败"}
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_CREATE.types.request :
      return {type: "INFO", text: error || "审核结果上传中..."}
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_CREATE.types.success :
      if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "审核结果有失败记录"}
      } else {
        return {type: "SUCCESS", text: error || "审核结果上传成功"}
      }
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_MATCH.types.fail :
      return {type: "FAIL", text: error || "出账明细匹配失败"}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_MATCH.types.request :
      return {type: "INFO", text: error || "出账明细匹配中..."}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_MATCH.types.success :
      if (response.ngHeaders) {
        return {type: "FAIL", text: error || "出账明细表头匹配失败，请自行映射"}
      } else if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "出账明细数据校验失败"}
      } else if (!response.matched || !response.matched.length){
        return {type: "FAIL", text: error || "出账明细没有有效数据"}
      }
      return {type: "SUCCESS", text: error || "出账明细匹配成功"}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_CREATE.types.fail :
      return {type: "FAIL", text: error || "出账明细上传失败"}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_CREATE.types.request :
      return {type: "INFO", text: error || "出账明细上传中..."}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_CREATE.types.success :
      if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "出账明细有失败记录"}
      } else {
        return {type: "SUCCESS", text: error || "出账明细上传成功"}
      }
    case ACTIONS.CALL_LOGIN_LOG.types.fail:
      return {type: "FAIL", text: error || "登录日志搜索失败"}
    case ACTIONS.CALL_LOGIN_LOG.types.request:
      return {type: "INFO", text: "登录日志搜索中..."}
    case ACTIONS.CALL_LOGIN_LOG.types.success:
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何登录日志"}
      }
      return null
    case ACTIONS.CALL_LOGIN.types.fail:
      return {type: "FAIL", text: error || "登录失败"}
    case ACTIONS.CALL_LOGIN.types.success:
      return {type: "SUCCESS", text: "登录成功"}
    case ACTIONS.CALL_LOGIN.types.request:
      return {type: "INFO", text: "登录中..."}
    case ACTIONS.CALL_USERINFO.types.fail:
      return {type: "FAIL", text: error || "更新失败"}
    case ACTIONS.CALL_USERINFO.types.success:
      return {type: "SUCCESS", text: "更新成功"}
    case ACTIONS.CALL_USERINFO.types.request:
      return {type: "INFO", text: error || "用户信息更新中..."}
    case ACTIONS.CALL_ASSET_ACCOUNT_UPDATE.types.success:
      return {type: "SUCCESS", text: error || "资产方到账信息更新成功"}
    case ACTIONS.CALL_ASSET_ACCOUNT_UPDATE.types.fail:
      return {type: "FAIL", text: error || "资产方到账信息更新失败"}
    case ACTIONS.CALL_ASSET_ACCOUNT_UPDATE.types.request:
      return {type: "INFO", text: error || "资产方到账信息更新中..."}
    case ACTIONS.CALL_REPAYMENT_UPDATE.types.success:
      return {type: "SUCCESS", text: error || "兑付单状态更新成功"}
    case ACTIONS.CALL_REPAYMENT_UPDATE.types.fail:
      return {type: "FAIL", text: error || "兑付单状态更新失败"}
    case ACTIONS.CALL_REPAYMENT_UPDATE.types.request:
      return {type: "INFO", text: error || "兑付单状态更新中..."}
    case ACTIONS.CALL_USER_MANAGEMENT_CREATE.types.success:
      return {type: "SUCCESS", text: error || "用户创建成功"}
    case ACTIONS.CALL_USER_MANAGEMENT_CREATE.types.fail:
      return {type: "FAIL", text: error || "用户创建失败"}
    case ACTIONS.CALL_USER_MANAGEMENT_CREATE.types.request:
      return {type: "INFO", text: error || "用户创建中..."}
    case ACTIONS.CALL_USER_MANAGEMENT_ATTRIBUTE_FIND.types.fail:
      return {type: "FAIL", text: error || "用户属性查询失败"}
    case ACTIONS.CALL_USER_MANAGEMENT_ATTRIBUTE_FIND.types.request:
      return {type: "INFO", text: error || "用户属性查询中..."}
    case ACTIONS.CALL_USER_MANAGEMENT_ATTRIBUTE_UPDATE.types.success:
      return {type: "SUCCESS", text: error || "用户属性修改成功"}
    case ACTIONS.CALL_USER_MANAGEMENT_ATTRIBUTE_UPDATE.types.fail:
      return {type: "FAIL", text: error || "用户属性修改失败"}
    case ACTIONS.CALL_USER_MANAGEMENT_ATTRIBUTE_UPDATE.types.request:
      return {type: "INFO", text: error || "用户属性修改中..."}
    case ACTIONS.CALL_USER_MANAGEMENT_DELETE.types.success:
      return {type: "SUCCESS", text: error || "用户删除成功"}
    case ACTIONS.CALL_USER_MANAGEMENT_DELETE.types.fail:
      return {type: "FAIL", text: error || "用户删除失败"}
    case ACTIONS.CALL_USER_MANAGEMENT_DELETE.types.request:
      return {type: "INFO", text: error || "用户删除中..."}
    case ACTIONS.CALL_USER_MANAGEMENT_UPDATE.types.success:
      return {type: "SUCCESS", text: error || "用户更新成功"}
    case ACTIONS.CALL_USER_MANAGEMENT_UPDATE.types.fail:
      return {type: "FAIL", text: error || "用户更新失败"}
    case ACTIONS.CALL_USER_MANAGEMENT_UPDATE.types.request:
      return {type: "INFO", text: error || "用户更新中..."}
    case ACTIONS.CALL_USER_MANAGEMENT_AUTH.types.success :
      return {type: "SUCCESS", text: error || "用户授权成功"}
    case ACTIONS.CALL_USER_MANAGEMENT_AUTH.types.fail :
      return {type: "FAIL", text: error || "用户授权失败"}
    case ACTIONS.CALL_USER_MANAGEMENT_AUTH.types.request :
      return {type: "INFO", text: error || "用户授权中..."}
    case ACTIONS.CALL_MATCH_ASSET_ORDER.types.success:
      if (response.matched && response.matched.length) {
        return {type: "SUCCESS", text: error || "订单匹配成功"}
      }
      return {type: "FAIL", text: error || "订单匹配失败"}
    case ACTIONS.CALL_MATCH_ASSET_ORDER.types.fail:
      return {type: "FAIL", text: error || "订单匹配失败"}
    case ACTIONS.CALL_MATCH_ASSET_ORDER.types.request:
      return {type: "INFO", text: error || "订单匹配中..."}
    case ACTIONS.CALL_CREATE_ASSET_ORDER.types.success:
      if (response.succeed && response.succeed.length) {
        return {type: "SUCCESS", text: error || "订单创建成功"}
      }
      return {type: "FAIL", text: error || "订单创建失败"}
    case ACTIONS.CALL_CREATE_ASSET_ORDER.types.fail:
      return {type: "FAIL", text: error || "订单创建失败"}
    case ACTIONS.CALL_CREATE_ASSET_ORDER.types.request:
      return {type: "INFO", text: error || "订单创建中，大文件可能时间较长..."}
    case ACTIONS.CALL_MATCH_CORP_ASSET_ORDER.types.success:
      if (response.matched && response.matched.length) {
        return {type: "SUCCESS", text: error || "企业订单匹配成功"}
      }
      return {type: "FAIL", text: error || "企业订单匹配失败"}
    case ACTIONS.CALL_MATCH_CORP_ASSET_ORDER.types.fail:
      return {type: "FAIL", text: error || "企业订单匹配失败"}
    case ACTIONS.CALL_MATCH_CORP_ASSET_ORDER.types.request:
      return {type: "INFO", text: error || "企业订单匹配中..."}
    case ACTIONS.CALL_CREATE_CORP_ASSET_ORDER.types.success:
      if (response.succeed && response.succeed.length) {
        return {type: "SUCCESS", text: error || "企业订单创建成功"}
      }
      return {type: "FAIL", text: error || "企业订单创建失败"}
    case ACTIONS.CALL_CREATE_CORP_ASSET_ORDER.types.fail:
      return {type: "FAIL", text: error || "企业订单创建失败"}
    case ACTIONS.CALL_CREATE_CORP_ASSET_ORDER.types.request:
      return {type: "INFO", text: error || "企业订单创建中，大文件可能时间较长..."}
    case ACTIONS.CALL_MATCH_CORP_CREDIT.types.success:
      if (response.matched && response.matched.length) {
        return {type: "SUCCESS", text: error || "企业授信匹配成功"}
      }
      return {type: "FAIL", text: error || "企业授信匹配失败"}
    case ACTIONS.CALL_MATCH_CORP_CREDIT.types.fail:
      return {type: "FAIL", text: error || "企业授信匹配失败"}
    case ACTIONS.CALL_MATCH_CORP_CREDIT.types.request:
      return {type: "INFO", text: error || "企业授信匹配中..."}
    case ACTIONS.CALL_CREATE_CORP_CREDIT.types.success:
      if (response.succeed && response.succeed.length) {
        return {type: "SUCCESS", text: error || "企业授信发送成功"}
      }
      return {type: "FAIL", text: error || "企业授信失败"}
    case ACTIONS.CALL_CREATE_CORP_CREDIT.types.fail:
      return {type: "FAIL", text: error || "企业授信失败"}
    case ACTIONS.CALL_CREATE_CORP_CREDIT.types.request:
      return {type: "INFO", text: error || "企业授信中，大文件可能时间较长..."}
    case ACTIONS.CALL_MATCH_SUPPLEMENT_ASSET_ORDER.types.success:
      if (response.matched && response.matched.length) {
        return {type: "SUCCESS", text: error || "补充资料匹配成功"}
      }
      return {type: "FAIL", text: error || "补充资料匹配失败"}
    case ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_ASSET_ORDER.types.success:
      if (response.matched && response.matched.length) {
        return {type: "SUCCESS", text: error || "补充资料匹配成功"}
      }
      return {type: "FAIL", text: error || "补充资料匹配失败"}
    case ACTIONS.CALL_MATCH_SUPPLEMENT_ASSET_ORDER.types.fail:
      return {type: "FAIL", text: error || "补充资料匹配失败"}
    case ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_ASSET_ORDER.types.fail:
      return {type: "FAIL", text: error || "补充资料匹配失败"}
    case ACTIONS.CALL_MATCH_SUPPLEMENT_ASSET_ORDER.types.request:
      return {type: "INFO", text: error || "补充资料匹配中..."}
    case ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_ASSET_ORDER.types.request:
      return {type: "INFO", text: error || "补充资料匹配中..."}
    case ACTIONS.CALL_CORP_SUPPLEMENT_ASSET_ORDER.types.success:
    case ACTIONS.CALL_SUPPLEMENT_ASSET_ORDER.types.success:
      if (response.succeed && response.succeed.length) {
        return {type: "SUCCESS", text: error || "资料补充成功"}
      }
      return {type: "FAIL", text: error || "资料补充失败"}
    case ACTIONS.CALL_CORP_SUPPLEMENT_ASSET_ORDER.types.fail :
    case ACTIONS.CALL_SUPPLEMENT_ASSET_ORDER.types.fail :
      return {type: "FAIL", text: error || "资料补充失败"}
    case ACTIONS.CALL_CORP_SUPPLEMENT_ASSET_ORDER.types.request :
    case ACTIONS.CALL_SUPPLEMENT_ASSET_ORDER.types.request :
      return {type: "INFO", text: error || "资料补充中，大文件可能时间较长..."}
    case ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_CREDIT.types.success :
      if (response.matched && response.matched.length) {
        return {type: "SUCCESS", text: error || "补充资料匹配成功"}
      }
      return {type: "FAIL", text: error || "补充资料匹配失败"}
    case ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_CREDIT.types.fail :
      return {type: "FAIL", text: error || "补充资料匹配失败"}
    case ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_CREDIT.types.request :
      return {type: "INFO", text: error || "补充资料匹配中..."}
    case ACTIONS.CALL_SUPPLEMENT_CORP_CREDIT.types.success :
      if (response.succeed && response.succeed.length) {
        return {type: "SUCCESS", text: error || "资料补充成功"}
      }
      return {type: "FAIL", text: error || "资料补充失败"}
    case ACTIONS.CALL_SUPPLEMENT_CORP_CREDIT.types.fail :
      return {type: "FAIL", text: error || "资料补充失败"}
    case ACTIONS.CALL_SUPPLEMENT_CORP_CREDIT.types.request :
      return {type: "INFO", text: error || "资料补充中，大文件可能时间较长..."}
    case ACTIONS.CALL_REQWEEK_UPDATE.types.success :
      if (response.success) {
        return {type: "SUCCESS", text: error || "计划提交成功"}
      }
      return {type: "FAIL", text: error || "计划提交失败"}
    case ACTIONS.CALL_REQWEEK_UPDATE.types.fail :
      return {type: "FAIL", text: error || "计划提交失败"}
    case ACTIONS.CALL_REQWEEK_UPDATE.types.request :
      return {type: "INFO", text: error || "计划提交中..."}
    case ACTIONS.CALL_REQWEEK.types.success :
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "计划获取失败"}
    case ACTIONS.CALL_REQWEEK.types.fail :
      return {type: "FAIL", text: error || "计划获取失败"}
    case ACTIONS.CALL_REQWEEK.types.request :
      return {type: "INFO", text: error || "计划获取中..."}
    case ACTIONS.CALL_REQWEEK_HISTORY.types.success :
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "计划历史获取失败"}
    case ACTIONS.CALL_REQWEEK_HISTORY.types.fail :
      return {type: "FAIL", text: error || "计划历史获取失败"}
    case ACTIONS.CALL_REQWEEK_HISTORY.types.request :
      return {type: "INFO", text: error || "计划历史获取中..."}
    case ACTIONS.CALL_COLWEEK_UPDATE.types.success :
      if (response.success) {
        return {type: "SUCCESS", text: error || "计划提交成功"}
      }
      return {type: "FAIL", text: error || "计划提交失败"}
    case ACTIONS.CALL_COLWEEK_UPDATE.types.fail :
      return {type: "FAIL", text: error || "计划提交失败"}
    case ACTIONS.CALL_COLWEEK_UPDATE.types.request :
      return {type: "INFO", text: error || "计划提交中..."}
    case ACTIONS.CALL_COLWEEK.types.success :
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "计划获取失败"}
    case ACTIONS.CALL_COLWEEK.types.fail :
      return {type: "FAIL", text: error || "计划获取失败"}
    case ACTIONS.CALL_COLWEEK.types.request :
      return {type: "INFO", text: error || "计划获取中..."}
    case ACTIONS.CALL_COLWEEK_HISTORY.types.success :
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "计划历史获取失败"}
    case ACTIONS.CALL_COLWEEK_HISTORY.types.fail :
      return {type: "FAIL", text: error || "计划历史获取失败"}
    case ACTIONS.CALL_COLWEEK_HISTORY.types.request :
      return {type: "INFO", text: error || "计划历史获取中..."}

    // ToDo 新增加的每周需求、募集计划页面，整合到统一组件DistriPlan
    case ACTIONS.CALL_DISTRIPLAN_UPDATE.types.success :
      if (response.success) {
        return {type: "SUCCESS", text: error || "计划提交成功"}
      }
      return {type: "FAIL", text: error || "计划提交失败"}
    case ACTIONS.CALL_DISTRIPLAN_UPDATE.types.fail :
      return {type: "FAIL", text: error || "计划提交失败"}
    case ACTIONS.CALL_DISTRIPLAN_UPDATE.types.request :
      return {type: "INFO", text: error || "计划提交中..."}
    case ACTIONS.CALL_DISTRIPLAN.types.success :
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "计划获取失败"}
    case ACTIONS.CALL_DISTRIPLAN.types.fail :
      return {type: "FAIL", text: error || "计划获取失败"}
    case ACTIONS.CALL_DISTRIPLAN.types.request :
      return {type: "INFO", text: error || "计划获取中..."}
    case ACTIONS.CALL_DISTRIPLAN_HISTORY.types.success :
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "计划历史获取失败"}
    case ACTIONS.CALL_DISTRIPLAN_HISTORY.types.fail :
      return {type: "FAIL", text: error || "计划历史获取失败"}
    case ACTIONS.CALL_DISTRIPLAN_HISTORY.types.request :
      return {type: "INFO", text: error || "计划历史获取中..."}

    case ACTIONS.CALL_CORP_AUTH.types.success :
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "企业授信列表获取失败"}
    case ACTIONS.CALL_CORP_AUTH.types.fail :
      return {type: "FAIL", text: error || "企业授信列表失败"}
    case ACTIONS.CALL_CORP_AUTH.types.request :
      return {type: "INFO", text: error || "企业授信列表获取中..."}
    case ACTIONS.CALL_CORP_AUTH_DETAIL.types.success :
      if (!response.rows.length) {
        return {type: "WARN", text: "未搜索到任何数据"}
      }
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "企业授信详情获取失败"}
    case ACTIONS.CALL_CORP_AUTH_DETAIL.types.fail :
      return {type: "FAIL", text: error || "企业授信详情失败"}
    case ACTIONS.CALL_CORP_AUTH_DETAIL.types.request :
      return {type: "INFO", text: error || "企业授信详情获取中..."}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_MATCH.types.fail :
      return {type: "FAIL", text: error || "授信结果匹配失败"}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_MATCH.types.request :
      return {type: "INFO", text: error || "授信结果匹配中..."}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_MATCH.types.success :
      if (response.ngHeaders) {
        return {type: "FAIL", text: error || "授信结果表头匹配失败，请自行映射"}
      } else if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "授信结果数据校验失败"}
      } else if (!response.matched || !response.matched.length){
        return {type: "FAIL", text: error || "授信结果没有有效数据"}
      }
      return {type: "SUCCESS", text: error || "授信结果匹配成功"}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_CREATE.types.fail :
      return {type: "FAIL", text: error || "授信结果上传失败"}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_CREATE.types.request :
      return {type: "INFO", text: error || "授信结果上传中..."}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_CREATE.types.success :
      if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "授信结果有失败记录"}
      } else {
        return {type: "SUCCESS", text: error || "授信结果上传成功"}
      }
    case ACTIONS.CALL_ASSET_SETTING.types.success :
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "资产分配设置获取失败"}
    case ACTIONS.CALL_ASSET_SETTING.types.fail :
      return {type: "FAIL", text: error || "资产分配设置获取失败"}
    case ACTIONS.CALL_ASSET_SETTING.types.request :
      return {type: "INFO", text: error || "资产分配设置获取中..."}
    case ACTIONS.CALL_ASSET_SETTING_UPDATE.types.success :
      if (response.success) {
        return {type: "SUCCESS", text: error || "资产分配设置保存成功"}
      }
      return {type: "FAIL", text: error || "资产分配设置保存失败"}
    case ACTIONS.CALL_ASSET_SETTING_UPDATE.types.fail :
      return {type: "FAIL", text: error || "资产分配设置保存失败"}
    case ACTIONS.CALL_ASSET_SETTING_UPDATE_DEADLINE.types.success :
      if (response.success) {
        return {type: "SUCCESS", text: error || "资产分配设置保存成功"}
      }
      return {type: "FAIL", text: error || "资产分配设置保存失败"}
    case ACTIONS.CALL_ASSET_SETTING_UPDATE_DEADLINE.types.fail :
      return {type: "FAIL", text: error || "资产分配设置保存失败"}
    case ACTIONS.CALL_ASSET_SETTING_CAPTCHA.types.success :
      if (response.success) {
        return {type: "SUCCESS", text: error || "验证码发送成功"}
      }
    case ACTIONS.CALL_FUND_SETTING.types.success :
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "资金分配设置获取失败"}
    case ACTIONS.CALL_FUND_SETTING.types.fail :
      return {type: "FAIL", text: error || "资金分配设置获取失败"}
    case ACTIONS.CALL_FUND_SETTING.types.request :
      return {type: "INFO", text: error || "资金分配设置获取中..."}
    case ACTIONS.CALL_FUND_SETTING_UPDATE.types.success :
      if (response.success) {
        return {type: "SUCCESS", text: error || "资金分配设置保存成功"}
      }
      return {type: "FAIL", text: error || "资金分配设置保存失败"}
    case ACTIONS.CALL_FUND_SETTING_UPDATE.types.fail :
      return {type: "FAIL", text: error || "资金分配设置保存失败"}
    case ACTIONS.CALL_FUND_SETTING_UPDATE.types.request :
      return {type: "INFO", text: error || "资金分配设置保存中..."}
    case ACTIONS.CALL_FUND_SUPPLY_WEEKLY.types.success :
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "周供需计划获取失败"}
    case ACTIONS.CALL_FUND_SUPPLY_WEEKLY.types.fail :
      return {type: "FAIL", text: error || "周供需计划获取失败"}
    case ACTIONS.CALL_FUND_SUPPLY_WEEKLY.types.request :
      return {type: "INFO", text: error || "供需计划获取中..."}
    case ACTIONS.CALL_FUND_SUPPLY_DAILY.types.success :
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "日供需计划获取失败"}
    case ACTIONS.CALL_FUND_SUPPLY_DAILY.types.fail :
      return {type: "FAIL", text: error || "日供需计划获取失败"}
    case ACTIONS.CALL_FUND_SUPPLY_DAILY.types.request :
      return {type: "INFO", text: error || "供需计划获取中..."}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_CREATE.types.success :
      return {type: "SUCCESS", text: error || "子用户创建成功"}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_CREATE.types.fail :
      return {type: "FAIL", text: error || "子用户创建失败"}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_CREATE.types.request :
      return {type: "INFO", text: error || "子用户创建中..."}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_DELETE.types.success :
      return {type: "SUCCESS", text: error || "子用户删除成功"}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_DELETE.types.fail :
      return {type: "FAIL", text: error || "子用户删除失败"}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_DELETE.types.request :
      return {type: "INFO", text: error || "子用户删除中..."}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_UPDATE.types.success :
      return {type: "SUCCESS", text: error || "子用户更新成功"}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_UPDATE.types.fail :
      return {type: "FAIL", text: error || "子用户更新失败"}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_UPDATE.types.request :
      return {type: "INFO", text: error || "子用户更新中..."}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_AUTH.types.success :
      return {type: "SUCCESS", text: error || "子用户授权成功"}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_AUTH.types.fail :
      return {type: "FAIL", text: error || "子用户授权失败"}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_AUTH.types.request :
      return {type: "INFO", text: error || "子用户授权中..."}

    case ACTIONS.CALL_MENU_MANAGEMENT_CREATE.types.success :
      return {type: "SUCCESS", text: error || "菜单创建成功"}
    case ACTIONS.CALL_MENU_MANAGEMENT_CREATE.types.fail :
      return {type: "FAIL", text: error || "菜单创建失败"}
    case ACTIONS.CALL_MENU_MANAGEMENT_CREATE.types.request :
      return {type: "INFO", text: error || "菜单创建中..."}
    case ACTIONS.CALL_MENU_MANAGEMENT_DELETE.types.success :
      return {type: "SUCCESS", text: error || "菜单删除成功"}
    case ACTIONS.CALL_MENU_MANAGEMENT_DELETE.types.fail :
      return {type: "FAIL", text: error || "菜单删除失败"}
    case ACTIONS.CALL_MENU_MANAGEMENT_DELETE.types.request :
      return {type: "INFO", text: error || "菜单删除中..."}
    case ACTIONS.CALL_MENU_MANAGEMENT_UPDATE.types.success :
      return {type: "SUCCESS", text: error || "菜单更新成功"}
    case ACTIONS.CALL_MENU_MANAGEMENT_UPDATE.types.fail :
      return {type: "FAIL", text: error || "菜单更新失败"}
    case ACTIONS.CALL_MENU_MANAGEMENT_UPDATE.types.request :
      return {type: "INFO", text: error || "菜单更新中..."}
    case ACTIONS.CALL_MENU_MANAGEMENT_UP.types.success :
      return {type: "SUCCESS", text: error || "菜单向上移动成功"}
    case ACTIONS.CALL_MENU_MANAGEMENT_UP.types.fail :
      return {type: "FAIL", text: error || "菜单向上移动失败"}
    case ACTIONS.CALL_MENU_MANAGEMENT_UP.types.request :
      return {type: "INFO", text: error || "菜单向上移动中..."}
    case ACTIONS.CALL_MENU_MANAGEMENT_DOWN.types.success :
      return {type: "SUCCESS", text: error || "菜单向下移动成功"}
    case ACTIONS.CALL_MENU_MANAGEMENT_DOWN.types.fail :
      return {type: "FAIL", text: error || "菜单向下移动失败"}
    case ACTIONS.CALL_MENU_MANAGEMENT_DOWN.types.request :
      return {type: "INFO", text: error || "菜单向下移动中..."}

    case ACTIONS.CALL_PLATFORM_USE_FEE_PAY_ADD.types.success:
      return {type: "SUCCESS", text: error || "缴费添加成功"}
    case ACTIONS.CALL_PLATFORM_USE_FEE_PAY_ADD.types.fail:
      return {type: "FAIL", text: error || "缴费添加失败"}
    case ACTIONS.CALL_PLATFORM_USE_FEE_PAY_ADD.types.request:
      return {type: "INFO", text: error || "缴费添加中..."}
    case ACTIONS.CALL_PLATFORM_USE_FEE_FEE_UPDATE.types.success:
      return {type: "SUCCESS", text: error || "费用模版修改成功"}
    case ACTIONS.CALL_PLATFORM_USE_FEE_FEE_UPDATE.types.fail:
      return {type: "FAIL", text: error || "费用模版修改失败"}
    case ACTIONS.CALL_PLATFORM_USE_FEE_FEE_UPDATE.types.request:
      return {type: "INFO", text: error || "费用模版修改中..."}
    case ACTIONS.CALL_PLATFORM_USE_FEE_PAY_NOTICE.types.success:
      return {type: "SUCCESS", text: error || "缴费提醒发送成功"}
    case ACTIONS.CALL_PLATFORM_USE_FEE_PAY_NOTICE.types.fail:
      return {type: "FAIL", text: error || "缴费提醒发送失败"}
    case ACTIONS.CALL_PLATFORM_USE_FEE_PAY_NOTICE.types.request:
      return {type: "INFO", text: error || "缴费提醒发送中..."}
    case ACTIONS.CALL_PLATFORM_USE_FEE_BILL_REDUCE.types.success:
      return {type: "SUCCESS", text: error || "平台订单金额减免成功"}
    case ACTIONS.CALL_PLATFORM_USE_FEE_BILL_REDUCE.types.fail:
      return {type: "FAIL", text: error || "平台订单金额减免失败"}
    case ACTIONS.CALL_PLATFORM_USE_FEE_BILL_REDUCE.types.request:
      return {type: "INFO", text: error || "平台订单金额减免中..."}

      // 放款对账单
    case ACTIONS.CALL_FINANCE_LOAN_SEARCH.types.fail :
      return {type: "FAIL", text: error || "放款对账单数据获取失败"}
    case ACTIONS.CALL_FINANCE_LOAN_SEARCH.types.request :
      return {type: "INFO", text: error || "放款对账单数据获取中..."}
    case ACTIONS.CALL_FINANCE_LOAN_SEARCH.types.success :
      if (response.success) {
        return null
      }
      break
    case ACTIONS.CALL_FINANCE_LOAN_CHANGE_STATUS.types.fail :
      return {type: "FAIL", text: error || "放款对账单操作失败"}
    case ACTIONS.CALL_FINANCE_LOAN_CHANGE_STATUS.types.request :
      return {type: "INFO", text: error || "放款对账单操作中..."}
    case ACTIONS.CALL_FINANCE_LOAN_CHANGE_STATUS.types.success :
      if (response.success) {
        return null
      }
      break
    case ACTIONS.CALL_FINANCE_LOAN_MATCH_DETAIL.types.fail :
      return {type: "FAIL", text: error || "出账明细匹配失败"}
    case ACTIONS.CALL_FINANCE_LOAN_MATCH_DETAIL.types.request :
      return {type: "INFO", text: error || "出账明细匹配中..."}
    case ACTIONS.CALL_FINANCE_LOAN_MATCH_DETAIL.types.success :
      if (response.ngHeaders) {
        return {type: "FAIL", text: error || "出账明细表头匹配失败，请自行映射"}
      } else if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "出账明细数据校验失败"}
      } else if (!response.matched || !response.matched.length){
        return {type: "FAIL", text: error || "无出账明细数据有效数据"}
      }
      return {type: "SUCCESS", text: error || "出账明细匹配成功"}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_HISTORICAL_DETAIL.types.fail :
      return {type: "FAIL", text: error || "历史出账明细创建失败"}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_HISTORICAL_DETAIL.types.request :
      return {type: "INFO", text: error || "历史出账明细创建中，请耐心等待..."}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_HISTORICAL_DETAIL.types.success :
      return {type: "SUCCESS", text: error || "历史出账明细创建成功"}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_NEW_DETAIL.types.fail :
      return {type: "FAIL", text: error || "新建放款对账单明细创建失败"}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_NEW_DETAIL.types.request :
      return {type: "INFO", text: error || "新建放款对账单明细创建中，请耐心等待..."}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_NEW_DETAIL.types.success :
      return {type: "SUCCESS", text: error || "新建放款对账单明细创建成功"}

    // 还款对账单
    case ACTIONS.CALL_FINANCE_REPAYMENT_SEARCH.types.fail :
      return {type: "FAIL", text: error || "还款对账单数据获取失败"}
    case ACTIONS.CALL_FINANCE_REPAYMENT_SEARCH.types.request :
      return {type: "INFO", text: error || "还款对账单数据获取中..."}
    case ACTIONS.CALL_FINANCE_REPAYMENT_SEARCH.types.success :
      if (response.success) {
        return null
      }
      break
    case ACTIONS.CALL_FINANCE_REPAYMENT_CHANGE_STATUS.types.fail :
      return {type: "FAIL", text: error || "还款对账单操作失败"}
    case ACTIONS.CALL_FINANCE_REPAYMENT_CHANGE_STATUS.types.request :
      return {type: "INFO", text: error || "还款对账单操作中..."}
    case ACTIONS.CALL_FINANCE_REPAYMENT_CHANGE_STATUS.types.success :
      if (response.success) {
        return null
      }
      break
    case ACTIONS.CALL_FINANCE_REPAYMENT_MATCH_DETAIL.types.fail :
      return {type: "FAIL", text: error || "还款明细匹配失败"}
    case ACTIONS.CALL_FINANCE_REPAYMENT_MATCH_DETAIL.types.request :
      return {type: "INFO", text: error || "还款明细匹配中..."}
    case ACTIONS.CALL_FINANCE_REPAYMENT_MATCH_DETAIL.types.success :
      if (response.ngHeaders) {
        return {type: "FAIL", text: error || "还款明细表头匹配失败，请自行映射"}
      } else if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "还款明细数据校验失败"}
      } else if (!response.matched || !response.matched.length){
        return {type: "FAIL", text: error || "还款对账明细数据有效数据"}
      }
      return {type: "SUCCESS", text: error || "还款明细匹配成功"}
    case ACTIONS.CALL_FINANCE_REPAYMENT_CREATE_NEW_DETAIL.types.fail :
      return {type: "FAIL", text: error || "新建还款对账单明细创建失败"}
    case ACTIONS.CALL_FINANCE_REPAYMENT_CREATE_NEW_DETAIL.types.request :
      return {type: "INFO", text: error || "新建还款对账单明细创建中，请耐心等待..."}
    case ACTIONS.CALL_FINANCE_REPAYMENT_CREATE_NEW_DETAIL.types.success :
      return {type: "SUCCESS", text: error || "新建还款对账单明细创建成功"}

    // 服务费结算单
    case ACTIONS.CALL_FINANCE_SERVICE_SEARCH.types.fail :
      return {type: "FAIL", text: error || "服务费结算单数据获取失败"}
    case ACTIONS.CALL_FINANCE_SERVICE_SEARCH.types.request :
      return {type: "INFO", text: error || "服务费结算单数据获取中..."}
    case ACTIONS.CALL_FINANCE_SERVICE_SEARCH.types.success :
      if (response.success) {
        return null
      }
      break
    case ACTIONS.CALL_FINANCE_SERVICE_SETTLEMENT_CHANGE_STATUS.types.fail :
      return {type: "FAIL", text: error || "服务费结算单操作失败"}
    case ACTIONS.CALL_FINANCE_SERVICE_SETTLEMENT_CHANGE_STATUS.types.request :
      return {type: "INFO", text: error || "服务费结算单操作中..."}
    case ACTIONS.CALL_FINANCE_SERVICE_SETTLEMENT_CHANGE_STATUS.types.success :
      if (response.success) {
        return null
      }
      break
    case ACTIONS.CALL_FINANCE_SERVICE_MATCH_DETAIL.types.fail :
      return {type: "FAIL", text: error || "服务费明细匹配失败"}
    case ACTIONS.CALL_FINANCE_SERVICE_MATCH_DETAIL.types.request :
      return {type: "INFO", text: error || "服务费明细匹配中..."}
    case ACTIONS.CALL_FINANCE_SERVICE_MATCH_DETAIL.types.success :
      if (response.ngHeaders) {
        return {type: "FAIL", text: error || "服务费明细表头匹配失败，请自行映射"}
      } else if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "服务费明细数据校验失败"}
      } else if (!response.matched || !response.matched.length){
        return {type: "FAIL", text: error || "服务费对账明细数据有效数据"}
      }
      return {type: "SUCCESS", text: error || "服务费明细匹配成功"}
    case ACTIONS.CALL_FINANCE_SERVICE_CREATE_NEW_DETAIL.types.fail :
      return {type: "FAIL", text: error || "新建服务费对账单明细创建失败"}
    case ACTIONS.CALL_FINANCE_SERVICE_CREATE_NEW_DETAIL.types.request :
      return {type: "INFO", text: error || "新建服务费对账单明细创建中，请耐心等待..."}
    case ACTIONS.CALL_FINANCE_SERVICE_CREATE_NEW_DETAIL.types.success :
      return {type: "SUCCESS", text: error || "新建服务费对账单明细创建成功"}

    // 还款对账单
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_SEARCH.types.fail :
      return {type: "FAIL", text: error || "贷后订单数据获取失败"}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_SEARCH.types.request :
      return {type: "INFO", text: error || "贷后订单数据获取中..."}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_SEARCH.types.success :
      if (response.success) {
        return null
      }
      break
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_CHANGE_STATUS.types.fail :
      return {type: "FAIL", text: error || "贷后订单操作失败"}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_CHANGE_STATUS.types.request :
      return {type: "INFO", text: error || "贷后订单操作中..."}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_CHANGE_STATUS.types.success :
      if (response.success) {
        return null
      }
      break
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_MATCH_DETAIL.types.fail :
      return {type: "FAIL", text: error || "贷后订单明细匹配失败"}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_MATCH_DETAIL.types.request :
      return {type: "INFO", text: error || "贷后订单明细匹配中..."}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_MATCH_DETAIL.types.success :
      if (response.ngHeaders) {
        return {type: "FAIL", text: error || "贷后订单明细表头匹配失败，请自行映射"}
      } else if (response.unmatched && response.unmatched.length){
        return {type: "FAIL", text: error || "贷后订单明细数据校验失败"}
      } else if (!response.matched || !response.matched.length){
        return {type: "FAIL", text: error || "贷后订单明细数据无有效数据"}
      }
      return {type: "SUCCESS", text: error || "贷后订单明细匹配成功"}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_CREATE_NEW_DETAIL.types.fail :
      return {type: "FAIL", text: error || "贷后订单明细创建失败"}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_CREATE_NEW_DETAIL.types.request :
      return {type: "INFO", text: error || "贷后订单明细创建中..."}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_CREATE_NEW_DETAIL.types.success :
      return {type: "SUCCESS", text: error || "贷后订单明细创建成功"}


    case ACTIONS.CALL_COOPERATOR_INFO_CREATE.types.success :
      return {type: "SUCCESS", text: error || "合作方创建成功"}
    case ACTIONS.CALL_COOPERATOR_INFO_CREATE.types.fail :
      return {type: "FAIL", text: error || "合作方创建失败"}
    case ACTIONS.CALL_COOPERATOR_INFO_CREATE.types.request :
      return {type: "INFO", text: error || "合作方创建中..."}
    case ACTIONS.CALL_COOPERATOR_INFO_DELETE.types.success :
      return {type: "SUCCESS", text: error || "合作方删除成功"}
    case ACTIONS.CALL_COOPERATOR_INFO_DELETE.types.fail :
      return {type: "FAIL", text: error || "合作方删除失败"}
    case ACTIONS.CALL_COOPERATOR_INFO_DELETE.types.request :
      return {type: "INFO", text: error || "合作方删除中..."}
    case ACTIONS.CALL_COOPERATOR_INFO_UPDATE.types.success :
      return {type: "SUCCESS", text: error || "合作方更新成功"}
    case ACTIONS.CALL_COOPERATOR_INFO_UPDATE.types.fail :
      return {type: "FAIL", text: error || "合作方更新失败"}
    case ACTIONS.CALL_COOPERATOR_INFO_UPDATE.types.request :
      return {type: "INFO", text: error || "合作方更新中..."}
    case ACTIONS.CALL_COOPERATOR_INFO_ADD_RELATION.types.success :
      return {type: "SUCCESS", text: error || "合作方关系添加成功"}
    case ACTIONS.CALL_COOPERATOR_INFO_ADD_RELATION.types.fail :
      return {type: "FAIL", text: error || "合作方关系添加失败"}
    case ACTIONS.CALL_COOPERATOR_INFO_ADD_RELATION.types.request :
      return {type: "INFO", text: error || "合作方关系添加中..."}
    case ACTIONS.CALL_COOPERATOR_INFO_SUPPLY_INFO.types.success :
      return {type: "SUCCESS", text: error || "合作方信息补全成功"}
    case ACTIONS.CALL_COOPERATOR_INFO_SUPPLY_INFO.types.fail :
      return {type: "FAIL", text: error || "合作方信息补全失败"}
    case ACTIONS.CALL_COOPERATOR_INFO_SUPPLY_INFO.types.request :
      return {type: "INFO", text: error || "合作方信息补全中, 请耐心等待..."}

    case ACTIONS.CALL_COOPERATOR_API_ASSET_QUERY.types.request:
      return {type: "INFO", text: "资产方API地址搜索中..."}
    case ACTIONS.CALL_COOPERATOR_API_ASSET_QUERY.types.success:
      return null
    case ACTIONS.CALL_COOPERATOR_API_ASSET_QUERY.types.fail:
      return {type: "FAIL", text: error || "资产方API地址搜索失败"}
    case ACTIONS.CALL_COOPERATOR_API_ASSET_CREATE.types.success :
      return {type: "SUCCESS", text: error || "资产方API地址创建成功"}
    case ACTIONS.CALL_COOPERATOR_API_ASSET_CREATE.types.fail :
      return {type: "FAIL", text: error || "资产方API地址创建失败"}
    case ACTIONS.CALL_COOPERATOR_API_ASSET_UPDATE.types.success :
      return {type: "SUCCESS", text: error || "资产方API地址更新成功"}
    case ACTIONS.CALL_COOPERATOR_API_ASSET_UPDATE.types.fail :
      return {type: "FAIL", text: error || "资产方API地址更新失败"}
    case ACTIONS.CALL_COOPERATOR_API_ASSET_DELETE.types.success :
      return {type: "SUCCESS", text: error || "资产方API地址删除成功"}
    case ACTIONS.CALL_COOPERATOR_API_ASSET_DELETE.types.fail :
      return {type: "FAIL", text: error || "资产方API地址删除失败"}
    case ACTIONS.CALL_COOPERATOR_API_FUND_QUERY.types.request:
      return {type: "INFO", text: "资金方API地址搜索中..."}
    case ACTIONS.CALL_COOPERATOR_API_FUND_QUERY.types.success:
      return null
    case ACTIONS.CALL_COOPERATOR_API_FUND_QUERY.types.fail:
      return {type: "FAIL", text: error || "资金方API地址搜索失败"}
    case ACTIONS.CALL_COOPERATOR_API_FUND_CREATE.types.success :
      return {type: "SUCCESS", text: error || "资金方API地址创建成功"}
    case ACTIONS.CALL_COOPERATOR_API_FUND_CREATE.types.fail :
      return {type: "FAIL", text: error || "资金方API地址创建失败"}
    case ACTIONS.CALL_COOPERATOR_API_FUND_UPDATE.types.success :
      return {type: "SUCCESS", text: error || "资金方API地址更新成功"}
    case ACTIONS.CALL_COOPERATOR_API_FUND_UPDATE.types.fail :
      return {type: "FAIL", text: error || "资金方API地址更新失败"}
    case ACTIONS.CALL_COOPERATOR_API_FUND_DELETE.types.success :
      return {type: "SUCCESS", text: error || "资金方API地址删除成功"}
    case ACTIONS.CALL_COOPERATOR_API_FUND_DELETE.types.fail :
      return {type: "FAIL", text: error || "资金方API地址删除失败"}

    case ACTIONS.CALL_USER_ATTRIBUTE_QUERY.types.request:
      return {type: "INFO", text: "平台属性查询中..."}
    case ACTIONS.CALL_USER_ATTRIBUTE_QUERY.types.fail :
      return {type: "FAIL", text: error || "平台属性查询失败"}
    case ACTIONS.CALL_USER_ATTRIBUTE_SAVE.types.request:
      return {type: "INFO", text: "平台属性保存中..."}
    case ACTIONS.CALL_USER_ATTRIBUTE_SAVE.types.success :
      return {type: "SUCCESS", text: error || "平台属性保存成功"}
    case ACTIONS.CALL_USER_ATTRIBUTE_SAVE.types.fail :
      return {type: "FAIL", text: error || "平台属性保存失败"}

    case ACTIONS.CALL_ADMIN_STATISTICS_PLATFORM.types.fail :
      return {type: "FAIL", text: error || "平台规模统计中失败"}
    case ACTIONS.CALL_ADMIN_STATISTICS_PLATFORM.types.request :
      return {type: "INFO", text: error || "平台规模统计中..."}
    case ACTIONS.CALL_ADMIN_STATISTICS_PLATFORM.types.success :
      if (response.success) {
        return null
      }
      break
    // --- 结算方式 --- //
    case ACTIONS.CALL_SETTLE_METHOD_SEARCH.types.fail :
      return {type: "FAIL", text: error || "结算方式数据获取失败"}
    case ACTIONS.CALL_SETTLE_METHOD_SEARCH.types.request :
      return {type: "INFO", text: error || "结算方式数据获取中..."}
    case ACTIONS.CALL_SETTLE_METHOD_SEARCH.types.success :
      if (response.success) {
        return null
      }
      break
    // --- 余额统计 --- //
    case ACTIONS.CALL_BALANCE_STATISTICS_SEARCH.types.fail :
      return {type: "FAIL", text: error || "余额统计数据获取失败"}
    case ACTIONS.CALL_BALANCE_STATISTICS_SEARCH.types.request :
      return {type: "INFO", text: error || "余额统计数据获取中..."}
    case ACTIONS.CALL_BALANCE_STATISTICS_SEARCH.types.success :
      if (response.success) {
        return null
      }
      break
    // 角色创建
    case ACTIONS.CALL_ROLE_MANAGEMENT_CREATE.types.fail :
      return {type: "FAIL", text: error || "角色创建失败"}
    case ACTIONS.CALL_ROLE_MANAGEMENT_CREATE.types.request :
      return {type: "INFO", text: error || "角色创建中..."}
    case ACTIONS.CALL_ROLE_MANAGEMENT_CREATE.types.success :
      if (response.success) {
        return null
      }
      break
    // 角色修改
    case ACTIONS.CALL_ROLE_MANAGEMENT_UPDATE.types.fail :
      return {type: "FAIL", text: error || "角色修改失败"}
    case ACTIONS.CALL_ROLE_MANAGEMENT_UPDATE.types.request :
      return {type: "INFO", text: error || "角色修改中..."}
    case ACTIONS.CALL_ROLE_MANAGEMENT_UPDATE.types.success :
      if (response.success) {
        return null
      }
      break
    case ACTIONS.CALL_ENTERPRISE_PUBLICITY_SEARCH.types.success:
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "企业征信信息查询失败"}
    case ACTIONS.CALL_ENTERPRISE_PUBLICITY_SEARCH.types.fail:
      return {type: "FAIL", text: error || "企业征信查询信息匹配失败"}
    case ACTIONS.CALL_ENTERPRISE_PUBLICITY_SEARCH.types.request:
      return {type: "INFO", text: error || "企业征信信息查询中..."}
    case ACTIONS.CALL_MATCH_ENTERPRISE_PUBLICITY.types.success:
      if (response.matched && response.matched.length) {
        return {type: "SUCCESS", text: error || "企业征信查询信息匹配成功"}
      }
      return {type: "FAIL", text: error || "企业征信查询信息匹配失败"}
    case ACTIONS.CALL_MATCH_ENTERPRISE_PUBLICITY.types.fail:
      return {type: "FAIL", text: error || "企业征信查询信息匹配失败"}
    case ACTIONS.CALL_MATCH_ENTERPRISE_PUBLICITY.types.request:
      return {type: "INFO", text: error || "企业征信查询信息匹配..."}
    case ACTIONS.CALL_CREATE_ENTERPRISE_PUBLICITY.types.success:
      return {type: "SUCCESS", text: error || "企业征信查询任务创建成功"}
    case ACTIONS.CALL_CREATE_ENTERPRISE_PUBLICITY.types.fail :
      return {type: "FAIL", text: error || "企业征信查询任务创建失败"}
    case ACTIONS.CALL_CREATE_ENTERPRISE_PUBLICITY.types.request :
      return {type: "INFO", text: error || "企业公示查询任务创建中..."}
    case ACTIONS.CALL_COOPERATOR_ACCOUNT_INFO_QUERY.types.fail :
      return {type: "FAIL", text: error || "合作方开户信息查询失败"}
    case ACTIONS.CALL_COOPERATOR_ACCOUNT_INFO_QUERY.types.request :
      return {type: "INFO", text: error || "合作方开户信息查询中..."}
    case ACTIONS.CALL_COOPERATOR_BUSINESS_SPECIFICA_QUERY.types.fail :
      return {type: "FAIL", text: error || "业务端口搜索失败"}
    case ACTIONS.CALL_COOPERATOR_BUSINESS_SPECIFICA_QUERY.types.request :
      return {type: "INFO", text: error || "业务端口搜索中..."}
    case ACTIONS.CALL_PERSONAL_PUBLICITY_SEARCH.types.success:
      if (response.success) {
        return null
      }
      return {type: "FAIL", text: error || "个人征信信息查询失败"}
    case ACTIONS.CALL_PERSONAL_PUBLICITY_SEARCH.types.fail:
      return {type: "FAIL", text: error || "个人征信查询信息匹配失败"}
    case ACTIONS.CALL_PERSONAL_PUBLICITY_SEARCH.types.request:
      return {type: "INFO", text: error || "个人征信信息查询中..."}
    case ACTIONS.CALL_MATCH_PERSONAL_PUBLICITY.types.success:
      if (response.matched && response.matched.length) {
        return {type: "SUCCESS", text: error || "个人征信查询信息匹配成功"}
      }
      return {type: "FAIL", text: error || "个人征信查询信息匹配失败"}
    case ACTIONS.CALL_MATCH_PERSONAL_PUBLICITY.types.fail:
      return {type: "FAIL", text: error || "个人征信查询信息匹配失败"}
    case ACTIONS.CALL_MATCH_PERSONAL_PUBLICITY.types.request:
      return {type: "INFO", text: error || "个人征信查询信息匹配..."}
    case ACTIONS.CALL_CREATE_PERSONAL_PUBLICITY.types.success:
      return {type: "SUCCESS", text: error || "个人征信查询任务创建成功"}
    case ACTIONS.CALL_CREATE_PERSONAL_PUBLICITY.types.fail :
      return {type: "FAIL", text: error || "个人征信查询任务创建失败"}
    case ACTIONS.CALL_CREATE_PERSONAL_PUBLICITY.types.request :
      return {type: "INFO", text: error || "个人征信查询任务创建中..."}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_RESTRICTION_UPDATE.types.success:
      return {type: "SUCCESS", text: error || "子用户数据权限更新成功"}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_RESTRICTION_UPDATE.types.fail :
      return {type: "FAIL", text: error || "子用户数据权限更新失败"}
    case ACTIONS.CALL_SUB_USER_MANAGEMENT_RESTRICTION_UPDATE.types.request :
      return {type: "INFO", text: error || "子用户数据权限更新中..."}
    case ACTIONS.CALL_WITHDRAW.types.request :
      return {type: "INFO", text: error || "订单提现查询中..."}
    case ACTIONS.CALL_WITHDRAW.types.fail :
      return {type: "INFO", text: error || "订单提现查询失败"}
    default:
      return null
  }
}

export default message
