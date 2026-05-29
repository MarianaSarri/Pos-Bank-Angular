import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { TransactionsComponent } from './transactions.component';
import { TransactionsRoutingModule } from './transactions-routing.module';

@NgModule({
  declarations: [TransactionsComponent],
  imports: [CommonModule, ComponentsModule, TransactionsRoutingModule],
})
export class TransactionsModule {}
