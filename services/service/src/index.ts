import * as path from 'path';
import * as mongoose from 'mongoose';
import { CurrencyInterface, CurrencyDataInterface } from './types';
import CurrencyModel from './models/currency';
import CurrencyDataModel from "./models/currencyData"
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

if(!process.env.API_KEY) {
  console.error("NO API_KEY...exiting")
  process.exit(1)
}

// [DB Connection]

declare var MONGODB_URI: string;
declare var THIRD_PARTY_BASE_URL: string;

axios.defaults.baseURL = THIRD_PARTY_BASE_URL;

axios.interceptors.request.use((config) => {
    config.params = {
        ...config.params,
        to_currency: 'EUR',
        apikey: process.env.API_KEY,
    };
    return config;
});

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

// [Script execution]

console.log('Executing service...');

const getDBCurrencies = async (): Promise<CurrencyInterface[]> => {
    const currencies = await CurrencyModel.find();
    return currencies;
};

const getCurrencyData = async ({ code }: { code: string }): Promise<CurrencyDataInterface> => {
    const res = await axios.get(`query?function=CURRENCY_EXCHANGE_RATE&from_currency=${code}`);

    const data = res.data?.['Realtime Currency Exchange Rate'];

    if(!data || data["Error Message"]) {
        console.error(`Error retrieving data from ${code}`)
        return undefined
    }
    const currencyData: CurrencyDataInterface = {
        code,
        bid: Number(data['8. Bid Price']),
        ask: Number(data['9. Ask Price']),
        time: new Date(data['6. Last Refreshed']),
        spread: Math.abs(Number(data['8. Bid Price']) - Number(data['9. Ask Price'])),
    };

    return currencyData;
};
const saveCurrencyData = async({bid,ask,spread,code,time}) => {


 const currency = await CurrencyModel.findOne({code})

 const newCurrencyData = new CurrencyDataModel ({
    bid,ask,spread,time,
    currency: currency._id
 })

const savedCurrencyData = await newCurrencyData.save()

console.log(currency)

currency.currencyDataArray = currency.currencyDataArray.concat(savedCurrencyData._id)

 
return await currency.save()
}

const getApiDataService = async () => {
    const currencies = await getDBCurrencies();

    const currenciesData = await Promise.all(currencies.map(getCurrencyData));

    const savedCurrenciesData = await Promise.all(currenciesData.filter(c=>c).map(saveCurrencyData));

    // console.log(savedCurrenciesData);
    process.exit(0);
};

getApiDataService();
