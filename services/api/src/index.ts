import * as path from 'path';
import * as express from 'express';
import * as mongoose from 'mongoose';
import Currency from './models/currency';
import { CurrencyInterface } from './types';
import * as moment from 'moment';

// [DB Connection]

declare var MONGODB_URI: string;

/**
 * connectToDatabase
 * Configures the global MongoDB connection based on the provided secrets.
 *
 * @returns Promise<string>
 */
async function connectToDatabase(connectionUri: string) {
    return new Promise((resolve, reject) => {
        // From mongoose@6.x.x onwards useNewUrlParser, useUnifiedTopology,
        // useCreateIndex are deprecated and default to true
        mongoose
            .connect(connectionUri)
            .then(() => resolve(connectionUri))
            .catch((error: any) => {
                console.log(error);
                reject(`${connectionUri}: ${error}`);
            });
    });
}
connectToDatabase(MONGODB_URI);

// [Express setup]

const app = express(),
    DIST_DIR = __dirname;
app.use(express.static(DIST_DIR));
app.use(express.json());

app.get('/health', async (req, res) => {
    res.status(200).json({ healthy: true });
});

/**
 * @api {get} /currency Request Currencies information
 * @apiGroup currency
 *
 *
 * @apiSuccess {Array} currencies List of Currency
 * @apiSuccessExample {Object} Success-Response:
 *     HTTP/1.1 200 OK
 *     "currencies": [
 *          {
 *              "code" : "BTC"
 *              "id" : "1233312312"
 *
 *          }
 *    ]
 */

app.get('/currency', async (req, res) => {
    const currencies: CurrencyInterface[] = await Currency.find();
    res.status(200).json({ currencies: currencies.map(({ id, code }) => ({ id, code })) });
});

/**
 * @api {post} /currency Post a Currency
 * @apiGroup currency
 * @apiParam (body) {String} code
 * @apiSuccess {Object} currency
 * @apiSuccessExample {Object} Success-Response:
 *     HTTP/1.1 201 Created
 *          {
 *              "code" : "BTC"
 *              "id" : "1233312312"
 *
 *          }
 */

app.post('/currency', async (req, res) => {
    try {
        if (!req.body.code) return res.status(422).json({ error: 'Code is required' });

        const currency = new Currency({ code: req.body.code });
        const savedCurrency = await currency.save();
        res.status(201).send({ id: savedCurrency.id, code: savedCurrency.code });
    } catch (err) {
        res.status(422).send({ error: err.message });
    }
});

app.delete('/currency/:code', async (req, res) => {
    await Currency.deleteOne({ code: req.params.code });

    res.status(204).json({});
});

app.get('/currency/historic', async (req, res) => {
    const currencies: CurrencyInterface[] = await Currency.find().populate('currencyDataArray');
    res.status(200).json({ currencies });
});

app.get('/currency/:code/historic', async (req, res) => {
    const { from, to } = req.query;

    const areValidDates = (from, to) => {
        const fromDate = new Date(from).toString();
        const toDate = new Date(from).toString();

        return fromDate !== 'Invalid Date' && toDate !== 'Invalid Date';
    };

    const currency: CurrencyInterface = await Currency.findOne({ code: req.params.code }).populate({
        path: 'currencyDataArray',
        match: {
            ...(from &&
                to &&
                areValidDates(from, to) && {
                    time: { $gte: new Date(from), $lte: new Date(to) },
                }),
        },
    });
    if (!currency) {
        res.status(404).send({ error: 'Currency not found' });
    }
    res.status(200).json({ currency });
});
app.use((req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
});

// [Express start]

const PORT: number | string = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening to ${PORT}....`);
    console.log('Press Ctrl+C to quit.');
});
