import { Font } from "tns-core-modules/ui/styling/font";
import {
    NSSegmentViewItemBase, NSSegmentViewBase, selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty,
    colorProperty, fontInternalProperty, fontSizeProperty, Color, layout,
    heightProperty, lineColorProperty, backgroundProperty, titleColorProperty, selectedColorProperty
} from "./n-s-segment-view.common";
import * as utils from "tns-core-modules/utils/utils";

export * from "./n-s-segment-view.common";

const R_ID_TABS = 0x01020013;
const R_ID_TABCONTENT = 0x01020011;
const R_ATTR_STATE_SELECTED = 0x010100a1;
const TITLE_TEXT_VIEW_ID = 16908310; // http://developer.android.com/reference/android/R.id.html#title

interface TabChangeListener {
    new(owner: NSSegmentView): android.widget.TabHost.OnTabChangeListener;
}

interface TabContentFactory {
    new(owner: NSSegmentView): android.widget.TabHost.TabContentFactory;
}

interface TabHost {
    new(context: android.content.Context, attrs: android.util.AttributeSet): android.widget.TabHost;
}

let apiLevel: number;
let selectedIndicatorThickness: number;

let TabHost: TabHost;
let TabChangeListener: TabChangeListener;
let TabContentFactory: TabContentFactory;

function initializeNativeClasses(): void {
    if (TabChangeListener) {
        return;
    }

    apiLevel = android.os.Build.VERSION.SDK_INT;
    // Indicator thickness for material - 2dip. For pre-material - 5dip.
    selectedIndicatorThickness = layout.toDevicePixels(apiLevel >= 21 ? 2 : 5);

    @Interfaces([android.widget.TabHost.OnTabChangeListener])
    class TabChangeListenerImpl extends java.lang.Object implements android.widget.TabHost.OnTabChangeListener {
        constructor(public owner: NSSegmentView) {
            super();
            return global.__native(this);
        }

        onTabChanged(id: string): void {
            const owner = this.owner;
            if (owner.shouldChangeSelectedIndex()) {
                owner.selectedIndex = parseInt(id);
            }
            this.owner.updateTextColor();
            // <android.view.ViewGroup>nativeView.getParent();
            // if (!owner.height || owner.height !== utils.layout.toDevicePixels(30))
            //     owner.height = utils.layout.toDevicePixels(30);
            // else
            //     owner.height = utils.layout.toDevicePixels(20);
            // owner.resetNativeView();
            // console.log("owner-height=" + owner.height);
        }
    }

    @Interfaces([android.widget.TabHost.TabContentFactory])
    class TabContentFactoryImpl extends java.lang.Object implements android.widget.TabHost.TabContentFactory {
        constructor(public owner: NSSegmentView) {
            super();
            return global.__native(this);
        }

        createTabContent(tag: string): android.view.View {
            const tv = new android.widget.TextView(this.owner._context);
            // const params = new 	android.widget.LinearLayout.LayoutParams(android.widget.LinearLayout.LayoutParams.MATCH_PARENT, android.widget.LinearLayout.LayoutParams.MATCH_PARENT, 1);
            // tv.setLayoutParams(params);
            // This is collapsed by default and made visible
            // by android when TabItem becomes visible/selected.
            // TODO: Try commenting visibility change.
            tv.setVisibility(android.view.View.GONE);
            tv.setMaxLines(1);
            tv.setEllipsize(android.text.TextUtils.TruncateAt.END);
            return tv;
        }
    }

    class TabHostImpl extends android.widget.TabHost {
        constructor(context: android.content.Context, attrs: android.util.AttributeSet) {
            super(context, attrs);
            return global.__native(this);
        }

        protected onAttachedToWindow(): void {
            // overriden to remove the code that will steal the focus from edit fields.
        }
    }

    TabHost = TabHostImpl;
    TabChangeListener = TabChangeListenerImpl;
    TabContentFactory = TabContentFactoryImpl;
}

class NSSegmentViewColorDrawable extends android.graphics.drawable.ColorDrawable {

    private thickness: number;
    private selectedBackgroundColor: Color;

    constructor(color: Color, selectedBackgroundColor: Color, thickness: number) {
        super(color.android);
        this.thickness = thickness;
        this.selectedBackgroundColor = selectedBackgroundColor;
        return global.__native(this);
    }

