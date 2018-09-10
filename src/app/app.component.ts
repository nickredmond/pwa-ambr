import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';

import { setTheme } from "ngx-bootstrap/utils";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private userService: UserService, private router: Router) {
    setTheme("bs4");
  }

  ngOnInit() {
    if (this.userService.isUserLoggedIn()) {
        this.router.navigate(["auctions"]);
    }
    else {
        this.router.navigate(["login"]);
    }
  }
}
