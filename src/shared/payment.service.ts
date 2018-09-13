import { Injectable } from "@angular/core";
import { PaymentMethod } from "src/models/paymentMethod.model";
import { Observable, of } from "rxjs";
import { PaymentResult } from "src/models/paymentResult.model";
import { HttpClient } from "@angular/common/http";

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

        return this.httpClient.post("", requestBody); // todo: implement url
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