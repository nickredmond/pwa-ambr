import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionsService } from 'src/shared/auctions.service';
import { PaymentService } from '../../shared/payment.service';
import { UserService } from '../../shared/user.service';
import { PaymentMethod } from '../../models/paymentMethod.model';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  public NEW_CARD_VALUE = "--NEW_CARD--";
  @ViewChild("paymentMethodSelect") paymentMethodSelect: ElementRef;
  @ViewChild("cardInfo") cardInfoInput: ElementRef;

  public paymentAmountLabelText: string;
  public pageName: string;
  public auctionId: string;
  public auctionItemName: string;
  public paymentMethods: PaymentMethod[];
  public isEnteringNewCard = false; // todo (v2): add option to "save" card for future use (mark as isSaved or whatever)
  public paymentAmount: number; 

  public cardErrorMessage: string;
  public isPaymentAmountError = false;
  public isSelectedPaymentMethodBlank = false;

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
    this.isPaymentAmountError = !this.paymentAmount;
    this.isSelectedPaymentMethodBlank = !this.selectedPaymentMethod;

    if (this.paymentAmount && this.selectedPaymentMethod) { // todo: is amount entered
      // todo: prevent more than 2 decimal places in payment amount whilst entering
      // todo: lock screen whilst processing
      await this.processPayment();
    }
  }

  private isHasDecimalPlace(value: string, numberOfPlaces: number) {
      var pointIndex = value.indexOf('.');
      return  pointIndex >= 0 && pointIndex < value.length - numberOfPlaces;
  }

  private async processPayment(): Promise<void> {
    if (this.isEnteringNewCard) {
      if (await this.authorizeNewCard()) {
        this.submitPaymentToServer();
      }
    } else {
      this.submitPaymentToServer();
    }
  }

  private submitPaymentToServer(): void {
    const userToken = this.userService.getUserToken();
    this.paymentService.submitPayment(userToken, this.auctionId, this.selectedPaymentMethod, this.paymentAmount, this.paymentType, this.isEnteringNewCard);
  }

  private async authorizeNewCard(): Promise<boolean> {
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

    return !error;
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
    this.paymentType = type;

    if (type === "bid") {
      this.paymentAmountLabelText = "Bid Amount";
      this.pageName = "Place Bid";
    } else {
      this.paymentAmountLabelText = "Donation Amount";
      this.pageName = "Make Donation";
    }
  }
}
