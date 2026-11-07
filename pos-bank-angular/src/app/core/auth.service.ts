import { Injectable } from '@angular/core';
import { FirebaseError, getApps, initializeApp } from '@firebase/app';
import {
  Auth,
  MultiFactorError,
  MultiFactorResolver,
  TotpMultiFactorGenerator,
  User,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getMultiFactorResolver,
  initializeAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from '@firebase/auth';
import { BehaviorSubject, Observable, of, shareReplay } from 'rxjs';
import { environment } from '../../env/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isConfigured: boolean;
  readonly user$: Observable<User | null>;
  readonly mfaPending$: Observable<boolean>;

  private readonly auth: Auth | null;
  private readonly mfaResolver$ = new BehaviorSubject<MultiFactorResolver | null>(null);

  constructor() {
    const config = environment.firebase;
    this.isConfigured = Object.values(config).every((value) => value.trim().length > 0);
    this.mfaPending$ = new Observable<boolean>((subscriber) => {
      const subscription = this.mfaResolver$.subscribe((resolver) => subscriber.next(resolver !== null));
      return () => subscription.unsubscribe();
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

    if (!this.isConfigured) {
      this.auth = null;
      this.user$ = of(null);
      return;
    }

    const appName = `pos-bank-angular-${config.projectId}`;
    const firebaseApp = getApps().find((app) => app.name === appName)
      ?? initializeApp(config, appName);
    this.auth = initializeAuth(firebaseApp, { persistence: browserSessionPersistence });
    const auth = this.auth;
    this.user$ = new Observable<User | null>((subscriber) =>
      onAuthStateChanged(auth, (user) => subscriber.next(user), (error) => subscriber.error(error))
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  async signIn(email: string, password: string): Promise<boolean> {
    const auth = this.requireAuth();

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      this.mfaResolver$.next(null);
      return true;
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/multi-factor-auth-required') {
        this.mfaResolver$.next(getMultiFactorResolver(auth, error as MultiFactorError));
        return false;
      }
      throw error;
    }
  }

  async signUp(email: string, password: string): Promise<void> {
    const auth = this.requireAuth();
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.requireAuth(), email.trim());
  }

  async completeTotpSignIn(code: string): Promise<void> {
    const resolver = this.mfaResolver$.value;
    if (!resolver) {
      throw new Error('Nao ha um desafio MFA pendente.');
    }

    const factor = resolver.hints.find(
      (hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID
    );
    if (!factor) {
      throw new Error('Esta conta nao possui um fator TOTP compativel.');
    }

    const assertion = TotpMultiFactorGenerator.assertionForSignIn(factor.uid, code.trim());
    await resolver.resolveSignIn(assertion);
    this.mfaResolver$.next(null);
  }

  cancelMfaChallenge(): void {
    this.mfaResolver$.next(null);
  }

  async signOut(): Promise<void> {
    this.cancelMfaChallenge();
    await signOut(this.requireAuth());
  }

  private requireAuth(): Auth {
    if (!this.auth) {
      throw new Error('Firebase Auth nao esta configurado para este ambiente.');
    }
    return this.auth;
  }
}