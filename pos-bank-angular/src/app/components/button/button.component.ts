import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input() label = '';
  @Input() showIcons = true;
  @Input() iconButton = 'create';
  @Input() iconsFill = 'var(--text-inverse)';
  @Input() customClass = '';
  @Output() onClick = new EventEmitter<void>();
}
