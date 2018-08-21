/**
 * 作者：石奇峰
 * EDI系统的各种工具和扩展
 * */
import XLSX from "xlsx"
import FileSaver from 'file-saver'
import MobileDetect from 'mobile-detect'
import _ from 'lodash'

Date.prototype.format = function (fmt) { //author: meizz
  const o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'H+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    'S': this.getMilliseconds() //毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()}`).substr(4 - RegExp.$1.length))
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)))
    }
  }
  return fmt
}

String.prototype.md5 = function () {
  let string = this

  function md5_RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits))
  }

  function md5_AddUnsigned(lX, lY) {
    let lX4, lY4, lX8, lY8, lResult
    lX8 = (lX & 0x80000000)
    lY8 = (lY & 0x80000000)
    lX4 = (lX & 0x40000000)
    lY4 = (lY & 0x40000000)
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF)
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8)
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8)
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8)
      }
    } else {
      return (lResult ^ lX8 ^ lY8)
    }
  }

  function md5_F(x, y, z) {
    return (x & y) | ((~x) & z)
  }

  function md5_G(x, y, z) {
    return (x & z) | (y & (~z))
  }

  function md5_H(x, y, z) {
    return (x ^ y ^ z)
  }

  function md5_I(x, y, z) {
    return (y ^ (x | (~z)))
  }

  function md5_FF(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac))
    return md5_AddUnsigned(md5_RotateLeft(a, s), b)
  }

  function md5_GG(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac))
    return md5_AddUnsigned(md5_RotateLeft(a, s), b)
  }

  function md5_HH(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac))
    return md5_AddUnsigned(md5_RotateLeft(a, s), b)
  }

  function md5_II(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac))
    return md5_AddUnsigned(md5_RotateLeft(a, s), b)
  }

  function md5_ConvertToWordArray(string) {
    let lWordCount
    const lMessageLength = string.length
    const lNumberOfWords_temp1 = lMessageLength + 8
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16
    const lWordArray = Array(lNumberOfWords - 1)
    let lBytePosition = 0
    let lByteCount = 0
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4
      lBytePosition = (lByteCount % 4) * 8
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition))
      lByteCount++
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4
    lBytePosition = (lByteCount % 4) * 8
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition)
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29
    return lWordArray
  }

  function md5_WordToHex(lValue) {
    let WordToHexValue = '', WordToHexValue_temp = '', lByte, lCount
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255
      WordToHexValue_temp = `0${lByte.toString(16)}`
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2)
    }
    return WordToHexValue
  }

  function md5_Utf8Encode(string) {
    string = string.replace(/\r\n/g, '\n')
    let utftext = ''
    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n)
      if (c < 128) {
        utftext += String.fromCharCode(c)
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192)
        utftext += String.fromCharCode((c & 63) | 128)
      } else {
        utftext += String.fromCharCode((c >> 12) | 224)
        utftext += String.fromCharCode(((c >> 6) & 63) | 128)
        utftext += String.fromCharCode((c & 63) | 128)
      }
    }
    return utftext
  }

  let x = []
  let k, AA, BB, CC, DD, a, b, c, d
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21
  string = md5_Utf8Encode(string)
  x = md5_ConvertToWordArray(string)
  a = 0x67452301
  b = 0xEFCDAB89
  c = 0x98BADCFE
  d = 0x10325476
  for (k = 0; k < x.length; k += 16) {
    AA = a
    BB = b
    CC = c
    DD = d
    a = md5_FF(a, b, c, d, x[k + 0], S11, 0xD76AA478)
    d = md5_FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756)
    c = md5_FF(c, d, a, b, x[k + 2], S13, 0x242070DB)
    b = md5_FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE)
    a = md5_FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF)
    d = md5_FF(d, a, b, c, x[k + 5], S12, 0x4787C62A)
    c = md5_FF(c, d, a, b, x[k + 6], S13, 0xA8304613)
    b = md5_FF(b, c, d, a, x[k + 7], S14, 0xFD469501)
    a = md5_FF(a, b, c, d, x[k + 8], S11, 0x698098D8)
    d = md5_FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF)
    c = md5_FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1)
    b = md5_FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE)
    a = md5_FF(a, b, c, d, x[k + 12], S11, 0x6B901122)
    d = md5_FF(d, a, b, c, x[k + 13], S12, 0xFD987193)
    c = md5_FF(c, d, a, b, x[k + 14], S13, 0xA679438E)
    b = md5_FF(b, c, d, a, x[k + 15], S14, 0x49B40821)
    a = md5_GG(a, b, c, d, x[k + 1], S21, 0xF61E2562)
    d = md5_GG(d, a, b, c, x[k + 6], S22, 0xC040B340)
    c = md5_GG(c, d, a, b, x[k + 11], S23, 0x265E5A51)
    b = md5_GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA)
    a = md5_GG(a, b, c, d, x[k + 5], S21, 0xD62F105D)
    d = md5_GG(d, a, b, c, x[k + 10], S22, 0x2441453)
    c = md5_GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681)
    b = md5_GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8)
    a = md5_GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6)
    d = md5_GG(d, a, b, c, x[k + 14], S22, 0xC33707D6)
    c = md5_GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87)
    b = md5_GG(b, c, d, a, x[k + 8], S24, 0x455A14ED)
    a = md5_GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905)
    d = md5_GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8)
    c = md5_GG(c, d, a, b, x[k + 7], S23, 0x676F02D9)
    b = md5_GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A)
    a = md5_HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942)
    d = md5_HH(d, a, b, c, x[k + 8], S32, 0x8771F681)
    c = md5_HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122)
    b = md5_HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C)
    a = md5_HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44)
    d = md5_HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9)
    c = md5_HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60)
    b = md5_HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70)
    a = md5_HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6)
    d = md5_HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA)
    c = md5_HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085)
    b = md5_HH(b, c, d, a, x[k + 6], S34, 0x4881D05)
    a = md5_HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039)
    d = md5_HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5)
    c = md5_HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8)
    b = md5_HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665)
    a = md5_II(a, b, c, d, x[k + 0], S41, 0xF4292244)
    d = md5_II(d, a, b, c, x[k + 7], S42, 0x432AFF97)
    c = md5_II(c, d, a, b, x[k + 14], S43, 0xAB9423A7)
    b = md5_II(b, c, d, a, x[k + 5], S44, 0xFC93A039)
    a = md5_II(a, b, c, d, x[k + 12], S41, 0x655B59C3)
    d = md5_II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92)
    c = md5_II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D)
    b = md5_II(b, c, d, a, x[k + 1], S44, 0x85845DD1)
    a = md5_II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F)
    d = md5_II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0)
    c = md5_II(c, d, a, b, x[k + 6], S43, 0xA3014314)
    b = md5_II(b, c, d, a, x[k + 13], S44, 0x4E0811A1)
    a = md5_II(a, b, c, d, x[k + 4], S41, 0xF7537E82)
    d = md5_II(d, a, b, c, x[k + 11], S42, 0xBD3AF235)
    c = md5_II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB)
    b = md5_II(b, c, d, a, x[k + 9], S44, 0xEB86D391)
    a = md5_AddUnsigned(a, AA)
    b = md5_AddUnsigned(b, BB)
    c = md5_AddUnsigned(c, CC)
    d = md5_AddUnsigned(d, DD)
  }
  return (md5_WordToHex(a) + md5_WordToHex(b) + md5_WordToHex(c) + md5_WordToHex(d)).toUpperCase()
}

