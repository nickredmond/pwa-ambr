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
  public isEnteringNewCard = false;

  public cardErrorMessage: string;

  private paymentType: string;
  private selectedPaymentMethodId: string;

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

  public getCardDisplayName(cardBrand: string, lastFourDigits: number): string {
    return cardBrand + " ***" + lastFourDigits;
  }

  public onSelectedPaymentMethodChange($event): void {
    const cardIdValue = this.paymentMethodSelect.nativeElement.value;
    if (cardIdValue === this.NEW_CARD_VALUE) {
      this.isEnteringNewCard = true;
    } else {
      this.isEnteringNewCard = false;
      this.selectedPaymentMethodId = cardIdValue;
    }
  }

  public async onPaymentSubmit(): Promise<void> {
    if (true) { // is amount entered
      await this.processPayment();
    } else {

    }
  }

  private async processPayment(): Promise<void> {
    if (this.isEnteringNewCard) {
      await this.authorizeNewCard();
      if (this.selectedPaymentMethodId) {
        this.submitPaymentToServer();
      }
    } else if (this.selectedPaymentMethodId && this.selectedPaymentMethodId.length > 0) {
      this.submitPaymentToServer();
    } else {
      // no payment method selected
    }
  }

  private submitPaymentToServer(): void {

  }

  private async authorizeNewCard(): Promise<void> {
    const { token, error } = await stripe.createToken(this.card);
    // todo: add loading spinner?
    if (error) {
      this.cardErrorMessage = "There was a problem authorizing your card.";
    } else {
      this.cardErrorMessage = null;
      console.log("success! ", token);
      // todo: set this.selectedPaymentMethodId
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
