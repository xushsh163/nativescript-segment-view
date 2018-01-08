import { NSSegmentView as NSSegmentViewDefinition, NSSegmentViewItem as NSSegmentViewItemDefinition, SelectedIndexChangedEventData } from ".";
import {
    ViewBase, View, AddChildFromBuilder, AddArrayFromBuilder,
    Property, CoercibleProperty, InheritedCssProperty, Color, Style, EventData
} from "tns-core-modules/ui/core/view";
import { ContentView } from "tns-core-modules/ui/content-view";
export * from "tns-core-modules/ui/core/view";

export abstract class NSSegmentViewItemBase extends ViewBase implements NSSegmentViewItemDefinition {
    private _title: string = "";

    get title(): string {
        return this._title;
    }
    set title(value: string) {
        let strValue = (value !== null && value !== undefined) ? value.toString() : "";
        if (this._title !== strValue) {
            this._title = strValue;
            this._update();
        }
    }

    public abstract _update();
}

export abstract class NSSegmentViewBase extends ContentView implements NSSegmentViewDefinition, AddChildFromBuilder, AddArrayFromBuilder {
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    public selectedIndex: number;
    public items: Array<NSSegmentViewItemDefinition>;

    public get selectedBackgroundColor(): Color {
        return this.style.selectedBackgroundColor;
    }
    public set selectedBackgroundColor(value: Color) {
        this.style.selectedBackgroundColor = value;
    }

    public _addArrayFromBuilder(name: string, value: Array<any>): void {
        if (name === "items") {
            this.items = value;
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === "NSSegmentViewItem") {
            const item = <NSSegmentViewItemBase>value;
            let items = this.items;
            if (!items) {
                items = new Array<NSSegmentViewItemBase>();
                items.push(item);
                this.items = items;
            } else {
                items.push(item);
                this._addView(item);
            }

            if (this.nativeViewProtected) {
                this[itemsProperty.setNative](items);
            }
        }
    }

    public onItemsChanged(oldItems: NSSegmentViewItemDefinition[], newItems: NSSegmentViewItemDefinition[]): void {
        if (oldItems) {
            for (let i = 0, count = oldItems.length; i < count; i++) {
                this._removeView(oldItems[i]);
            }
        }

        if (newItems) {
            for (let i = 0, count = newItems.length; i < count; i++) {
                this._addView(newItems[i]);
            }
        }
    }

    // TODO: Make _addView to keep its children so this method is not needed!
    public eachChild(callback: (child: ViewBase) => boolean): void {
        const items = this.items;
        if (items) {
            items.forEach((item, i) => {
                callback(item);
            });
        }
    }
}
export interface NSSegmentViewBase {
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
    on(event: "selectedIndexChanged", callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);
}

/**
 * Gets or sets the selected index dependency property of the NSSegmentView.
 */
export const selectedIndexProperty = new CoercibleProperty<NSSegmentViewBase, number>({ // CoercibleProperty
    name: "selectedIndex", defaultValue: -1,
    valueChanged: (target, oldValue, newValue) => {
        target.notify(<SelectedIndexChangedEventData>{ eventName: NSSegmentViewBase.selectedIndexChangedEvent, object: target, oldIndex: oldValue, newIndex: newValue });
    },
    coerceValue: (target, value) => {
        let items = target.items;
        if (items) {
            let max = items.length - 1;
            if (value < 0) {
                value = 0;
            }
            if (value > max) {
                value = max;
            }
        } else {
            value = -1;
        }

        return value;
    },
    valueConverter: (v) => parseInt(v)
});
selectedIndexProperty.register(NSSegmentViewBase);

export const itemsProperty = new Property<NSSegmentViewBase, NSSegmentViewItemDefinition[]>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        target.onItemsChanged(oldValue, newValue);
    }
});
itemsProperty.register(NSSegmentViewBase);

export const selectedBackgroundColorProperty = new InheritedCssProperty<Style, Color>({ name: "selectedBackgroundColor", cssName: "selected-background-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
selectedBackgroundColorProperty.register(Style);

export const backgroundProperty = new InheritedCssProperty<Style, Color>({ name: "segBackgroundColor", cssName: "seg-background-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
backgroundProperty.register(Style);

export const titleColorProperty = new InheritedCssProperty<Style, Color>({ name: "titleColor", cssName: "title-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
titleColorProperty.register(Style);

export const selectedColorProperty = new InheritedCssProperty<Style, Color>({ name: "selectedColor", cssName: "selected-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
selectedColorProperty.register(Style);

export const lineColorProperty = new InheritedCssProperty<Style, Color>({ name: "lineColor", cssName: "line-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
lineColorProperty.register(Style);