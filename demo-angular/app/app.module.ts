import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NSSegmentViewModule } from "nativescript-segment-view/angular";

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, NSSegmentViewModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
