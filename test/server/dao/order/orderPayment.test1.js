import OrderPayment from '../../../server/dao/order/OrderPayment';

test('test orderContract query', () => {
  expect.assertions(1);
  return OrderPayment()
    .query({
      order_no: '11112017092811013556c3e024a3f911e7affc6fbe000001ae',
    })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});
