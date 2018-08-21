import orderContract from '../../../server/dao/order/OrderContract';

test('test orderContract query', () => {
  expect.assertions(1);
  return orderContract()
    .query({
      order_no: '1111201709281715409913ea4ea42d11e79e40768c00000063',
    })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});
