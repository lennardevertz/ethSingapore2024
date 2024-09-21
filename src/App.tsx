import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Appointment, fetchAppointments } from './utils/fetchAppointments';
import { CreateCalendar } from './components/CreateCalendar';
import { UpdateCalendar } from './components/UpdateCalendar';
import { ScheduleAppointment } from './components/ScheduleAppointment';
import { WithdrawStakes } from './components/WithdrawStakes';
import { MyAppointments } from './components/MyAppointments';
import { ViewAppointment } from './components/ViewAppointment';
import { ConnectWallet } from './components/ConnectWallet';

function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [account, setAccount] = useState<string>('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);


  useEffect(() => {
    const loadAppointments = async () => {
      if (signer && account) {
        const appointments = await fetchAppointments(signer, account);
        setAppointments(appointments);
      } else {
        setAppointments([]);
      }
    };

    loadAppointments();
  }, [signer, account]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ConnectWallet
        account={account}
        setAccount={setAccount}
        setSigner={setSigner}
      />
      <h1 className="text-2xl font-bold text-center mb-8">On-Chain Calendar DApp</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CreateCalendar signer={signer} account={account} />
        <UpdateCalendar signer={signer} account={account} />
        <ScheduleAppointment
          signer={signer}
          account={account}
          setAppointments={setAppointments}
        />
        <WithdrawStakes signer={signer} account={account} />
        <MyAppointments
          appointments={appointments}
          setAppointments={setAppointments}
          signer={signer}
          account={account}
        />
        <ViewAppointment signer={signer} account={account} />
      </div>
    </div>
  );
}

export default App;
