import React, { useState } from 'react';
import { ethers } from 'ethers';
import OnChainCalendar from '../contracts/Scheduler.json';

interface CreateCalendarProps {
  signer: ethers.Signer | null;
  account: string;
}

export const CreateCalendar: React.FC<CreateCalendarProps> = ({ signer, account }) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [callLength, setCallLength] = useState('');
  const [message, setMessage] = useState('');

  const createCalendar = async () => {
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

      const tx = await contract.createCalendar(
        ethers.utils.parseEther(stakeAmount),
        parseInt(callLength)
      );
      await tx.wait();
      setMessage('Calendar created successfully!');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Calendar</h2>
      <input
        type="text"
        placeholder="Stake Amount in ETH"
        value={stakeAmount}
        onChange={(e) => setStakeAmount(e.target.value)}
        className="w-full mb-2"
      />
      <input
        type="number"
        placeholder="Call Length in seconds"
        value={callLength}
        onChange={(e) => setCallLength(e.target.value)}
        className="w-full mb-4"
      />
      <button
        onClick={createCalendar}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Calendar
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};
