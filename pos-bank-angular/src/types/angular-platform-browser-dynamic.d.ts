declare module '@angular/platform-browser-dynamic' {
  import { Type } from '@angular/core';

  export interface PlatformRef {
    bootstrapModule<M>(moduleType: Type<M>): Promise<unknown>;
  }

  export function platformBrowserDynamic(): PlatformRef;
}
