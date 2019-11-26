import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { Router, NavigationEnd } from '@angular/router';
import { GaService } from './shared/ga.service';

import { filter } from 'rxjs/operators';

import * as fromApp from './store/app.reducer';
import * as AdminActions from './admin/store/admin.actions';

import * as firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'fm-j-league-pack';

  loaded = false;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private gaService: GaService
  ) {}

  ngOnInit() {
    this.loaded = true;

    this.store.dispatch(new AdminActions.AutoLogin());

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((params: any) => {
        this.gaService.sendPageView(params.url);
      });
  }
}
