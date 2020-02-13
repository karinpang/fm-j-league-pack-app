import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { User } from '../../../../../admin/user.model';
import { Comment } from '../../comment.interface';

import * as fromApp from '../../../../../store/app.reducer';
import * as AdminActions from '../../../../../admin/store/admin.actions';
import * as DisucssAreaActions from '../../store/discuss-area.actions';

import * as moment from 'moment';

@Component({
  selector: 'app-comment-form',
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css']
})
export class CommentFormComponent implements OnInit, OnDestroy {

  @Input() playerId: string;
  @Output() reload = new EventEmitter<boolean>();

  public displayName: string;
  public comment: string;

  public user: User;

  public submitting: boolean;
  public loading: boolean;
  public errString: string;

  private adminAuthSubscription: Subscription;
  private discussAreaSubscription: Subscription;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.adminAuthSubscription = this.store.select('admin').subscribe(adminState => {
      this.user = adminState.user;
      if (this.user) this.displayName = this.user.displayName;      
    });
    this.discussAreaSubscription = this.store.select('discussArea').subscribe(discussAreaState => {
      this.loading = discussAreaState.loading;
      this.errString = discussAreaState.errMsg;
      if (this.submitting) {
        this.comment = "";
        this.submitting = false;
        this.reload.emit(true);
      }
    });
  }

  ngOnDestroy() {
    if (this.adminAuthSubscription) {
      this.adminAuthSubscription.unsubscribe();
    }
    if (this.discussAreaSubscription) {
      this.discussAreaSubscription.unsubscribe();
    }
  }

  onLogin() {
    this.store.dispatch(
      new AdminActions.LoginStart()
    );
  }

  onReset() {
    this.comment = "";
  }

  onComment() {
    let newComment: Comment = {
      loginToken: this.user.uuid,
      displayName: this.displayName,
      targetPlayerId: this.playerId,
      content: this.comment,
      createDate: moment().valueOf()
    };
    this.submitting = true;
    this.store.dispatch(
      new DisucssAreaActions.AddComment(newComment)
    );
  }

}