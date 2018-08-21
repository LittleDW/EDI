import enterpriseAssetCredit from '../../../server/dao/enterPrise/enterpriseAssetCredit';

test('test enterpriseFundCredit corpFundAuth', () => {
  expect.assertions(1);
  return enterpriseAssetCredit()
    .corpAssetAuth({
      borrow_name: '融数金服',
      asset_org_code: 'A1501001',
    })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});

test('test enterpriseAssetCredit corpFundAuthCount', () => {
  expect.assertions(1);
  return enterpriseAssetCredit().corpAssetAuthCount().then(result => {
    expect(result).toBeGreaterThan(0);
  });
});

test('test enterpriseAssetCredit corpAuthAssetExport', () => {
  expect.assertions(1);
  return enterpriseAssetCredit()
    .corpAuthAssetExport({ borrow_name: '融数金服大连' })
    .then(result => {
      expect(result.length).toBeGreaterThan(0);
    });
});

