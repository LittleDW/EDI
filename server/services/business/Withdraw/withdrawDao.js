/*
 * @Author Osborn
 * @File withdrawDao.js
 * @Created Date 2018-05-30 10-00
 * @Last Modified: 2018-05-30 10-00
 * @Modified By: Osborn
 */

const { Order } = require('../../../dao');
const Super = require('../super');

class WithDraw extends Super {
  count(params = {}) {
    return Order.OrderWithdraw(this.info).countRaw(params);
  }

  query(params = {}) {
    const { page_index } = params;
    return Order.OrderWithdraw(this.info).query(params, page_index);
  }
}

module.exports = (req) => new WithDraw(req);
