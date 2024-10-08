import { describe, expect, it } from 'vitest';
import { checkIfAdmin, defineAdmin, login } from '../../../../stock-auth-server/src/controllers/admin.controller';

describe('checkIfAdmin', () => {
  it('should return success if the password is correct', async() => {
    const response = await checkIfAdmin('admin', 'cryptedPasswd', 'admin', 'cryptedPasswd');

    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
  });

  it('should return failure if the password is incorrect', async() => {
    const response = await checkIfAdmin('admin', 'wrongpassword', 'admin', 'admin');

    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(false);
  });

  it('should return failure if the emailPhone does not match the processadminID', async() => {
    const response = await checkIfAdmin('notadmin', 'password', 'admin', 'admin');

    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(false);
  });

  it('should return admin prop succsessfully', () => {
    const admin = defineAdmin();

    expect(admin).toHaveProperty('name');
    expect(admin).toHaveProperty('admin');
    expect(admin).toHaveProperty('permissions');
    expect(typeof admin.permissions).toBe('object');
    expect(admin.permissions).toHaveProperty('orders');
    expect(admin.permissions).toHaveProperty('payments');
    expect(admin.permissions).toHaveProperty('users');
    expect(admin.permissions).toHaveProperty('items');
    expect(admin.permissions).toHaveProperty('faqs');
    expect(admin.permissions).toHaveProperty('videos');
    expect(admin.permissions).toHaveProperty('printables');
    expect(admin.permissions).toHaveProperty('buyer');

    Object.keys(admin.permissions).map(key => {
      expect(typeof admin.permissions[key]).toBe('object');
    });
  });

  it('should return success if the emailPhone matches the processadminID', async() => {
    const response = await checkIfAdmin('admin', 'cryptedPasswd', 'admin', 'cryptedPasswd');

    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
  });

  it('should return failure if the emailPhone does not match the processadminID', async() => {
    const response = await checkIfAdmin('notadmin', 'password', 'admin', 'adminPass');

    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(false);
  });

  it('should return failure if the emailPhone matches the processadminID but login fails', async() => {
    const response = await checkIfAdmin('admin', 'wrongpassword', 'admin', 'adminPass');

    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(false);
  });
});


describe('login', () => {
  it('should login fail', async() => {
    const password = 'paddwd';
    const adminServerPasswd = 'adminPass';
    const loginVal = await login(
      password,
      adminServerPasswd
    );

    expect(typeof loginVal).toBe('object');
    expect(loginVal).toHaveProperty('success');
    expect(typeof loginVal.success).toBe('boolean');
    expect(loginVal.success).toBe(false);
  });

  it('should login in admin successfully', async() => {
    const adminServerPasswd = 'paddwd';
    const password = 'paddwd';
    const loginVal = await login(
      password,
      adminServerPasswd
    );

    expect(typeof loginVal).toBe('object');
    expect(loginVal).toHaveProperty('success');
    expect(typeof loginVal.success).toBe('boolean');
    expect(loginVal.success).toBe(true);
  });

  it('should fail to login if the password is incorrect', async() => {
    const password = 'wrongpassword';
    const adminServerPasswd = 'adminPass';
    const loginVal = await login(
      password,
      adminServerPasswd
    );

    expect(typeof loginVal).toBe('object');
    expect(loginVal).toHaveProperty('success');
    expect(typeof loginVal.success).toBe('boolean');
    expect(loginVal.success).toBe(false);
  });

  it('should successfully login if the password is correct', async() => {
    const password = 'cryptedPasswd';
    const adminServerPasswd = 'cryptedPasswd';
    const loginVal = await login(
      password,
      adminServerPasswd
    );

    expect(typeof loginVal).toBe('object');
    expect(loginVal).toHaveProperty('success');
    expect(typeof loginVal.success).toBe('boolean');
    expect(loginVal.success).toBe(true);
  });
});

describe('login extended', () => {
  it('should checkIfAdmin and fail', async() => {
    const emailPhone = 'gwegerh@qgewg.com';
    const password = 'paddwed';
    const processadminID = 'egegreh';
    const adminServerPasswd = 'adminPass';
    const checkVal = await checkIfAdmin(
      emailPhone,
      password,
      processadminID,
      'cryptedPasswd'
    );

    expect(typeof checkVal).toBe('object');
    expect(checkVal).toHaveProperty('success');
    expect(typeof checkVal.success).toBe('boolean');
    expect(checkVal.success).toBe(false);
  });

  it('should checkIfAdmin be successful', async() => {
    const emailPhone = 'gwegerh@qgewg.com';
    const password = 'paddwed';
    const processadminID = 'gwegerh@qgewg.com';
    const adminServerPasswd = 'paddwed';
    const checkVal = await checkIfAdmin(
      emailPhone,
      password,
      processadminID,
      adminServerPasswd
    );

    expect(typeof checkVal).toBe('object');
    expect(checkVal).toHaveProperty('success');
    expect(typeof checkVal.success).toBe('boolean');
    expect(checkVal.success).toBe(true);
  });
});

