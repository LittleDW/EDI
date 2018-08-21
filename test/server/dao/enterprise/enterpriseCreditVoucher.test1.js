import enterpriseCreditVoucher from '../../../server/dao/enterPrise/enterpriseCreditVoucher';

test('test enterpriseCreditVoucher corpOrdersCount', () => {
  expect.assertions(1);
  return enterpriseCreditVoucher().corpAuthVoucher().then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

test('test enterpriseCreditVoucher filterCorpAuthAssetVoucher', () => {
  expect.assertions(1);
  return enterpriseCreditVoucher().filterCorpAuthAssetVoucher().then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

test('test enterpriseCreditVoucher filterCorpAuthFundVoucher', () => {
  expect.assertions(1);
  return enterpriseCreditVoucher().filterCorpAuthFundVoucher().then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});


