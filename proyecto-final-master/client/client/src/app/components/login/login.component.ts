import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule, FormsModule], // Agrega CommonModule aquí
  templateUrl: './login.component.html',
  providers: [UserService]
})
export class LoginComponent {
  public title: string = 'Identifícate'; // Título del componente
  public user: User = new User('', '', '', '', '', '', '', ''); // Declara la propiedad 'user'

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) {}

  ngOnInit() {
    console.log('Componente de login cargado...'); // Mensaje de carga del componente
  }

  onSubmit(loginForm: any) {
    console.log(loginForm.value); // Muestra los valores del formulario en la consola
    // Aquí puedes agregar la lógica para iniciar sesión con el formulario
    this._userService.login(this.user).subscribe(
      (response: any) => {
        if (response.token) {
          console.log('Token:', response.token); // Imprime el token en la consola
        } else {
          console.error('No se recibió el token en la respuesta.');
        }
      },
      (error: any) => {
        console.error('Error al iniciar sesión:', error);
      }
    );
  }

  // Método para registrar y luego iniciar sesión automáticamente
  registerAndLogin() {
    // Aquí puedes agregar la lógica para registrar un usuario y luego iniciar sesión automáticamente
    const newUser = new User('', '', '', '', '', '', '', ''); // Crea una nueva instancia de User
    this._userService.register(newUser).subscribe(
      (response: any) => { // Especifica el tipo de response como any
        if (response.user && response.user._id) {
          // Usuario registrado con éxito, ahora intenta iniciar sesión automáticamente
          this._userService.login(newUser).subscribe(
            () => { // No necesitas usar loginResponse aquí
              // Manejar la respuesta del inicio de sesión, como redirigir a una página después del inicio de sesión
              console.log('Usuario inició sesión automáticamente después de registrar');
            },
            (error: any) => { // Especifica el tipo de error como any
              console.error('Error al iniciar sesión automáticamente:', error);
            }
          );
        } else {
          console.error('Error al registrar usuario:', response.error);
        }
      },
      (error: any) => { // Especifica el tipo de error como any
        console.error('Error al registrar usuario:', error);
      }
    );
  }
}
