import { Injectable } from '@angular/core';
import { Router } from "@angular/router";

import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User>;

  constructor(private afAuth: AngularFireAuth, private afStore: AngularFirestore, private router: Router) {
    //this assigns the user record that is in the authentication tab
    //using the auth state to switch to an observable of this database record
    //swith map allows you to listen to the user that is emitted from this auth state thing
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user){
          return this.afStore.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  async googleSignIn(){
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  async signOut(){
    await this.afAuth.signOut();
    return this.router.navigate(['/']);
  }

  private updateUserData(user){
    const userRef: AngularFirestoreDocument<User> = this.afStore.doc(`users/${user.uid}`);
    const data = {
      userName: user.displayName,
      userEmail: user.email,
      userPhotoUrl: user.photoUrl,
    }
    return userRef.set(data, {merge: true});
  }
}
