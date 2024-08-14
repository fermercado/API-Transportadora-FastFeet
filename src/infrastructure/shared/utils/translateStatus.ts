import { OrderStatus } from '../../../domain/enums/OrderStatus';

export const statusToRecipientMessage = {
  [OrderStatus.Pending]:
    'Sua encomenda foi recebida pela transportadora e está sendo processada.',
  [OrderStatus.AwaitingPickup]:
    'Sua encomenda está pronta para ser retirada pelo entregador.',
  [OrderStatus.PickedUp]: 'Sua encomenda saiu para entrega.',
  [OrderStatus.Delivered]: 'Sua encomenda foi entregue.',
  [OrderStatus.Returned]:
    'Não foi possível entregar sua encomenda e ela foi devolvida para a transportadora.',
};

export const translateStatus = (statusKey: string): string => {
  const status: OrderStatus | undefined = Object.values(OrderStatus).find(
    (s) => s === statusKey,
  ) as OrderStatus;

  if (!status) {
    console.log(
      `Status '${statusKey}' não encontrado. Verifique se o valor corresponde exatamente aos valores do enum.`,
    );
    return 'Status desconhecido.';
  }

  return statusToRecipientMessage[status];
};
