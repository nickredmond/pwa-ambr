import { Injectable } from "@angular/core";
import { PaymentMethod } from "src/models/paymentMethod.model";
import { Observable, of } from "rxjs";
import { PaymentResult } from "src/models/paymentResult.model";
import { HttpClient } from "@angular/common/http";
import { HighestBidResponse } from "../models/highestBidResponse.model";
import { environment } from "../environments/environment";

@Injectable()
export class PaymentService {
    private _paymentMethods: PaymentMethod[];

    constructor(private httpClient: HttpClient) {}

    public getPaymentMethods(userToken: string): Observable<PaymentMethod[]> {
        let paymentMethods;

        if (this._paymentMethods) {
            paymentMethods = of(this._paymentMethods);
        } else {
            paymentMethods = this.retrievePaymentMethods(userToken);
        }

        return paymentMethods;
    }

    public loadPaymentMethods(userToken: string): void {
        this.retrievePaymentMethods(userToken).subscribe(
            paymentMethods => {
                this._paymentMethods = paymentMethods;
            }
        );
    }

    public submitPayment(userToken: string, auctionId: string, paymentMethod: PaymentMethod, paymentAmount: number, bidType: string, isNewPaymentMethod: boolean): Observable<any> {
        const requestBody = {
            userToken,
            auctionId,
            paymentMethod,
            paymentAmount,
            bidType,
            isNewPaymentMethod
        };

        const options = {
            headers: { "x-api-key": environment.apiKey }
        };
        const paymentServiceUrl = "https://494emnupx8.execute-api.us-east-1.amazonaws.com/beta/ambr-mongo-payment";
        return this.httpClient.post(paymentServiceUrl, requestBody, options);
    }
    public processPaymentResult(paymentResponseBody: any): PaymentResult {
        const statusCode = paymentResponseBody.statusCode;
        const paymentResponse = JSON.parse(paymentResponseBody.body);

        const result = <PaymentResult>{ isSuccess: false };

        if (statusCode === 200) {
            result.isSuccess = true;
            result.isUserMadeHighestBid = paymentResponse.isHighestBid;
            result.highestBidDetail = <HighestBidResponse>{
                highestBidAmount: paymentResponse.highestBidAmount,
                isPermissionToViewExpires: paymentResponse.isPermissionExpires,
                minutesUntilExpiry: paymentResponse.minutesToExpiry
            };
        } else if (statusCode === 400 && paymentResponse.isCardDeclined === true) {
            result.isCardDeclined = true;
        }

        return result;
    }

    private retrievePaymentMethods(userToken: string): Observable<PaymentMethod[]> {
        // todo: retrieve this from server
        // todo: also parse response.body?
        return of([
            <PaymentMethod>{
                cardBrand: "MasterCard",
                lastFourDigits: 9823,
                tokenId: "card_aend9332n2s9"
            },
            <PaymentMethod>{
                cardBrand: "VISA",
                lastFourDigits: 5129,
                tokenId: "card_aend93323en9"
            }
        ]);
    }
}