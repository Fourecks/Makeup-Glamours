
import React from 'react';
import { CartItem } from '../types';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import TrashIcon from './icons/TrashIcon';
import WhatsappIcon from './icons/WhatsappIcon';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  phoneNumber: string;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, phoneNumber }) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const handleFinalizePurchase = () => {
    const header = "Hola, estoy interesado/a en finalizar la compra de los siguientes productos:\n\n";
    
    const itemsList = cartItems.map(item => 
      `- ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const footer = `\n\n*Total a Pagar: $${subtotal.toFixed(2)}*`;

    const message = header + itemsList + footer;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Tu Carrito</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <p className="text-gray-500 text-lg">Tu carrito está vacío.</p>
            <button onClick={onClose} className="mt-4 bg-brand-pink text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-pink-hover transition-colors duration-300">
                Seguir Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img src={item.images[0]} alt={item.name} className="w-24 h-24 object-cover rounded-md"/>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-500 text-sm">${item.price.toFixed(2)}</p>
                    <div className="flex items-center border rounded-md mt-2 w-fit">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 text-gray-600 hover:bg-gray-100">
                        <MinusIcon className="h-4 w-4"/>
                      </button>
                      <span className="px-3 text-sm font-semibold text-gray-800">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                        className="p-1 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                        disabled={item.quantity >= item.stock}
                      >
                        <PlusIcon className="h-4 w-4"/>
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                     <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 mt-2">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t space-y-4">
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500">Envío e impuestos calculados al finalizar la compra.</p>
              <button 
                onClick={handleFinalizePurchase}
                className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center space-x-3">
                <WhatsappIcon className="h-6 w-6" />
                <span>Finalizar Compra</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;