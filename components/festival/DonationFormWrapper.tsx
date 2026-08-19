"use client";
import React, { useState } from 'react';
import DonationForm from './DonationForm';

export default function DonationFormWrapper({ config }: { config: any }) {
  const [toast, setToast] = useState<{ message?: string; type?: string }>({});

  return (
    <>
      <DonationForm config={config} setToast={setToast} />
      {
}
      {toast?.message && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-medium shadow-xl border backdrop-blur-sm transition-all ${toast.type === 'error' ? 'bg-red-950/90 border-red-400/30 text-red-300' : 'bg-indigo-950/90 border-violet-400/30 text-violet-100'}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
