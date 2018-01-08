import { screen } from "tns-core-modules/platform";
import { Font } from "tns-core-modules/ui/styling/font";
import { ios } from "tns-core-modules/utils/utils";
import {
  NSSegmentViewBase, NSSegmentViewItemBase,
  selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty, backgroundProperty,
  titleColorProperty, selectedColorProperty, lineColorProperty,
  colorProperty, fontInternalProperty, Color, heightProperty
} from "./n-s-segment-view.common";

declare var SegmentView: any, CGRectMake: any, CGSizeMake: any, SegmentViewControlDelegate: any;

export class NSSegmentViewItem extends NSSegmentViewItemBase {
  public _update() {
      const parent = <NSSegmentView>this.parent;
      if (parent) {
          let tabIndex = parent.items.indexOf(this);
          let title = this.title;
          title = (title === null || title === undefined) ? "" : title;
          parent.nativeView.itemArray[tabIndex].setTitleForState(title, UIControlState.Normal);
      }
  }
}

export class NSSegmentView extends NSSegmentViewBase {
  delegate: NSObject = SelectionHandlerImpl.initWithOwner(new WeakRef(this));
  constructor() {
    super();
    console.log("NSSegmentView constructor");
    let width = screen.mainScreen.widthDIPs - 20;
    this.nativeView = SegmentView.initSegment();
    let nsArray = NSMutableArray.new();
    nsArray.addObject("1111");
    nsArray.addObject("test2");
    this.nativeView.delegate = this.delegate;
    this.nativeView.addItemsFrameInView(nsArray, CGRectMake(0, 0, width, 0), null);
    // this.nativeView.layer.masksToBounds = false;
  }

  get ios(): any {
    return this.nativeView;
  }

  [selectedIndexProperty.getDefault](): number {
      return -1;
  }
  [selectedIndexProperty.setNative](value: number) {
      this.nativeView.selectedSegmentIndex = value;
  }

  [itemsProperty.getDefault](): NSSegmentViewItem[] {
      return null;
  }
  [itemsProperty.setNative](value: NSSegmentViewItem[]) {
      const segmentedControl = this.nativeView;
      const newItems = value;

      if (newItems && newItems.length) {
          let nsArray = NSMutableArray.new();
          for (let one of newItems) {
            nsArray.addObject(one.title);
          }
          segmentedControl.replaceItems(nsArray);
      }

      // selectedIndexProperty.coerce(this);
  }

  [selectedBackgroundColorProperty.getDefault](): UIColor {
      return this.nativeView.selectedBackgroundColor;
  }
  [selectedBackgroundColorProperty.setNative](value: UIColor | Color) {
      let color = value instanceof Color ? value.ios : value;
      this.nativeView.selectedBackgroundColor = color;
  }

    [backgroundProperty.getDefault](): UIColor {
        return this.nativeView.segmentBackgroundColor;
    }
    [backgroundProperty.setNative](value: UIColor | Color) {
        let color = value instanceof Color ? value.ios : value;
        this.nativeView.segmentBackgroundColor = color;
    }

  [titleColorProperty.getDefault](): UIColor {
      return null;
  }
  [titleColorProperty.setNative](value: Color | UIColor) {
      let color = value instanceof Color ? value.ios : value;
      this.nativeView.titleColor = color;
  }

    [selectedColorProperty.getDefault](): UIColor {
        return null;
    }
    [selectedColorProperty.setNative](value: Color | UIColor) {
        let color = value instanceof Color ? value.ios : value;
        this.nativeView.selectColor = color;
    }

    [lineColorProperty.getDefault](): UIColor {
        return null;
    }
    [lineColorProperty.setNative](value: Color | UIColor) {
        let color = value instanceof Color ? value.ios : value;
        this.nativeView.lineColor = color;
    }

  [fontInternalProperty.getDefault](): Font {
      return null;
  }
  [fontInternalProperty.setNative](value: Font) {
      let font: UIFont = value ? value.getUIFont(UIFont.systemFontOfSize(ios.getter(UIFont, UIFont.labelFontSize))) : null;
      this.nativeView.titleFont = font;
  }
}

class SelectionHandlerImpl extends NSObject {

  public static ObjCProtocols = [SegmentViewControlDelegate];

  private _owner: WeakRef<NSSegmentView>;

  public static initWithOwner(owner: WeakRef<NSSegmentView>): SelectionHandlerImpl {
      let handler = <SelectionHandlerImpl>SelectionHandlerImpl.new();
      handler._owner = owner;
      return handler;
  }

  public didSelectSegmentAtIndex(index) {
      let owner = this._owner.get();
      if (owner) {
          owner.selectedIndex = index;
      }
  }
}

class DelegateClass extends NSObject implements UIPageViewControllerDelegate {
  public static ObjCProtocols = [SegmentViewControlDelegate];

  didSelectSegmentAtIndex(index) {

  }
}
