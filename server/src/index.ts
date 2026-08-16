import express from 'express';
import { MongoClient, Db } from 'mongodb';
import { hashPassword, verifyPassword, normalizePhone, generateToken, SafeUser, DbUser } from './authUtils.js';

const DEFAULT_MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb://muhammadalibinyousaf:scNP9EWXPcFtO0Gx@liistprod-shard-00-00.li2gx.mongodb.net:27017,liistprod-shard-00-01.li2gx.mongodb.net:27017,liistprod-shard-00-02.li2gx.mongodb.net:27017/Omore?ssl=true&authSource=admin&retryWrites=true&w=majority';
const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || 'Omore';

let mongoClient: MongoClient | null = null;
let dbInstance: Db | null = null;
let isMongoConnected = false;

let fallbackUsers: DbUser[] = [];
let fallbackSessions: Record<string, string> = {};
let fallbackProducts: any[] = [];
let fallbackEmployees: any[] = [];
let fallbackLedger: any[] = [];
let fallbackDispatches: any[] = [];

async function getDatabase(): Promise<Db | null> {
  if (dbInstance && isMongoConnected) {
    return dbInstance;
  }
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(DEFAULT_MONGO_URI, {
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
      });
    }
    await mongoClient.connect();
    dbInstance = mongoClient.db(DEFAULT_DB_NAME);
    isMongoConnected = true;
    console.log(`[MongoDB] Successfully connected to database: "${DEFAULT_DB_NAME}"`);

    try {
      await dbInstance.collection('users').createIndex({ phone: 1 }, { unique: true });
    } catch {
      // index might already exist
    }

    return dbInstance;
  } catch (error) {
    console.error('[MongoDB] Connection error, using memory fallback:', error);
    isMongoConnected = false;
    return null;
  }
}

function sanitizeDoc(doc: any) {
  if (!doc) return doc;
  const { _id, passwordHash, salt, ...rest } = doc;
  return rest;
}

function sanitizeDocs(docs: any[]) {
  return docs.map(sanitizeDoc);
}

function getBearerToken(req: express.Request): string | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  return parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : null;
}

function applyCors(app: express.Express) {
  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    const allowed = (process.env.FRONTEND_URL || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (requestOrigin && (allowed.length === 0 || allowed.includes('*') || allowed.includes(requestOrigin))) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
      res.header('Vary', 'Origin');
    } else if (!requestOrigin && (allowed.length === 0 || allowed.includes('*'))) {
      res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });
}

export const app = express();

app.use(express.json());
applyCors(app);

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'omore-backend',
    health: '/api/health',
  });
});

