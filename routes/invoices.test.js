// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
let testInvoice;

beforeEach(async () => {
  const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('samsung', 'Samsung Mobiles', 'they make phones') RETURNING code, name, description`);
  testCompany = result.rows[0];
  const res = await db.query("INSERT INTO invoices (comp_code, amt) VALUES ('samsung', 1000) RETURNING id, comp_code");
  testInvoice = res.rows[0];
  testCompany.invoices = testInvoice;
})

afterEach(async () => {
  await db.query(`DELETE FROM companies`)
  await db.query(`DELETE FROM invoices`);
})

afterAll(async () => {
  await db.end()
})


describe("GET /invoices", () => {
  test("Get a list of invoices", async () => {
    const res = await request(app).get('/invoices')
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoices: [testInvoice] })
  })
})


describe("GET /invoices/:id", () => {
  test("Gets a single invoice", async () => {
    const res = await request(app).get(`/invoices/${testInvoice.id}`)
    expect(res.statusCode).toBe(200);
  })
  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).get(`/invoices/0`)
    expect(res.statusCode).toBe(404);
  })
})


describe("POST /invoices", () => {
  test("Creates a single invoice", async () => {
    const res = await request(app).post('/invoices').send({ comp_code: 'samsung', amt: 1000 });
    expect(res.statusCode).toBe(201);
    expect(res.body.invoice.amt).toEqual(1000);
    expect(res.body.invoice.comp_code).toEqual('samsung');
  })
})


describe("PUT /invoices/:id", () => {
  test("Updates a single invoice", async () => {
    const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt: 10000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.invoice.amt).toEqual(10000);
  })
  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).put(`/invoices/0`).send({ amt: 1000000});
    expect(res.statusCode).toBe(404);
  })
})


describe("DELETE /invoices/:id", () => {
  test("Deletes a single invoice", async () => {
    const res = await request(app).delete(`/invoices/${testInvoice.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: 'DELETED!' })
  })
})