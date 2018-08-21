import orderAdvance from '../../../server/dao/order/OrderAccount';

test('test orderAdvance query', () => {
  expect.assertions(1);
  return orderAdvance()
    .query({
      order_no: '111120170922094217446430ee9f3711e793e102e90f001b4d',
    })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});
