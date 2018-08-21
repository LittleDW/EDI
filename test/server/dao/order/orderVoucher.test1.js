import orderVoucher from '../../../server/dao/order/orderVoucher';

test('test orderVoucher query', () => {
  expect.assertions(1);
  return orderVoucher()
    .query({
      order_no: '11112017103011145781de0e84bd2011e78d1702ea03000faa',
    })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});

test('test orderVoucher count', () => {
  expect.assertions(1);
  return orderVoucher()
    .filter({
      order_no: '111120170922155753bd01d5f49f6b11e7a4fa768d00000042',
    })
    .then(result => {
      expect(result.length).toEqual(0);
    });
});

test('test orderVoucher corpFilter', () => {
  expect.assertions(1);
  return orderVoucher().corpFilter().then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});
