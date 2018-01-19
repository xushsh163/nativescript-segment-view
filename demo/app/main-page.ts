import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';
import {HelloWorldModel} from './main-view-model';
import { SelectedIndexChangedEventData, NSSegmentView } from "nativescript-segment-view";
import { View, getViewById, EventData } from "tns-core-modules/ui/core/view";
import {Button} from 'tns-core-modules/ui/button';

// Event handler for Page 'loaded' event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // Get the event sender
    let page = <pages.Page>args.object;
    page.bindingContext = new HelloWorldModel();
}

export function selectedIndexChanged(args: SelectedIndexChangedEventData) {
    console.log("SelectedIndexChangedEventData:" + args.newIndex);
}

export function onTap(args) {
    const sv = <NSSegmentView>getViewById(args.object.parent, "111");
    sv.selectedIndex = 1;
}
