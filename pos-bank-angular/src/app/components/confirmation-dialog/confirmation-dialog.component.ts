import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: false,
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css',
})
export class ConfirmationDialogComponent implements AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() description = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();
  @ViewChild('dialogRef') dialogRef!: ElementRef<HTMLDivElement>;
  @ViewChild('headingRef') headingRef!: ElementRef<HTMLHeadingElement>;

  private lastFocused: HTMLElement | null = null;

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

  handleConfirm() {
    this.onConfirm.emit();
    this.onClose.emit();
  }
}
