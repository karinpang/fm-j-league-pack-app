import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { FormGroup, FormControl } from '@angular/forms';

import diff from 'deep-diff';

import * as fromApp from '../../store/app.reducer';
import * as DatabaseActions from '../../database/store/database.actions';

import { PlayerData } from "../../data/fmJDatabase/PlayerData.interface";

import * as CitiesData from '../../data/fmJDatabase/Cities.data';
import * as ClubData from '../../data/fmJDatabase/Clubs.data';
import { nationality } from '../../shared/nationality';

import { PlayerType } from "../../shared/player-type.enum";
import { DatapackFiletype } from '../../shared/datapack-filetype.enum';

import * as f from './form.data';

function removeEmpty(obj) {
  Object.keys(obj).forEach(function(key) {
    if (obj[key] && typeof obj[key] === 'object') removeEmpty(obj[key])
    else if (obj[key] == null) delete obj[key]
  });
};

@Component({
  selector: 'app-admin-player-db',
  templateUrl: './admin-player-db.component.html',
  styleUrls: ['./admin-player-db.component.css']
})
export class AdminPlayerDbComponent implements OnInit, OnDestroy {

  public searchPlayerName: string;
  public searchPlayers: {player: PlayerData, id: string, label: string}[];
  public searchPlayerId: string;

  public locationFormGroup = new FormGroup({
    file: new FormControl(DatapackFiletype["新規選手.fmf"]),
    id: new FormControl(null),
    jleagueId: new FormControl(null),
  });
  public basicInfoFormGroup = new FormGroup({
    name: new FormControl(''),
    nameEng: new FormControl(''),
    dob: new FormControl(null),
    cob: new FormControl(null),
    nationality: new FormControl(''),
    secondNationality: new FormControl(null),
    isPlayer: new FormControl(true),
    isNonPlayer: new FormControl(false),
  });
  public clubInfoFormGroup = new FormGroup({
    id: new FormControl(null),
    dateJoined: new FormControl(''),
    dateRenew: new FormControl(null),
    job: new FormControl([PlayerType.選手]),
    contractType: new FormControl(null),
    salaryPerYear: new FormControl(null),
    squardNumber: new FormControl(null),
  });
  public loanInfoFormGroup = new FormGroup({
    id: new FormControl(null),
    dateStart: new FormControl(''),
    dateEnd: new FormControl(''),
    squardNumber: new FormControl(null),
  });
  public personalDataFormGroup = new FormGroup({
    adaptability: new FormControl(null),
    ambition: new FormControl(null),
    controversy: new FormControl(null),
    loyalty: new FormControl(null),
    perssure: new FormControl(null),
    professionalism: new FormControl(null),
    sportsmanship: new FormControl(null),
    temperament: new FormControl(null),
  });
  public jobReferencesFormGroup = new FormGroup({
    headCoach: new FormControl(null),
    assistantCoach: new FormControl(null),
    coach: new FormControl(null),
    fitnessCoach: new FormControl(null),
    goalkeepingCoach: new FormControl(null),
    physio: new FormControl(null),
    scout: new FormControl(null),
    chiefDataAnalyst: new FormControl(null),
    headOfSportsScience: new FormControl(null),
    generalManager: new FormControl(null),
    headOfYouthDevelopment: new FormControl(null),
    chairman: new FormControl(null),
  });

  public playerDataGeneralFormGroup = new FormGroup({
    ca: new FormControl(0),
    pa: new FormControl(0),
    currentReputation: new FormControl(null),
    homeReputation: new FormControl(null),
    worldReputation: new FormControl(null),
    height: new FormControl(null),
    weight: new FormControl(null),
    leftFoot: new FormControl(null),
    rightFoot: new FormControl(null),
  });

  public playerDataPositionFormGroup = new FormGroup({
    goalkeeper: new FormControl(null),
    defenderLeft: new FormControl(null),
    defenderCentral: new FormControl(null),
    defenderRight: new FormControl(null),
    defensiveMidfielder: new FormControl(null),
    wingBackLeft: new FormControl(null),
    wingBackRight: new FormControl(null),
    midfielderLeft: new FormControl(null),
    midfielderCentral: new FormControl(null),
    midfielderRight: new FormControl(null),
    attackingMidfielderLeft: new FormControl(null),
    attackingMidfielderCentral: new FormControl(null),
    attackingMidfielderRight: new FormControl(null),
    striker: new FormControl(null),
  });

  public playerDataMentalFormGroup = new FormGroup({
    aggression: new FormControl(null),
    anticipation: new FormControl(null),
    bravery: new FormControl(null),
    composure: new FormControl(null),
    concentration: new FormControl(null),
    consistency: new FormControl(null),
    decisions: new FormControl(null),
    determination: new FormControl(null),
    dirtiness: new FormControl(null),
    flair: new FormControl(null),
    importantMatches: new FormControl(null),
    leadership: new FormControl(null),
    movement: new FormControl(null),
    positioning: new FormControl(null),
    teamWork: new FormControl(null),
    vision: new FormControl(null),
    workRate: new FormControl(null),
  });
  
