import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const defaultAuthContext = {
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: false,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return defaultAuthContext;
  }
  return context;
};
