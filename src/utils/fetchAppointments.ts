import { ethers } from 'ethers';
import OnChainCalendar from '../contracts/Scheduler.json';

export interface Appointment {
  id: number;
  scheduler: string;
  owner: string;
  time: Date;
  amountStaked: string;
  attended: boolean;
  confirmedByOwner: boolean;
  stakeReturned: boolean;
  canceled: boolean;
}

export const fetchAppointments = async (
  signer: ethers.Signer,
  account: string
): Promise<Appointment[]> => {
  const contractAddress = '0x88751b2Be2578825E8b7662d74f63639D0C10222';
  const contract = new ethers.Contract(
    contractAddress,
    OnChainCalendar.abi,
    signer
  );

  const fetchedAppointments: Appointment[] = [];

  const calendar = await contract.calendars(account);
  const hasCalendar = calendar.stakeAmount.gt(0);

  if (hasCalendar) {
    const appointmentIds: ethers.BigNumber[] = await contract.getCalendarAppointments(account);

    for (let i = 0; i < appointmentIds.length; i++) {
      const appointmentId = appointmentIds[i].toNumber();
      const data = await contract.getAppointment(appointmentId);

      fetchedAppointments.push({
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
    }
  }

  const schedulerAppointmentIds: ethers.BigNumber[] = await contract.getSchedulerAppointments(account);

  for (let i = 0; i < schedulerAppointmentIds.length; i++) {
    const appointmentId = schedulerAppointmentIds[i].toNumber();
    const data = await contract.getAppointment(appointmentId);

    if (!fetchedAppointments.find((appt) => appt.id === appointmentId)) {
      fetchedAppointments.push({
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
    }
  }

  fetchedAppointments.sort((a, b) => a.time.getTime() - b.time.getTime());

  return fetchedAppointments;
};