String.prototype.getBytesLength = function () { //author: meizz
  var length = 0
  for (var i = 0; i < this.length; i++) {
    var code = this.charCodeAt(i), str = String.fromCharCode(code)
    if (/[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/.test(str)) {
      length += 2
    } else {
      length += 1
    }
  }
  return length
}
String.prototype.getUnicodeLength = function(){
  var result = 0
  if (this) {
    var urilength = encodeURIComponent(this).match(/%[89ABab]/g)
    if (urilength) {
      result = this.length + Math.floor(urilength.length / 2)
    } else {
      result = this.getBytesLength()
    }
  }
  return result
}

FileReader.prototype.readAsArrayBufferPromise = (file) =>{
  var reader = this;
  return new Promise((res, rej)=>{
    reader.onload = function() {
      var arrayBuffer = reader.result,
        array = new Uint8Array(arrayBuffer)
        //binaryString = String.fromCharCode.apply(null, array);
      res(array)
    }
    reader.readAsArrayBuffer(file);
  })
}

export default {}
export const getBrowserType = () => {
  let isChromeVersion = (version) => {
    var test = navigator.userAgent.match(/chrom(?:e|ium)\/(\d+)\./i);
    if (test) {
      return (parseInt(test[1], 10) === version);
    }
    return false;
  }
  let is_qq_browser = navigator.userAgent.indexOf('QQBrowser') > -1
  let is_m_qq = navigator.userAgent.indexOf('MQQBrowser') > -1
  let is_chrome45 = isChromeVersion(45)
  let is_chrome = navigator.userAgent.indexOf('Chrome') > -1
  let is_explorer = navigator.userAgent.indexOf('MSIE') > -1
  let is_firefox = navigator.userAgent.indexOf('Firefox') > -1
  let is_safari = navigator.userAgent.indexOf('Safari') > -1
  let is_opera = navigator.userAgent.toLowerCase().indexOf('op') > -1
  if ((is_chrome) && (is_safari)) {
    is_safari = false
  }
  if ((is_chrome) && (is_opera)) {
    is_chrome = false
  }

  if (is_qq_browser) {
    return 'QQBrowser'
  } else if (is_explorer) {
    return 'MSIE'
  } else if (is_m_qq) {
    return 'MQQ'
  } else if (is_firefox) {
    return 'Firefox'
  } else if (is_opera) {
    return 'op'
  } else if (is_safari) {
    return 'Safari'
  } else if (is_chrome45) {
    return 'Chrome45'
  } else if (is_chrome) {
    return 'Chrome'
  } else {
    if (document.body.style['msTextCombineHorizontal'] != undefined) {
      return 'IE11'
    }
  }

  return null
}
export const escCloser = (cb)=>(e)=>{
  if(e.which == 27){
    (typeof cb == "function") && cb()
  }
}

export const formatOrganizationCode = (s, dictionary) => {
  var period = dictionary.filter(r => (r.table_name == 't_user')).filter(r => (r.col_name == "org_code")),
    result = period.filter(r => (s == r.para_key))[0]
  return result ? result.para_value : s
}

export const formatRoleType = (s, dictionary) => {
  var period = dictionary.filter(r => (r.table_name == 't_role')).filter(r => (r.col_name == "role_type")),
    result = period.filter(r => (s == r.para_key))[0]
  return result ? result.para_value : s
}


export const formatNumber = (number) => {
  if (isNaN(number)) {
    return '-'
  } else {
    let value = ''
    let numArr = String(number).split('.')
    let num = numArr[0] < 0 ? numArr[0] * -1 : numArr[0]
    value = String(num).split("").reverse().join("");
    value = value.replace(/(\d{3})/g,"$1,");
    value = value.split("").reverse().join("");
    value = value.indexOf(",")==0?value.substring(1):value;
    let result =  number < 0 ? '-' + value : value
    if (numArr.length > 1) {
      result = result +  '.' + numArr[1]
    }
    return result
  }
}

export const formatStatisNumber = (number) => {
  if (isNaN(number) || Number(number) === 0) {
    return '-'
  } else {
    return formatNumber(number)
  }
}

// 将Value转化为number用于计算 如：1,233.23 => 1233.23
export const convertToNumber = (value) => {
  try {
    return parseFloat(String(value).replace(',', ''))
  } catch(e) {
    return 0
  }
}

// 将Value转化为string用于渲染 如：1233.23212 => '1,233.23'
export const convertToString = (value, digits) => {
  try {
    return parseFloat(String(value).replace(',', '')).toFixed(digits ? digits : 0)
  } catch(e) {
    return '-'
  }
}

export const convertToStringNew = (value, isPercent, digits = 2) => {
  let result = parseFloat(String(value).replace(',', ''))
  if (Number.isNaN(result) || result === Infinity) {
    return '-'
  } else if (isPercent){
    return (result* 100).toFixed(digits ? digits : 0) + '%'
  } else {
    return result.toFixed(digits ? digits : 0)
  }
}

export const sumArray = (array, attr) =>{
  try {
    if (!attr) {return Number.NaN}
    let _array = [...array]
    return _array.map(item => convertToNumber(item[attr])).reduce((a, b) => a + b).toFixed(0)
  } catch(e) {
    return Number.NaN
  }
}

// 去重
export const unique = (arr, type) => {
  const seen = new Map()
  return arr.filter((a) => a[type] && !seen.has(a[type]) && seen.set(a[type], 1))
}

export const unique2 = (arr, type1, type2) => {
  const seen = new Map()
  return arr.filter((a) => !(seen.has(a[type1]) && seen.has(a[type2])) && seen.set(a[type1], 1) && seen.set(a[type2], 1))
}

export const flattenTableData = (arr, rowIterator, columnIterator, valueIterator) => {
  if (!Array.isArray(arr) || !rowIterator || !columnIterator || !valueIterator) {
    return null
  }
  try {
    const rowList = unique(arr, rowIterator).map(item => item[rowIterator])
    const result = []
    rowList.forEach(row => {
      const _arr = arr.filter(item => item[rowIterator] === row)
      const obj = _.chain(_arr).keyBy(columnIterator).mapValues(valueIterator).value();
      obj[rowIterator] = row
      result.push(obj)
    });

    return result

  } catch (error) {
    return null
  }

}

export const isElement = (obj) =>{
  try {
    //Using W3 DOM2 (works for FF, Opera and Chrom)
    return obj instanceof HTMLElement;
  }
  catch(e){
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have. (works on IE7)
    return (typeof obj==="object") &&
      (obj.nodeType===1) && (typeof obj.style === "object") &&
      (typeof obj.ownerDocument ==="object");
  }
}

export const exportXLSX = (json, filename)=>{
  let wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(json),
    wopts = { bookType:'xlsx', bookSST:false, type:'array' }
  XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
  var wbout = XLSX.write(wb,wopts);
  FileSaver.saveAs(new Blob([wbout],{type:"application/octet-stream"}), filename)
}

export const fastExport = (data, columns, filename)=>{
  let json = data.map(r=>{
    let xr = {}
    columns.forEach(t=>{
      if(t.renderDom && (typeof t.renderDom == "function")){
        let dom = t.renderDom(r)
        if(dom && !dom.$$typeof){
          xr[t.text] = t.renderDom(r)
          return
        }
      }
      xr[t.text] = r[t.name]
    })
    return xr
  })
  exportXLSX(json, filename)
}
export const downloadUrl = (url, hiddenLink)=>{
  var browserType = getBrowserType()
  if (browserType == "Chrome") {
    hiddenLink.href = url
    hiddenLink.click()
  } else if (browserType == 'Safari') {
    //this.hiddenLink.href = queryString
    window.location.href = url
  } else if (browserType == 'Firefox') {
    //this.hiddenLink.href = queryString
    window.location.href = url
  } else {
    window.open(url, '_blank')
  }
}

// Measure scrollbar width for padding body during modal show/hide
const scrollbarMeasure = {
  position: 'absolute',
  top: '-9999px',
  width: '50px',
  height: '50px',
  overflow: 'scroll',
};

let scrollbarSize;

// measure scrollbar width
export function measureScrollbar(direction = 'vertical') {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return 0;
  }
  if (scrollbarSize) {
    return scrollbarSize;
  }
  const scrollDiv = document.createElement('div');
  Object.keys(scrollbarMeasure).forEach(scrollProp => {
    scrollDiv.style[scrollProp] = scrollbarMeasure[scrollProp];
  });
  document.body.appendChild(scrollDiv);
  let size = 0;
  if (direction === 'vertical') {
    size = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  } else if (direction === 'horizontal') {
    size = scrollDiv.offsetHeight - scrollDiv.clientHeight;
  }

  document.body.removeChild(scrollDiv);
  scrollbarSize = size;
  return scrollbarSize;
}

export const isMobile = ()=>{
  var md = new MobileDetect(window.navigator.userAgent)
  return (md.mobile() != null)
}

export const isIE = (function(){
  var undef,rv = -1; // Return value assumes failure.
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  var trident = ua.indexOf('Trident/');

  if (msie > 0) {
    // IE 10 or older => return version number
    rv = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  } else if (trident > 0) {
    // IE 11 (or newer) => return version number
    var rvNum = ua.indexOf('rv:');
    rv = parseInt(ua.substring(rvNum + 3, ua.indexOf('.', rvNum)), 10);
  }

  return ((rv > -1) ? rv : undef);
}());
