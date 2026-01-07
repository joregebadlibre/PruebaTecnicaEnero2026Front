import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render navigation links', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('a[routerLink="/clientes"]')?.textContent).toContain('Clientes');
    expect(el.querySelector('a[routerLink="/cuentas"]')?.textContent).toContain('Cuentas');
    expect(el.querySelector('a[routerLink="/movimientos"]')?.textContent).toContain('Movimientos');
    expect(el.querySelector('a[routerLink="/reportes"]')?.textContent).toContain('Reportes');
  });
});
