import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
// import "hammerjs"; // HammerJS provides gesture recognition capabilities required by some
// components
// (mat-slide-toggle, mat-slider, matToolTip).
// -> wahrscheinlich nicht noetig

if (environment.production) {
  enableProdMode();
}

// Clientseitig keine Config-Files verwenden (package.json?)
// Die einzige config, die hier gebraucht wird, ist der Pfad zur Web-API.
// Alles andere kann bei Bedarf der Webserver liefern

// AppConfig.load(environment.configFile).then(() => {
// angular
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => {
    console.error("Runtime-ERROR " + err);
  });
// });
