import OrderRepayment from '../../../server/dao/order/OrderRepayment';

test('test orderContract query', () => {
  expect.assertions(1);
  return OrderRepayment()
    .query({
      order_no: '1111201709220942124185c7de9f3711e7a217768c0e006e23',
    })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});
