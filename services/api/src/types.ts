export interface CurrencyInterface {
    code: string,
    currencyDataArray?,
    _id?:string
    id?:String
}


export interface CurrencyDataInterface {
    code?: string,
    bid: number,
    ask:number,
    time: Date,
    spread:number,
    bidDiff?:number,
    askDiff?:number,
    spreadDiff?:number,
 
}