    public draw(canvas: android.graphics.Canvas) {
        const p = new android.graphics.Paint();
        p.setColor(this.getColor());
        p.setStyle(android.graphics.Paint.Style.FILL);
        canvas.drawRect(0, this.getBounds().height() - this.thickness, this.getBounds().width(), this.getBounds().height(), p);
        const p2 = new android.graphics.Paint();
        p2.setColor(this.selectedBackgroundColor.android);
        p2.setStyle(android.graphics.Paint.Style.FILL);
        canvas.drawRect(0, 0, this.getBounds().width(), this.getBounds().height() - this.thickness, p2);
    }
}

export class NSSegmentViewItem extends NSSegmentViewItemBase {
    nativeViewProtected: android.widget.TextView;
    backgroundColor: Color | android.graphics.drawable.Drawable;
    selectedBackgroundColor: Color;
    lineColor: Color | android.graphics.drawable.Drawable;

    public setupNativeView(tabIndex: number): void {
        // TabHost.TabSpec.setIndicator DOES NOT WORK once the title has been set.
        // http://stackoverflow.com/questions/2935781/modify-tab-indicator-dynamically-in-android
        const titleTextView = <android.widget.TextView>this.parent.nativeViewProtected.getTabWidget().getChildAt(tabIndex).findViewById(TITLE_TEXT_VIEW_ID);
        // const params = new 	android.widget.LinearLayout.LayoutParams(android.widget.LinearLayout.LayoutParams.MATCH_PARENT, android.widget.LinearLayout.LayoutParams.MATCH_PARENT, 1);
        // titleTextView.setLayoutParams(params);
        this.setNativeView(titleTextView);
        if (titleTextView) {
            if (this.titleDirty) {
                this._update();
            }
        }
    }

    private titleDirty: boolean;
    public _update(): void {
        const tv = this.nativeViewProtected;
        if (tv) {
            let title = this.title;
            title = (title === null || title === undefined) ? "" : title;
            tv.setText(title);
            this.titleDirty = false;
        } else {
            this.titleDirty = true;
        }
    }

    public updateBackground() {
        if (this.lineColor == null || this.selectedBackgroundColor == null) {
            return;
        }
        const nativeView = this.nativeViewProtected;
        const viewGroup = <android.view.ViewGroup>nativeView.getParent();
        if (this.lineColor instanceof Color) {
            const color = this.lineColor.android;
            const backgroundDrawable = viewGroup.getBackground();
            // if (apiLevel > 21 && backgroundDrawable) {
            //     const newDrawable = tryCloneDrawable(backgroundDrawable, nativeView.getResources());
            //     newDrawable.setColorFilter(color, android.graphics.PorterDuff.Mode.SRC_IN);
            //     org.nativescript.widgets.ViewHelper.setBackground(viewGroup, newDrawable);
            // } else {
                const stateDrawable = new android.graphics.drawable.StateListDrawable();
                const colorDrawable: android.graphics.drawable.ColorDrawable = new NSSegmentViewColorDrawable(this.lineColor, this.selectedBackgroundColor, selectedIndicatorThickness);
                const arr = Array.create("int", 1);
                arr[0] = R_ATTR_STATE_SELECTED;
                stateDrawable.addState(arr, colorDrawable);
                const arr2 = Array.create("int", 1);
                arr2[0] = -R_ATTR_STATE_SELECTED;
                stateDrawable.addState(arr2, backgroundDrawable);
                stateDrawable.setBounds(0, 15, viewGroup.getRight(), viewGroup.getBottom());
                org.nativescript.widgets.ViewHelper.setBackground(viewGroup, stateDrawable);
            // }
        } else if (this.lineColor != null) {
            const backgroundDrawable = tryCloneDrawable(this.lineColor, nativeView.getResources());
            org.nativescript.widgets.ViewHelper.setBackground(viewGroup, backgroundDrawable);
        }
    }

    [colorProperty.getDefault](): number {
        return this.nativeViewProtected.getCurrentTextColor();
    }
    [colorProperty.setNative](value: Color | number) {
        const color = value instanceof Color ? value.android : value;
        this.nativeViewProtected.setTextColor(color);
    }

    [fontSizeProperty.getDefault](): { nativeSize: number } {
        return { nativeSize: this.nativeViewProtected.getTextSize() };
    }
    [fontSizeProperty.setNative](value: number | { nativeSize: number }) {
        if (typeof value === "number") {
            this.nativeViewProtected.setTextSize(value);
        } else {
            this.nativeViewProtected.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
        }
    }

