import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  providers: [UserService]
})
export class LoginComponent {
  public title: string = 'Identifícate';
  public user: User = new User('', '', '', '', '', '', '', '');

  constructor(private _router: Router, private _userService: UserService) {}

  ngOnInit() {
    console.log('Componente de login cargado...');
  }

  onSubmit(loginForm: any) {
    this._userService.login(this.user).subscribe(
      (response: any) => {
        console.log('Respuesta del servidor:', response);
        if (response.token && response.user) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            console.log('Token y usuario almacenados en localStorage');
            alert('Identificación correcta');
            this._router.navigate(['/home']);
          }
        } else {
          console.error('No se recibió el token o el usuario en la respuesta.');
        }
      },
      (error: any) => {
        console.error('Error al iniciar sesión:', error);
      }
    );
  }
}
