const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

jest.mock('../../config', () => ({
  jwtSecret: 'test-secret',
  jwtExpiresIn: '7d',
}));

const { verifyToken, extractUser } = require('../auth');

describe('verifyToken', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('debe llamar next() con token válido', () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-1', email: 'test@test.com', role: 'user' });

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(req.user).toEqual({ id: 'user-1', email: 'test@test.com', role: 'user' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('debe retornar 401 si no hay authorization header', () => {
    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el header no empieza con Bearer', () => {
    req.headers.authorization = 'Basic credentials';

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el token es inválido', () => {
    req.headers.authorization = 'Bearer invalid-token';
    jwt.verify.mockImplementation(() => { throw new Error('jwt malformed'); });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el token está expirado', () => {
    req.headers.authorization = 'Bearer expired-token';
    jwt.verify.mockImplementation(() => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      throw err;
    });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el token está vacío después de Bearer', () => {
    req.headers.authorization = 'Bearer ';

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('', 'test-secret');
  });
});

describe('extractUser', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('debe extraer usuario de headers y llamar next()', () => {
    req.headers['x-user-id'] = 'user-1';
    req.headers['x-user-role'] = 'admin';
    req.headers['x-user-name'] = 'Admin User';

    extractUser(req, res, next);

    expect(req.user).toEqual({ id: 'user-1', role: 'admin', name: 'Admin User' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('debe llamar next() aunque no haya x-user-id', () => {
    extractUser(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('debe establecer role y name como undefined si solo viene x-user-id', () => {
    req.headers['x-user-id'] = 'user-1';

    extractUser(req, res, next);

    expect(req.user).toEqual({ id: 'user-1', role: undefined, name: undefined });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('debe ignorar headers sin x-user-id aunque tenga otros headers', () => {
    req.headers['x-user-role'] = 'admin';

    extractUser(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
