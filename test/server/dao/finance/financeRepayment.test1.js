import financeRepayment from '../../../server/dao/finance/FinanceRepayment';

test('test financeRepayment pagingSearch', () => {
  expect.assertions(1);
  return financeRepayment().pagingSearch()
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});


