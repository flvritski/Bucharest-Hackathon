import * as React from 'react';
import { useEffect, useState } from 'react';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGetPendingTransactions } from '@multiversx/sdk-dapp/hooks/transactions/useGetPendingTransactions';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { refreshAccount } from '@multiversx/sdk-dapp/utils';
import moment from 'moment';
import { contractAddress } from 'config';
import { useGetTimeToPong, useGetPingAmount } from './helpers';
import {
  ESDTTransferPayloadBuilder,
  TokenIdentifierType,
  TokenIdentifierValue,
  TokenPayment,
  TransactionPayload
} from '@multiversx/sdk-core/out';
import {
  useGetAccountInfo,
  useGetNetworkConfig
} from '@multiversx/sdk-dapp/hooks';
import BigNumber from 'bignumber.js';

export const COLLECTION_TICKER = 'ZGP-e11b25';

export const Actions = () => {
  const { network } = useGetNetworkConfig();

  const [sessionId, setSessionId] = React.useState<string>('');

  const { hasPendingTransactions } = useGetPendingTransactions();
  const getTimeToPong = useGetTimeToPong();
  const pingAmount = useGetPingAmount();

  const [secondsLeft, setSecondsLeft] = useState<number>();
  const [hasPing, setHasPing] = useState<boolean>();
  const /*transactionSessionId*/ [, setTransactionSessionId] = useState<
      string | null
    >(null);

  const mount = () => {
    if (secondsLeft) {
      const interval = setInterval(() => {
        setSecondsLeft((existing) => {
          if (existing) {
            return existing - 1;
          } else {
            clearInterval(interval);
            return 0;
          }
        });
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  };

  useEffect(mount, [hasPing]);

  const setSecondsRemaining = async () => {
    const secondsRemaining = await getTimeToPong();

    switch (secondsRemaining) {
      case undefined:
      case null:
        setHasPing(true);
        break;
      case 0:
        setSecondsLeft(0);
        setHasPing(false);
        break;
      default: {
        setSecondsLeft(secondsRemaining);
        setHasPing(false);
        break;
      }
    }
  };

  useEffect(() => {
    setSecondsRemaining();
  }, [hasPendingTransactions]);

  ///******===== Stake function ******==== */
  const sendStakeTokenTransaction = async (
    tokenId: TokenIdentifierValue,
    amount: BigNumber
  ) => {
    const payment = TokenPayment.fungibleFromAmount(
      COLLECTION_TICKER,
      amount,
      18
    );

    const stakeTransaction = {
      data: new TransactionPayload(
        `ESDTTransfer@${tokenId}@056bc75e2d63100000@7374616b65`
      ),
      value: 0,
      receiver: contractAddress,
      gasLimit: '600000000',
      chainID: network.chainId,
      singleESDTTransfer: payment
    };

    const { sessionId, error } = await sendTransactions({
      transactions: stakeTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing Ping transaction',
        errorMessage: 'An error has occured during Ping',
        successMessage: 'Ping transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const sendPingTransaction = async () => {
    const pingTransaction = {
      value: pingAmount,
      data: 'ping',
      receiver: contractAddress,
      gasLimit: '60000000'
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: pingTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing Ping transaction',
        errorMessage: 'An error has occured during Ping',
        successMessage: 'Ping transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const sendPongTransaction = async () => {
    const pongTransaction = {
      value: '0',
      data: 'pong',
      receiver: contractAddress,
      gasLimit: '60000000'
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: pongTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing Pong transaction',
        errorMessage: 'An error has occured during Pong',
        successMessage: 'Pong transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const pongAllowed = secondsLeft === 0 && !hasPendingTransactions;
  const notAllowedClass = pongAllowed ? '' : 'not-allowed disabled';

  const timeRemaining = moment()
    .startOf('day')
    .seconds(secondsLeft || 0)
    .format('mm:ss');

  return (
    <div className='d-flex mt-4 justify-content-center'>
      {hasPing !== undefined && (
        <>
          {hasPing && !hasPendingTransactions ? (
            <div className='action-btn'>
              <button
                className='btn'
                onClick={() =>
                  sendStakeTokenTransaction(
                    new TokenIdentifierValue(
                      '4841434b544f4b454e2d323863393230'
                    ),
                    new BigNumber(10)
                  )
                }
              >
                <FontAwesomeIcon icon={faArrowUp} className='text-primary' />
              </button>
              <a href='/' className='text-white text-decoration-none'>
                Stake
              </a>
            </div>
          ) : (
            <>
              <div className='d-flex flex-column'>
                <div
                  {...{
                    className: `action-btn ${notAllowedClass}`,
                    ...(pongAllowed ? { onClick: sendPongTransaction } : {})
                  }}
                >
                  <button className={`btn ${notAllowedClass}`}>
                    <FontAwesomeIcon
                      icon={faArrowDown}
                      className='text-primary'
                    />
                  </button>
                  <span className='text-white'>
                    {pongAllowed ? (
                      <a href='/' className='text-white text-decoration-none'>
                        Pong
                      </a>
                    ) : (
                      <>Pong</>
                    )}
                  </span>
                </div>
                {!pongAllowed && !hasPendingTransactions && (
                  <span className='opacity-6 text-white'>
                    {timeRemaining} until able to Pong
                  </span>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
