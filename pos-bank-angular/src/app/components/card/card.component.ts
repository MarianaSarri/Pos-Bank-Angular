import { Component, Input } from '@angular/core';

export type CardType = {
  className?: string;
  title?: string;
  currencySymbol?: string;
  amount?: string;
  valueColor?: string;
};

@Component({
  selector: 'app-card',
  standalone: false,
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent {
  @Input() className = '';
  @Input() title = 'Default';
  @Input() currencySymbol = 'R$';
  @Input() amount = '3000';
  @Input() valueColor: string | undefined;
}
