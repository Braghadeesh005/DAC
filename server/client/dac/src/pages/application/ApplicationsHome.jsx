import React from 'react';
import { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/button/Button';
import Loader from '../../components/Loader/Loader';
import Table from '../../components/Table/Table';
import { useNotifier } from '../../components/Notification/NotificationContext';
import './ApplicationsHome.css'
import Forms from '../../layouts/Forms';
import { TextField, TextArea, RadioButton, CheckBox, DatePicker, TimePicker, SelectDropdown, PasswordField, NumberInput, FileUpload, SwitchToggle } from '../../components/InputFields/InputFields';
import { ValidateSession } from '../../services/sessionService';

const ApplicationsHome = () => {

  ValidateSession();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [option, setOption] = useState('1');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const notify = useNotifier();

  const headers = [
    'ID',
    'App Name',
    'Owner',
    'Status',
    'Version',
    'Created At',
    'Updated At',
    'Environment',
    'Region',
    'Health',
    'Users',
    'Last Deployed',
  ];

  const data = [
  {
    ID: 1,
    'App Name': 'Inventory Manager',
    Owner: 'Alice',
    Status: 'Active',
    Version: 'v1.4.2',
    'Created At': '2024-02-15',
    'Updated At': '2025-07-01',
    Environment: 'Production',
    Region: 'US-East',
    Health: 'Healthy',
    Users: 120,
    'Last Deployed': '2025-07-03',
  },
  {
    ID: 2,
    'App Name': 'Firewall Monitor',
    Owner: 'Bob',
    Status: 'Maintenance',
    Version: 'v2.0.0',
    'Created At': '2023-11-20',
    'Updated At': '2025-06-25',
    Environment: 'Staging',
    Region: 'EU-West',
    Health: 'Degraded',
    Users: 32,
    'Last Deployed': '2025-06-29',
  },
  {
    ID: 3,
    'App Name': 'LB Balancer',
    Owner: 'Charlie',
    Status: 'Inactive',
    Version: 'v3.5.1',
    'Created At': '2024-05-10',
    'Updated At': '2025-05-28',
    Environment: 'Development',
    Region: 'Asia-Pacific',
    Health: 'Offline',
    Users: 5,
    'Last Deployed': '2025-04-15',
  }];

  const handleSubmit = (e) => {
    e.preventDefault();
    notify("Form submitted successfully 🎉", 'success');
  };

  const labelList = [
    "Full Name",
    "Bio",
    "Gender",
    "Accept Terms",
    "Date of Birth",
    "Preferred Time",
    "Select Option",
    "Password",
    "Age",
    "Upload File",
    "Enable Dark Mode"
  ];

  return (
    <MainLayout>
      <div>
        
        <Button bgColor="rgb(160, 160, 160)" textColor="black" onClick={() => notify('Oops ❌', 'failure')}>Check Me</Button>
        <br/><br/>
        <Button onClick={() => notify('Success 🎉', 'success')}>Check Me</Button>
        <br/><br/>
        <Loader></Loader>
        <br/><br/>
        <Table headers={headers} data={data} />
        <br/><br/>

        <Forms labelList={labelList} onSubmit={handleSubmit} maxComponentsPerColumn={6}>
          <TextField value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
          <TextArea value={bio} onChange={e => setBio(e.target.value)} placeholder="Your bio..." />
          <RadioButton name="gender" value="male" checked={gender === "male"} onChange={() => setGender("male")} />
          <CheckBox checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
          <DatePicker value={dob} onChange={e => setDob(e.target.value)} />
          <TimePicker value={time} onChange={e => setTime(e.target.value)} />
          <SelectDropdown value={option} onChange={e => setOption(e.target.value)} options={[{ label: "One", value: "1" }]} />
          <PasswordField value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          <NumberInput value={age} onChange={e => setAge(e.target.value)} placeholder="Age" />
          <FileUpload onChange={e => console.log(e.target.files)} />
          <SwitchToggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </Forms>

      </div>
    </MainLayout>
  );
};

export default ApplicationsHome;