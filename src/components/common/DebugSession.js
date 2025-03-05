// components/common/DebugSession.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

const DebugSession = () => {
  const [sessionData, setSessionData] = useState("Loading...");
  
  useEffect(() => {
    async function getSessionDebug() {
      const { data } = await supabase.auth.getSession();
      setSessionData(JSON.stringify(data, null, 2));
    }
    getSessionDebug();
  }, []);
  
  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-mono mb-2">Session Debug:</h3>
      <pre className="text-xs overflow-auto max-h-60">{sessionData}</pre>
    </div>
  );
};

export default DebugSession;