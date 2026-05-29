import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CategoriesService } from '../../services/categories.service';
import { TransactionInput, Category } from '../../models/transaction.model';

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-transaction-modal',
  standalone: false,
  templateUrl: './transaction-modal.component.html',
  styleUrl: './transaction-modal.component.css',
})
export class TransactionModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Input() transaction: any | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<TransactionInput>();
  @ViewChild('dialogRef') dialogRef!: ElementRef<HTMLDivElement>;
  @ViewChild('headingRef') headingRef!: ElementRef<HTMLHeadingElement>;

  description = '';
  value = '';
  date = '';
  category = '';
  type: 'income' | 'expense' | '' = '';
  categoryOptions: Category[] = [];
  isEditing = false;
  private lastFocused: HTMLElement | null = null;

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit() {
    if (this.transaction) {
      this.isEditing = true;
      this.description = this.transaction.description;
      this.value = Math.abs(this.transaction.value).toString();
      this.date = this.transaction.date;
      this.category = this.transaction.category.toString();
      this.type = this.transaction.value < 0 ? 'expense' : 'income';
    }
    this.updateCategoryOptions();
  }

  ngAfterViewInit() {
    if (this.isOpen) {
      this.lastFocused = document.activeElement as HTMLElement;
      requestAnimationFrame(() => {
        const focusable = this.dialogRef?.nativeElement?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        } else {
          this.headingRef?.nativeElement?.focus();
        }
      });
    }
  }

  ngOnDestroy() {
    this.lastFocused?.focus();
  }

  updateCategoryOptions() {
    const cats = this.categoriesService.getCategories();
    if (this.type === 'expense') {
      this.categoryOptions = cats.categoriesExpense;
      return;
    }

    if (this.type === 'income') {
      this.categoryOptions = cats.categoriesIncome;
      return;
    }

    this.categoryOptions = [];
  }

  setType(type: 'income' | 'expense') {
    this.type = type;
    this.category = '';
    this.updateCategoryOptions();
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onClose.emit();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = this.dialogRef?.nativeElement?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable || focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  handleSubmit() {
    if (!this.type || !this.description || !this.category || !this.value || !this.date) {
      return;
    }

    const numericValue = parseFloat(this.value);
    const numericCategory = parseInt(this.category, 10);

    this.onSubmit.emit({
      description: this.description.trim(),
      category: numericCategory,
      value: this.type === 'expense' ? -Math.abs(numericValue) : Math.abs(numericValue),
      type: this.type as 'income' | 'expense',
      date: this.date,
    });

    this.resetForm();
    this.onClose.emit();
  }

  private resetForm() {
    this.description = '';
    this.value = '';
    this.date = '';
    this.category = '';
    this.type = '';
  }
}
