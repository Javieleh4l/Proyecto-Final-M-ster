import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { User } from "@app/models/user";
import { UserService } from "@app/services/user.service";
import { CommonModule } from '@angular/common';
import { NgForm,FormsModule } from '@angular/forms';  // Importa NgForm para manejar formularios


@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  standalone: true,
  imports: [CommonModule],
  providers: [UserService]
})
export class UsersComponent implements OnInit {
  public title: string;
  public identity: User | null;
  public token: string | null;
  public page: number;
  public next_page: number;
  public prev_page: number;
  public status: string;
  public users: User[];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) {
    this.title = 'Gente';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.page = 1;
    this.next_page = 2;
    this.prev_page = 1;
    this.status = '';
    this.users = [];
  }

  ngOnInit() {
    console.log('users.component.ts cargado');
    this.actualPage();
  }

  actualPage() {
    this._route.params.subscribe(params => {
      let page = +params['page'];
      if (!page) {
        page = 1;
      }
      console.log('Page from route params:', page);
      this.page = page;
      this.next_page = page + 1;
      this.prev_page = page - 1;

      if (this.prev_page <= 0) {
        this.prev_page = 1;
      }

      // Devolver listado de usuarios
      this.getUsers(page);
    });
  }

  getUsers(page: number) {
    console.log('Fetching users for page:', page);
    this._userService.getUsers(page).subscribe(
      response => {
        console.log('API response:', response);
        if (!response.users) {
          this.status = 'error';
        } else {
          this.users = response.users;
          console.log('Users:', this.users);
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log('Error:', errorMessage);

        if (errorMessage != null) {
          this.status = 'error';
        }
      }
    );
  }
}
