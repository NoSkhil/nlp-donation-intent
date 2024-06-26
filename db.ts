import { Client } from 'pg';

const supabaseUrl = process.env.PGURL;

const client = new Client({
  connectionString: supabaseUrl
});

export default client;