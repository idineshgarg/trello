import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'trello-copy';
  lists: any = [];
  addActionForm: FormGroup;
  addListForm: FormGroup;
  actionIndex;
  showAddActionPopup = false;
  showListPopup = false;
  prevActions: any = {};
  actions: any = {};

  constructor(public formBuilder: FormBuilder) {}

  ngOnInit() {
    this.lists = JSON.parse(localStorage.getItem('List')) || [];
    this.actions = JSON.parse(localStorage.getItem('Actions')) || {};
    this.prevActions = this.actions;
    this.initalizeForm();
  }

  /**
   * initialize list
   */
  initalizeForm() {
    this.addActionForm = this.formBuilder.group({
      name: ['',Validators.required],
      description: ['',Validators.required],
    });
    this.addListForm = this.formBuilder.group({
      name: ['',Validators.required],
    });
  }

  /**
   * @param  index
   * delete list with index
   */
  deleteList(index) {
    let previndex: any = -1;
    let list = this.actions;
    for (let obj in list) {
      if (Number(obj) > Number(index) && Number(obj) > 0) {
        list[Number(obj) - 1] = list[Number(obj)];
      }
      previndex = obj;
    }
    if (previndex > -1) {
      list[previndex] = [];
    }

    this.actions = list;
    this.lists.splice(index, 1);
    this.saveList();
  }
  /**
   * @param  {} data
   * @param  {} index
   * add new action
   */
  addAction(data, index) {
    if (this.actions && this.actions[index]) {
      let obj = {
        index: this.actions[index].length,
        title: data.title,
        description: data.description,
        job_date_time: new Date(),
      };
      this.actions[index].push(obj);
    } else {
      this.actions[index] = [];
      let obj = {
        index: 0,
        title: data.title,
        description: data.description,
        job_date_time: new Date(),
      };
      this.actions[index].push(obj);
    }
    this.showAddActionPopup = false;
    this.actionIndex = undefined;
    this.saveList();
  }

  /**
   * @param  {} index
   * @param  {} index2
   * remove action from this.lists
   */
  removeIndexAction(index, index2) {
    this.actions[index].splice(index2, 1);
    this.saveList();
  }

  /**
   * @param  {CdkDragDrop<string[]>} event
   * main drag and drop function
   */
  drop(event: CdkDragDrop<string[]>) {
    let arr = this.actions;
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      let index = -1;
      for (let obj in arr) {
        if (arr[obj] == event.container.data) {
          index = Number(obj);
        }
      }
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.sortActions(index);
    }
    this.saveList();
  }

  /**
   * @param index
   * open popup for adding actions
   */
  openDialogForAction(index) {
    this.actionIndex = index;
    this.showAddActionPopup = true;
    this.showListPopup = false;
  }

  /**
   * add action item from popup
   */
  addActionFromPopup() {
    let obj = {
      title: this.addActionForm.controls.name.value,
      description: this.addActionForm.controls.description.value,
    };
    this.addActionForm.reset(this.initalizeForm());
    this.addAction(obj, this.actionIndex);
  }

  /**
   * Open popup
   */
  openDialogForList() {
    this.showListPopup = true;
    this.showAddActionPopup = false;
  }

  /**
   * @param obj :list item
   * into this.lists
   */
  addList(obj) {
    this.lists.push({
      index: this.lists.length,
      title: obj.title,
      list_creation_time: new Date(),
    });
    this.showListPopup = false;
    this.addListForm.reset(this.initalizeForm());
    this.saveList();
  }

  /**
   * add new list
   */
  addListFromPopup() {
    let obj = {
      title: this.addListForm.controls.name.value,
    };
    this.addListForm.reset(this.initalizeForm());
    this.addList(obj);
    this.actions[this.lists.length - 1] = [];
  }

  /**
   * close popup
   * and reset
   */
  closePopup() {
    this.actionIndex = undefined;
    this.showListPopup = false;
    this.showAddActionPopup = false;
    this.initalizeForm();
  }

  /**
   * common function to save data
   */
  saveList() {
    localStorage.setItem('List', JSON.stringify(this.lists));
    localStorage.setItem('Actions', JSON.stringify(this.actions));
    this.prevActions = this.actions;
  }

  /**
   * @param  index
   * sort actions with index
   */
  sortActions(index) {
    this.actions[index].sort(function (a, b) {
      var keyA = new Date(a.job_date_time),
        keyB = new Date(b.job_date_time);
      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });
  }
}
