
import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch(err => console.error('Erro ao inicializar a federação:', err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err))