app.get('/api/health', async (_req, res) => {
  res.json({
    status: 'ok',
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
    database: DEFAULT_DB_NAME,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanPhone = normalizePhone(phone);
    const db = await getDatabase();

    let existingUser: any = null;
    if (db) {
      existingUser = await db.collection('users').findOne({ phone: cleanPhone });
    } else {
      existingUser = fallbackUsers.find((u) => u.phone === cleanPhone);
    }

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this mobile number already exists. Please sign in.' });
    }

    const { hash, salt } = hashPassword(password);
    const userId = 'u-' + Date.now();
    const newUser: DbUser = {
      id: userId,
      name: name.trim(),
      phone: cleanPhone,
      passwordHash: hash,
      salt,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };

    const token = generateToken(userId);

    if (db) {
      await db.collection('users').insertOne(newUser);
      await db.collection('sessions').insertOne({
        token,
        userId,
        createdAt: new Date().toISOString(),
      });
    } else {
      fallbackUsers.push(newUser);
      fallbackSessions[token] = userId;
    }

    const safeUser: SafeUser = {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    return res.status(201).json({
      token,
      user: safeUser,
      message: 'Account created successfully',
    });
  } catch (err: any) {
    console.error('[API] /api/auth/signup error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Mobile number and password are required' });
    }

    const cleanPhone = normalizePhone(phone);
    const db = await getDatabase();

    let user: DbUser | null = null;
    if (db) {
      user = (await db.collection('users').findOne({ phone: cleanPhone })) as unknown as DbUser | null;
    } else {
      user = fallbackUsers.find((u) => u.phone === cleanPhone) || null;
    }

    if (!user) {
      return res.status(401).json({ error: 'No account found with this mobile number. Please sign up.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password. Please check and try again.' });
    }

    const token = generateToken(user.id);

    if (db) {
      await db.collection('sessions').insertOne({
        token,
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
    } else {
      fallbackSessions[token] = user.id;
    }

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.json({
      token,
      user: safeUser,
      message: 'Signed in successfully',
    });
  } catch (err: any) {
    console.error('[API] /api/auth/signin error:', err);
    return res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const db = await getDatabase();
    let userId: string | null = null;

    if (db) {
      const session = await db.collection('sessions').findOne({ token });
      if (session) userId = session.userId;
    } else {
      userId = fallbackSessions[token] || null;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    let user: DbUser | null = null;
    if (db) {
      user = (await db.collection('users').findOne({ id: userId })) as unknown as DbUser | null;
    } else {
      user = fallbackUsers.find((u) => u.id === userId) || null;
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.json({ user: safeUser });
  } catch (err) {
    console.error('[API] /api/auth/me error:', err);
    return res.status(500).json({ error: 'Failed to verify session' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (token) {
      const db = await getDatabase();
      if (db) {
        await db.collection('sessions').deleteOne({ token });
      }
      delete fallbackSessions[token];
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch {
    res.json({ success: true });
  }
});

async function getAuthUserId(req: express.Request): Promise<string | null> {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    const db = await getDatabase();
    if (db) {
      const session = await db.collection('sessions').findOne({ token });
      if (session) return session.userId;
    }
    return fallbackSessions[token] || null;
  } catch {
    return null;
  }
}

app.get('/api/db', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const db = await getDatabase();
    if (db) {
      const filter = userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {};
      const [products, employees, ledger, dispatches] = await Promise.all([
        db.collection('products').find(filter).sort({ createdAt: -1 }).toArray(),
        db.collection('employees').find(filter).sort({ createdAt: -1 }).toArray(),
        db.collection('ledger').find(filter).sort({ createdAt: -1 }).toArray(),
        db.collection('dispatches').find(filter).sort({ createdAt: -1 }).toArray(),
      ]);
      return res.json({
        products: sanitizeDocs(products),
        employees: sanitizeDocs(employees),
        ledger: sanitizeDocs(ledger),
        dispatches: sanitizeDocs(dispatches),
        dbSource: 'mongodb',
        userId: userId || null,
      });
    }
  } catch (err) {
    console.error('[API] /api/db error:', err);
  }
  const userId = await getAuthUserId(req);
  const filterFn = (item: any) => !userId || item.userId === userId || !item.userId;
  res.json({
    products: fallbackProducts.filter(filterFn),
    employees: fallbackEmployees.filter(filterFn),
    ledger: fallbackLedger.filter(filterFn),
    dispatches: fallbackDispatches.filter(filterFn),
    dbSource: 'memory',
    userId: userId || null,
  });
});

app.post('/api/reset', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const db = await getDatabase();
    const filter = userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {};

    if (db) {
      await Promise.all([
        db.collection('products').deleteMany(filter),
        db.collection('employees').deleteMany(filter),
        db.collection('ledger').deleteMany(filter),
        db.collection('dispatches').deleteMany(filter),
      ]);
    }
    if (userId) {
      fallbackProducts = fallbackProducts.filter((p) => p.userId && p.userId !== userId);
      fallbackEmployees = fallbackEmployees.filter((e) => e.userId && e.userId !== userId);
      fallbackLedger = fallbackLedger.filter((l) => l.userId && l.userId !== userId);
      fallbackDispatches = fallbackDispatches.filter((d) => d.userId && d.userId !== userId);
    } else {
      fallbackProducts = [];
      fallbackEmployees = [];
      fallbackLedger = [];
      fallbackDispatches = [];
    }

    res.json({
      success: true,
      message: 'Store data cleared',
      products: [],
      employees: [],
      ledger: [],
      dispatches: [],
    });
  } catch (err) {
    console.error('[API] /api/reset error:', err);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const { name, quantity, purchasePrice, salePrice } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const newProduct = {
      id: 'p-' + Date.now(),
      userId: userId || 'default',
      name: name.trim(),
      quantity: Math.max(0, Number(quantity) || 0),
      purchasePrice: Math.max(0, Number(purchasePrice) || 0),
      salePrice: Math.max(0, Number(salePrice) || 0),
      createdAt: new Date().toISOString(),
    };

    const db = await getDatabase();
    if (db) {
      await db.collection('products').insertOne({ ...newProduct });
    }

    fallbackProducts.push(newProduct);
    res.status(201).json(sanitizeDoc(newProduct));
  } catch (err) {
    console.error('[MongoDB] Insert product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const { id } = req.params;
    const { name, quantity, purchasePrice, salePrice } = req.body;
    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (quantity !== undefined) updateFields.quantity = Math.max(0, Number(quantity));
    if (purchasePrice !== undefined) updateFields.purchasePrice = Math.max(0, Number(purchasePrice));
    if (salePrice !== undefined) updateFields.salePrice = Math.max(0, Number(salePrice));
    updateFields.updatedAt = new Date().toISOString();

    let updatedDoc: any = null;
    const db = await getDatabase();
    const filter = { id, ...(userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {}) };

    if (db) {
      const result = await db.collection('products').findOneAndUpdate(
        filter,
        { $set: updateFields },
        { returnDocument: 'after' }
      );
      if (result) {
        updatedDoc = sanitizeDoc(result);
      }
    }

    const idx = fallbackProducts.findIndex((p: any) => p.id === id && (!userId || p.userId === userId || !p.userId));
    if (idx !== -1) {
      fallbackProducts[idx] = { ...fallbackProducts[idx], ...updateFields };
      if (!updatedDoc) updatedDoc = fallbackProducts[idx];
    }

    if (updatedDoc) {
      res.json(updatedDoc);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    console.error('[MongoDB] Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const { id } = req.params;
    const db = await getDatabase();
    const filter = { id, ...(userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {}) };

    if (db) {
      await db.collection('products').deleteOne(filter);
    }
    fallbackProducts = fallbackProducts.filter((p: any) => p.id !== id);
    res.json({ success: true, id });
  } catch (err) {
    console.error('[MongoDB] Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const { name, salary, address, phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Employee name is required' });
    }

    const newEmployee = {
      id: 'e-' + Date.now(),
      userId: userId || 'default',
      name: name.trim(),
      salary: Math.max(0, Number(salary) || 0),
      address: address ? address.trim() : '',
      phone: phone ? phone.trim() : '',
      createdAt: new Date().toISOString(),
    };

    const db = await getDatabase();
    if (db) {
      await db.collection('employees').insertOne({ ...newEmployee });
    }

    fallbackEmployees.push(newEmployee);
    res.status(201).json(sanitizeDoc(newEmployee));
  } catch (err) {
    console.error('[MongoDB] Insert employee error:', err);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const { id } = req.params;
    const { name, salary, address, phone } = req.body;
    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (salary !== undefined) updateFields.salary = Math.max(0, Number(salary));
    if (address !== undefined) updateFields.address = address.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    updateFields.updatedAt = new Date().toISOString();

    let updatedDoc: any = null;
    const db = await getDatabase();
    const filter = { id, ...(userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {}) };

    if (db) {
      const result = await db.collection('employees').findOneAndUpdate(
        filter,
        { $set: updateFields },
        { returnDocument: 'after' }
      );
      if (result) {
        updatedDoc = sanitizeDoc(result);
      }
    }

    const idx = fallbackEmployees.findIndex((e: any) => e.id === id && (!userId || e.userId === userId || !e.userId));
    if (idx !== -1) {
      fallbackEmployees[idx] = { ...fallbackEmployees[idx], ...updateFields };
      if (!updatedDoc) updatedDoc = fallbackEmployees[idx];
    }

    if (updatedDoc) {
      res.json(updatedDoc);
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  } catch (err) {
    console.error('[MongoDB] Update employee error:', err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const { id } = req.params;
    const db = await getDatabase();
    const filter = { id, ...(userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {}) };

    if (db) {
      await db.collection('employees').deleteOne(filter);
    }
    fallbackEmployees = fallbackEmployees.filter((e: any) => e.id !== id);
    res.json({ success: true, id });
  } catch (err) {
    console.error('[MongoDB] Delete employee error:', err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

app.post('/api/dispatches', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const { employeeId, date, items } = req.body;
    let emp: any = null;
    let prodsList: any[] = [];

    const db = await getDatabase();
    const filter = userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {};

    if (db) {
      emp = await db.collection('employees').findOne({ id: employeeId, ...filter });
      prodsList = await db.collection('products').find(filter).toArray();
    }

    if (!emp) {
      emp = fallbackEmployees.find((e: any) => e.id === employeeId && (!userId || e.userId === userId || !e.userId));
    }
    if (!prodsList || prodsList.length === 0) {
      prodsList = fallbackProducts.filter((p: any) => !userId || p.userId === userId || !p.userId);
    }

    if (!emp) {
      return res.status(400).json({ error: 'Selected employee does not exist' });
    }

    const processedItems = (items || []).map((item: any) => {
      const prod = prodsList.find((p: any) => p.id === item.productId);
      const salePrice = prod ? prod.salePrice : item.salePrice || 0;
      const assignedQty = Math.max(0, Number(item.assignedQty) || 0);
      const returnQty = Math.max(0, Number(item.returnQty) || 0);
      const totalAssignPrice = assignedQty * salePrice;
      const totalReturnPrice = returnQty * salePrice;
      const netSoldQty = Math.max(0, assignedQty - returnQty);
      const netSoldAmount = totalAssignPrice - totalReturnPrice;

      return {
        productId: item.productId,
        productName: prod ? prod.name : item.productName || 'Product',
        assignedQty,
        salePrice,
        totalAssignPrice,
        returnQty,
        totalReturnPrice,
        netSoldQty,
        netSoldAmount,
      };
    });

    const totalAssignPrice = processedItems.reduce((acc: number, cur: any) => acc + cur.totalAssignPrice, 0);
    const totalReturnPrice = processedItems.reduce((acc: number, cur: any) => acc + cur.totalReturnPrice, 0);
    const expectedCash = totalAssignPrice - totalReturnPrice;

    const newDispatch = {
      id: 'd-' + Date.now(),
      userId: userId || 'default',
      date: date || new Date().toLocaleDateString('en-US'),
      employeeId: emp.id,
      employeeName: emp.name,
      items: processedItems,
      totalAssignPrice,
      totalReturnPrice,
      expectedCash,
      cashInHand: 0,
      shortageCash: 0,
      extraCash: 0,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    };

    if (db) {
      await db.collection('dispatches').insertOne({ ...newDispatch });
    }

    fallbackDispatches.push(newDispatch);
    res.status(201).json(sanitizeDoc(newDispatch));
  } catch (err) {
    console.error('[API] /api/dispatches error:', err);
    res.status(500).json({ error: 'Failed to create dispatch assignment' });
  }
});

app.post('/api/dispatches/:id/settle', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const { id } = req.params;
    const { cashInHand, items, date } = req.body;

    let dispatch: any = null;
    const db = await getDatabase();
    const filter = { id, ...(userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {}) };

    if (db) {
      dispatch = await db.collection('dispatches').findOne(filter);
    }

    if (!dispatch) {
      const idx = fallbackDispatches.findIndex((d: any) => d.id === id && (!userId || d.userId === userId || !d.userId));
      if (idx !== -1) dispatch = fallbackDispatches[idx];
    }

    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch assignment not found' });
    }

    if (items && Array.isArray(items)) {
      dispatch.items = items.map((item: any) => {
        const assignedQty = Math.max(0, Number(item.assignedQty) || 0);
        const returnQty = Math.max(0, Number(item.returnQty) || 0);
        const salePrice = Math.max(0, Number(item.salePrice) || 0);
        const totalAssignPrice = assignedQty * salePrice;
        const totalReturnPrice = returnQty * salePrice;
        return {
          ...item,
          assignedQty,
          returnQty,
          salePrice,
          totalAssignPrice,
          totalReturnPrice,
          netSoldQty: Math.max(0, assignedQty - returnQty),
          netSoldAmount: totalAssignPrice - totalReturnPrice,
        };
      });
    }

    dispatch.totalAssignPrice = dispatch.items.reduce((acc: number, cur: any) => acc + cur.totalAssignPrice, 0);
    dispatch.totalReturnPrice = dispatch.items.reduce((acc: number, cur: any) => acc + cur.totalReturnPrice, 0);
    dispatch.expectedCash = dispatch.totalAssignPrice - dispatch.totalReturnPrice;

    const actualCash = Math.max(0, Number(cashInHand) || 0);
    dispatch.cashInHand = actualCash;

    const diff = dispatch.expectedCash - actualCash;
    if (diff > 0) {
      dispatch.shortageCash = diff;
      dispatch.extraCash = 0;
    } else if (diff < 0) {
      dispatch.shortageCash = 0;
      dispatch.extraCash = Math.abs(diff);
    } else {
      dispatch.shortageCash = 0;
      dispatch.extraCash = 0;
    }

    dispatch.status = 'SETTLED';
    dispatch.settledAt = new Date().toISOString();

    let newLedgerEntry: any = null;
    if (dispatch.shortageCash > 0 || dispatch.extraCash > 0) {
      newLedgerEntry = {
        id: 'l-' + Date.now(),
        userId: userId || dispatch.userId || 'default',
        employeeId: dispatch.employeeId,
        employeeName: dispatch.employeeName,
        date: date || dispatch.date,
        shortage: dispatch.shortageCash,
        extra: dispatch.extraCash,
        recovery: 0,
        description: `Settlement for Dispatch #${dispatch.id}`,
        dispatchId: dispatch.id,
        createdAt: new Date().toISOString(),
      };
    }

    let currentProducts: any[] = [];
    let currentLedger: any[] = [];

    if (db) {
      await db.collection('dispatches').updateOne(filter, { $set: sanitizeDoc(dispatch) });

      for (const item of dispatch.items) {
        if (item.netSoldQty > 0) {
          await db.collection('products').updateOne(
            { id: item.productId, ...(userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {}) },
            { $inc: { quantity: -item.netSoldQty } }
          );
        }
      }

      if (newLedgerEntry) {
        await db.collection('ledger').insertOne({ ...newLedgerEntry });
      }

      const userScope = userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {};
      const [pList, lList] = await Promise.all([
        db.collection('products').find(userScope).toArray(),
        db.collection('ledger').find(userScope).sort({ createdAt: -1 }).toArray(),
      ]);
      currentProducts = sanitizeDocs(pList);
      currentLedger = sanitizeDocs(lList);
    }

    dispatch.items.forEach((item: any) => {
      const prod = fallbackProducts.find((p: any) => p.id === item.productId);
      if (prod) {
        prod.quantity = Math.max(0, prod.quantity - item.netSoldQty);
      }
    });
    if (newLedgerEntry) {
      fallbackLedger.unshift(newLedgerEntry);
    }
    if (currentProducts.length === 0) currentProducts = fallbackProducts.filter((p) => !userId || p.userId === userId || !p.userId);
    if (currentLedger.length === 0) currentLedger = fallbackLedger.filter((l) => !userId || l.userId === userId || !l.userId);

    res.json({ dispatch: sanitizeDoc(dispatch), products: currentProducts, ledger: currentLedger });
  } catch (err) {
    console.error('[MongoDB] Settle update error:', err);
    res.status(500).json({ error: 'Failed to settle dispatch' });
  }
});

app.post('/api/recovery', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const { employeeId, amount, date, description } = req.body;
    let emp: any = null;

    const db = await getDatabase();
    const filter = userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {};

    if (db) {
      emp = await db.collection('employees').findOne({ id: employeeId, ...filter });
    }

    if (!emp) {
      emp = fallbackEmployees.find((e: any) => e.id === employeeId && (!userId || e.userId === userId || !e.userId));
    }

    if (!emp) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    const recoveryAmount = Number(amount) || 0;
    if (recoveryAmount <= 0) {
      return res.status(400).json({ error: 'Recovery amount must be greater than 0' });
    }

    const newLedgerEntry = {
      id: 'l-' + Date.now(),
      userId: userId || 'default',
      employeeId: emp.id,
      employeeName: emp.name,
      date: date || new Date().toLocaleDateString('en-US'),
      shortage: 0,
      extra: 0,
      recovery: recoveryAmount,
      description: description ? description.trim() : 'Cash Recovery Payment',
      createdAt: new Date().toISOString(),
    };

    if (db) {
      await db.collection('ledger').insertOne({ ...newLedgerEntry });
    }

    fallbackLedger.unshift(newLedgerEntry);
    res.status(201).json(sanitizeDoc(newLedgerEntry));
  } catch (err) {
    console.error('[MongoDB] Insert recovery error:', err);
    res.status(500).json({ error: 'Failed to record recovery payment' });
  }
});

app.delete('/api/ledger/:id', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const { id } = req.params;
    const db = await getDatabase();
    const filter = { id, ...(userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {}) };

    if (db) {
      await db.collection('ledger').deleteOne(filter);
    }
    fallbackLedger = fallbackLedger.filter((l: any) => l.id !== id);
    res.json({ success: true, id });
  } catch (err) {
    console.error('[MongoDB] Delete ledger error:', err);
    res.status(500).json({ error: 'Failed to delete ledger entry' });
  }
});

app.delete('/api/dispatches/:id', async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    const { id } = req.params;
    const db = await getDatabase();
    const filter = { id, ...(userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {}) };

    if (db) {
      await db.collection('dispatches').deleteOne(filter);
    }
    fallbackDispatches = fallbackDispatches.filter((d: any) => d.id !== id);
    res.json({ success: true, id });
  } catch (err) {
    console.error('[MongoDB] Delete dispatch error:', err);
    res.status(500).json({ error: 'Failed to delete dispatch' });
  }
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API] Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
