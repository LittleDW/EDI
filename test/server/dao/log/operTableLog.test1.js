import operTableLog from '../../../server/dao/log/operTableLog';

test('test operTableLog count', () => {
  expect.assertions(1);
  return operTableLog().count({
    oper_time_start: '2018-01-22 10:36:30',
    oper_time_end: '2017-01-22 10:36:30',
    user_name: '坚果111',
    from_table: 't_order_voucher',
    }).then(result => {
    expect(result).toBeGreaterThan(0);
  });
});

test('test operTableLog query', () => {
  expect.assertions(1);
  return operTableLog().query({
    oper_time_end: '2018-01-22 10:36:30',
    oper_time_start: '2017-01-22 10:36:30',
    user_name: '坚果111',
    from_table: 't_order_voucher',
    }).then(result => {
    expect(result[0].length).toBeGreaterThan(0);
  });
});
