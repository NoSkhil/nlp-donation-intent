"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const supabaseUrl = process.env.PGURL;
const client = new pg_1.Client({
    connectionString: supabaseUrl
});
exports.default = client;
