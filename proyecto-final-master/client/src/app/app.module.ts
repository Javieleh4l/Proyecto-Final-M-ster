// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';


// Componentes standalone
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { UsersComponent } from './components/users/users.component';

// Rutas
import { routing, appRoutingProviders } from './app.routing';
import { FormsModule } from '@angular/forms'; // Importa FormsModule

@NgModule({
  declarations: [], // No declares componentes standalone aquí
  imports: [
    BrowserModule,
    routing, // Importa las rutas aquí
    LoginComponent, // Importa componentes standalone aquí
    RegisterComponent,
    HomeComponent, // Importa componentes standalone aquí
    HttpClientModule,
    FormsModule
  ],
  providers: [
    appRoutingProviders // Proveedores de rutas
  ],
  bootstrap: [] // No hay bootstrap en AppModule porque AppComponent es standalone
})
export class AppModule { }
