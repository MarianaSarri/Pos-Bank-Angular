import { Component } from '@angular/core';
import { TransactionsService } from '../../services/transactions.service';
import { TransactionInput } from '../../models/transaction.model';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isModalOpen = false;

  constructor(private transactionsService: TransactionsService) {}

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  handleAddTransaction(input: TransactionInput) {
    this.transactionsService.addTransaction(input);
    this.closeModal();
  }
}
