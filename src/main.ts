import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

function suppressFirefoxLeafletDeprecatedEventWarnings() {
  const isFirefox = typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);
  if (!isFirefox || typeof MouseEvent === 'undefined') return;

  // Leaflet can touch these legacy properties internally on Firefox.
  // We provide neutral getters to avoid repetitive deprecation console warnings.
  const safeDefine = (prop: string, value: unknown) => {
    try {
      Object.defineProperty(MouseEvent.prototype, prop, {
        configurable: true,
        get: () => value,
      });
    } catch {
      // Ignore if browser doesn't allow overriding this descriptor.
    }
  };

  safeDefine('mozPressure', 0);
  safeDefine('mozInputSource', 1);
}

suppressFirefoxLeafletDeprecatedEventWarnings();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
