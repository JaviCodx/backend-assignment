import * as mongoose from 'mongoose';
import { CurrencyInterface } from '../types';
import CurrencyData from "./currencyData"

const currencySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    currencyDataArray: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: CurrencyData,
        },
    ],
});

currencySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

const Currency = mongoose.model('Currency', currencySchema);

export default Currency;
