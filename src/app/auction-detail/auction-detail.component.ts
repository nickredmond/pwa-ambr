import { Component, OnInit } from '@angular/core';
import { Auction } from 'src/models/auction.model';
import { AuctionsService } from '../../shared/auctions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/user.service';

@Component({
  selector: 'app-auction-detail',
  templateUrl: './auction-detail.component.html',
  styleUrls: ['./auction-detail.component.css']
})
export class AuctionDetailComponent implements OnInit {
  public auction: Auction;
  public isErrorRetrievingAuction = false;
  public isUserAuthorOfAuction: boolean; // todo: used to cancel donation -- implement cancel, and CHECK to make sure logged in user can do that!

  constructor(private auctionService: AuctionsService, private userService: UserService, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const auctionId = params["id"];
      this.auctionService.getAuctionById(auctionId).subscribe(
        auction => {
          this.auction = auction;
          this.isUserAuthorOfAuction = this.auction.item.ownerUserId === this.userService.getUserId();
        },
        error => {
          this.isErrorRetrievingAuction = true;
        }
      );
    });
  }

  public getTargetCharityName(): string {
    const charityName = this.auction.charity ? this.auction.charity.name : "TBD (winner selects recipient of proceeds)";
    return charityName;
  }

  public getHighestBidValue(): string {
    const highestBidAmount = this.auction.highestBid ? this.auction.highestBid.amount.toString() : "0";
    return this.isUserPermittedToSeeBid() ? highestBidAmount : "??? (place bid or donation to unlock)";
  }

  public onPlaceBidClick(): void {
    this.goToPaymentPage("bid");
  }
  public onMakeDonationClick(): void {
    this.goToPaymentPage("donate");
  }

  private isUserPermittedToSeeBid(): boolean { //todo: BAD, THIS CAN BE JAIL-BROKEN EASILY
    // todo: userService.requestHighestBid(this.auction.id) // this.getUserToken() in userService
    return false;
  }

  private goToPaymentPage(paymentType: string): void {
    this.router.navigate(["auction", this.auction.id, paymentType]);
  }
}
