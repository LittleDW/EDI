import userAttribute from '../../../server/dao/user/userAttribute';

test('test userAttribute relatedOrgs', () => {
  expect.assertions(1);
  return userAttribute.count().then(result => {
    expect(result).toBeGreaterThan(0);
  });
});
