const { getAll, getById, create, updateStatus } = require('../orderController');

function mockCreateQuery(resolveValue = { data: null, error: null }) {
  const self = {};
  self.data = resolveValue.data;
  self.error = resolveValue.error;
  self.select = jest.fn(() => self);
  self.insert = jest.fn(() => self);
  self.update = jest.fn(() => self);
  self.eq = jest.fn(() => self);
  self.in = jest.fn(() => self);
  self.maybeSingle = jest.fn().mockResolvedValue(resolveValue);
  self.single = jest.fn().mockResolvedValue(resolveValue);
  return self;
}

const mockQueries = [];
jest.mock('../../../../../common/src/supabase', () => ({
  from: jest.fn(() => {
    const q = mockQueries.shift();
    return q || mockCreateQuery();
  }),
}));

describe('getAll', () => {
  let req, res, next;

  beforeEach(() => {
    mockQueries.length = 0;
    req = { query: {}, user: { id: 'user-1', role: 'user' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('debe retornar todas las órdenes para admin sin filtros', async () => {
    req.user.role = 'admin';
    const orders = [
      { id: 1, user_id: 'u1', order_items: [], shipping_address_id: null, status: 'pending' },
      { id: 2, user_id: 'u2', order_items: [], shipping_address_id: null, status: 'processing' },
    ];

    mockQueries.push(mockCreateQuery({ data: orders, error: null }));
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await getAll(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'OK',
      data: [
        expect.objectContaining({ id: 1, status: 'pending' }),
        expect.objectContaining({ id: 2, status: 'processing' }),
      ],
    });
  });

  it('debe filtrar por user_id si no es admin', async () => {
    const q = mockCreateQuery({ data: [{ id: 1, user_id: 'user-1', order_items: [], shipping_address_id: null, status: 'pending' }], error: null });
    mockQueries.push(q);
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await getAll(req, res, next);

    expect(q.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('debe filtrar por user_id si admin provee el query param', async () => {
    req.user.role = 'admin';
    req.query.user_id = 'specific-user';
    const q = mockCreateQuery({ data: [], error: null });
    mockQueries.push(q);
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await getAll(req, res, next);

    expect(q.eq).toHaveBeenCalledWith('user_id', 'specific-user');
  });

  it('debe filtrar por status si se provee el query param', async () => {
    req.query.status = 'pending';
    const q = mockCreateQuery({ data: [], error: null });
    mockQueries.push(q);
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await getAll(req, res, next);

    expect(q.eq).toHaveBeenCalledWith('status', 'pending');
  });

  it('debe usar "none" como user_id si req.user es undefined', async () => {
    req.user = undefined;
    const q = mockCreateQuery({ data: [], error: null });
    mockQueries.push(q);
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await getAll(req, res, next);

    expect(q.eq).toHaveBeenCalledWith('user_id', 'none');
  });

  it('debe retornar array vacío si no hay órdenes', async () => {
    mockQueries.push(mockCreateQuery({ data: [], error: null }));
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await getAll(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'OK', data: [] });
  });

  it('debe enriquecer órdenes con nombres de productos', async () => {
    req.user.role = 'admin';
    const orders = [{
      id: 1, user_id: 'u1',
      order_items: [{ product_id: 'p1', quantity: 2, unit_price: 100 }],
      shipping_address_id: null,
      status: 'pending',
    }];

    mockQueries.push(mockCreateQuery({ data: orders, error: null }));
    mockQueries.push(mockCreateQuery({ data: [{ id: 'p1', name: 'Producto 1' }], error: null }));

    await getAll(req, res, next);

    const returnedData = res.json.mock.calls[0][0].data;
    expect(returnedData[0].order_items[0].product_name).toBe('Producto 1');
  });

  it('debe usar "Producto" genérico si el producto no se encuentra', async () => {
    req.user.role = 'admin';
    const orders = [{
      id: 1, user_id: 'u1',
      order_items: [{ product_id: 'unknown', quantity: 1, unit_price: 50 }],
      shipping_address_id: null,
      status: 'pending',
    }];

    mockQueries.push(mockCreateQuery({ data: orders, error: null }));
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await getAll(req, res, next);

    const returnedData = res.json.mock.calls[0][0].data;
    expect(returnedData[0].order_items[0].product_name).toBe('Producto');
  });

  it('debe llamar next(err) si la consulta falla', async () => {
    const dbError = new Error('DB error');
    mockQueries.push(mockCreateQuery({ data: null, error: dbError }));

    await getAll(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});

describe('getById', () => {
  let req, res, next;

  beforeEach(() => {
    mockQueries.length = 0;
    req = { params: { id: 'order-1' }, user: { id: 'user-1', role: 'user' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('debe retornar la orden para admin', async () => {
    req.user.role = 'admin';
    const order = { id: 'order-1', user_id: 'other-user', order_items: [], shipping_address_id: null, status: 'pending' };

    mockQueries.push(mockCreateQuery({ data: order, error: null }));
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await getById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('debe retornar la orden si el usuario es el propietario', async () => {
    const order = { id: 'order-1', user_id: 'user-1', order_items: [], shipping_address_id: null, status: 'pending' };

    mockQueries.push(mockCreateQuery({ data: order, error: null }));
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await getById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('debe retornar 404 si la orden no existe', async () => {
    mockQueries.push(mockCreateQuery({ data: null, error: null }));

    await getById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Orden no encontrada' });
  });

  it('debe retornar 403 si el usuario no es admin ni propietario', async () => {
    const order = { id: 'order-1', user_id: 'other-user', order_items: [], shipping_address_id: null };

    mockQueries.push(mockCreateQuery({ data: order, error: null }));

    await getById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Acceso denegado' });
  });

  it('debe llamar next(err) si supabase falla', async () => {
    const dbError = new Error('DB error');
    mockQueries.push(mockCreateQuery({ data: null, error: dbError }));

    await getById(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});

describe('create', () => {
  let req, res, next;
  const baseBody = {
    user_id: 'user-1',
    items: [{ product_id: 'p1', quantity: 2 }],
  };

  beforeEach(() => {
    mockQueries.length = 0;
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('debe crear una orden exitosamente (happy path)', async () => {
    req.body = { ...baseBody };
    const fullOrder = {
      id: 'order-1', user_id: 'user-1', total: 232, status: 'pending',
      notes: null, created_at: '2024-01-01',
      order_items: [{ product_id: 'p1', quantity: 2, unit_price: 100 }],
      profiles: { name: 'Test', email: 'test@test.com' },
    };

    mockQueries.push(mockCreateQuery({ data: [{ id: 'p1', price: 100, stock: 10 }], error: null }));
    mockQueries.push(mockCreateQuery({ data: { id: 'order-1', total: 232 }, error: null }));
    mockQueries.push(mockCreateQuery({ data: null, error: null }));
    mockQueries.push(mockCreateQuery({ data: fullOrder, error: null }));
    mockQueries.push(mockCreateQuery({ data: [{ id: 'p1', name: 'Producto 1' }], error: null }));

    await create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Orden creada',
      data: expect.objectContaining({ id: 'order-1', total: 232 }),
    });
  });

  it('debe retornar 400 si falta user_id o items', async () => {
    const testCases = [
      { user_id: '', items: [{ product_id: 'p1' }] },
      { user_id: 'user-1', items: [] },
      {},
    ];

    for (const body of testCases) {
      req.body = body;
      res.status.mockClear();
      res.json.mockClear();

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'user_id y items son requeridos' });
    }
  });

  it('debe retornar 400 si un producto no existe', async () => {
    req.body = { user_id: 'user-1', items: [{ product_id: 'nonexistent', quantity: 1 }] };

    mockQueries.push(mockCreateQuery({ data: [{ id: 'p1', price: 100, stock: 10 }], error: null }));

    await create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Producto ID nonexistent no encontrado' });
  });

  it('debe retornar 400 si el stock es insuficiente', async () => {
    req.body = { user_id: 'user-1', items: [{ product_id: 'p1', quantity: 99 }] };

    mockQueries.push(mockCreateQuery({ data: [{ id: 'p1', price: 100, stock: 5 }], error: null }));

    await create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Stock insuficiente para el producto ID p1' });
  });

  it('debe crear dirección si se provee shipping_address sin shipping_address_id', async () => {
    req.body = {
      ...baseBody,
      shipping_address: {
        company: 'Empresa',
        contact: 'Contacto',
        street: 'Calle 123',
        city: 'Ciudad',
        state: 'Estado',
        zip: '12345',
        country: 'México',
      },
    };

    mockQueries.push(mockCreateQuery({ data: [{ id: 'p1', price: 100, stock: 10 }], error: null }));
    mockQueries.push(mockCreateQuery({ data: { id: 'addr-1' }, error: null }));
    mockQueries.push(mockCreateQuery({ data: { id: 'order-1', total: 232 }, error: null }));
    mockQueries.push(mockCreateQuery({ data: null, error: null }));
    mockQueries.push(mockCreateQuery({ data: { id: 'order-1', total: 232, order_items: [], profiles: {} }, error: null }));
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('debe usar "N/A" como state por defecto si no se provee', async () => {
    req.body = {
      ...baseBody,
      shipping_address: {
        street: 'Calle 123',
        city: 'Ciudad',
        zip: '12345',
      },
    };

    mockQueries.push(mockCreateQuery({ data: [{ id: 'p1', price: 100, stock: 10 }], error: null }));
    mockQueries.push(mockCreateQuery({ data: { id: 'addr-1' }, error: null }));
    mockQueries.push(mockCreateQuery({ data: { id: 'order-1', total: 232 }, error: null }));
    mockQueries.push(mockCreateQuery({ data: null, error: null }));
    mockQueries.push(mockCreateQuery({ data: { id: 'order-1', total: 232, order_items: [], profiles: {} }, error: null }));
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('debe llamar next(err) si supabase.from para productos falla', async () => {
    req.body = { ...baseBody };
    const dbError = new Error('DB error');

    mockQueries.push(mockCreateQuery({ data: null, error: dbError }));

    await create(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });

  it('debe llamar next(err) si la inserción de la orden falla', async () => {
    req.body = { ...baseBody };
    const dbError = new Error('DB error');

    mockQueries.push(mockCreateQuery({ data: [{ id: 'p1', price: 100, stock: 10 }], error: null }));
    mockQueries.push(mockCreateQuery({ data: null, error: dbError }));

    await create(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});

describe('updateStatus', () => {
  let req, res, next;

  beforeEach(() => {
    mockQueries.length = 0;
    req = { params: { id: 'order-1' }, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('debe actualizar el estado de la orden exitosamente', async () => {
    req.body = { status: 'shipped' };
    const updatedOrder = {
      id: 'order-1', user_id: 'u1', status: 'shipped',
      order_items: [], shipping_address_id: null,
    };

    mockQueries.push(mockCreateQuery({ data: updatedOrder, error: null }));
    mockQueries.push(mockCreateQuery({ data: [], error: null }));

    await updateStatus(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Estado de orden actualizado',
      data: expect.objectContaining({ id: 'order-1', status: 'shipped' }),
    });
  });

  it('debe retornar 400 si el estado no es válido', async () => {
    const invalidStatuses = ['invalid', '', 'shippped', 'DELIVERED', 123];

    for (const status of invalidStatuses) {
      req.body = { status };
      res.status.mockClear();
      res.json.mockClear();

      await updateStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Estado inválido. Valores: pending, processing, confirmed, shipped, delivered, cancelled',
      });
    }
  });

  it('debe retornar 404 si la orden no existe (PGRST116)', async () => {
    req.body = { status: 'confirmed' };
    const pgError = new Error('Not found');
    pgError.code = 'PGRST116';

    mockQueries.push(mockCreateQuery({ data: null, error: pgError }));

    await updateStatus(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Orden no encontrada' });
  });

  it('debe manejar todos los estados válidos', async () => {
    const validStatuses = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    for (const status of validStatuses) {
      mockQueries.length = 0;
      req.body = { status };

      mockQueries.push(mockCreateQuery({
        data: { id: 'order-1', status, order_items: [], shipping_address_id: null },
        error: null,
      }));
      mockQueries.push(mockCreateQuery({ data: [], error: null }));

      res.status.mockClear();
      res.json.mockClear();

      await updateStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    }
  });

  it('debe llamar next(err) si supabase.update falla con otro error', async () => {
    req.body = { status: 'shipped' };
    const dbError = new Error('DB error');

    mockQueries.push(mockCreateQuery({ data: null, error: dbError }));

    await updateStatus(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});
