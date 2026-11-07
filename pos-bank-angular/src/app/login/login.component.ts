import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseError } from '@firebase/app';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private static readonly AUTH_TIMEOUT_MS = 30_000;

  readonly auth = inject(AuthService);
  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
  });
  readonly mfaCode = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{6}$/)] });

  isRegistering = false;
  isResettingPassword = false;
  isMfaPending = false;
  isSubmitting = false;
  feedback = '';
  isError = true;

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  async submit(): Promise<void> {
    if (this.isSubmitting) return;
    this.feedback = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmitting = true;
    let shouldNavigate = false;
    try {
      const { email, password } = this.form.getRawValue();
      if (this.isRegistering) {
        await this.withAuthTimeout(this.auth.signUp(email, password));
        shouldNavigate = true;
      } else {
        this.isMfaPending = !(await this.withAuthTimeout(this.auth.signIn(email, password)));
        shouldNavigate = !this.isMfaPending;
      }
    } catch (error) {
      this.showError(this.mapAuthError(error));
    } finally {
      this.isSubmitting = false;
    }

    if (shouldNavigate) {
      await this.navigateAfterSignIn();
    }
  }

  async submitMfa(): Promise<void> {
    if (this.isSubmitting) return;
    this.feedback = '';
    this.mfaCode.markAsTouched();
    if (this.mfaCode.invalid) return;

    this.isSubmitting = true;
    let shouldNavigate = false;
    try {
      await this.withAuthTimeout(this.auth.completeTotpSignIn(this.mfaCode.value));
      this.isMfaPending = false;
      this.mfaCode.reset();
      shouldNavigate = true;
    } catch (error) {
      this.showError(this.mapAuthError(error));
    } finally {
      this.isSubmitting = false;
    }

    if (shouldNavigate) {
      await this.navigateAfterSignIn();
    }
  }

  async resetPassword(): Promise<void> {
    if (this.isSubmitting) return;
    const email = this.form.controls.email;
    email.markAsTouched();
    if (email.invalid) {
      this.showError('Informe um email valido para redefinir a senha.');
      return;
    }

    this.isSubmitting = true;
    try {
      await this.withAuthTimeout(this.auth.resetPassword(email.value));
      this.isError = false;
      this.feedback = 'Enviamos um link de redefinicao para seu email.';
      this.isResettingPassword = false;
    } catch (error) {
      this.showError(this.mapAuthError(error));
    } finally {
      this.isSubmitting = false;
    }
  }

  cancelMfa(): void {
    this.auth.cancelMfaChallenge();
    this.isMfaPending = false;
    this.mfaCode.reset();
    this.feedback = '';
  }

  toggleRegistration(): void {
    this.isRegistering = !this.isRegistering;
    this.isResettingPassword = false;
    this.feedback = '';
  }

  private async navigateAfterSignIn(): Promise<void> {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const destination = returnUrl?.startsWith('/transactions') && !returnUrl.startsWith('//')
      ? returnUrl
      : '/transactions';
    try {
      await this.router.navigateByUrl(destination);
    } catch {
      this.showError('Autenticacao concluida, mas nao foi possivel abrir a tela de transacoes. Acesse-a pelo menu.');
    }
  }

  private showError(message: string): void {
    this.isError = true;
    this.feedback = message;
  }

  private withAuthTimeout<T>(operation: Promise<T>): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      timeoutId = setTimeout(() => reject(new Error(
        'O Firebase nao respondeu em 30 segundos. Verifique a conexao e a configuracao. Se a conta puder ter sido criada, tente entrar antes de cadastrar novamente.'
      )), LoginComponent.AUTH_TIMEOUT_MS);
    });

    return Promise.race([operation, timeout]).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });
  }

  private mapAuthError(error: unknown): string {
    if (!(error instanceof FirebaseError)) {
      return error instanceof Error ? error.message : 'Nao foi possivel concluir a operacao.';
    }

    const messages: Record<string, string> = {
      'auth/invalid-credential': 'Email ou senha invalidos.',
      'auth/invalid-email': 'Informe um email valido.',
      'auth/email-already-in-use': 'Este email ja esta cadastrado.',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde e tente novamente.',
      'auth/network-request-failed': 'Falha de conexao. Verifique sua internet.',
      'auth/operation-not-allowed': 'Login por email e senha nao esta habilitado no Firebase.',
      'auth/invalid-verification-code': 'Codigo TOTP invalido.',
      'auth/code-expired': 'Codigo TOTP expirado.'
    };
    return messages[error.code] ?? 'Nao foi possivel autenticar. Verifique os dados e tente novamente.';
  }
}