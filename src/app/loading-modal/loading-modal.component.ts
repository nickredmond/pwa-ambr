import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'loading-modal',
  templateUrl: './loading-modal.component.html',
  styleUrls: ['./loading-modal.component.css']
})
export class LoadingModalComponent implements OnInit {
  @Input() modalText: string;
  @ViewChild("loadingModal") loadingModal: ModalDirective;

  constructor() { }

  ngOnInit() {
  }

  public show(): void {
    this.loadingModal.show();
  }

  public hide(): void {
    this.loadingModal.hide();
  }
}
