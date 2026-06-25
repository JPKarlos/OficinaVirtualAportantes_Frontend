import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Municipio } from '../interfaces/municipio.interface';
import { CiiuClase } from '../interfaces/ciiu-clase.interface';
import { TipoIdenCont } from '../interfaces/tipo-iden-cont.interface';
import { ClaseAportante } from '../interfaces/clase-aportante.interface';
import { NaturalezaAportante } from '../interfaces/naturaleza-aportante.interface';
import { TipoPersona } from '../interfaces/tipo-persona.interface';
import { TipoAccion } from '../interfaces/tipo-accion.interface';
import { TipoAportanteCont } from '../interfaces/tipo-aportante-cont.interface';
import { FormaPresentacion } from '../interfaces/forma-presentacion.interface';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccesoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  async listMunicipios(search?: string, departamentoIde?: number): Promise<Municipio[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (departamentoIde) {
      params = params.set('departamentoIde', departamentoIde.toString());
    }

    return firstValueFrom(
      this.http.get<Municipio[]>(`${this.baseUrl}/accesoria/municipios/list`, { params }),
    );
  }

  async listCiiuClase(search?: string, ciiuGrupoId?: number): Promise<CiiuClase[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (ciiuGrupoId) {
      params = params.set('ciiuGrupoId', ciiuGrupoId.toString());
    }

    return firstValueFrom(
      this.http.get<CiiuClase[]>(`${this.baseUrl}/accesoria/ciiu-clase/list`, { params }),
    );
  }

  async listTipoIdenCont(search?: string): Promise<TipoIdenCont[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return firstValueFrom(
      this.http.get<TipoIdenCont[]>(`${this.baseUrl}/accesoria/tipo-iden-cont/list`, { params }),
    );
  }

  async listClaseAportante(search?: string): Promise<ClaseAportante[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return firstValueFrom(
      this.http.get<ClaseAportante[]>(`${this.baseUrl}/accesoria/clase-aportante/list`, { params }),
    );
  }

  async listNaturalezaAportante(search?: string): Promise<NaturalezaAportante[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return firstValueFrom(
      this.http.get<NaturalezaAportante[]>(
        `${this.baseUrl}/accesoria/naturaleza-aportante/list`,
        { params },
      ),
    );
  }

  async listTipoPersona(search?: string): Promise<TipoPersona[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return firstValueFrom(
      this.http.get<TipoPersona[]>(`${this.baseUrl}/accesoria/tipo-persona/list`, { params }),
    );
  }

  async listTipoAccion(search?: string): Promise<TipoAccion[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return firstValueFrom(
      this.http.get<TipoAccion[]>(`${this.baseUrl}/accesoria/tipo-accion/list`, { params }),
    );
  }

  async listTipoAportanteCont(search?: string): Promise<TipoAportanteCont[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return firstValueFrom(
      this.http.get<TipoAportanteCont[]>(
        `${this.baseUrl}/accesoria/tipo-aportante-cont/list`,
        { params },
      ),
    );
  }

  async listFormaPresentacion(search?: string): Promise<FormaPresentacion[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return firstValueFrom(
      this.http.get<FormaPresentacion[]>(
        `${this.baseUrl}/accesoria/forma-presentacion/list`,
        { params },
      ),
    );
  }
}
