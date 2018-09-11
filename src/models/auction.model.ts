import { Item } from "./item.model";
import { Charity } from "./charity.model";
import { Bid } from "./Bid.model";

export class Auction {
    id: string;
    item: Item;
    charity: Charity;
    highestBid: Bid;
}