    [fontInternalProperty.getDefault](): android.graphics.Typeface {
        return this.nativeViewProtected.getTypeface();
    }
    [fontInternalProperty.setNative](value: Font | android.graphics.Typeface) {
        this.nativeViewProtected.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
    }

    [selectedBackgroundColorProperty.getDefault](): Color {
        return this.selectedBackgroundColor;
    }
    [selectedBackgroundColorProperty.setNative](value: Color) {
        this.selectedBackgroundColor = value;
        this.updateBackground();
    }
    [lineColorProperty.getDefault](): android.graphics.drawable.Drawable {
        const viewGroup = <android.view.ViewGroup>this.nativeViewProtected.getParent();
        return viewGroup.getBackground();
    }
    [lineColorProperty.setNative](value: Color | android.graphics.drawable.Drawable) {
        this.lineColor = value;
        this.updateBackground();
        // const nativeView = this.nativeViewProtected;
        // const viewGroup = <android.view.ViewGroup>nativeView.getParent();
        // if (value instanceof Color) {
        //     const color = value.android;
        //     const backgroundDrawable = viewGroup.getBackground();
        //     if (apiLevel > 21 && backgroundDrawable) {
        //         const newDrawable = tryCloneDrawable(backgroundDrawable, nativeView.getResources());
        //         newDrawable.setColorFilter(color, android.graphics.PorterDuff.Mode.SRC_IN);
        //         org.nativescript.widgets.ViewHelper.setBackground(viewGroup, newDrawable);
        //     } else {
        //         const stateDrawable = new android.graphics.drawable.StateListDrawable();
        //         const colorDrawable: android.graphics.drawable.ColorDrawable = new org.nativescript.widgets.SegmentedBarColorDrawable(color, selectedIndicatorThickness);
        //         const arr = Array.create("int", 1);
        //         arr[0] = R_ATTR_STATE_SELECTED;
        //         stateDrawable.addState(arr, colorDrawable);
        //         stateDrawable.setBounds(0, 15, viewGroup.getRight(), viewGroup.getBottom());
        //         org.nativescript.widgets.ViewHelper.setBackground(viewGroup, stateDrawable);
        //     }
        // } else {
        //     const backgroundDrawable = tryCloneDrawable(value, nativeView.getResources());
        //     org.nativescript.widgets.ViewHelper.setBackground(viewGroup, backgroundDrawable);
        // }
    }
    [backgroundProperty.getDefault](): android.graphics.drawable.Drawable {
        return this.nativeViewProtected.getBackground();
    }
    [backgroundProperty.setNative](value: Color | android.graphics.drawable.Drawable) {
        this.backgroundColor = value;
        const nativeView = this.nativeViewProtected;
        const viewGroup = <android.view.ViewGroup>nativeView.getParent();
        if (value instanceof Color) {
            const color = value.android;
            viewGroup.setBackgroundColor(color);
        } else {
            const backgroundDrawable = tryCloneDrawable(value, nativeView.getResources());
            org.nativescript.widgets.ViewHelper.setBackground(viewGroup, backgroundDrawable);
        }
    }
    // [heightProperty.getDefault](): { nativeSize: number } {
    //     return { nativeSize: this.nativeViewProtected.getHeight() };
    // }
    // [heightProperty.setNative](value: number | { nativeSize: number }) {
    //     this.nativeViewProtected.setHeight(utils.layout.toDevicePixels(30));
    // }
}

function tryCloneDrawable(value: android.graphics.drawable.Drawable, resources: android.content.res.Resources): android.graphics.drawable.Drawable {
    if (value) {
        const constantState = value.getConstantState();
        if (constantState) {
            return constantState.newDrawable(resources);
        }
    }

    return value;
}

export class NSSegmentView extends NSSegmentViewBase {
    nativeViewProtected: android.widget.TabHost;
    private _tabContentFactory: android.widget.TabHost.TabContentFactory;
    private _addingTab: boolean;
    textColor: Color;
    selectedTextColor: Color;

    public shouldChangeSelectedIndex(): boolean {
        return !this._addingTab;
    }

