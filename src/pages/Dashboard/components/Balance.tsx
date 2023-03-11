import axios from 'axios';
import { useState, useEffect } from 'react';

interface TokenData {
  balance: number;
}

const Balance = () => {
  const [tokenData, setTokenData] = useState<TokenData[]>([]);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const { data } = await axios.get<TokenData[]>(
          'https://devnet-api.multiversx.com/accounts/erd10x2dcvqxvgf8urkaanl7cak4ynhewjt8q5xgl0kssngjnjp40ytssdfd8k/tokens'
        );
        setTokenData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTokenData();
  }, []);

  const balance = tokenData.reduce(
    (totalBalance, token) => totalBalance + token.balance,
    0
  );

  return (
    <div>
      {tokenData.map((token, index) => (
        <div key={index}>Token balance: {token.balance / Math.pow(10, 18)}</div>
      ))}
    </div>
  );
};

export default Balance;
