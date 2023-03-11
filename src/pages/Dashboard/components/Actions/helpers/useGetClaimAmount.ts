import { useEffect, useState } from 'react';
import { ContractFunction, ResultsParser } from '@multiversx/sdk-core/out';
import { useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks/useGetNetworkConfig';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers/out';

import { smartContract } from './smartContract';

const resultsParser = new ResultsParser();

export const useGetClaimAmount = () => {
  const { network } = useGetNetworkConfig();
  const [claimAmount, setClaimAmount] = useState<string>();

  const proxy = new ProxyNetworkProvider(network.apiAddress);

  const getClaimAmount = async () => {
    try {
      const query = smartContract.createQuery({
        func: new ContractFunction('getClaimAmount')
      });
      const queryResponse = await proxy.queryContract(query);

      const endpointDefinition = smartContract.getEndpoint('getClaimAmount');

      const { firstValue: amount } = resultsParser.parseQueryResponse(
        queryResponse,
        endpointDefinition
      );

      setClaimAmount(amount?.valueOf()?.toString(10));
    } catch (err) {
      console.error('Unable to call getClaimAmount', err);
    }
  };

  useEffect(() => {
    getClaimAmount();
  }, []);

  return claimAmount;
};
