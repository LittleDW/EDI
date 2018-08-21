import fundWeekPlan from '../../../server/dao/fund/fundWeekPlan';

test('test fundWeekPlan colHisList', () => {
  expect.assertions(1);
  return fundWeekPlan()
    .colHisList({
      fund_org_code: 'F1502001',
    })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});

test('test fundWeekPlan colInsertData', () => {
  expect.assertions(1);
  return fundWeekPlan().colInsertData({fund_org_code: 'F1502001'}).then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});
