import { useEffect, useState } from 'react';
import { ContractFunction, ResultsParser } from '@multiversx/sdk-core/out';
import { useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks/useGetNetworkConfig';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers/out';

import { smartContract } from './smartContract';

const resultsParser = new ResultsParser();

export const useGetStakeAmount = () => {
  const { network } = useGetNetworkConfig();
  const [stakeAmount, setStakeAmount] = useState<string>();

  const proxy = new ProxyNetworkProvider(network.apiAddress);

  const getStakeAmount = async () => {
    try {
      let query = smartContract.createQuery({
        func: new ContractFunction('stake')
      });
      const queryResponse = await proxy.queryContract(query);

      const endpointDefinition = smartContract.getEndpoint('stake');

      const { firstValue: amount } = resultsParser.parseQueryResponse(
        queryResponse,
        endpointDefinition
      );

      setStakeAmount(amount?.valueOf()?.toString(10));
    } catch (err) {
      console.error('Unable to call getStakeAmount', err);
    }
  };

  useEffect(() => {
    getStakeAmount();
  }, []);

  return stakeAmount;
};


