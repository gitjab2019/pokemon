import { Component, NgModule, OnInit, Output, inject } from '@angular/core';
import { Pokemon } from '../interfaces/pokemon.interface';
import { CommonModule } from '@angular/common';
import { PokemonDetailComponent } from '../pokemon-detail/pokemon-detail.component';
import { FormsModule } from '@angular/forms';
import { SingletondataService } from '../services/data/singletondata.service';
import { PokemonLight } from '../interfaces/pokemonlight.interface';

@Component({
  selector: 'app-listado',
  standalone: true,
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.css',
  imports: [CommonModule, PokemonDetailComponent, FormsModule],
})
export default class ListadoComponent implements OnInit {
  @Output() pokemon!: PokemonLight;
  editingPokemon: boolean[] = [];
  errorMessage!: String;
  currentPokemon!: number;
  loaded!: boolean;
  pokemons!: PokemonLight[];

  constructor(private aPokeService: SingletondataService) {}

  ngOnInit() {
    this.pokemons = this.aPokeService.getPokemonAll();
  }

  editPokemonOn(id: number): void {
    this.editingPokemon[id] = true;
    this.currentPokemon = id;
    console.log(this.editingPokemon);
  }

  editPokemonOff(): void {
    if (!this.pokemons[this.currentPokemon]) {
      console.error('Pokemon no encontrado en la lista');
      return;
    }

    console.log(this.pokemons[this.currentPokemon].name);
    const pokemonToUpdate = this.pokemons[this.currentPokemon];

    if (!pokemonToUpdate.id) {
      console.error('Pokemon ID no encontrado');
      return;
    }

    this.editingPokemon[this.currentPokemon] = false;

    this.aPokeService
      .putPokemon2Repo(this.pokemons[this.currentPokemon])
      .subscribe({
        next: () => console.log('Pokemon Actualizado con exito'),
        error: () => console.log('error actualizando pokemon'),
      });
  }

  async getMorePokemonsFromApi(): Promise<void> {
    let i: number = 0;
    let j: number = 1;

    while (i < 10) {
      if (this.aPokeService.findPokemonInRepo(j) == -1) {
        try {
          const pokemon = await this.aPokeService.getPokemonAsPromiseFromAPI(j);

          if (pokemon) {
            let aPokeLight: PokemonLight = {
              id: pokemon.id.toString(),
              name: pokemon.name,
              sprite: pokemon.sprites.front_default,
            };
            this.aPokeService.addPokemon(aPokeLight);
            this.aPokeService.postPokemonToRepo(aPokeLight);
            i++; // Incrementar i solo si se añade un nuevo Pokemon
          }
        } catch (error) {
          console.error(`Failed to get Pokemon with id ${j}:`, error);
        }
      }
      j++; // Incrementar j para seguir con el siguiente Pokemon
    }
  }

  async deletePoke(j: number): Promise<void> {
    try {
      const pokeDeleted =
        await this.aPokeService.deletePokemonFromRepoAsPromise(
          parseInt(this.pokemons[j].id)
        );
    } catch (error: any) {
      console.error(`Failed to get Pokemon with id:`, error);
    }
    this.pokemons.splice(j, 1);
  }
}
