const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');
jest.mock('../config', () => ({
  jwtSecret: 'test-secret',
  jwtExpiresIn: '7d',
}));

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn(),
};

jest.mock('../supabase', () => mockSupabase);

const { verifyToken } = require('../auth');

describe('verifyToken', () => {
  let req, res, next, mockSupabaseFrom, mockSupabaseSelect, mockSupabaseEq, mockSupabaseMaybeSingle;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();

    mockSupabaseFrom = mockSupabase.from.mockReturnThis();
    mockSupabaseSelect = mockSupabase.select.mockReturnThis();
    mockSupabaseEq = mockSupabase.eq.mockReturnThis();
    mockSupabaseMaybeSingle = mockSupabase.maybeSingle;
  });

  it('debe llamar next() con token válido y token_version coincidente', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-1', email: 'test@test.com', role: 'user', token_version: 0 });
    mockSupabaseMaybeSingle.mockResolvedValue({ data: { token_version: 0, status: 'active' }, error: null });

    await verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(req.user).toEqual({ id: 'user-1', email: 'test@test.com', role: 'user', token_version: 0 });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('debe retornar 401 si no hay authorization header', async () => {
    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el header no empieza con Bearer', async () => {
    req.headers.authorization = 'Basic credentials';

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el token es inválido', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    jwt.verify.mockImplementation(() => { throw new Error('jwt malformed'); });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el token está expirado', async () => {
    req.headers.authorization = 'Bearer expired-token';
    jwt.verify.mockImplementation(() => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      throw err;
    });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el token es inválido (JsonWebTokenError)', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    jwt.verify.mockImplementation(() => {
      const err = new Error('jwt malformed');
      err.name = 'JsonWebTokenError';
      throw err;
    });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si usuario no existe en BD', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-1', email: 'test@test.com', role: 'user', token_version: 0 });
    mockSupabaseMaybeSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 403 si usuario está inactivo', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-1', email: 'test@test.com', role: 'user', token_version: 0 });
    mockSupabaseMaybeSingle.mockResolvedValue({ data: { token_version: 0, status: 'inactive' }, error: null });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cuenta deshabilitada' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si token_version no coincide', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-1', email: 'test@test.com', role: 'user', token_version: 0 });
    mockSupabaseMaybeSingle.mockResolvedValue({ data: { token_version: 1, status: 'active' }, error: null });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado. Inicia sesión nuevamente.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si error en BD', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-1', email: 'test@test.com', role: 'user', token_version: 0 });
    mockSupabaseMaybeSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si token_version undefined en token pero 0 en BD', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-1', email: 'test@test.com', role: 'user' });
    mockSupabaseMaybeSingle.mockResolvedValue({ data: { token_version: 0, status: 'active' }, error: null });

    await verifyToken(req, res, next);

    expect(req.user).toEqual({ id: 'user-1', email: 'test@test.com', role: 'user', token_version: 0 });
    expect(next).toHaveBeenCalledTimes(1);
  });
});