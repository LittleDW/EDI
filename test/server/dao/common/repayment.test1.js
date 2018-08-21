import repayment from '../../../server/dao/common/repayment';

test('test repayment base query called repayment', () => {
  expect.assertions(1);
  return repayment().repayment({ fund_org_code: 'F1502001' }).then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

test('test repayment count', () => {
  expect.assertions(1);
  return repayment().count({ fund_org_code: 'F1502001' }).then(result => {
    expect(result).toBeGreaterThan(0);
  });
});

test('test repayment export', () => {
  expect.assertions(1);
  return repayment().export().then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

// test('test repayment update', () => {
//   expect.assertions(1);
//   return repayment().update().then(result => {
//     expect(result.length).toBeGreaterThan(0);
//   });
// });

test('test repayment query', () => {
  expect.assertions(1);
  return repayment().query().then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});
