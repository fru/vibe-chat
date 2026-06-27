import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(async () => {
    const a = await fetch('/api/version.json');
    console.log(await a.text());
    const b = await fetch('/version.json');
    console.log(await b.text());
  })
  .catch((err) => console.error(err));
