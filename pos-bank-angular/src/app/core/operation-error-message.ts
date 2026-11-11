import { HttpErrorResponse } from '@angular/common/http';

export function getOperationErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error
      ? error.message
      : 'Nao foi possivel concluir a operacao. Tente novamente.';
  }

  if (error.status === 0) {
    return 'Nao foi possivel carregar os dados. Verifique a conexao e tente novamente.';
  }

  if (error.status === 401 || error.status === 403) {
    return 'A solicitacao foi recusada. Verifique sua sessao e permissoes.';
  }

  if (error.status === 404) {
    return 'Os dados solicitados nao foram encontrados.';
  }

  if (error.status === 429) {
    return 'Muitas solicitacoes foram feitas. Aguarde um momento e tente novamente.';
  }

  if (error.status >= 500) {
    return `Nao foi possivel carregar os dados no momento (HTTP ${error.status}).`;
  }

  return `Nao foi possivel processar os dados (HTTP ${error.status}).`;
}
