import assetFund from '../../../server/dao/common/assetFund';

test('test assetFund relatedOrgs', () => {
  expect.assertions(2);
  return assetFund().relatedOrgs({ org_code: 'A1501001' }).then(result => {
    expect(result.length).toBe(2);
    expect(result[1].length).toBeGreaterThan(0);
  });
});

test('test assetFund reqGetData', () => {
  expect.assertions(2);
  return assetFund().reqGetData({ asset_org_code: 'A1505009' }).then(result => {
    expect(result.length).toBe(2);
    expect(result[1].length).toBeGreaterThan(0);
  });
});

test('test assetFund colGetData', () => {
  expect.assertions(2);
  return assetFund().colGetData({year:'2017', fund_org_code: 'F1502001' }).then(result => {
    expect(result.length).toBe(2);
    expect(result[1].length).toBeGreaterThan(0);
  });
});
