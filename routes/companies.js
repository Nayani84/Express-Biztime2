/** Routes for companies of Biztime. */

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require('slugify');

// GET /companies
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: result.rows })
  } catch (e) {
    return next(e);
  }
})

// GET /companies/[code]
router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const companyResult = await db.query('SELECT * FROM companies WHERE code = $1', [code])
    if (companyResult.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404)
    }
    const invoicesResult = await db.query('SELECT * FROM invoices WHERE comp_code = $1', [code]);
    const industriesResult = await db.query(`
      SELECT i.industry
      FROM industries AS i
      JOIN companies_industries AS ci
      ON i.code = ci.indus_code
      WHERE ci.comp_code = $1
      `, [code]);

    const company = companyResult.rows[0];
    company.invoices = invoicesResult.rows.map(inv => inv.id);
    company.industries = industriesResult.rows.map(ind => ind.industry);
    return res.send({ company })
  } catch (e) {
    return next(e)
  }
})

// POST /companies
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name) // generate code using slugify.
    const result = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
    return res.status(201).json({ company: result.rows[0] })
  } catch (e) {
    return next(e)
  }
})

// PUT /companies/[code]
router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const result = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code])
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't update company with code of ${code}`, 404)
    }
    return res.send({ company: result.rows[0] })
  } catch (e) {
    return next(e)
  }
})

// DELETE /companies/[code]
router.delete('/:code', async (req, res, next) => {
  try {
    const result = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
    if (result.rowCount === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404)
    }
    return res.send({ msg: "DELETED!" })
  } catch (e) {
    return next(e)
  }
})


module.exports = router;