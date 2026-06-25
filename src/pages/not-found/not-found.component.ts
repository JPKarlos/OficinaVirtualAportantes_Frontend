import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-not-found',
  template: `
    <div class="min-h-screen grid place-content-center gap-4 text-center p-8">
      <h1 class="text-4xl font-bold">404</h1>
      <p class="text-gray-600">Página NO encontrada</p>
      <a
        class="text-blue-600 underline hover:text-blue-800 cursor-pointer"
        routerLink="/home"
        >Ir a la página principal</a
      >
    </div>
  `,
})
export default class NotFoundComponent {}
