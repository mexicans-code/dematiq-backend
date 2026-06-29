const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockSupabaseFrom = jest.fn();
jest.mock('../../../../../common/src/supabase', () => ({
  from: (...args) => mockSupabaseFrom(...args),
}));

jest.mock('../../config', () => ({
  jwtSecret: 'test-secret',
  jwtExpiresIn: '7d',
}));

const { register, login, getMe, changePassword } = require('../authController');

function createMockQuery(resolveValue = { data: null, error: null }) {
  const query = {
    data: resolveValue.data,
    error: resolveValue.error,
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(resolveValue),
    single: jest.fn().mockResolvedValue(resolveValue),
  };
  return query;
}

describe('register', () => {
  let req, res, next;
  const validBody = { name: 'Test User', email: 'test@test.com', password: 'password123' };

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('debe registrar un usuario y retornar token (happy path)', async () => {
    req.body = { ...validBody };

    const profile = { id: 'user-1', name: 'Test User', email: 'test@test.com', role: 'user' };
    const existingQuery = createMockQuery({ data: null, error: null });
    const insertQuery = createMockQuery({ data: profile, error: null });

    mockSupabaseFrom
      .mockReturnValueOnce(existingQuery)
      .mockReturnValueOnce(insertQuery);

    bcrypt.hash.mockResolvedValue('hashed-password');
    jwt.sign.mockReturnValue('jwt-token');

    await register(req, res, next);

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user-1', email: 'test@test.com', name: 'Test User', role: 'user' },
      'test-secret',
      { expiresIn: '7d' }
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Usuario registrado',
      data: { token: 'jwt-token', user: profile },
    });
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const testCases = [
      { name: '', email: 'test@test.com', password: 'pass123' },
      { name: 'Test', email: '', password: 'pass123' },
      { name: 'Test', email: 'test@test.com', password: '' },
      {},
    ];

    for (const body of testCases) {
      req.body = body;
      res.status.mockClear();
      res.json.mockClear();

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nombre, email y password son requeridos' });
    }
  });

  it('debe retornar 400 si el email ya está registrado', async () => {
    req.body = { ...validBody };

    const existingQuery = createMockQuery({ data: { id: 'existing-user' }, error: null });
    mockSupabaseFrom.mockReturnValueOnce(existingQuery);

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El email ya está registrado' });
  });

  it('debe llamar next(err) si supabase.insert falla', async () => {
    req.body = { ...validBody };
    const dbError = new Error('DB error');

    const existingQuery = createMockQuery({ data: null, error: null });
    const insertQuery = createMockQuery({ data: null, error: dbError });

    mockSupabaseFrom
      .mockReturnValueOnce(existingQuery)
      .mockReturnValueOnce(insertQuery);

    bcrypt.hash.mockResolvedValue('hashed-password');

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });

  it('debe llamar next(err) si bcrypt.hash lanza error', async () => {
    req.body = { ...validBody };
    const hashError = new Error('hash failed');

    const existingQuery = createMockQuery({ data: null, error: null });
    mockSupabaseFrom.mockReturnValueOnce(existingQuery);
    bcrypt.hash.mockRejectedValue(hashError);

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(hashError);
  });
});

describe('login', () => {
  let req, res, next;
  const validBody = { email: 'test@test.com', password: 'password123' };
  const profile = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@test.com',
    role: 'user',
    password_hash: 'hashed-password',
    phone: null,
    company_name: null,
    rfc: null,
  };

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('debe loguear usuario y retornar token (happy path)', async () => {
    req.body = { ...validBody };

    const profileQuery = createMockQuery({ data: profile, error: null });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('jwt-token');

    await login(req, res, next);

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const { password_hash, ...userWithoutHash } = profile;
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login exitoso',
      data: { token: 'jwt-token', user: userWithoutHash },
    });
  });

  it('debe retornar 400 si faltan email o password', async () => {
    const testCases = [{ email: '' }, { password: '' }, {}];

    for (const body of testCases) {
      req.body = body;
      res.status.mockClear();
      res.json.mockClear();

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email y password son requeridos' });
    }
  });

  it('debe retornar 401 si el usuario no existe', async () => {
    req.body = { ...validBody };

    const profileQuery = createMockQuery({ data: null, error: null });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
  });

  it('debe retornar 401 si la contraseña es incorrecta', async () => {
    req.body = { ...validBody };

    const profileQuery = createMockQuery({ data: profile, error: null });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    bcrypt.compare.mockResolvedValue(false);

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
  });

  it('debe llamar next(err) si supabase.select falla', async () => {
    req.body = { ...validBody };
    const dbError = new Error('DB error');

    const profileQuery = createMockQuery({ data: null, error: dbError });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});

