import operLog from '../../../server/dao/log/OperLog';

test('test operLog query', () => {
  expect.assertions(1);
  return operLog()
    .query()
    .then(result => {
      expect(result).toBeGreaterThan(0);
    });
});

test('test operLog search', () => {
  expect.assertions(1);
  return operLog()
    .search({
      from_table: 't_fund_product',
      from_table_key: '141567e2-9392-11e7-9f2b-00163e2e8257',
    })
    .then(result => {
      expect(result[0].length).toBeGreaterThan(0);
    });
});
