const sequelize = require('sequelize');
const Model = require('../super');
const {Op} = sequelize
const _ = require('lodash');

// "getAllWeekAndDate": "select `year`,`week`,start_date,end_date  from t_week where `year` >= DATE_FORMAT(DATE_ADD(now(),INTERVAL -1 year),'%Y')and `year` <= DATE_FORMAT(DATE_ADD(now(),INTERVAL 2 year),'%Y') order by `year`,`week`",
class _Date extends Model {
  queryLastWeek() {
    return this.queryWeek('last')
  }
  queryThisWeek() {
    return this.queryWeek('this')
  }
  queryNextWeek() {
    return this.queryWeek('next')
  }
  queryWeek(whichWeek="last") {
    const attributes = ['year', 'week'];
    let number = 0
    switch (whichWeek) {
      case 'last':
        number = -7;
        break;
      case 'next':
        number = 7;
        break;
      default:
        number = 0
    }
    const where = {
      date: {
        [Op.eq]: sequelize.literal(`date_format( date_add( NOW( ), INTERVAL ${number} DAY ), '%Y-%m-%d' )`)
      }
    }
    return this.nativeQuery({
      raw: true,
      attributes,
      where,
    });
  }
  queryDateRange(params={}) {
    const attributes = [
      [sequelize.fn('MIN', sequelize.col('date')), 'start_date'],
      [sequelize.fn('MAX', sequelize.col('date')), 'end_date'],
    ]
    return this.nativeQuery({
      attributes,
      where: params,
      raw: true
    })
  }
}

class _Week extends Model {
  query() {
    const attributes = [
      'year',
      'week',
      'start_date',
      'end_date',
    ]
    const where = {
      year: {
        [Op.between]: [sequelize.literal(`DATE_FORMAT(DATE_ADD(now(),INTERVAL -1 year),'%Y')`), sequelize.literal(`DATE_FORMAT(DATE_ADD(now(),INTERVAL 2 year),'%Y')`)]
      }
    }
    return this.nativeQuery({
      attributes,
      where,
      order: ['year', 'week'],
      raw: true
    })
  }
}

//const deadline = new Week('t_deadline');
module.exports = {
  date: (info, accessList = []) => new _Date('t_date', info, accessList),
  week: (info, accessList = []) => new _Week('t_week', info, accessList),
}
