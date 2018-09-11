export class BidPermission {
    public auctionId: string;
    public bidId: string;

    public isAllBidsViewable(): boolean {
        return this.bidId === null || this.bidId === undefined || this.bidId === "";
    }
}