import * as mongoose from "mongoose";

const currencySchema = new mongoose.Schema({
  name: String,
});

const Currency = mongoose.model("Currency", currencySchema);

export default Currency;
