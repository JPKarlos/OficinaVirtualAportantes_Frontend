import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import LayoutComponent from '../../../shared/ui/layout.component';
import { DataValidationMessageComponent } from '../../auth/components/data-validation-message.component';
import { AportanteValidationService } from '../../auth/data-access/aportante-validation.service';
import { AuthService } from '../../auth/data-access/auth.service';
import { AfiliadosAsociadosModalComponent } from '../../afiliados/components/afiliados-asociados-modal.component';
import { MoraAportanteModalComponent } from '../../mora/components/mora-aportante-modal.component';
import { IncapacidadesAportanteModalComponent } from '../../incapacidades/components/incapacidades-aportante-modal.component';
import { LicenciasAportanteModalComponent } from '../../licencias/components/licencias-aportante-modal.component';
import { SolicitudesModalComponent } from '../../solicitudes/components/solicitudes-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent, DataValidationMessageComponent, AfiliadosAsociadosModalComponent, MoraAportanteModalComponent, IncapacidadesAportanteModalComponent, LicenciasAportanteModalComponent, SolicitudesModalComponent],
  templateUrl: './home.component.html'
})
export default class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private validationService = inject(AportanteValidationService);
  private router = inject(Router);

  validationResult = this.validationService.validationResult;
  isValidating = this.validationService.isValidating;
  showQuickActions = computed(
    () => this.authService.estadoActualizacion()?.estado === 'MENOR_6_MESES',
  );
  nombreRazonSocial = computed(
    () => this.authService.estadoActualizacion()?.nombreRazonSocial ?? null,
  );
  showAfiliadosModal = signal(false);
  showMoraModal = signal(false);
  showIncapacidadesModal = signal(false);
  showLicenciasModal = signal(false);
  showSolicitudesModal = signal(false);
  aportanteId = computed(
    () =>
      this.authService.getUser()?.Aportante_id ??
      this.authService.getEstadoActualizacion()?.aportanteId ??
      null,
  );

  async ngOnInit() {
    await this.authService.ensureEstadoActualizacion();
  }

  onValidationButtonClicked(
    action: 'update' | 'register' | 'create-aportante' | 'update-ultima-actualizacion',
  ) {
    if (action === 'create-aportante') {
      this.router.navigate(['/aportantes/crear']);
      return;
    }

    if (action === 'update-ultima-actualizacion' || action === 'update') {
      this.router.navigate(['/aportantes/actualizar-datos']);
      return;
    }

    if (action === 'register') {
      console.log('Navegar a formulario de registro');
      // TODO: Implementar navegación al formulario de registro
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  openAfiliadosModal(): void {
    this.showAfiliadosModal.set(true);
  }

  closeAfiliadosModal(): void {
    this.showAfiliadosModal.set(false);
  }

  openMoraModal(): void {
    this.showMoraModal.set(true);
  }

  closeMoraModal(): void {
    this.showMoraModal.set(false);
  }

  openIncapacidadesModal(): void {
    this.showIncapacidadesModal.set(true);
  }

  closeIncapacidadesModal(): void {
    this.showIncapacidadesModal.set(false);
  }

  openLicenciasModal(): void {
    this.showLicenciasModal.set(true);
  }

  closeLicenciasModal(): void {
    this.showLicenciasModal.set(false);
  }

  openSolicitudesModal(): void {
    this.showSolicitudesModal.set(true);
  }

  closeSolicitudesModal(): void {
    this.showSolicitudesModal.set(false);
  }
}
