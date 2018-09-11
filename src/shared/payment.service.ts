import { Injectable } from "@angular/core";
import { PaymentMethod } from "src/models/paymentMethod.model";
import { Observable, of } from "rxjs";

@Injectable()
export class PaymentService {
    private _paymentMethods: PaymentMethod[];

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