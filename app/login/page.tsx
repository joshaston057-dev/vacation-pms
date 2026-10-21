'use client';

import React from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', padding: '2.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Login Module</h1>
      <p style={{ color: '#94a3b8' }}>Managed directly through your main dashboard panel.</p>
    </div>
  );
}