import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Appointment, fetchAppointments } from '../utils/fetchAppointments';
import OnChainCalendar from '../contracts/Scheduler.json';
import { truncateAddress } from '../utils/helpers';

interface MyAppointmentsProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  signer: ethers.Signer | null;
  account: string;
}

export const MyAppointments: React.FC<MyAppointmentsProps> = ({
  appointments,
  setAppointments,
  signer,
  account,
}) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadAppointments = async () => {
      if (signer && account) {
        const updatedAppointments = await fetchAppointments(signer, account);
        setAppointments(updatedAppointments);
      }
    };

    loadAppointments();
  }, [signer, account, setAppointments]);

  const confirmAttendance = async (appointmentId: number, attended: boolean) => {
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

      const tx = await contract.confirmAppointment(appointmentId, attended);
      await tx.wait();
      setMessage('Appointment confirmed successfully!');

      const updatedAppointments = await fetchAppointments(signer, account);
      setAppointments(updatedAppointments);
    } catch (error: any) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const cancelAppointment = async (appointmentId: number) => {
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

      const tx = await contract.cancelAppointment(appointmentId);
      await tx.wait();
      setMessage('Appointment canceled successfully!');

      const updatedAppointments = await fetchAppointments(signer, account);
      setAppointments(updatedAppointments);
    } catch (error: any) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow col-span-2">
      <h2 className="text-xl font-bold mb-4">My Appointments</h2>
      {message && <p className="text-red-500">{message}</p>}
      {appointments.length > 0 ? (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Appointment ID</th>
              <th className="py-2">Calendar Owner</th>
              <th className="py-2">Scheduler</th>
              <th className="py-2">Time</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id} className="text-center">
                <td className="py-2">{appt.id}</td>
                <td className="py-2">{truncateAddress(appt.owner)}</td>
                <td className="py-2">{truncateAddress(appt.scheduler)}</td>
                <td className="py-2">{appt.time.toLocaleString()}</td>
                <td className="py-2">
                  {appt.canceled
                    ? 'Canceled'
                    : appt.confirmedByOwner
                    ? appt.attended
                      ? 'Attended'
                      : 'No Show'
                    : 'Pending'}
                </td>
                <td className="py-2">
                  {appt.owner.toLowerCase() === account.toLowerCase() &&
                    !appt.confirmedByOwner &&
                    !appt.canceled && (
                      <>
                        <button
                          onClick={() => confirmAttendance(appt.id, true)}
                          className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => confirmAttendance(appt.id, false)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Deny
                        </button>
                      </>
                    )}
                  {appt.scheduler.toLowerCase() === account.toLowerCase() &&
                    !appt.canceled &&
                    !appt.confirmedByOwner && (
                      <button
                        onClick={() => cancelAppointment(appt.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No appointments found.</p>
      )}
    </div>
  );
};
