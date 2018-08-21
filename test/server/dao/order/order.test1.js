import order from '../../../server/dao/order/order';

test('test order orders', () => {
  expect.assertions(1);
  return order().orders({
    borrow_date_start: '2018-01-22 10:36:30',
    borrow_date_end: '2017-01-22 10:36:30',
    fund_org_code:'F1502001',
    deadline_from:25,
    deadline_to: 30,
  }).then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

test('test order count', () => {
  expect.assertions(1);
  return order().count().then(result => {
    expect(result).not.toBeNull();
  });
});

test('test order assetExport', () => {
  expect.assertions(1);
  return order()
    .assetExport({
      borrow_date_start: '2018-01-22 10:36:30',
      borrow_date_end: '2017-01-22 10:36:30',
    })
    .then(result => {
      expect(result).not.toBeNull();
    });
});

test('test order fundExport', () => {
  expect.assertions(1);
  return order()
    .fundExport({
      borrow_date_start: '2018-01-22 10:36:30',
      borrow_date_end: '2017-01-22 10:36:30',
    })
    .then(result => {
      expect(result).not.toBeNull();
    });
});

test('test order adminExport', () => {
  expect.assertions(1);
  return order()
    .adminExport({
      borrow_date_start: '2018-01-22 10:36:30',
      borrow_date_end: '2017-01-22 10:36:30',
    })
    .then(result => {
      expect(result).not.toBeNull();
    });
});
