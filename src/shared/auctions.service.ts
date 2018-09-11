import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Auction } from "src/models/auction.model";

@Injectable()
export class AuctionsService {
    private _selectedAuction: Auction;

    public setSelectedAuction(selectedAuction: Auction): void {
        this._selectedAuction = selectedAuction;
    }
    public getAuctionById(auctionId: string): Observable<Auction> {
        let auctionRequest: Observable<Auction> = null;

        if (this._selectedAuction.id === auctionId) {
            auctionRequest = of(this._selectedAuction);
        } else {
            auctionRequest = this.retrieveAuctionById(auctionId);
        }

        return auctionRequest;
    }

    public getAuctions(skip: number, take: number): Observable<Auction[]> {
        return this.retrieveAuctions(null, skip, take);
    }

    public searchAuctions(query: string, skip: number, take: number): Observable<Auction[]> {
        return this.retrieveAuctions(query, skip, take);
    }

    private retrieveAuctions(query: string, skip: number, take: number): Observable<Auction[]> {
        return of(<Auction[]>[
            {
                id: "5b946934e553f483ccd98dc7",
                item: {
                    name: "Xbox One",
                    estimatedMarketValue: 350,
                    description: "New Xbox One, never used, mint condition. Console only (no controllers or games).",
                    ownerUserId: "5b946934e553f483ccd98dc7",
                    imageSource: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Xbox-One-Console-wController-FL.jpg/1280px-Xbox-One-Console-wController-FL.jpg"
                },
                charity: {
                    "name":"ASPCA",
                    "imageSource":"https://yt3.ggpht.com/a-/ACSszfEfeCYUch7EDA1EthYdxHUKsoF_nqFhHm8nKA=s900-mo-c-c0xffffffff-rj-k-no",
                    "description":"Learn more about the ASPCA's work to rescue animals from abuse, pass humane laws and share resources with shelters nationwide. Join our fight today!","website":"https://www.aspca.org/"
                },
                highestBid: {
                    amount: 100,
                    userId: "5b9474762b9c5683cb1f0ec1" // ambr.user@gmail.com
                }
            },
            {
                id: "5b95f7e1093ede4b0b543ff8",
                item: {
                    name: "CandyLand Board Game",
                    estimatedMarketValue: 30,
                    description: "CandyLand board game, unused. Purchased and delivered after auction ends.",
                    ownerUserId: null,
                    imageSource: "https://images-na.ssl-images-amazon.com/images/I/91yUG40gv0L._SX425_.jpg"
                },
                charity: null,
                highestBid: {
                    amount: 5,
                    userId: "5b95f7e1093ede4b0b543ff8"
                }
            },
            {
                id: "5b947e7b2b9c5643d41f0ec2",
                item: {
                    name: "Used Ford F-250 Super Duty",
                    estimatedMarketValue: 9500,
                    description: "Need to get rid of this truck. It's fared me well, runs well, new tires and brakes. Bought a new truck and am donating this to charity because I'm a philanthropist.",
                    ownerUserId: "5b947e7b2b9c5643d41f0ec2",
                    imageSource: "https://pictures.dealer.com/f/freeholdfordfd/0045/308240c6520292344daa1167f8b4e7ccx.jpg?impolicy=resize&w=650"
                },
                charity: null, // user can choose whether or not proceeds go to charity of their choice
                highestBid: null
            },
            {
                id: "5b9474762b9c5683cb1f0ec1",
                item: {
                    name: "Xbox One",
                    estimatedMarketValue: 350,
                    description: "New Xbox One, never used, mint condition. Console only (no controllers or games).",
                    ownerUserId: "5b946934e553f483ccd98dc7",
                    imageSource: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Xbox-One-Console-wController-FL.jpg/1280px-Xbox-One-Console-wController-FL.jpg"
                },
                charity: {
                    "name":"ASPCA",
                    "imageSource":"https://yt3.ggpht.com/a-/ACSszfEfeCYUch7EDA1EthYdxHUKsoF_nqFhHm8nKA=s900-mo-c-c0xffffffff-rj-k-no",
                    "description":"Learn more about the ASPCA's work to rescue animals from abuse, pass humane laws and share resources with shelters nationwide. Join our fight today!","website":"https://www.aspca.org/"
                },
                highestBid: {
                    amount: 100,
                    userId: "5b9474762b9c5683cb1f0ec1" // ambr.user@gmail.com
                }
            },
            {
                id: "5b95f7e1093ede4b0b543ff8",
                item: {
                    name: "CandyLand Board Game",
                    estimatedMarketValue: 30,
                    description: "CandyLand board game, unused. Purchased and delivered after auction ends.",
                    ownerUserId: null,
                    imageSource: "https://images-na.ssl-images-amazon.com/images/I/91yUG40gv0L._SX425_.jpg"
                },
                charity: null,
                highestBid: {
                    amount: 5,
                    userId: "5b95f7e1093ede4b0b543ff8"
                }
            },
            {
                id: "5b947e7b2b9c5643d41f0ec2",
                item: {
                    name: "Used Ford F-250 Super Duty",
                    estimatedMarketValue: 9500,
                    description: "Need to get rid of this truck. It's fared me well, runs well, new tires and brakes. Bought a new truck and am donating this to charity because I'm a philanthropist.",
                    ownerUserId: "5b947e7b2b9c5643d41f0ec2",
                    imageSource: "https://pictures.dealer.com/f/freeholdfordfd/0045/308240c6520292344daa1167f8b4e7ccx.jpg?impolicy=resize&w=650"
                },
                charity: null, // user can choose whether or not proceeds go to charity of their choice
                highestBid: null
            }
        ]);
    }

    private retrieveAuctionById(auctionId: string): Observable<Auction> {
        return of(<Auction>{
            item: {
                name: "test item",
                description: "this is an item",
                estimatedMarketValue: 1000,
                imageSource: "https://www.219group.com/wp-content/uploads/2018/06/placeholder.png",
                ownerUserId: null
            },
            charity: null,
            highestBid: { amount: 300, userId: "5b9474762b9c5683cb1f0ec1" },
            id: auctionId
        });
    }
}