import React from 'react';
import { X } from 'lucide-react';

interface MessageToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const MessageToast: React.FC<MessageToastProps> = ({ message, type = 'success', onClose }) => {
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
      type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <span>{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white rounded-full">
        <X size={16} />
      </button>
    </div>
  );
};

export default MessageToast;
