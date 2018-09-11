import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AuctionsComponent } from './auctions/auctions.component';
import { UserService } from '../shared/user.service';
import { HttpClientModule } from '@angular/common/http';
import { AuctionsService } from '../shared/auctions.service';
import { AuctionDetailComponent } from './auction-detail/auction-detail.component';
import { PaymentComponent } from './payment/payment.component';
import { PaymentService } from '../shared/payment.service';

const appRoutes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "auctions", component: AuctionsComponent },
  { path: "auction/:id", component: AuctionDetailComponent },
  { path: "auction/:id/:paymentType", component: PaymentComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AuctionsComponent,
    AuctionDetailComponent,
    PaymentComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    UserService,
    AuctionsService,
    PaymentService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
