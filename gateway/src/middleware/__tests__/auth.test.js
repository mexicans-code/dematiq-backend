const mockVerifyToken = jest.fn();

jest.mock('../../../../common/src/middleware/auth', () => ({
  verifyToken: mockVerifyToken,
}));

const { adminForWrites, requireAdmin } = require('../auth');

describe('adminForWrites', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {}, method: 'GET', user: null };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    mockVerifyToken.mockReset();
  });

  it('debe saltar verificación en GET y llamar next()', () => {
    req.method = 'GET';

    adminForWrites(req, res, next);

    expect(mockVerifyToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('debe saltar verificación en métodos de lectura (GET, HEAD, OPTIONS)', () => {
    const readMethods = ['GET', 'HEAD', 'OPTIONS'];
    for (const method of readMethods) {
      req.method = method;
      next.mockClear();

      adminForWrites(req, res, next);

      expect(mockVerifyToken).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    }
  });

  it('debe verificar token y llamar next() si el rol es admin en POST', () => {
    req.method = 'POST';
    mockVerifyToken.mockImplementation((_req, _res, cb) => {
      _req.user = { role: 'admin' };
      cb();
    });

    adminForWrites(req, res, next);

    expect(mockVerifyToken).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('debe verificar token en PUT y denegar si no es admin', () => {
    req.method = 'PUT';
    mockVerifyToken.mockImplementation((_req, _res, cb) => {
      _req.user = { role: 'user' };
      cb();
    });

    adminForWrites(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere rol de administrador' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe verificar token en PATCH y denegar si no es admin', () => {
    req.method = 'PATCH';
    mockVerifyToken.mockImplementation((_req, _res, cb) => {
      _req.user = { role: 'user' };
      cb();
    });

    adminForWrites(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere rol de administrador' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe verificar token en DELETE y denegar si no es admin', () => {
    req.method = 'DELETE';
    mockVerifyToken.mockImplementation((_req, _res, cb) => {
      _req.user = { role: 'user' };
      cb();
    });

    adminForWrites(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere rol de administrador' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el token es inválido (no llama cb)', () => {
    req.method = 'POST';
    mockVerifyToken.mockImplementation((_req, _res) => {
      _res.status(401).json({ error: 'Token inválido o expirado' });
    });

    adminForWrites(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireAdmin', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {}, user: null };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    mockVerifyToken.mockReset();
  });

  it('debe llamar next() si el usuario es admin', () => {
    mockVerifyToken.mockImplementation((_req, _res, cb) => {
      _req.user = { role: 'admin' };
      cb();
    });

    requireAdmin(req, res, next);

    expect(mockVerifyToken).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('debe retornar 403 si el usuario no es admin', () => {
    mockVerifyToken.mockImplementation((_req, _res, cb) => {
      _req.user = { role: 'user' };
      cb();
    });

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere rol de administrador' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el token es inválido', () => {
    mockVerifyToken.mockImplementation((_req, _res) => {
      _res.status(401).json({ error: 'Token inválido o expirado' });
    });

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 403 si req.user no tiene role', () => {
    mockVerifyToken.mockImplementation((_req, _res, cb) => {
      _req.user = { id: 'user-1' };
      cb();
    });

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere rol de administrador' });
    expect(next).not.toHaveBeenCalled();
  });
});