  public playerDataPhysicalFormGroup = new FormGroup({
    acceleration: new FormControl(null),
    agility: new FormControl(null),
    balance: new FormControl(null),
    injuryProneness: new FormControl(null),
    jumpingReach: new FormControl(null),
    naturalFitness: new FormControl(null),
    pace: new FormControl(null),
    stamina: new FormControl(null),
    strength: new FormControl(null),
  });
  
  public playerDataTechnicalFormGroup = new FormGroup({
    corners: new FormControl(null),
    crossing: new FormControl(null),
    dribbling: new FormControl(null),
    finishing: new FormControl(null),
    firstTouch: new FormControl(null),
    freeKicks: new FormControl(null),
    heading: new FormControl(null),
    longShots: new FormControl(null),
    longThrows: new FormControl(null),
    marking: new FormControl(null),
    passing: new FormControl(null),
    penaltyTaking: new FormControl(null),
    tackling: new FormControl(null),
    technique: new FormControl(null),
    versatility: new FormControl(null),
  });
  
  public playerDataGoalkeepingFormGroup = new FormGroup({
    aerialAbility: new FormControl(null),
    commandOfArea: new FormControl(null),
    communication: new FormControl(null),
    eccentricity: new FormControl(null),
    handling: new FormControl(null),
    kicking: new FormControl(null),
    oneOnOnes: new FormControl(null),
    reflexes: new FormControl(null),
    rushingOut: new FormControl(null),
    tendencyToPunch: new FormControl(null),
    throwing: new FormControl(null),
  });

  public playerDataFormGroup = new FormGroup({
    general: this.playerDataGeneralFormGroup,
    trainedInNation: new FormControl(null),
    trainedAtClub: new FormControl(null),
    positions: this.playerDataPositionFormGroup,
    mental: this.playerDataMentalFormGroup,
    physical: this.playerDataPhysicalFormGroup,
    technical: this.playerDataTechnicalFormGroup,
    goalkeeping: this.playerDataGoalkeepingFormGroup,
  });

  public nonPlayerDataFormGroup = new FormGroup({
    ca: new FormControl(0),
    pa: new FormControl(0),
    currentReputation: new FormControl(null),
    homeReputation: new FormControl(null),
    worldReputation: new FormControl(null),
  });

  public playerForm = new FormGroup({
    location: this.locationFormGroup,
    basicInfo: this.basicInfoFormGroup,
    clubInfo: this.clubInfoFormGroup,
    loanInfo: this.loanInfoFormGroup,
    personalData: this.personalDataFormGroup,
    jobReferences: this.jobReferencesFormGroup,
    playerData: this.playerDataFormGroup,
    nonPlayerData: this.nonPlayerDataFormGroup,
  })

  public playerTypeList: { key: number, val: string }[];
  public datepackFileTypeList: { key: number, val: string }[];
  public nationalityList: {
    name: string,
    code: string
  }[] = nationality;
  public cityList: CitiesData.CityData[] = CitiesData.Cities;
  public clubList: ClubData.ClubData[] = ClubData.Clubs;

  public nationalityDropdownSettings = {
    singleSelection: true,
    idField: 'code',
    textField: 'name',
    allowSearchFilter: true
  };

  public formList = f;

  public loading: boolean = false;
  public updateError: string;

  public editPlayerId: string;
  public editPlayer: PlayerData;

  private databaseSubscription: Subscription;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.playerTypeList = Object.keys(PlayerType)
      .map(Number)
      .filter(Number.isInteger)
      .map(k => ({ key: k, val: PlayerType[k] }));
    this.datepackFileTypeList = Object.keys(DatapackFiletype)
      .map(Number)
      .filter(Number.isInteger)
      .map(k => ({ key: k, val: DatapackFiletype[k] }));

