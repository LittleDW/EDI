/**
 * 作者：石奇峰
 * 功能：提供API调用工具
 * */

let request = require("request"), configure = require("../config/configure.json")[process.env.NODE_ENV],
  {co, promisify, logger, promisifyTimeout} = require("./util");

module.exports = (ropAPI, data, errorTag, alwaysSuccess) => {
  let {appKey, appSecret, host, requestHeader} = configure.rop,
    timestamp = new Date().format("yyyy-MM-dd HH:mm:ss"), param = Object.assign({
      app_key: appKey,
      format: "json",
      method: ropAPI,
      session: 1,
      timestamp: timestamp,
    }, data);

  // 过滤参数数据，去掉不用的undefined，nul和空字符串
  for (var props in param) {
    if (!param[props] && (param[props] !== 0)) {
      if ((typeof param[props] == "undefined") || (param[props] === null) || (param[props] === "")) {
        delete param[props];
      }
    }
  }

  // 制造sign
  let sign = `${appSecret}${Object.keys(param).sort().filter(r => (param[r] || (param[r] === 0))).map(r => `${r}${param[r]}`).join("")}${appSecret}`.md5(),
    option = {
      url: `${host}?method=${ropAPI}&&format=json&&app_key=${appKey}&&timestamp=${timestamp}&&session=1&&sign=${sign}`,
      json: true,
      headers: requestHeader,
      form: param,
      timeout: 600000
    };
  //let endTime = Date.now() + 1000000;
  return co(function* () {
    let repeater = function* () {
      let result,POST = promisify(request.post, {multiArgs: true});
      logger.info(`调用ROP接口 => ${ropAPI}-${JSON.stringify(data)}`);
      let [response, body] = yield POST.call(request, option);
      logger.info(`ROP接口返回 => ${ropAPI}-${body ? JSON.stringify(body) : ""}`);
      if (response.statusCode === 200) {
        if (body.error_response) {
          result = {
            success: false,
            data: Object.assign({_reason: `${body.error_response.msg}${body.error_response.sub_msg ? `: ${body.error_response.sub_msg}` : ""}`}, data),
            error_code: 1
          };
        } else if (alwaysSuccess) {
          let domain = body[Object.keys(body)[0]];
          result = {success: true, data: {...data, ...domain}};
        } else {
          let domain = body[Object.keys(body)[0]];
          if (((domain.is_success === true) || (domain.is_success == "true") || (domain.is_success == "ok")) && (domain.is_success != "false")) {
            result = {success: true, data: Object.assign({}, data, domain)};
          } else {
            result = {
              success: false,
              data: Object.assign({_reason: errorTag ? domain[errorTag] : "ROP无返回消息", error: body}, data),
              error_code: 2
            };
          }
          //results.push({success: true, data: Object.assign(,t.data)})
        }
      } else {
        result = {
          success: false,
          data: Object.assign({_reason: `ROP请求出错，status=${response.statusCode}，请联系管理员`, error: body}, data),
          error_code: 0
        };
      }
      return result;
    };

    try {
      return yield* repeater();
    } catch (e) {
      logger.error(e)
      throw new Error(e);
      /*try{
        return yield* repeater();
      }catch(e1){
        logger.error(e1)
        throw new Error(e1);
      }*/
    }

    //return yield* repeater();
  }).catch(e => {
    return {success: false, data: Object.assign({_reason: e.message || "ROP接口调用失败"}, data)};
  });
};
