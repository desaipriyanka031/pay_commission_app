import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: sql.config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE || 'PayCommissionDB',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true,
  },
  pool: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let pool: sql.ConnectionPool | null = null;

export async function initializeDatabase(): Promise<void> {
  pool = await sql.connect(dbConfig);
  console.log('✅ MSSQL connection pool created');
}

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(dbConfig);
  }
  return pool;
}

export async function query<T = sql.IRecordSet<Record<string, unknown>>>(
  queryText: string,
  params?: Record<string, { type: sql.ISqlType | (() => sql.ISqlType); value: unknown }>
): Promise<T> {
  const conn = await getPool();
  const request = conn.request();

  if (params) {
    for (const [key, param] of Object.entries(params)) {
      request.input(key, param.type, param.value);
    }
  }

  const result = await request.query(queryText);
  return result.recordset as T;
}

export async function execute(
  queryText: string,
  params?: Record<string, { type: sql.ISqlType | (() => sql.ISqlType); value: unknown }>
): Promise<sql.IResult<unknown>> {
  const conn = await getPool();
  const request = conn.request();

  if (params) {
    for (const [key, param] of Object.entries(params)) {
      request.input(key, param.type, param.value);
    }
  }

  return request.query(queryText);
}

export { sql };
