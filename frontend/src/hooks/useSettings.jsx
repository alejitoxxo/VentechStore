// src/hooks/useSettings.js
import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../services/api';

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    businessName: 'Ventech',
    whatsappNumber: '5491100000000',
    instagram: '@ventech',
    email: 'ventech@gmail.com',
    showOutOfStock: 'false',
    whatsappMessage: 'Hola, quiero consultar por estos productos:',
    mode: 'minorista',
    accentColor: '#0898B5',
  });

  useEffect(() => {
    getSettings()
      .then((res) => setSettings((prev) => ({ ...prev, ...res.data })))
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
