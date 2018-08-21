import loginLog from '../../../server/dao/log/loginLog';

test('test loginLog count with all params', () => {
  expect.assertions(1);
  return loginLog()
    .logCount({
      login_time_end: '2018-01-22 10:36:30',
      login_time_start: '2017-01-22 10:36:30',
      user_name: '坚果111',
      user_type: 1,
    })
    .then(result => {
      expect(result).toBeGreaterThan(0);
    });
});

test('test loginLog query', () => {
  expect.assertions(1);
  return loginLog()
    .query({
      login_time_end: '2018-01-22 10:36:30',
      login_time_start: '2017-01-22 10:36:30',
      user_name: '坚果111',
      user_type: 1,
    })
    .then(result => {
      expect(result[0].length).toBeGreaterThan(0);
    });
});

