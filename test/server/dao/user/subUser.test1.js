import subUser from '../../../server/dao/user/subUser';

test('test subUser login', () => {
  expect.assertions(1);
  return subUser
    .login(
      '5d82e87e-9120-11e7-8f36-00163e2e8257',
      '99999',
      'D3EB9A9233E52948740D7EB8C3062D14'
    )
    .then(result => {
      expect(result).not.toBeNull();
    });
});
