import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'register',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './register.component.html',
  providers: [UserService]
})
export class RegisterComponent {
  public title: string;
  public user: User;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) {
    this.title = 'Registrate';
    this.user = new User('', '', '', '', '', '', 'ROLE_USER', '');
  }

  ngOnInit() {
    console.log('Componente de register cargado...');
  }

  onSubmit() {
    this._userService.register(this.user).subscribe(
      response => {
        if (response.user && response.user._id) {
          console.log(this.user);  // Usa this.user en lugar de user
        }
      },
      error => {
        console.log(<any>error);  // Usa error en lugar de errr
        // Manejo de errores, como mostrar un mensaje al usuario
      }
    );
  }
}
