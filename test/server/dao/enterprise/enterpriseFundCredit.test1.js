import enterpriseFundCredit from '../../../server/dao/enterPrise/enterpriseFundCredit';

test('test enterpriseFundCredit corpFundAuth', () => {
  expect.assertions(1);
  return enterpriseFundCredit()
    .corpFundAuth({
      borrow_name: '融数金服',
      asset_org_code: 'A1501001',
    })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});

test('test enterpriseFundCredit corpFundAuthCount', () => {
  expect.assertions(1);
  return enterpriseFundCredit().corpFundAuthCount().then(result => {
    expect(result).toBeGreaterThan(0);
  });
});

test('test enterpriseFundCredit corpAuthDetail', () => {
  expect.assertions(1);
  return enterpriseFundCredit()
    .corpAuthDetail({ fundOrgCode: 'F1502001' })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});

test('test enterpriseFundCredit corpAuthDetailCount', () => {
  expect.assertions(1);
  return enterpriseFundCredit().corpAuthDetailCount().then(result => {
    expect(result).toBeGreaterThan(0);
  });
});

// test('test enterpriseOrder corpOrdersCount', () => {
//   expect.assertions(1);
//   return enterpriseOrder.corpOrdersCount().then(result => {
//     expect(result.length).toBeGreaterThan(0);
//   });
// });