    public createNativeView() {
        initializeNativeClasses();
        console.log("createNativeView");
        const context: android.content.Context = this._context;
        const nativeView = new TabHost(context, null);
        // this.height = utils.layout.toDevicePixels(40);
        console.log("this-height=" + this.height);
        const tabHostLayout = new android.widget.LinearLayout(context);
        tabHostLayout.setOrientation(android.widget.LinearLayout.VERTICAL);

        const tabWidget = new android.widget.TabWidget(context);
        console.log("tabWidget-height=" + tabWidget.getHeight());
        tabWidget.setId(R_ID_TABS);
        tabHostLayout.addView(tabWidget);

        const frame = new android.widget.FrameLayout(context);
        frame.setId(R_ID_TABCONTENT);
        frame.setVisibility(android.view.View.GONE);
        tabHostLayout.addView(frame);

        nativeView.addView(tabHostLayout);

        const listener = new TabChangeListener(this);
        nativeView.setOnTabChangedListener(listener);
        (<any>nativeView).listener = listener;
        nativeView.setup();
        return nativeView;
    }

    public initNativeView(): void {
        super.initNativeView();
        const nativeView: any = this.nativeViewProtected;
        nativeView.listener.owner = this;
        this._tabContentFactory = this._tabContentFactory || new TabContentFactory(this);
    }

    public disposeNativeView() {
        const nativeView: any = this.nativeViewProtected;
        nativeView.listener.owner = null;
        super.disposeNativeView();
    }

    private insertTab(tabItem: NSSegmentViewItem, index: number): void {
        const tabHost = this.nativeViewProtected;
        const tab = tabHost.newTabSpec(index + "");
        tab.setIndicator(tabItem.title + "");
        tab.setContent(this._tabContentFactory);

        this._addingTab = true;

        tabHost.addTab(tab);
        tabItem.setupNativeView(index);
        this._addingTab = false;
        const i = tabHost.getTabWidget().getTabCount() - 1;
        console.log("index2=" + i);
        if (this.height === "auto") {
            this.height = 30;
        }
        tabHost.getTabWidget().getChildAt(i).getLayoutParams().height = utils.layout.toDevicePixels(Number(this.height));
        this.updateTextColor();
    }

    public updateTextColor() {
        // console.log("textColor=" + this.textColor + ";selectedTextColor=" + this.selectedTextColor);
        if (this.selectedTextColor == null) {
            this.selectedTextColor = new Color("#000");
        }
        if (this.textColor == null) {
            this.textColor = new Color("#CCC");
        }
        // console.log("textColor=" + this.textColor + ";selectedTextColor=" + this.selectedTextColor);
        const tabHost = this.nativeViewProtected;
        // console.log("tabHost.getTabWidget().getChildCount()=" + tabHost.getTabWidget().getChildCount());
        for (let i = 0; i < tabHost.getTabWidget().getChildCount(); i++) {
            // console.log("tabHost[i]=" + i);
            const item = <NSSegmentViewItem>this.items[i];
            const tv = <android.widget.TextView>tabHost.getTabWidget().getChildAt(i).findViewById(TITLE_TEXT_VIEW_ID); //Unselected Tabs
            if (i === tabHost.getCurrentTab()) {
                tv.setTextColor(this.selectedTextColor.android);
            } else {
                // console.log("this.textColor.android=" + this.textColor.android);
                tv.setTextColor(this.textColor.android);
            }
        }
    }

    [selectedIndexProperty.getDefault](): number {
        return -1;
    }
    [selectedIndexProperty.setNative](value: number) {
        this.nativeViewProtected.setCurrentTab(value);
    }

    // [heightProperty.getDefault](): number {
    //     return -1;
    // }
    // [heightProperty.setNative](value: number) {
    //     console.log("heightProperty=" + value);
    //     const tabHost = this.nativeViewProtected;
    //     for (let i = 0; i < tabHost.getTabWidget().getTabCount(); i++) {
    //         tabHost.getTabWidget().getChildAt(i).getLayoutParams().height = value;
    //     }
    //     tabHost.getLayoutParams().height = 30;
    // }

    [itemsProperty.getDefault](): NSSegmentViewItem[] {
        return null;
    }
    [itemsProperty.setNative](value: NSSegmentViewItem[]) {
        this.nativeViewProtected.clearAllTabs();

        const newItems = value;
        if (newItems) {
            newItems.forEach((item, i, arr) => this.insertTab(item, i));
        }

        // selectedIndexProperty.coerce(this);
    }

    [titleColorProperty.getDefault](): Color {
        return this.textColor;
    }
    [titleColorProperty.setNative](value: Color) {
        console.log("titleColorProperty=" + value);
        this.textColor = value;
        // this.updateTextColor();
    }
    [selectedColorProperty.getDefault](): Color {
        return this.selectedTextColor;
    }
    [selectedColorProperty.setNative](value: Color) {
        console.log("selectedColorProperty=" + value);
        this.selectedTextColor = value;
        // this.updateTextColor();
    }
}