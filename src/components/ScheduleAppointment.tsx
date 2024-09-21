import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Appointment, fetchAppointments } from '../utils/fetchAppointments';
import OnChainCalendar from '../contracts/Scheduler.json';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ScheduleAppointmentProps {
  signer: ethers.Signer | null;
  account: string;
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

export const ScheduleAppointment: React.FC<ScheduleAppointmentProps> = ({
  signer,
  account,
  setAppointments,
}) => {
  const [ownerAddress, setOwnerAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [message, setMessage] = useState('');

  const scheduleAppointment = async () => {
    if (!signer) {
      setMessage('Please connect your wallet');
      return;
    }

    if (!selectedDate) {
      setMessage('Please select an appointment date and time.');
      return;
    }

    try {
      const contract = new ethers.Contract(
        '0x88751b2Be2578825E8b7662d74f63639D0C10222',
        OnChainCalendar.abi,
        signer
      );

      const calendar = await contract.calendars(ownerAddress);
      const stakeAmount = calendar.stakeAmount.toString();

      const appointmentTime = Math.floor(selectedDate.getTime() / 1000);

      const tx = await contract.scheduleAppointment(
        ownerAddress,
        appointmentTime,
        { value: stakeAmount }
      );
      await tx.wait();

      const updatedAppointments = await fetchAppointments(signer, account);
      setAppointments(updatedAppointments);

      setMessage('Appointment scheduled successfully!');
    } catch (error: any) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Schedule Appointment</h2>
      <input
        type="text"
        placeholder="Calendar Owner Address"
        value={ownerAddress}
        onChange={(e) => setOwnerAddress(e.target.value)}
        className="w-full mb-2"
      />
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date) => setSelectedDate(date)}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="MMMM d, yyyy h:mm aa"
        className="w-full mb-4"
        placeholderText="Select appointment date and time"
      />
      <button
        onClick={scheduleAppointment}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Schedule Appointment
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};
