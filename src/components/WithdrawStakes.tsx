import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import OnChainCalendar from '../contracts/Scheduler.json';

interface WithdrawProps {
  signer: ethers.Signer | null;
  account: string;
}

export const WithdrawStakes: React.FC<WithdrawProps> = ({ signer, account }) => {
  const [message, setMessage] = useState('');
  const [availableBalance, setAvailableBalance] = useState<string>('0');

  const fetchAvailableBalance = useCallback(async () => {
    if (!signer || !account) {
      setAvailableBalance('0');
      return;
    }

    try {
      const contract = new ethers.Contract(
        '0x88751b2Be2578825E8b7662d74f63639D0C10222',
        OnChainCalendar.abi,
        signer
      );

      const balance = await contract.balances(account);
      const formattedBalance = ethers.utils.formatEther(balance);
      setAvailableBalance(formattedBalance);
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      setAvailableBalance('0');
    }
  }, [signer, account]);

  const withdrawStakes = async () => {
    if (!signer) {
      setMessage('Please connect your wallet');
      return;
    }

    try {
      const contract = new ethers.Contract(
        '0x88751b2Be2578825E8b7662d74f63639D0C10222',
        OnChainCalendar.abi,
        signer
      );

      const tx = await contract.withdraw();
      await tx.wait();
      setMessage('Withdrawal successful!');
      fetchAvailableBalance();
    } catch (error: any) {
      console.error('Error during withdrawal:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchAvailableBalance();
  }, [fetchAvailableBalance]);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Withdraw Stakes</h2>
      <p className="mb-4">
        Available Balance: <strong>{availableBalance} ETH</strong>
      </p>
      <button
        onClick={withdrawStakes}
        className="bg-purple-500 text-white px-4 py-2 rounded"
      >
        Withdraw
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};
