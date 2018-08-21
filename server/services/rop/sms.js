/**
 * 作者：石奇峰
 * 功能：提供sms调用工具
 * */

let ropAPI = require('./ropAPI');

module.exports = (type, mobile, content, message) => {
  if (process.env.NODE_ENV === 'test') {
    return {
      success: true,
    };
  }
  let info;
  switch (type) {
    case 0:
      info = `验证码为：${content}，您正在修改分配设置，产品期限为${message}，5分钟内有效。如非本人操作，可忽略本消息。`;
      break;
    case 1:
      info = `EDI爬虫任务报障：${content}，请查询任务日志，并处理数据库中错误数据。`;
      break;
    default:
      info = ``;
  }
  if (Array.isArray(mobile)) {
    return mobile.map((r) =>
      ropAPI('ruixue.sms.note.send', {
        channel_code: 'BF175285-4821-4C41-9462-6EC00F84E57B',
        append_code: '0030',
        mobile: r,
        content: info,
      }),
    );
  } else {
    return ropAPI('ruixue.sms.note.send', {
      channel_code: 'BF175285-4821-4C41-9462-6EC00F84E57B',
      append_code: '0030',
      mobile,
      content: info,
    });
  }
};
