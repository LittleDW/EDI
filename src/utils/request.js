/**
 * 作者：石奇峰
 * EDI系统的Ajax请求
 * */

import uuidv4 from "uuid/v4"
import co from "co"
import io from "socket.io-client"

export default function request(method, url, body, opt) {
  //return post(url, body, opt)
  /*if(!opt || !opt.multipart){
   return post(url, body, opt)
   }
   let data = {}, files = [];
   if(body && (typeof body == "object")){
   files = [].concat.apply([],Object.keys(body).map(r=>{
   if(r&&r.constructor&&(r.constructor.name == "File")){
   return [r]
   }
   data[r] = body[r]
   return []
   }))
   }*/

  /*if (body && body.constructor && (body.constructor.name == "FormData")) {
   return post(url, body, opt)
   }*/
  //return ediPost(url, body, opt)
  if (opt && opt.arrayBuffer) {
    return ediArrayBufferPost(url, body, opt)
  } else if (body && body.constructor && (body.constructor.name == "FormData")) {
    return ediPost(url, body, opt)
  } else{
    return ediFetch.apply(this, arguments)
  }
}

export const ediFetch = (method, url, body, opt) => {
  method = method.toUpperCase();
  if (method === 'GET') {
    // fetch的GET不允许有body，参数只能放在url中
    body = undefined;
  } else {
    body = body && JSON.stringify(body);
  }

  return {
    promise: fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Token': sessionStorage.getItem('access_token') || '' // 从sessionStorage中获取access token
      },
      credentials: "same-origin",
      body
    })
      .then((res) => {
        if (res.status === 401) {
          return Promise.reject('Unauthorized.');
        }
        if (res.status === 404) {
          return Promise.reject('Not Found.');
        } else {
          const token = res.headers.get('access-token');
          if (token) {
            sessionStorage.setItem('access_token', token);
          }
          return res.json();
        }
      }),
    xhr: null
  }
}
export const ediPost = (url, body, opt) => {
  let data, onProgress, onLoad, xhr = undefined, header, promise;
  if(opt){
    onProgress = opt.onProgress
    onLoad = opt.onLoad
    header = opt.header
  }
  if ((!xhr) && (typeof XMLHttpRequest !== 'undefined')) {
    xhr = new XMLHttpRequest();
  }
  if (body && body.constructor && (body.constructor.name == "FormData")) {
    data = body
  } else {
    data = JSON.stringify(body)
  }
  var getPromise = (extraHeaders)=> new Promise((res, rej) => {
    if (!xhr) {
      rej('该浏览器不支持XmlHttpRequest')
    }
    xhr.open("POST", url);
    xhr.timeout = 3600000;
    xhr.onerror = rej;
    if (!body || !body.constructor || (body.constructor.name != "FormData")) {
      xhr.setRequestHeader('Content-type', header&&header.contentType || 'application/json;charset=UTF-8');
    }
    if(extraHeaders && extraHeaders.constructor && (extraHeaders.constructor === Object)){
      Object.keys(extraHeaders).forEach(r=>{
        xhr.setRequestHeader(r, extraHeaders[r]);
      })
    }
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = onProgress;
    }
    if (xhr.upload && onLoad) {
      xhr.upload.onload = onLoad;
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status === 0) {
          data = {success: false, message: "接口超时或被取消"};
        } else if (xhr.status === 504) {
          data = {success: false, message: "网关超时，创建中的订单不会被取消"};
        } else if (xhr.status === 200) {
          var data = undefined;
          try {
            data = JSON.parse(xhr.responseText);
          } catch (e) {
            data = {success: false, message: e.message || "服务器出错"};
          }
        } else {
          data = {success: false, message: xhr && xhr.responseText || "服务器出错"};
        }
        res(data)
      }
    };
    xhr.ontimeout = function (e) {
      res({success: false, message: "连接超时，您需要刷新页面才能获得最新数据"})
    };
    xhr.send(data);
  })
  if(opt && opt.socket){
    /** socket连接后再发送接口，以防止接口在未连接的时候发送 */
    let socket, channel = uuidv4(), {handler, manager} = opt.socket
    promise = new Promise((res, rej) => {
      socket = io(window.EDI_CLIENT.WS,{transports: ['websocket']})
      socket.on(channel,handler);
      socket.on("connect_error", rej);
      socket.on("connect", ()=>{
        res({"x-edi-token":socket.id, "x-edi-channel": channel})
      });
      if(typeof manager == "function"){
        manager(socket)
      }
    }).then(getPromise).then((data)=>{
      if((typeof manager != "function") && socket){
        socket.close()
      }
      return data
    })
  } else {
    promise = getPromise()
  }
  //promise = getPromise()
  return {promise, xhr}
};
export const ediArrayBufferPost = (url, body, opt) => {
  let onProgress = opt && opt.onProgress, onLoad = opt && opt.onLoad, xhr = undefined,
    data = {}, files = [];
  if (body && (typeof body == "object")) {
    files = [].concat.apply([], Object.keys(body).map(r => {
      if (r && r.constructor && (r.constructor.name == "File")) {
        return [r]
      }
      data[r] = body[r]
      return []
    }))
  }

  files.map(r=>{
    let fr = new FileReader(), minPartSize = 1024 * 1024, fileName = uuidv4();
    return fr.readAsArrayBufferPromise(r).then(t=>{
      let filesize = t.length, parts = Math.ceil(filesize/minPartSize), group = []
      for(let i=0;i<parts;i++){
        group.push(t.slice(i*minPartSize, (i+1)*minPartSize))
      }
      return group.map(g=>new Promise((res,rej)=>{
        ediPost(url,{})
      }))
    })
  })
  co(function*(){

  })

  if ((!xhr) && (typeof XMLHttpRequest !== 'undefined')) {
    xhr = new XMLHttpRequest();
  }
  return {
    promise: new Promise((res, rej) => {
      if (!xhr) {
        rej('该浏览器不支持XmlHttpRequest')
      }
      xhr.open("POST", url);
      xhr.timeout = 3600000;
      xhr.onerror = rej;
      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = onProgress;
      }
      if (xhr.upload && onLoad) {
        xhr.upload.onload = onLoad;
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status === 0) {
            data = {success: false, message: "接口超时或被取消"};
          } else if (xhr.status === 504) {
            data = {success: false, message: "网关超时，创建中的订单不会被取消"};
          } else if (xhr.status === 200) {
            var data = undefined;
            try {
              data = JSON.parse(xhr.responseText);
            } catch (e) {
              data = {success: false, message: e.message || "服务器出错"};
            }
          } else {
            data = {success: false, message: xhr && xhr.responseText || "服务器出错"};
          }
          res(data)
        }
      };
      xhr.ontimeout = function (e) {
        res({success: false, message: "连接超时，您需要刷新页面才能获得最新数据"})
      };
      xhr.send(data);
    }),
    xhr
  }
};
/*export const get = url => request('GET', url);
 export const put = (url, body) => request('PUT', url, body);
 export const del = (url, body) => request('DELETE', url, body);*/
