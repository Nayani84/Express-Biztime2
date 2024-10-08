/** Routes for invoices of Biztime. */

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

// GET /invoices
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(`SELECT id, comp_code FROM invoices`);
    return res.json({ invoices: result.rows })
  } catch (e) {
    return next(e);
  }
})

// GET /invoices/[id]
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE id = $1', [id])
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
    }
    const invoice = result.rows[0];
    const companyResult = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [invoice.comp_code]);
    invoice.company = companyResult.rows[0];
    return res.send({ invoice })
  } catch (e) {
    return next(e)
  }
})

// POST /invoices
router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', [comp_code, amt]);
    return res.status(201).json({ invoice: result.rows[0] })
  } catch (e) {
    return next(e)
  }
})

// PUT /invoices/[id]
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;
    const invoiceResult = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (invoiceResult.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
    }
    const invoice = invoiceResult.rows[0];
    let paidDate = invoice.paid_date;

    if (paid && !invoice.paid) {
      paidDate = new Date(); // Set to today if paying
    } else if (!paid && invoice.paid) {
      paidDate = null; // Set to null if un-paying
    }

    const result = await db.query('UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING *', [amt, paid, paidDate, id]);
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't update invoice with id of ${id}`, 404)
    }
    return res.send({ invoice: result.rows[0] })
  } catch (e) {
    return next(e)
  }
})

// DELETE /invoices/[id]
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
    }
    return res.send({ msg: "DELETED!" })
  } catch (e) {
    return next(e)
  }
})


module.exports = router;