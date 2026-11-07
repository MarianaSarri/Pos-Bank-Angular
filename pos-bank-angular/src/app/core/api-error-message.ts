import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Nao foi possivel concluir a operacao. Tente novamente.';
  }

  if (error.status === 0) {
    return 'Nao foi possivel conectar a API. Verifique a conexao e se o servico esta disponivel.';
  }

  if (error.status === 401 || error.status === 403) {
    return 'A API recusou a solicitacao. Verifique sua sessao e permissoes.';
  }

  if (error.status === 404) {
    return 'O endpoint solicitado nao foi encontrado.';
  }

  if (error.status === 429) {
    return 'A API recebeu muitas solicitacoes. Aguarde um momento e tente novamente.';
  }

  if (error.status >= 500) {
    return `A API esta indisponivel no momento (HTTP ${error.status}). Tente novamente mais tarde.`;
  }

  return `A API recusou a solicitacao (HTTP ${error.status}). Verifique os dados e tente novamente.`;
}