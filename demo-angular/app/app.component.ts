import { Component, ViewChild, ElementRef } from "@angular/core";
import {NSSegmentView, NSSegmentViewItem} from 'nativescript-segment-view';

@Component({
  selector: "my-app",
  template: `
    <ActionBar title="My App" class="action-bar"></ActionBar>
    <StackLayout>
    <NSSegmentView #sv1 [items]="tabItems" [(ngModel)]="selectedIndex" height="60" (selectedIndexChanged)="selectedIndexChanged($event)"
      style="seg-background-color:#EEE;selected-background-color:#FF0;line-color:#000;selected-color:#F00;title-color:#0F0;"></NSSegmentView>
      <NSSegmentView #sv2 [items]="tabItems2" [(ngModel)]="selectedIndex"  height="30" (selectedIndexChanged)="selectedIndexChanged($event)"></NSSegmentView>
      <Button text="select second" (tap)="onTap()"></Button>
    </StackLayout>
  `
})
export class AppComponent {
  public message: string;
  selectedIndex: number;
  @ViewChild("sv1")
  private segmentView: ElementRef;

  private tabItems: NSSegmentViewItem[];
  private tabItems2: NSSegmentViewItem[];

  // Your TypeScript logic goes here
  constructor() {
    this.message = "natviescript-segment-view-example";
    this.tabItems = [];
    const item1 = new NSSegmentViewItem();
    item1.title = 'custome_item1';
    this.tabItems.push(item1);
    const item2 = new NSSegmentViewItem();
    item2.title = 'custome_item2';
    this.tabItems.push(item2);

    this.tabItems2 = [];
    const item21 = new NSSegmentViewItem();
    item21.title = 'default_item1';
    this.tabItems2.push(item21);
    const item22 = new NSSegmentViewItem();
    item22.title = 'default_item2';
    this.tabItems2.push(item22);
  }

  onTap() {
    // this.segmentView.selectedIndex = 1;
    // this.selectedIndex = 1;
    // console.log("")
    this.segmentView.nativeElement.selectedIndex = 1;
  }

  selectedIndexChanged(args) {
    console.log("selected=" + args.object.selectedIndex);
    console.log("selected2=" + this.selectedIndex);
  }
}
