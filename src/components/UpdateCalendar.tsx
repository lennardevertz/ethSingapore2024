import React, { useState } from 'react';
import { ethers } from 'ethers';
import OnChainCalendar from '../contracts/Scheduler.json';

interface UpdateProps {
  signer: ethers.Signer | null;
  account: string;
}

export const UpdateCalendar: React.FC<UpdateProps> = ({ signer, account }) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [callLength, setCallLength] = useState('');
  const [message, setMessage] = useState('');

  const updateCalendarSettings = async () => {
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

      const tx = await contract.updateCalendarSettings(
        ethers.utils.parseEther(stakeAmount),
        parseInt(callLength)
      );
      await tx.wait();
      setMessage('Calendar settings updated successfully!');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Update Calendar Settings</h2>
      <input
        type="text"
        placeholder="New Stake Amount in ETH"
        value={stakeAmount}
        onChange={(e) => setStakeAmount(e.target.value)}
        className="w-full mb-2"
      />
      <input
        type="number"
        placeholder="New Call Length in seconds"
        value={callLength}
        onChange={(e) => setCallLength(e.target.value)}
        className="w-full mb-4"
      />
      <button
        onClick={updateCalendarSettings}
        className="bg-orange-500 text-white px-4 py-2 rounded"
      >
        Update Settings
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};
