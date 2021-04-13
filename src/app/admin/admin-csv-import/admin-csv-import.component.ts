import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DatapackFiletype } from "../../shared/datapack-filetype.enum";

import { ImportCsvModalContentComponent } from '../../shared/import-csv-modal-content/import-csv-modal-content.component'

import * as moment from 'moment';

import getPlayerType from "../../shared/import-csv-modal-content/job-table-match-table";

import * as fromApp from "../../store/app.reducer";
import * as DatabaseActions from "../../database/store/database.actions";
import * as SharedActions from "../../shared/store/shared.actions";

@Component({
  selector: 'app-admin-csv-import',
  templateUrl: './admin-csv-import.component.html',
  styleUrls: ['./admin-csv-import.component.css']
})
export class AdminCsvImportComponent implements OnInit, OnDestroy {

  public loadData: Array<any> = null;
  public displayData: Array<any> = null;

  public updateId: number = null;

  public isUpdating: boolean = false;

  public datepackFileType: number = 0;
  public datepackFileTypeList: { key: number; val: string }[];

  public filterValue: string = "";
  public filterLimitToRecent: boolean = false;

  private databaseSubscription: Subscription;  

  constructor(private modal$: NgbModal, private store$: Store<fromApp.AppState>) { }

  ngOnInit(): void {
    this.datepackFileTypeList = Object.keys(DatapackFiletype)
      .map(Number)
      .filter(Number.isInteger)
      .map((k) => ({ key: k, val: DatapackFiletype[k] }));
    
    this.databaseSubscription = this.store$
      .select("database")
      .subscribe((databaseState) => {
        if (this.isUpdating) {
          const loading = databaseState.loading;
          if (!loading) {
            this.isUpdating = false;
            this.store$.dispatch(new SharedActions.SetToastContent({
              content: "レコードを更新しました",
              style: "success"
            }));
          }
        }
        if (databaseState.errMsg) {
          this.store$.dispatch(new SharedActions.SetToastContent({
            content: databaseState.errMsg,
            style: "danger"
          }));
        }
      });
  }

  ngOnDestroy() {
    if (this.databaseSubscription) {
      this.databaseSubscription.unsubscribe();
    }
  }

  onUploadFiles(files: any) {
    if (files.length <= 0) { return; }
    let f = files[0];

    this.readFile(f).then((data) => {
      this.loadData = this.csvToJson(data);
      this.loadData = this.loadData.filter(data => data.common_name || data.first_name || data.last_name);
      this.displayData = [...this.loadData];
    })
  }

  updateFilter(event) {
    const val = this.filterValue.toLowerCase();
    const limit = this.filterLimitToRecent;

    // filter our data
    const displayData = this.loadData.filter(function (d) {
      let extra_filter = true;
      if (limit) {
        const clubDateRenewedMonth = moment().diff(moment(moment(d.clubDateRenewed)), 'month');
        extra_filter = clubDateRenewedMonth < 6;
        if (d.loanDateStart != "") {
          const loanDateStartMonth = moment().diff(moment(moment(d.loanDateStart)), 'month');
          extra_filter = clubDateRenewedMonth < 6 || loanDateStartMonth < 6;
        }
      }
      return (d.common_name.toLowerCase().indexOf(val) !== -1 || d.club == val || !val) && extra_filter;
    });

    // update the rows
    this.displayData = displayData;
  }

  onDoAnalysis(data, directUpdate = false) {
    const modalRef = this.modal$.open(ImportCsvModalContentComponent, { scrollable: true })
    modalRef.componentInstance.data = data;
    modalRef.componentInstance.datafileType = this.datepackFileType;
    modalRef.componentInstance.updateId = this.updateId;
    modalRef.componentInstance.directUpdate = directUpdate;
    modalRef.result.then((result) => {
      this.isUpdating = true;
      this.store$.dispatch(new DatabaseActions.UpdatePlayer(result));
    }, (dismiss) => {});
  }

  private readFile(file): Promise<string> {
    const reader = new FileReader();
    reader.readAsText(file);
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
    });
  }

  private csvToJson(csv): Array<any> {
    var lines = csv.split("\n");
    var result = [];
    var headers;
    headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {
        var obj = {};

        if(lines[i] == undefined || lines[i].trim() == "") {
            continue;
        }
        var words = lines[i].split(",");
        for(var j = 0; j < words.length; j++) {
            obj[headers[j].trim()] = words[j];
        }

        result.push(obj);
    }
    return result;
  }

}
