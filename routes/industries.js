/** Routes for companies of Biztime. */

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

// GET /industries
router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT * FROM industries`);
        return res.json({ industries: result.rows })
    } catch (e) {
        return next(e);
    }
})

// POST /industries
router.post('/', async (req, res, next) => {
    try {
        const { code, industry } = req.body;
        const result = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry', [code, industry]);
        return res.status(201).json({ industry: result.rows[0] })
    } catch (e) {
        return next(e)
    }
})

// POST associating an industry to a company.
router.post('/:code/companies/:comp_code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { comp_code } = req.body;
        const industryResult = await db.query('SELECT * FROM industries WHERE code = $1', [code])
        const companyResult = await db.query('SELECT * FROM companies WHERE code = $1', [comp_code])
        if (industryResult.rows.length === 0 || companyResult.rows.length === 0) {
            throw new ExpressError(`Can't find industry with code of ${code}`, 404)
        }
        await db.query('INSERT INTO companies_industries (comp_code, indus_code) VALUES ($1, $2)', [comp_code, code]);
        return res.json({ status: "associated", indus_code: code, comp_code });
    } catch (e) {
        return next(e)
    }
})


module.exports = router;