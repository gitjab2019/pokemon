import { Component, Input, input } from '@angular/core';
import { Pokemon } from '../interfaces/pokemon.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonLight } from '../interfaces/pokemonlight.interface';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.css',
})
export class PokemonDetailComponent {
  @Input() pokePadre!: PokemonLight;
}
