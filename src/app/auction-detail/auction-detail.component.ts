import { Component, OnInit } from '@angular/core';
import { Auction } from 'src/models/auction.model';
import { AuctionsService } from '../../shared/auctions.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../shared/user.service';

@Component({
  selector: 'app-auction-detail',
  templateUrl: './auction-detail.component.html',
  styleUrls: ['./auction-detail.component.css']
})
export class AuctionDetailComponent implements OnInit {
  public auction: Auction;
  public isErrorRetrievingAuction = false;
  public isUserAuthorOfAuction: boolean;

  constructor(private auctionService: AuctionsService, private userService: UserService, private route: ActivatedRoute) {
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

  private isUserPermittedToSeeBid(): boolean {
    let isPermitted = this.isUserAuthorOfAuction;

    if (!isPermitted) {
      const matchingPermissions = this.userService.getBidPermissions().filter(permission => {
        return permission.auctionId === this.auction.id;
      });
      isPermitted = matchingPermissions.filter(permission => {
        return permission.isAllBidsViewable();
      }).length > 0;

      if (!isPermitted) {
        isPermitted = matchingPermissions.filter(permission => {
          return permission.bidId === this.auction.highestBid.id;
        }).length > 0;
      }
    }

    return isPermitted;
  }
}