    this.databaseSubscription = this.store.select('database').subscribe(databaseState => {
      this.loading = databaseState.loading;
      this.updateError = databaseState.errMsg;

      this.searchPlayers = databaseState.searchPlayers ? databaseState.searchPlayers.map(sp => ({
        ...sp,
        label: sp.player.basicInfo.name + (sp.player.basicInfo.dob ? '( ' + sp.player.basicInfo.dob + ' )' : '')
      })) : null;

      if (databaseState.editPlayer) {
        if (databaseState.editPlayer.player.clubInfo && databaseState.editPlayer.player.clubInfo.id) {
          const isClubIdExist = this.clubList.find(c => c.id === databaseState.editPlayer.player.clubInfo.id);          
          if (!isClubIdExist) {
            this.clubList = [...this.clubList, {
              id: databaseState.editPlayer.player.clubInfo.id,
              name: "" + databaseState.editPlayer.player.clubInfo.id
            }];
          }
        }
        if (databaseState.editPlayer.player.loanInfo && databaseState.editPlayer.player.loanInfo.id) {
          const isClubIdExist = this.clubList.find(c => c.id === databaseState.editPlayer.player.loanInfo.id);
          if (!isClubIdExist) {
            this.clubList = [...this.clubList, {
              id: databaseState.editPlayer.player.loanInfo.id,
              name: "" + databaseState.editPlayer.player.loanInfo.id
            }];
          }
        }

        this.editPlayerId = databaseState.editPlayer.id;
        this.editPlayer = databaseState.editPlayer.player;              
      } else {
        this.editPlayerId = null;
        this.editPlayer = null;
      }

      if (!this.loading) {
        this.resetForm();
      }
    })
  }

  ngOnDestroy() {
    if (this.databaseSubscription) {
      this.databaseSubscription.unsubscribe();
    }
  }

  onSubmit() {
    let personalData = {
      ...this.playerForm.value.personalData
    }
    let playerDataGeneral = {
      ...this.playerForm.value.playerData.general
    }    
    let playerDataPositions = {
      ...this.playerForm.value.playerData.positions
    }
    let playerDataMental = {
      ...this.playerForm.value.playerData.mental
    }
    let playerDataPhyiscal = {
      ...this.playerForm.value.playerData.physical
    }
    let playerDataTechnical = {
      ...this.playerForm.value.playerData.technical
    }
    let playerDataGoalkeeping = {
      ...this.playerForm.value.playerData.goalkeeping
    }    

    removeEmpty(personalData);
    removeEmpty(playerDataGeneral);
    removeEmpty(playerDataPositions);
    removeEmpty(playerDataMental);
    removeEmpty(playerDataPhyiscal);
    removeEmpty(playerDataTechnical);
    removeEmpty(playerDataGoalkeeping);

    let player: PlayerData = {
      location: this.playerForm.value.location,
      basicInfo: this.playerForm.value.basicInfo,
      clubInfo: this.playerForm.value.clubInfo.id ? this.playerForm.value.clubInfo : null,
      loanInfo: this.playerForm.value.loanInfo.id ? this.playerForm.value.loanInfo : null,
      personalData: Object.keys(personalData).length > 0 ? personalData : null,
      playerData: this.playerForm.value.basicInfo.isPlayer ? {
        general: Object.keys(playerDataGeneral).length > 0 ? playerDataGeneral : null,
        positions: Object.keys(playerDataPositions).length > 0 ? playerDataPositions : null,
        mental: Object.keys(playerDataMental).length > 0 ? playerDataMental : null,
        physical: Object.keys(playerDataPhyiscal).length > 0 ? playerDataPhyiscal : null,
        technical: Object.keys(playerDataTechnical).length > 0 ? playerDataTechnical : null,
        goalkeeping: Object.keys(playerDataGoalkeeping).length > 0 ? playerDataGoalkeeping : null,
      } : null,
      nonPlayerData: this.playerForm.value.basicInfo.isNonPlayer ? this.playerForm.value.nonPlayerData : null,
    }
    removeEmpty(player);

    let differences = null;
    if (this.editPlayerId) {
      differences = diff.diff(this.editPlayer, player);
    }

    this.store.dispatch(new DatabaseActions.UpdatePlayer({
      player,
      id: this.editPlayerId,
      changeLog: differences
    }));
    this.searchPlayerName = "";
    this.store.dispatch(new DatabaseActions.ResetSearch());
  }

  onSearchPlayer() {
    if (this.searchPlayerName) {
      this.store.dispatch(new DatabaseActions.SearchPlayers(this.searchPlayerName));
    }
  }

  onSelectSearchPlayer() {
    if (this.searchPlayerId) {
      this.store.dispatch(new DatabaseActions.LoadPlayer({id: this.searchPlayerId}));
    }
  }

  onAddPlayer() {
    this.searchPlayerName = "";
    this.store.dispatch(new DatabaseActions.ResetSearch());
    this.resetForm();
  }

  private resetForm() {
    this.playerForm.reset();

    if (this.editPlayer) {
      this.playerForm.patchValue(this.editPlayer);
    } else {
      this.playerForm.patchValue({
        location: {
          file: DatapackFiletype["新規選手.fmf"]
        },
        basicInfo: {
          name: '',
          nameEng: '',
          nationality: 'JPN',
          isPlayer: true,
          isNonPlayer: false,
        },
        clubInfo: {
          dateJoined: '',
          job: [PlayerType.選手],
        },
        loanInfo: {
          dateStart: '',
          dateEnd: '',
        }
      })
    }
  }

}
