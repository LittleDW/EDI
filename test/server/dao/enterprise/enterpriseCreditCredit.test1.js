import enterpriseCreditCredit from '../../../server/dao/enterPrise/enterpriseCreditCredit';

test('test enterpriseCreditCredit filter', () => {
  expect.assertions(1);
  return enterpriseCreditCredit().query({}).then(result => {
    expect(result).not.toBeNull();
  });
});

test('test enterpriseCreditCredit corpAuthCredit', () => {
  expect.assertions(1);
  return enterpriseCreditCredit().corpAuthCredit({}).then(result => {
    expect(result).not.toBeNull();
  });
});
