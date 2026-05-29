import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: false,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
})
export class IconComponent {
  @Input() icon = 'create';
  @Input() iconsFill: string | null = null;
  @Input() ariaLabel: string | null = null;
}
