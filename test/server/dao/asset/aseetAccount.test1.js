import assetAccount from '../../../server/dao/asset/assetAccount';

test('test assetAccount base query called repayment', () => {
  expect.assertions(1);
  return assetAccount().query({ fund_org_code: 'F1502001' }).then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

test('test assetAccount assetFundAccountQuery', () => {
  expect.assertions(1);
  return assetAccount().assetFundAccountQuery({ fund_org_code: 'F1502001' }).then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

test('test assetAccount check', () => {
  expect.assertions(1);
  const where= {
    fund_org_code: null,
  }
  return assetAccount().check(where).then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

