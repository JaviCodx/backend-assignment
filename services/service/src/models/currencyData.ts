import * as mongoose from "mongoose";


const currencyDataSchema = new mongoose.Schema({
    bid:{
        type:Number,
        required:true,
    },
    ask:{
        type:Number,
        required:true,
    },
    spread:{
        type:Number,
        required:true,
    },
    time:{
        type:Date,
        required:true,
    },
    currency: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Currency",
        required: true,
    }

   
  })

  currencyDataSchema.set("toJSON", {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
    },
  });



  const CurrencyData = mongoose.model("CurrencyData", currencyDataSchema);

export default CurrencyData;