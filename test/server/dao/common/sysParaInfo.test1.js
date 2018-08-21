import sysParaInfo from '../../../server/dao/common/sysParaInfo';

test('test sysParaInfo query', () => {
  expect.assertions(1);
  return sysParaInfo().query().then(result => {
    expect(result.length).toBeGreaterThan(0);
  });
});
