import { Component, OnInit } from '@angular/core';
import { NgForm,FormsModule } from '@angular/forms';  // Importa NgForm para manejar formularios
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user-edit.component.html',
})
export class UserEditComponent implements OnInit {
  public title: string = 'Editar perfil';
  public user: any;
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.user = '...';
    this.loadUserProfile(); // Llama aquí a la función para cargar el perfil del usuario
  }


  loadUserProfile() {
    this.userService.getUserProfile().subscribe(

      (data) => {
        this.user = data; // asume que la API devuelve los datos del usuario
        console.log('Datos del usuario cargados:', this.user);
      },
      (error) => {
        console.error('Error al cargar los datos del usuario:', error);
      }
    );
  }

  onSubmit(userEditForm: NgForm): void {
    if (userEditForm.valid) {
      this.userService.updateUserProfile(this.user).subscribe(
        response => {
          console.log('Datos actualizados correctamente:', response);
          // Puedes redirigir al usuario a otra página después de guardar los cambios si es necesario
        },
        error => {
          console.error('Error al actualizar los datos del usuario:', error);
        }
      );
    } else {
      console.error('El formulario no es válido.');
    }
  }

  /*loadUserProfile(): void {
    try {
      this.userService.getUserProfile().subscribe(
        response => {
          this.user = response.user;
        },
        error => {
          console.error('Error al cargar los datos del usuario:', error);
          // Puedes manejar el error aquí, por ejemplo, redirigiendo a la página de inicio de sesión
        }
      );
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
      // Manejar el error, por ejemplo, redirigiendo a la página de inicio de sesión
    }
  }*/


  /*loadUserProfile(): void {
    this.userService.getUserProfile().subscribe(
      response => {
        this.user = response.user;
      },
      error => {
        console.error('Error al cargar los datos del usuario:', error);
      }
    );
  }

  onSubmit(userEditForm: NgForm): void {
    if (userEditForm.valid) {
      this.userService.updateUserProfile(this.user).subscribe(
        response => {
          console.log('Datos actualizados correctamente:', response);
          // Puedes redirigir al usuario a otra página después de guardar los cambios si es necesario
        },
        error => {
          console.error('Error al actualizar los datos del usuario:', error);
        }
      );
    } else {
      console.error('El formulario no es válido.');
    }
  }*/
}
