import { Component, input } from '@angular/core';

/**
 * Presentational wrapper: gives every data table a consistent card shell,
 * horizontal scroll on narrow viewports, and built-in loading/empty states.
 * Pages project their own <table> (desktop/tablet) and, optionally, a
 * separate stacked-card list for mobile - see usage in feature pages.
 */
@Component({
  selector: 'app-table',
  standalone: true,
  template: `
    <div class="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class TableComponent {
  readonly dense = input(false);
}
