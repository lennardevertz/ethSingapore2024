# On-Chain Calendar App

An application that enables users to create calendars, schedule appointments, and manage stakes via Ethereum smart contracts.

## Features

### Create Calendar
- Define a stake amount and call length.
- Stake amount is required to schedule appointments.
- Call length specifies the duration of each appointment.

### Update Calendar
- Modify stake amount and call length for existing calendars.

### Schedule Appointment
- Schedule appointments with calendar owners by staking the required amount.
- Select specific dates and times for appointments.

### Withdraw Stakes
- View available balance from the balances mapping in the smart contract.
- Withdraw available stakes directly from the contract.

### My Appointments
- View scheduled and received appointments.
- Calendar owners can confirm or deny attendance.
- Appointments are sorted by date and time.

### View Appointment
- Access detailed information about individual appointments.

### Login/Logout
- Connect and disconnect Ethereum wallets (e.g., MetaMask).
- Session management for user authentication.

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- `ethers.js` for blockchain interactions

### Smart Contracts
- Solidity for contract development
- Ethereum blockchain
- Remix for deployment

### Network
- Sepolia Testnet for testing and development

### Contract
- 0x88751b2Be2578825E8b7662d74f63639D0C10222

## Getting Started

### Prerequisites
- Node.js and npm
- MetaMask browser extension

### Installation

Clone the Repository:  
  
```bash  
git clone https://github.com/lennardevertz/ethSingapore2024.git  
cd ethSingapore2024  
```
  
Install Dependencies:  
  ```bash
npm install  
 ``` 
  
### Running the Application  
Start the app:  
  
 ```bash
npm start  
```
Access the app at http://localhost:3000/.
