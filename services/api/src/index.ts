import * as path from 'path';
import * as express from 'express';
import * as mongoose from 'mongoose';
import axios from 'axios';
import Currency from './models/currency';
import CurrencyData from './models/currencyData';

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

app.get('/currency', async (req, res) => {
    const currencies = await Currency.find();
    res.status(200).json({ currencies: currencies.map(({ id, code }) => ({ id, code })) });
});

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
    const currencies = await Currency.find().populate('currencyDataArray');
    res.status(200).json({ currencies });
});

app.get('/currency/:code/historic', async (req, res) => {
    const currency = await Currency.findOne({ code: req.params.code }).populate('currencyDataArray');
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
