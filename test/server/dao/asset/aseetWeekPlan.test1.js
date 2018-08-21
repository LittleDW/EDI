import assetWeekPlan from '../../../server/dao/asset/assetWeekPlan';

test('test assetWeekPlan reqHisList', () => {
  expect.assertions(1);
  return assetWeekPlan().reqHisList({ asset_org_code: 'A1501001' }).then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});

test('test assetWeekPlan reqHisCount', () => {
  expect.assertions(1);
  return assetWeekPlan().reqHisCount({end_date:new Date().toLocaleDateString(), asset_org_code: 'A1501001' }).then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});
