import orderCredit from '../../../server/dao/order/OrderCredit';

test('test orderContract query', () => {
  expect.assertions(1);
  return orderCredit()
    .query({
      order_no: '111120171208181101179b6bc6dc0011e797a4db0b020068fd',
    })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});
