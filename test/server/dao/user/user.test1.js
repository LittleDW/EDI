import user from '../../../server/dao/user/User';

test('test user login', () => {
  expect.assertions(1);
  return user()
    .login({
      username: '测试李楠',
      password: '41B3DCEFE7FBAD7899865588E77CBFCA',
    })
    .then(result => {
      expect(result).not.toBeNull();
    });
});

test('test user freePatternCount', () => {
  expect.assertions(1);
  return user().freePatternCount({ org_code: 'F1502002' }).then(result => {
    expect(result).toBeGreaterThan(0);
  });
});

test('test user freePatternCount empty', () => {
  expect.assertions(1);
  return user().freePatternCount({ org_code: 'A1505021' }).then(result => {
    expect(result).toBe(0);
  });
});

test('test user freePatternQuery empty', () => {
  expect.assertions(1);
  return user().freePatternQuery({ org_code: 'A1505021' }).then(result => {
    expect(result.length).toBe(0);
  });
});

test('test user freePatternQuery', () => {
  expect.assertions(1);
  return user().freePatternQuery({ org_code: 'F1502002' }).then(result => {
    expect(result.length).toBe(1);
  });
});

test('test user query', () => {
  expect.assertions(1);
  return user().query().then(result => {
    expect(result).not.toBeNull();
  });
});

test('test user manageCount ', () => {
  expect.assertions(1);
  return user().manageCount().then(result => {
    expect(result).toBeGreaterThan(0);
  });
});

test('test user managePreCount ', () => {
  expect.assertions(1);
  return user()
    .managePreCount({
      org_code: 'A1501001',
      // user_account: 'lnlaurence2'
    })
    .then(result => {
      expect(result).toBeGreaterThan(0);
    });
});
