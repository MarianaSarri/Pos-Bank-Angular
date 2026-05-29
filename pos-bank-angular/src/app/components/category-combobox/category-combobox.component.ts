import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Category } from '../../models/transaction.model';

@Component({
  selector: 'app-category-combobox',
  standalone: false,
  templateUrl: './category-combobox.component.html',
  styleUrl: './category-combobox.component.css',
})
export class CategoryComboboxComponent implements OnChanges {
  @Input() id = 'transaction-category';
  @Input() categories: Category[] = [];
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  open = false;
  searchText = '';

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  get filteredCategories(): Category[] {
    const term = this.searchText.trim().toLowerCase();
    if (!term) return this.categories;

    return this.categories.filter((category) =>
      category.name.toLowerCase().includes(term),
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] || changes['categories']) {
      this.syncTextFromValue();
    }
  }

  handleInput(text: string) {
    this.searchText = text;
    this.open = true;

    const exactMatch = this.categories.find(
      (category) => category.name.toLowerCase() === text.trim().toLowerCase(),
    );

    if (exactMatch) {
      this.valueChange.emit(String(exactMatch.id));
    }
  }

  selectCategory(category: Category) {
    this.searchText = category.name;
    this.valueChange.emit(String(category.id));
    this.open = false;
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!target) return;

    if (!this.elementRef.nativeElement.contains(target)) {
      this.open = false;
      this.syncTextFromValue();
    }
  }

  private syncTextFromValue() {
    const selected = this.categories.find((category) => String(category.id) === this.value);
    this.searchText = selected?.name ?? '';
  }
}
