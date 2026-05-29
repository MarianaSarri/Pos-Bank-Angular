import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonComponent } from './button/button.component';
import { CardComponent } from './card/card.component';
import { CategoryComboboxComponent } from './category-combobox/category-combobox.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { HeaderComponent } from './header/header.component';
import { IconComponent } from './icon/icon.component';
import { MenuComponent } from './menu/menu.component';
import { TransactionModalComponent } from './transaction-modal/transaction-modal.component';
import { TransactionsTableComponent } from './transactions-table/transactions-table.component';

@NgModule({
  declarations: [
    ButtonComponent,
    CardComponent,
    CategoryComboboxComponent,
    ConfirmationDialogComponent,
    HeaderComponent,
    IconComponent,
    MenuComponent,
    TransactionModalComponent,
    TransactionsTableComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [
    ButtonComponent,
    CardComponent,
    CategoryComboboxComponent,
    ConfirmationDialogComponent,
    HeaderComponent,
    IconComponent,
    MenuComponent,
    TransactionModalComponent,
    TransactionsTableComponent,
  ],
})
export class ComponentsModule {}
