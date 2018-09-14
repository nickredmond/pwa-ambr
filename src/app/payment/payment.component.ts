import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionsService } from 'src/shared/auctions.service';
import { PaymentService } from '../../shared/payment.service';
import { UserService } from '../../shared/user.service';
import { PaymentMethod } from '../../models/paymentMethod.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LoadingModalComponent } from '../loading-modal/loading-modal.component';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  public NEW_CARD_VALUE = "--NEW_CARD--";
  public DEFAULT_SUBMISSION_ERROR_MESSAGE = "Oops! There was a problem submitting your payment.";
  @ViewChild("paymentMethodSelect") paymentMethodSelect: ElementRef;
  @ViewChild("cardInfo") cardInfoInput: ElementRef;
  @ViewChild("paymentProcessingModal") paymentProcessingModal: LoadingModalComponent;

  public paymentAmountLabelText: string;
  public pageName: string;
  public auctionId: string;
  public auctionItemName: string;
  public paymentMethods: PaymentMethod[];
  public isEnteringNewCard = false; // todo (v2): add option to "save" card for future use (mark as isSaved or whatever)
  public paymentAmount: string; 

  public cardErrorMessage: string;
  public isPaymentAmountError = false;
  public isSelectedPaymentMethodBlank = false;
  public paymentSubmissionErrorMessage: string;

  public isPaymentProcessed = false;

  private paymentType: string;
  private selectedPaymentMethod: PaymentMethod;

  // Stripe element
  private card: any;
  private cardHandler = this.onCardInfoChange.bind(this);

  constructor(private auctionService: AuctionsService, private paymentService: PaymentService, 
      private userService: UserService, private route: ActivatedRoute, private changeDetector: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const auctionId = params["id"];
      this.setPaymentType(params["paymentType"]);

      this.auctionService.getAuctionById(auctionId).subscribe(
        auction => {
          this.auctionId = auction.id;
          this.auctionItemName = auction.item.name;
        },
        error => {
          // todo: error handling
          console.log("ERROR retrieving current auction.");
        }
      );

      this.paymentService.getPaymentMethods(this.userService.getUserToken()).subscribe(
        paymentMethods => {
          this.paymentMethods = paymentMethods;
        },
        error => {
          // todo: error handling
          console.log("ERROR getting payment methods");
        }
      )
    });
  }

  ngAfterViewInit() {
    this.card = elements.create("card");
    this.card.mount(this.cardInfoInput.nativeElement);
    this.card.addEventListener("change", this.cardHandler);
  }

  ngOnDestroy() {
    this.card.removeEventListener("change", this.cardHandler);
    this.card.destroy();
  }

  public onBlur() {
    this.isPaymentAmountError = !this.paymentAmount;
    if (this.paymentAmount) {
      const paymentValue = this.paymentAmount.toString();
      if (paymentValue.indexOf(".") < 0 || !paymentValue.split(".")[1]) {
        this.paymentAmount += ".00";
      } else if (this.isOnlyOneDecimalPlace(paymentValue)) {
        this.paymentAmount += "0";
      }
    }
  }

  public getCardDisplayName(cardBrand: string, lastFourDigits: number): string {
    return cardBrand + " ***" + lastFourDigits;
  }

  public onSelectedPaymentMethodChange($event): void {
    const cardIdValue = this.paymentMethodSelect.nativeElement.value;
    if (cardIdValue === this.NEW_CARD_VALUE) {
      this.isEnteringNewCard = true;
    } else {
      this.isEnteringNewCard = false;
      this.selectedPaymentMethod = this.paymentMethods.find(paymentMethod => {
        return paymentMethod.tokenId === cardIdValue;
      });
    }
  }

  public onPaymentAmountInput($event) {
    const character = String.fromCharCode($event.keyCode);
    const existingValue = this.paymentAmount || "";
    const newValue = existingValue + character;
    if (isNaN(parseFloat(newValue)) || this.isHasDecimalPlace(newValue, 3)) {
      $event.preventDefault();
    }
  }

  public async onPaymentSubmit(): Promise<void> {
    if (this.isEnteringNewCard) {
      await this.authorizeNewCard();
    }

    this.isPaymentAmountError = !this.paymentAmount;
    this.isSelectedPaymentMethodBlank = !this.selectedPaymentMethod;

    if (this.paymentAmount && this.selectedPaymentMethod) {
      this.paymentProcessingModal.show();
      await this.submitPaymentToServer();
    }
  }

  private isHasDecimalPlace(value: string, numberOfPlaces: number): boolean {
      var pointIndex = value.indexOf('.');
      return  pointIndex >= 0 && pointIndex < value.length - numberOfPlaces;
  }
  private isOnlyOneDecimalPlace(value: string): boolean {
    const valueParitions = value.split(".");
    return valueParitions[1] && valueParitions[1].length === 1;
  }

  private submitPaymentToServer(): void {
    const userToken = this.userService.getUserToken();
    this.paymentSubmissionErrorMessage = null;

    this.paymentService.submitPayment(userToken, this.auctionId, this.selectedPaymentMethod, parseFloat(this.paymentAmount), this.paymentType, this.isEnteringNewCard)
      .subscribe(
        response => {
          const paymentResult = this.paymentService.processPaymentResult(response);

          if (paymentResult.isSuccess) {
            this.isPaymentProcessed = true;
          } else if (paymentResult.isCardDeclined) {
            this.paymentSubmissionErrorMessage = "Your card has been declined.";
          } else {
            this.paymentSubmissionErrorMessage = this.DEFAULT_SUBMISSION_ERROR_MESSAGE;
          }

          this.paymentProcessingModal.hide();
        },
        error => {
          console.log("oh that's rich", error);
          this.paymentSubmissionErrorMessage = this.DEFAULT_SUBMISSION_ERROR_MESSAGE;
        }
      );
  }

  private async authorizeNewCard(): Promise<void> {
    // todo: add loading spinner?
    const { token, error } = await stripe.createToken(this.card);
    
    if (error) {
      this.cardErrorMessage = "There was a problem authorizing your card.";
    } else {
      this.cardErrorMessage = null;
      this.selectedPaymentMethod = <PaymentMethod>{
        tokenId: token.id,
        cardBrand: token.card.brand,
        lastFourDigits: token.card.last4
      };
    }
  }

  private onCardInfoChange({ error }): void {
    if (error) {
      this.cardErrorMessage = error.message;
    } else {
      this.cardErrorMessage = null;
    }
    this.changeDetector.detectChanges();
  }

  private setPaymentType(type: string): void {
    if (type === "bid") {
      this.paymentType = "bid";
      this.paymentAmountLabelText = "Bid Amount";
      this.pageName = "Place Bid";
    } else {
      this.paymentType = "donation";
      this.paymentAmountLabelText = "Donation Amount";
      this.pageName = "Make Donation";
    }
  }
}
