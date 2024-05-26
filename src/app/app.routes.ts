import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { PokemonDetailComponent } from './pokemon-detail/pokemon-detail.component';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./hero/hero.component') },
  { path: 'search', loadComponent: () => import('./hero/hero.component') },
  {
    path: 'listar',
    loadComponent: () => import('./listado/listado.component'),
  },
  {
    path: 'aboutus',
    loadComponent: () => import('./aboutus/aboutus.component'),
  },
];
