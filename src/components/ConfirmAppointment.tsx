import React, { useState } from 'react';
import { ethers } from 'ethers';
import OnChainCalendar from '../contracts/Scheduler.json';

export const ConfirmAppointment = () => {
  const [appointmentId, setAppointmentId] = useState('');
  const [attended, setAttended] = useState(false);
  const [message, setMessage] = useState('');

  const confirmAppointment = async () => {
    if (!window.ethereum) {
      setMessage('MetaMask is not installed');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        '0x88751b2Be2578825E8b7662d74f63639D0C10222',
        OnChainCalendar.abi,
        signer
      );

      const tx = await contract.confirmAppointment(
        parseInt(appointmentId),
        attended
      );
      await tx.wait();
      setMessage('Appointment confirmed successfully!');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Confirm Appointment</h2>
      <input
        type="number"
        placeholder="Appointment ID"
        value={appointmentId}
        onChange={(e) => setAppointmentId(e.target.value)}
        className="w-full mb-2"
      />
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={attended}
          onChange={(e) => setAttended(e.target.checked)}
          className="mr-2"
        />
        <label>Attended</label>
      </div>
      <button
        onClick={confirmAppointment}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
      >
        Confirm Appointment
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};
