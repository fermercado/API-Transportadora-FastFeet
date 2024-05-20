import { OrderStatus } from '../../../../domain/enums/OrderStatus';
import {
  statusToRecipientMessage,
  translateStatus,
} from '../../../../application/utils/translateStatus';

describe('statusUtils', () => {
  describe('statusToRecipientMessage', () => {
    it('should have the correct messages for each status', () => {
      expect(statusToRecipientMessage[OrderStatus.Pending]).toBe(
        'Sua encomenda foi recebida pela transportadora e está sendo processada.',
      );
      expect(statusToRecipientMessage[OrderStatus.AwaitingPickup]).toBe(
        'Sua encomenda está pronta para ser retirada pelo entregador.',
      );
      expect(statusToRecipientMessage[OrderStatus.PickedUp]).toBe(
        'Sua encomenda saiu para entrega.',
      );
      expect(statusToRecipientMessage[OrderStatus.Delivered]).toBe(
        'Sua encomenda foi entregue.',
      );
      expect(statusToRecipientMessage[OrderStatus.Returned]).toBe(
        'Não foi possível entregar sua encomenda e ela foi devolvida para a transportadora.',
      );
    });
  });

  describe('translateStatus', () => {
    it('should return the correct message for a known status', () => {
      expect(translateStatus(OrderStatus.Pending)).toBe(
        'Sua encomenda foi recebida pela transportadora e está sendo processada.',
      );
      expect(translateStatus(OrderStatus.AwaitingPickup)).toBe(
        'Sua encomenda está pronta para ser retirada pelo entregador.',
      );
      expect(translateStatus(OrderStatus.PickedUp)).toBe(
        'Sua encomenda saiu para entrega.',
      );
      expect(translateStatus(OrderStatus.Delivered)).toBe(
        'Sua encomenda foi entregue.',
      );
      expect(translateStatus(OrderStatus.Returned)).toBe(
        'Não foi possível entregar sua encomenda e ela foi devolvida para a transportadora.',
      );
    });

    it('should return "Status desconhecido." for an unknown status', () => {
      expect(translateStatus('UnknownStatus')).toBe('Status desconhecido.');
    });

    it('should log an error message for an unknown status', () => {
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      translateStatus('UnknownStatus');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        // eslint-disable-next-line quotes
        `Status 'UnknownStatus' não encontrado. Verifique se o valor corresponde exatamente aos valores do enum.`,
      );

      consoleLogSpy.mockRestore();
    });
  });
});
