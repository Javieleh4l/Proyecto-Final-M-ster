import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  public title: string;

  constructor(private _router: Router) {
    this.title = 'Bienvenido a Red Social';
  }

  ngOnInit(): void {
    console.log('home.component cargado!!');
  }

  navigateToProfile() {
    this._router.navigate(['/user-edit']);
  }

  navigateToPeople() {
    this._router.navigate(['/users']);
  }
}
