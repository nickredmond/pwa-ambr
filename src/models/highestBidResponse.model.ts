/**
 * Response to request for highest bid amount, or part of response to payment request
 */
export class HighestBidResponse {
    public highestBidAmount: number;
    public isPermissionToViewExpires: boolean;
    public minutesUntilExpiry: number;
}