/**
 * Inicializador da Sincronização Automática do Pinata
 * Garante que a sincronização seja iniciada quando o app carregar
 */

import { useEffect } from 'react';
import PinataAutoSync from '../services/pinataAutoSync.service';

const usePinataAutoInit = () => {
  useEffect(() => {
    // Inicia a sincronização automática quando o componente montar
    if (!PinataAutoSync.getStats().isRunning) {
      console.log('🚀 Iniciando sincronização automática do Pinata...');
      PinataAutoSync.start();
    }

    // Cleanup: para a sincronização quando o app for desmontado
    return () => {
      // Não paramos aqui para manter a sincronização em background
      // PinataAutoSync.stop();
    };
  }, []);

  // Listener para erros de rede
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Conexão restaurada - reiniciando sincronização');
      if (!PinataAutoSync.getStats().isRunning) {
        PinataAutoSync.start();
      }
    };

    const handleOffline = () => {
      console.log('📡 Conexão perdida - pausando sincronização');
      PinataAutoSync.stop();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
};

export default usePinataAutoInit;