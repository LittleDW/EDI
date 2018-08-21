import assetDayPlan from '../../../server/dao/asset/assetDayPlan';

test('test assetDayPlan assetFundAccountQuery', () => {
  expect.assertions(1);
  return assetDayPlan().assetFundAccountQuery({ fund_org_code: 'F1502001' }).then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});


