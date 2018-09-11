import { Component, OnInit } from '@angular/core';
import { Auction } from 'src/models/auction.model';
import { AuctionsService } from 'src/shared/auctions.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.css']
})
export class AuctionsComponent implements OnInit {
  public auctions: Auction[];
  public isServerError = false;

  constructor(private auctionsService: AuctionsService, private router: Router) { }

  ngOnInit() {
    this.auctionsService.getAuctions(0, 20).subscribe(
      (auctions) => {
        this.auctions = auctions;
      },
      (error) => {
        this.isServerError = true;
      }
    );
  }

  public getBriefDescription(description: string): string {
    const ending = description.length > 200 ? "..." : "";
    return description.substring(0, 200) + ending;
  }

  public onAuctionClick(auction: Auction): void {
    this.auctionsService.setSelectedAuction(auction);
    this.router.navigate(["auction", auction.id]);
  }
}
