
export interface CurrencyInterface {

    code: string,
    currencyData?,
    _id?:string
}

export interface CurrencyDataInterface {
    code?: string,
    bid: number,
    ask:number,
    time: Date,
    spread:number,
    currency?
}