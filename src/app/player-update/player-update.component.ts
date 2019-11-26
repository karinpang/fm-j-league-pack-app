import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import * as moment from 'moment';
import * as localization from 'moment/locale/ja';
moment.locale('ja', localization);

import * as fromApp from '../store/app.reducer';
import * as PlayerUpdateActions from './store/player-update.actions';

import * as PlayerUpdateModel from './player-update.model';

import { LocaleConfig } from 'ngx-daterangepicker-material';

@Component({
  selector: 'app-player-update',
  templateUrl: './player-update.component.html',
  styleUrls: ['./player-update.component.css'],
})
export class PlayerUpdateComponent implements OnInit, OnDestroy {

  public datepickerLocale: LocaleConfig = {
    applyLabel: '確認',
    customRangeLabel: ' - ',
    daysOfWeek: moment.weekdaysMin(),
    monthNames: moment.monthsShort(),
    firstDay: moment.localeData().firstDayOfWeek(),
  }

  public fmVersion: string;
  public records: PlayerUpdateModel.PlayerUpdate[];

  public displayRecords: PlayerUpdateModel.PlayerUpdate[];

  public filterPlayerUpdateType: number[];
  public playerUpdateTypeList: { key: number, val: string }[];

  public dateSelected: {startDate: moment.Moment, endDate: moment.Moment};

  public loadingData: boolean = true;

  private playerUpdateSubscription: Subscription;
  private coreSubscription: Subscription;

  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit() {
    this.loadingData = true;
    
    this.dateSelected = {
      startDate: moment().set('date', 1).set('hour', 0).set('minute', 0).set('second', 0),
      endDate: moment().add(1, 'month').set('date', 0).set('hour', 0).set('minute', 0).set('second', 0),
    }

    this.playerUpdateTypeList = Object.keys(PlayerUpdateModel.PlayerUpdateType)
      .map(Number)
      .filter(Number.isInteger)
      .map(k => ({ key: k, val: PlayerUpdateModel.PlayerUpdateType[k] }));

    this.coreSubscription = this.store.select('core').subscribe(coreState => {
      this.fmVersion = coreState.fmVersion;
      this.store.dispatch(new PlayerUpdateActions.FetchPlayerUpdate(this.fmVersion));      
    })
    this.playerUpdateSubscription = this.store
      .select('playerUpdate')
      .pipe(map(playerUpdateState => playerUpdateState.playerUpdateRecords))
      .subscribe((records: PlayerUpdateModel.PlayerUpdate[]) => {
        this.records = records.sort((a,b) => {
          const dateA = moment(a.activeDate).valueOf();
          const dateB = moment(b.activeDate).valueOf();
          if (dateB === dateA) {
            const dateA = moment(a.updateDate).valueOf();
            const dateB = moment(b.updateDate).valueOf();
            return dateB - dateA;
          } else {
            return dateB - dateA;
          }
        });
        this.loadingData = false;
        this.refreshDisplayRecords();
      });
  }

  ngOnDestroy() {
    if (this.playerUpdateSubscription)
      this.playerUpdateSubscription.unsubscribe();
    if (this.coreSubscription)
      this.coreSubscription.unsubscribe();
  }

  refreshDisplayRecords() {
    this.displayRecords = this.records.filter(r => {
      const activeDateValue = moment(r.activeDate + " 00:00:01", "YYYY-MM-DD HH:mm:ss").valueOf();
      return activeDateValue >= this.dateSelected.startDate.valueOf() && activeDateValue <= this.dateSelected.endDate.valueOf()
    }).filter(r => {
      if (!this.filterPlayerUpdateType || this.filterPlayerUpdateType.length <= 0) return true;
      return this.filterPlayerUpdateType.includes(r.updateType)
    })
  }

  onChangeFilterPlayerUpdateType() {
    this.refreshDisplayRecords();
  }

}
