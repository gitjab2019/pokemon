import { Injectable } from '@angular/core';
import { Pokemon } from '../../interfaces/pokemon.interface';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, of } from 'rxjs';
import { PokemonLight } from '../../interfaces/pokemonlight.interface';

@Injectable({
  providedIn: 'root',
})
export class SingletondataService {
  pokemonList: PokemonLight[] = [];
  url: string = 'https://pokeapi.co/api/v2/pokemon/';
  urlServer = 'http://localhost:3000/pokemons';
  pokemonLimit: number = 10;
  aPoke!: Pokemon;

  constructor(private http: HttpClient) {
    this.initializeData();
  }

  async initializeData() {
    try {
      this.pokemonList = await this.loadPokemonsFromRepoByPromise();
      console.log(this.pokemonList.length);
      if (this.pokemonList.length === 0) {
        this.loadXPokemonsFromAPI(this.pokemonLimit);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }

  //======= POKEMON API FUNCTIONS=============
  async getPokemonAsPromiseFromAPI(id: number): Promise<Pokemon | undefined> {
    try {
      const result = await fetch(`${this.url}${id}`);
      const pokemon = await result.json();
      return pokemon;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  loadPokemonByIdAsObservable(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.url}${id}`);
  }

  //========== POKEMON ARRAY LIST FUNCTIONS ===========
  deletePokemon(id: number): void {
    this.pokemonList.splice(id, 1);
    this.deletePokemonFromRepoAsObservable(id).subscribe({
      next: () => console.log('Pokemon borrado del repo'),
      error: (error) => console.log(error),
    });
  }
  //adds a Pokemon in the array
  addPokemon(aPoke: PokemonLight | undefined): void {
    if (aPoke) {
      this.pokemonList.push(aPoke);
    } else {
      console.error('Attempted to add an undefined Pokemon.');
    }
  }

  putPokemon(aPoke: PokemonLight, id: number) {
    this.pokemonList[id] = aPoke;
  }

  getPokemonAll(): PokemonLight[] {
    return this.pokemonList;
  }

  loadXPokemonsFromAPI(q: number): void {
    //cargo en el arreglo un número determinado de pokemones dado por pokemonLimit
    let aPokeLight: PokemonLight;
    for (let i = 1; i <= q; i++)
      this.getPokemonAsPromiseFromAPI(i)
        .then((poke) => {
          if (poke) {
            let aPokeLight: PokemonLight = {
              id: poke.id.toString(),
              name: poke.name,
              sprite: poke.sprites.front_default,
            };
            this.addPokemon(aPokeLight);
            this.postPokemonToRepo(aPokeLight);
          }
        })
        .catch((error) => console.log(error));
  }

  //=========(REPO) JSON SERVER FUNCTIONS===========

  postPokemon2Repo(poke: Pokemon): Observable<Pokemon> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    console.log(poke);
    return this.http
      .post<Pokemon>(`${this.urlServer}`, poke, { headers })
      .pipe(catchError(this.handleError<Pokemon>('postPokemon')));
  }

  putPokemon2Repo(poke: PokemonLight): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    console.log(poke);
    return this.http
      .put<void>(`${this.urlServer}/${poke.id}`, poke, { headers })
      .pipe(catchError(this.handleError<void>('postPokemon')));
  }

  findPokemonInRepo(id: number): number {
    const index = this.pokemonList.findIndex(
      (pokemon) => pokemon.id === id.toString()
    );
    return index;
  }

  getPokemonFromRepoById(id: number): Observable<PokemonLight> {
    return this.http.get<PokemonLight>(`${this.urlServer}?id=${id}`);
  }

  /*deletePokemonByIdFromRepo(id: number): ight> {
    return this.http
      .delete<PokemonLight>(`${this.urlServer}/${id}`)
      .pipe(catchError(this.handleError<void>('deletePokemonFromRepo')));
  }*/

  deletePokemonFromRepoAsObservable(id: number): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .delete<void>(`${this.urlServer}/${id}`, { headers })
      .pipe(catchError(this.handleError<void>('delete Pokemon')));
  }

  async deletePokemonFromRepoAsPromise(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.urlServer}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to delete Pokemon with id ${id}:`, error);
    }
  }

  //hace un get del arreglo completo de pokemones en el json server
  getAllPokemonsFromRepo(): Observable<PokemonLight[] | undefined> {
    return this.http.get<PokemonLight[]>(`${this.urlServer}`);
  }

  async postPokemonToRepo(poke: PokemonLight): Promise<PokemonLight> {
    try {
      const response = await fetch(this.urlServer, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(poke),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to post Pokemon`);
    }
  }

  //lee todos los pokemones del JSON Server
  loadPokemonsFromServer(): void {
    this.getAllPokemonsFromRepo().subscribe({
      next: (poke: PokemonLight[] | undefined) => {
        if (poke) {
          this.pokemonList = poke;
        } else {
          this.pokemonList = [];
        }
      },
      error: (error: any) => console.log(error),
    });
  }

  async loadPokemonsFromRepoByPromise(): Promise<PokemonLight[]> {
    try {
      const response = await fetch(this.urlServer, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data as PokemonLight[];
    } catch (error: any) {
      throw new Error(`Failed to load Pokemons: ${error.message}`);
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
