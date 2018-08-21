import enterpriseOrder from '../../../server/dao/enterPrise/enterpriseOrder';

test('test enterpriseOrder corpOrdersCount', () => {
  expect.assertions(1);
  return enterpriseOrder().corpOrdersCount().then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

test('test enterpriseOrder corpOrdersFundExport', () => {
  expect.assertions(1);
  return enterpriseOrder().corpOrdersFundExport().then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

test('test enterpriseOrder corpOrdersAdminExport', () => {
  expect.assertions(1);
  return enterpriseOrder()
    .corpOrdersAdminExport({ borrow_name: '融数金服大连' })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});

test('test enterpriseOrder corpOrdersForPublicity', () => {
  expect.assertions(1);
  return enterpriseOrder().corpOrdersForPublicity().then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

test('test enterpriseOrder corpOrdersCount', () => {
  expect.assertions(1);
  return enterpriseOrder().corpOrdersCount().then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});
