import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TransactionType } from '../../../shared/domain/transaction-type';
import { LocalJsonCategoriesRepository } from './local-json-categories.repository';

describe('LocalJsonCategoriesRepository', () => {
  let repository: LocalJsonCategoriesRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    repository = TestBed.inject(LocalJsonCategoriesRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads categories from the local JSON asset', async () => {
    const categoriesRequest = firstValueFrom(repository.getCategories());
    http.expectOne('assets/categories.json').flush([
      { id: 1, name: 'Salario', type: TransactionType.INCOME }
    ]);

    await expect(categoriesRequest).resolves.toEqual([
      { id: 1, name: 'Salario', type: TransactionType.INCOME }
    ]);
  });
});