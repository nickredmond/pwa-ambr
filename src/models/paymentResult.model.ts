import { HighestBidResponse } from "./highestBidResponse.model";

export class PaymentResult {
    public isSuccess: boolean;
    public isCardDeclined: boolean;
    public isUserMadeHighestBid: boolean;
    public highestBidDetail: HighestBidResponse;
}