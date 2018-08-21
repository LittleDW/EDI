const sequelize = require("sequelize");
const Model = require("../super");
const _ = require("lodash");
const {db} = require("../../schema/index");


class PlantformQuery extends Model {
  // 平台规模统计
  query(params={}) {
    const {start_date, end_date} = params
    const attributes = [
      ['borrow_date', 'borrow_date'],
      ['borrow_count', 'borrow_count'],
      ['borrow_fee', 'borrow_fee'],
      ['d_000', 'd_000'],
      ['d_001', 'd_001'],
      ['d_002', 'd_002'],
      ['d_003', 'd_003'],
      ['d_004', 'd_004'],
      ['d_005', 'd_005'],
      ['d_006', 'd_006'],
      ['d_007', 'd_007'],
    ]
    const where = {}
    this.durationGenerator(params, where, 'borrow_date', 'start_date', 'end_date')
    return this.nativeQuery({
      attributes,
      where
    })
  }
}

function Query() {
  let queryScale = (params) => {
    return new PlantformQuery('t_edi_order_total_report').query(params)
  }
  let queryCollect = (params) => {
    return new PlantformQuery('t_edi_order_raise_report').query(params)
  }
  return {
    queryScale,
    queryCollect
  }
}

module.exports = Query()
