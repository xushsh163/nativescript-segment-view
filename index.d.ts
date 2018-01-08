import {
  ViewBase, View, AddChildFromBuilder, AddArrayFromBuilder,
  Property, CoercibleProperty, EventData, Color, CssProperty, Style
} from "tns-core-modules/ui/core/view";

/**
* Represents a NSSegmentView item.
*/
export class NSSegmentViewItem extends ViewBase {
  /**
   * Gets or sets the title of the NSSegmentViewItem.
   */
  public title: string;
}

/**
* Defines the data for the NSSegmentView.selectedIndexChanged event.
*/
export interface SelectedIndexChangedEventData extends EventData {
  /**
   * The old selected index.
   */
  oldIndex: number;

  /**
   * The new selected index.
   */
  newIndex: number;
}

/**
* Represents a UI NSSegmentView component.
*/
export class NSSegmentView extends View implements AddChildFromBuilder, AddArrayFromBuilder {
  /**
   * Gets or sets the selected index of the NSSegmentView component.
   */
  selectedIndex: number;

  /**
   * Gets or sets the selected background color of the NSSegmentView component.
   */
  selectedBackgroundColor: Color;

  /**
   * Gets or sets the items of the NSSegmentView.
   */
  items: Array<NSSegmentViewItem>;

  /**
   * String value used when hooking to the selectedIndexChanged event.
   */
  public static selectedIndexChangedEvent: string;

  /**
   * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
   * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change"). 
   * @param callback - Callback function which will be executed when event is raised.
   * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
   */
  on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

  /**
   * Raised when the selected index changes.
   */
  on(event: "selectedIndexChanged", callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);

  /**
   * Called for every child element declared in xml.
   * @param name - Name of the element.
   * @param value - Value of the element.
   */
  public _addChildFromBuilder(name: string, value: any): void;
  public _addArrayFromBuilder(name: string, value: Array<any>): void;
}

/**
* Gets or sets the selected index dependency property of the NSSegmentView.
*/
export const selectedIndexProperty: CoercibleProperty<NSSegmentView, number>;

/**
* Gets or sets the selected background color property of the NSSegmentView.
*/
export const selectedBackgroundColorProperty: CssProperty<Style, Color>;

/**
* Gets or sets the items dependency property of the NSSegmentView.
*/
export const itemsProperty: Property<NSSegmentView, NSSegmentViewItem[]>;
