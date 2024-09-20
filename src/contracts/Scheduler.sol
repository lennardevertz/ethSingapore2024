// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Scheduler {
    struct Appointment {
        uint256 id;
        address scheduler;
        address owner;
        uint256 time;
        uint256 amountStaked;
        bool attended;
        bool confirmedByOwner;
        bool stakeReturned;
        bool canceled;
    }

    struct Calendar {
        uint256 stakeAmount;
        uint256 callLength;
        uint256[] appointmentIds;
    }

    uint256 public nextAppointmentId;
    mapping(uint256 => Appointment) public appointments;
    mapping(address => Calendar) public calendars;
    mapping(address => uint256) public balances;
    mapping(address => uint256[]) public schedulerAppointments;

    event CalendarCreated(address indexed owner, uint256 stakeAmount, uint256 callLength);
    event CalendarUpdated(address indexed owner, uint256 newStakeAmount, uint256 newCallLength);
    event AppointmentScheduled(
        uint256 appointmentId,
        address indexed owner,
        address indexed scheduler,
        uint256 time
    );
    event AppointmentConfirmed(uint256 appointmentId, bool attended);
    event AppointmentCanceled(uint256 appointmentId);
    event StakeReturned(address indexed scheduler, uint256 amount);
    event StakeForfeited(address indexed owner, uint256 amount);

    function createCalendar(uint256 _stakeAmount, uint256 _callLength) public {
        Calendar storage calendar = calendars[msg.sender];
        require(calendar.stakeAmount == 0, "Calendar already exists");
        require(_callLength > 0, "Call length must be greater than zero");
        calendar.stakeAmount = _stakeAmount;
        calendar.callLength = _callLength;
        emit CalendarCreated(msg.sender, _stakeAmount, _callLength);
    }

    function updateCalendarSettings(uint256 _newStakeAmount, uint256 _newCallLength) public {
        Calendar storage calendar = calendars[msg.sender];
        require(calendar.stakeAmount != 0, "Calendar does not exist");
        require(_newCallLength > 0, "Call length must be greater than zero");
        calendar.stakeAmount = _newStakeAmount;
        calendar.callLength = _newCallLength;
        emit CalendarUpdated(msg.sender, _newStakeAmount, _newCallLength);
    }

    function scheduleAppointment(address _owner, uint256 _time) public payable {
        Calendar storage calendar = calendars[_owner];
        require(calendar.stakeAmount != 0, "Calendar does not exist");
        require(msg.value == calendar.stakeAmount, "Incorrect stake amount");
        require(_time >= block.timestamp, "Cannot schedule in the past");

        uint256 newStartTime = _time;
        uint256 newEndTime = newStartTime + calendar.callLength;

        for (uint256 i = 0; i < calendar.appointmentIds.length; i++) {
            uint256 existingAppointmentId = calendar.appointmentIds[i];
            Appointment storage existingAppointment = appointments[existingAppointmentId];

            if (existingAppointment.canceled || existingAppointment.time + calendar.callLength <= block.timestamp) {
                continue;
            }

            if (!existingAppointment.confirmedByOwner) {
                uint256 existingStartTime = existingAppointment.time;
                uint256 existingEndTime = existingStartTime + calendar.callLength;

                bool overlap = (newStartTime < existingEndTime) && (existingStartTime < newEndTime);
                if (overlap) {
                    revert("Appointment overlaps with an existing appointment");
                }
            }
        }

        uint256 appointmentId = nextAppointmentId++;
        Appointment storage appointment = appointments[appointmentId];
        appointment.id = appointmentId;
        appointment.scheduler = msg.sender;
        appointment.owner = _owner;
        appointment.time = _time;
        appointment.amountStaked = msg.value;

        calendar.appointmentIds.push(appointmentId);
        schedulerAppointments[msg.sender].push(appointmentId);

        emit AppointmentScheduled(appointmentId, _owner, msg.sender, _time);
    }

    function confirmAppointment(uint256 _appointmentId, bool _attended) public {
        Appointment storage appointment = appointments[_appointmentId];
        require(appointment.owner == msg.sender, "Not your appointment");
        require(!appointment.confirmedByOwner, "Already confirmed");
        require(!appointment.canceled, "Appointment canceled");
        require(block.timestamp >= appointment.time, "Cannot confirm before appointment time");

        appointment.attended = _attended;
        appointment.confirmedByOwner = true;

        if (_attended) {
            (bool sent, ) = appointment.scheduler.call{value: appointment.amountStaked}("");
            require(sent, "Failed to return stake");
            appointment.stakeReturned = true;
            emit StakeReturned(appointment.scheduler, appointment.amountStaked);
        } else {
            balances[msg.sender] += appointment.amountStaked;
            emit StakeForfeited(msg.sender, appointment.amountStaked);
        }

        emit AppointmentConfirmed(_appointmentId, _attended);
    }

    function cancelAppointment(uint256 _appointmentId) public {
        Appointment storage appointment = appointments[_appointmentId];
        require(appointment.scheduler == msg.sender, "Not your appointment");
        require(!appointment.confirmedByOwner, "Already confirmed");
        require(!appointment.canceled, "Already canceled");
        require(block.timestamp < appointment.time, "Cannot cancel past appointment");

        appointment.canceled = true;

        (bool sent, ) = appointment.scheduler.call{value: appointment.amountStaked}("");
        require(sent, "Failed to return stake");
        appointment.stakeReturned = true;

        emit AppointmentCanceled(_appointmentId);
    }

    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No stakes to withdraw");
        balances[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to withdraw");
    }

    function getAppointment(uint256 _appointmentId)
        public
        view
        returns (
            uint256 id,
            address scheduler,
            address owner,
            uint256 time,
            uint256 amountStaked,
            bool attended,
            bool confirmedByOwner,
            bool stakeReturned,
            bool canceled
        )
    {
        Appointment storage appointment = appointments[_appointmentId];
        return (
            appointment.id,
            appointment.scheduler,
            appointment.owner,
            appointment.time,
            appointment.amountStaked,
            appointment.attended,
            appointment.confirmedByOwner,
            appointment.stakeReturned,
            appointment.canceled
        );
    }

    function getSchedulerAppointments(address _scheduler) public view returns (uint256[] memory) {
        return schedulerAppointments[_scheduler];
    }

    function getCalendarAppointments(address _owner) public view returns (uint256[] memory) {
        Calendar storage calendar = calendars[_owner];
        return calendar.appointmentIds;
    }
}
