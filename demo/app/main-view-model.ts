import { Observable } from 'tns-core-modules/data/observable';
import { NSSegmentView, NSSegmentViewItem } from 'nativescript-segment-view';

export class HelloWorldModel extends Observable {
  public message: string;
  private segmentView: NSSegmentView;
  private tabItems: NSSegmentViewItem[];
  private tabItems2: NSSegmentViewItem[];

  constructor() {
    super();

    // this.segmentView = new NSSegmentView();
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
}
