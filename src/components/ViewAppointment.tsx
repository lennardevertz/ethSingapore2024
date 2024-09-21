import React, { useState } from 'react';
import { ethers } from 'ethers';
import OnChainCalendar from '../contracts/Scheduler.json';

interface ViewProps {
  signer: ethers.Signer | null;
  account: string;
}

export const ViewAppointment: React.FC<ViewProps> = ({ signer, account }) => {
  const [appointmentId, setAppointmentId] = useState('');
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [message, setMessage] = useState('');

  const viewAppointment = async () => {
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

      const data = await contract.getAppointment(parseInt(appointmentId));

      setAppointmentData({
        id: data.id.toNumber(),
        scheduler: data.scheduler,
        owner: data.owner,
        time: new Date(data.time.toNumber() * 1000),
        amountStaked: ethers.utils.formatEther(data.amountStaked),
        attended: data.attended,
        confirmedByOwner: data.confirmedByOwner,
        stakeReturned: data.stakeReturned,
        canceled: data.canceled,
      });
      setMessage('');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      setAppointmentData(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow col-span-2">
      <h2 className="text-xl font-bold mb-4">View Appointment</h2>
      <input
        type="number"
        placeholder="Appointment ID"
        value={appointmentId}
        onChange={(e) => setAppointmentId(e.target.value)}
        className="w-full mb-4"
      />
      <button
        onClick={viewAppointment}
        className="bg-indigo-500 text-white px-4 py-2 rounded"
      >
        View Appointment
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
      {appointmentData && (
        <div className="mt-4">
          <p><strong>Appointment ID:</strong> {appointmentData.id}</p>
          <p><strong>Scheduler:</strong> {appointmentData.scheduler}</p>
          <p><strong>Calendar Owner:</strong> {appointmentData.owner}</p>
          <p><strong>Time:</strong> {appointmentData.time.toLocaleString()}</p>
          <p><strong>Amount Staked:</strong> {appointmentData.amountStaked} ETH</p>
          <p><strong>Attended:</strong> {appointmentData.attended ? 'Yes' : 'No'}</p>
          <p><strong>Confirmed By Owner:</strong> {appointmentData.confirmedByOwner ? 'Yes' : 'No'}</p>
          <p><strong>Stake Returned:</strong> {appointmentData.stakeReturned ? 'Yes' : 'No'}</p>
          <p><strong>Canceled:</strong> {appointmentData.canceled ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};
