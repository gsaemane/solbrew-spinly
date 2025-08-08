export interface StockItem {
    id: string;
    name: string;
    quantity: number;
    color: string;
    image?: string;
    isWinner?:boolean;
}
export interface Log {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  isWinner: boolean;
  quantity: number;
}