describe('getMe', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('debe retornar el perfil del usuario autenticado (happy path)', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-1' });

    const profile = { id: 'user-1', name: 'Test', email: 'test@test.com', role: 'user' };
    const profileQuery = createMockQuery({ data: profile, error: null });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    await getMe(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'OK', data: profile });
  });

  it('debe retornar 401 si no hay authorization header', async () => {
    await getMe(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
  });

  it('debe retornar 401 si el header no empieza con Bearer', async () => {
    req.headers.authorization = 'Basic credentials';

    await getMe(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
  });

  it('debe retornar 401 si el token es inválido', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    jwt.verify.mockImplementation(() => { throw { name: 'JsonWebTokenError', message: 'jwt malformed' }; });

    await getMe(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
  });

  it('debe retornar 401 si el token expiró', async () => {
    req.headers.authorization = 'Bearer expired-token';
    jwt.verify.mockImplementation(() => { throw { name: 'TokenExpiredError', message: 'jwt expired' }; });

    await getMe(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
  });

  it('debe retornar 404 si el usuario no existe en BD', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'nonexistent' });

    const profileQuery = createMockQuery({ data: null, error: null });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    await getMe(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });

  it('debe llamar next(err) si el error no es de JWT', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockImplementation(() => { throw new Error('algo salió mal'); });

    await getMe(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalledWith(401);
  });

  it('debe llamar next(err) si supabase falla', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-1' });

    const dbError = new Error('DB error');
    const profileQuery = createMockQuery({ data: null, error: dbError });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    await getMe(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});

describe('changePassword', () => {
  let req, res, next;
  const validBody = { current: 'oldPass123', newPass: 'newPass456' };

  beforeEach(() => {
    req = { body: {}, user: { id: 'user-1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('debe cambiar la contraseña exitosamente', async () => {
    req.body = { ...validBody };

    const profileQuery = createMockQuery({ data: { password_hash: 'old-hash' }, error: null });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('new-hash');

    const updateQuery = createMockQuery({ data: null, error: null });
    mockSupabaseFrom.mockReturnValueOnce(updateQuery);

    await changePassword(req, res, next);

    expect(bcrypt.compare).toHaveBeenCalledWith('oldPass123', 'old-hash');
    expect(bcrypt.hash).toHaveBeenCalledWith('newPass456', 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Contraseña actualizada exitosamente',
      data: null,
    });
  });

  it('debe retornar 400 si faltan current o newPass', async () => {
    const testCases = [
      { current: '', newPass: 'newPass456' },
      { current: 'oldPass123', newPass: '' },
      {},
    ];

    for (const body of testCases) {
      req.body = body;
      res.status.mockClear();
      res.json.mockClear();

      await changePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contraseña actual y nueva son requeridas' });
    }
  });

  it('debe retornar 400 si newPass tiene menos de 6 caracteres', async () => {
    req.body = { current: 'oldPass123', newPass: '12345' };

    await changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  });

  it('debe retornar 404 si el usuario no existe en BD', async () => {
    req.body = { ...validBody };

    const profileQuery = createMockQuery({ data: null, error: null });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    await changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });

  it('debe retornar 401 si la contraseña actual es incorrecta', async () => {
    req.body = { ...validBody };

    const profileQuery = createMockQuery({ data: { password_hash: 'old-hash' }, error: null });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    bcrypt.compare.mockResolvedValue(false);

    await changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'La contraseña actual es incorrecta' });
  });

  it('debe llamar next(err) si supabase.select falla', async () => {
    req.body = { ...validBody };
    const dbError = new Error('DB error');

    const profileQuery = createMockQuery({ data: null, error: dbError });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    await changePassword(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });

  it('debe llamar next(err) si supabase.update falla', async () => {
    req.body = { ...validBody };
    const dbError = new Error('DB error');

    const profileQuery = createMockQuery({ data: { password_hash: 'old-hash' }, error: null });
    mockSupabaseFrom.mockReturnValueOnce(profileQuery);

    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('new-hash');

    const updateQuery = createMockQuery({ data: null, error: dbError });
    mockSupabaseFrom.mockReturnValueOnce(updateQuery);

    await changePassword(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});
