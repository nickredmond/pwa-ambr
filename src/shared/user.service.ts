import { Injectable } from "@angular/core";
import { PaymentMethod } from "../models/paymentMethod.model";
import { Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { User } from "../models/user.model";
import { RegistrationStatus } from "../models/registrationStatus.enum";
import { LoginStatus } from "../models/loginStatus.enum";
import { environment } from "../environments/environment";
import { BidPermission } from "../models/bidPermission.model";

@Injectable()
export class UserService {
    private paymentMethods: PaymentMethod[];
    private currentUserToken: string; // todo: make token expire
    private currentUserId: string; // todo: implement this, return and set on register/login
    private currentBidPermissions: BidPermission[] = []; // todo: implement this on back-end too
    // todo: check user token before ever doing an action on the back-end

    constructor(private httpClient: HttpClient) {}

    public isUserLoggedIn(): boolean {
        const userToken = this.getUserToken();
        return userToken && userToken.length > 0; // todo: check expiry and get refresh token somewhere
    }

    public register(user: User): Observable<any> {
        const requestBody = {
            requestType: "register",
            user
        };
        return this.performAuthRequest(requestBody);
    }
    public logIn(user: User): Observable<any> {
        const requestBody = {
            requestType: "login",
            user
        };
        return this.performAuthRequest(requestBody);
    }
    public resetPassword(emailAddress: string): void {
        // todo: implement this
    }

    public processRegistrationResult(responseBody: any): RegistrationStatus {
        const messageBody = this.IsJsonString(responseBody.body) ? JSON.parse(responseBody.body) : responseBody.body.toString();
        let resultStatus = RegistrationStatus.ErrorRegisteringUser;

        if (messageBody.isUserLoggedIn === true) {
            resultStatus = RegistrationStatus.UserCreatedSuccessfully;
            this.setUserToken(messageBody.apiToken);
            this.setUserId(messageBody.userId);
            this.setBidPermissions(messageBody.bidPermissions);
        } else if (messageBody.isUserAlreadyExists === true) {
            resultStatus = RegistrationStatus.UserAlreadyExists;
        }

        return resultStatus;
    }
    public processLoginResult(responseBody: any): LoginStatus {
        const messageBody = this.IsJsonString(responseBody.body) ? JSON.parse(responseBody.body) : responseBody.body.toString();
        let resultStatus = LoginStatus.ErrorLoggingIn;

        if (messageBody.isUserLoggedIn === true) {
            resultStatus = LoginStatus.UserLoggedIn;
            this.setUserToken(messageBody.apiToken);
            this.setUserId(messageBody.userId);
            this.setBidPermissions(messageBody.bidPermissions);
        } else if (messageBody.isUserNotFound === true) {
            resultStatus = LoginStatus.UserNotFound;
        } else if (responseBody.statusCode === 401) {
            resultStatus = LoginStatus.IncorrectPassword;
        }

        return resultStatus;
    }

    public getUserId(): string {
        let userId = this.currentUserId;
        if (!userId) {
            userId = window.localStorage.getItem("currentUserId");
        }
        return userId;
    }

    public getBidPermissions(): BidPermission[] {
        let permissions = this.currentBidPermissions;
        if (!permissions) {
            permissions = JSON.parse(window.localStorage.getItem("userBidPermissions"));
        }
        return permissions;
    }

    private setUserId(userId: string): void {
        this.currentUserId = userId;
        window.localStorage.setItem("currentUserId", userId);
    }
    private setBidPermissions(permissions: BidPermission[]): void {
        this.currentBidPermissions = permissions;
        window.localStorage.setItem("userBidPermissions", JSON.stringify(permissions));
    }

    private getUserToken(): string {
        let userToken = this.currentUserToken;
        if (!userToken) {
            userToken = window.localStorage.getItem("currentUserToken");
        }
        return userToken;
    }
    private setUserToken(userToken: string): void {
        this.currentUserToken = userToken;
        window.localStorage.setItem("currentUserToken", userToken);
        // todo: set expiry, and possibly refresh token
    }

    public getSavedPaymentMethods(): Observable<PaymentMethod[]> {
        return this.paymentMethods ? of(this.paymentMethods) : this.loadSavedPaymentMethods();
    }

    private performAuthRequest(body: any): Observable<any> {
        const options = {
            headers: { "x-api-key": environment.apiKey }
        };
        const userServiceUrl = "https://494emnupx8.execute-api.us-east-1.amazonaws.com/beta/ambr-mongo-users";
        return this.httpClient.post(userServiceUrl, body, options);
    }

    private loadSavedPaymentMethods(): Observable<PaymentMethod[]> {
        // todo: implement http call to user-get-tokens lambda
        this.paymentMethods = [
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
        ];
        return of(this.paymentMethods);
    }

    private IsJsonString(str): boolean {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
}