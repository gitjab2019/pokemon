import { Component, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Pokemon } from '../interfaces/pokemon.interface';
import { CommonModule } from '@angular/common';
import { PokemonDetailComponent } from '../pokemon-detail/pokemon-detail.component';
import { SingletondataService } from '../services/data/singletondata.service';
import { PokemonLight } from '../interfaces/pokemonlight.interface';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  imports: [FormsModule, CommonModule, PokemonDetailComponent],
})
export default class HeroComponent {
  pokeId!: number;
  @Output() pokemon?: PokemonLight;
  errorMessage!: string;
  aPokeFromApi?: Pokemon;

  pokeService = inject(SingletondataService);

  constructor() {}

  async getPokemonFromApiToFront(): Promise<void> {
    try {
      const poke = await this.pokeService.getPokemonAsPromiseFromAPI(
        this.pokeId
      );
      console.log(poke);
      let pokeLocation = this.pokeService.findPokemonInRepo(this.pokeId);
      if (poke && pokeLocation == -1) {
        let aPokeLight: PokemonLight = {
          id: poke.id.toString(),
          name: poke.name,
          sprite: poke.sprites.front_default,
        };
        this.pokemon = aPokeLight;
        this.pokeService.addPokemon(aPokeLight);
        this.pokeService.postPokemonToRepo(aPokeLight);
      } else {
        if (pokeLocation != -1)
          this.pokemon = this.pokeService.pokemonList[pokeLocation];
      }
    } catch {
      () => console.log('error creating a new pokemon from API');
    }
  }

  addPokemonRepo(newPokemon: Pokemon): void {
    this.pokeService.postPokemon2Repo(newPokemon).subscribe({
      next: (newPokemon) => console.log(newPokemon),
      error: (error) => {
        this.errorMessage = error;
        console.error('There was an error!', error);
      },
    });
  }
}
