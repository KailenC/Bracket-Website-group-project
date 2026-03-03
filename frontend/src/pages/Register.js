import React, { useState } from 'react';

export default function Register() {
  const[firstname, setFirstname] = useState('');
  const[lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstname, last_name: lastname, username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || 'Registration failed');
      } else {
        setStatus('success: ' + (data.message || 'Registered'));
        setFirstname('');
        setLastname('');
        setUsername('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setStatus('Network error');
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '1rem auto', padding: 12 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>First Name</label>
          <br />
          <input value={firstname} onChange={e => setFirstname(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Last Name</label>
          <br />
          <input value={lastname} onChange={e => setLastname(e.target.value)} required />
        </div> 
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>               
        <div style={{ marginBottom: 8 }}>
          <label>Username</label>
          <br />
          <input value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Register</button>
      </form>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}
