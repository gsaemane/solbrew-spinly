export interface StockItem {
    id: string;
    name: string;
    quantity: number;
    color: string;
    image?: string;
    isWinner?:boolean;
  }