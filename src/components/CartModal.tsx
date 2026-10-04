import React from "react";
import { useDialog } from "../hooks/useDialog";
import { CartItem } from "../types";
import XIcon from "./icons/XIcon";
import PlusIcon from "./icons/PlusIcon";
import MinusIcon from "./icons/MinusIcon";
import TrashIcon from "./icons/TrashIcon";
import WhatsappIcon from "./icons/WhatsappIcon";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  phoneNumber: string;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  phoneNumber,
}) => {
  const dialogRef = useDialog(isOpen, onClose);
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleFinalizePurchase = () => {
    const header = "Hola, estoy interesado/a en finalizar la compra de los siguientes productos:\n\n";
    
    const itemsList = cartItems.map(item => {
      const variantText = item.variantName ? ` (${item.variantName})` : '';
      return `- ${item.quantity}x ${item.productName}${variantText} - $${(item.price * item.quantity).toFixed(2)}`;
    }).join('\n');

    const footer = `\n\n*Total a Pagar: $${subtotal.toFixed(2)}*`;

    const message = header + itemsList + footer;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };


  return (
    <div className="cart-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="cart-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="cart-title" className="font-serif text-2xl">
            Tu carrito{" "}
            <span className="cart-title-count">
              ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </span>
          </h2>
          <button
            aria-label="Cerrar carrito"
            onClick={onClose}
            className="icon-button text-gray-500 hover:text-gray-800"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <p className="text-gray-500 text-lg">Tu carrito está vacío.</p>
            <button
              onClick={onClose}
              className="mt-4 bg-brand-pink text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-pink-hover transition-colors duration-300"
            >
              Seguir Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-line">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="cart-line-image"
                      width="80"
                      height="96"
                    />
                  )}
                  <div className="cart-line-copy">
                    <h3 className="font-semibold text-gray-900">
                      {item.productName}
                    </h3>
                    {item.variantName && (
                      <p className="text-gray-500 text-sm">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center border rounded-md mt-2 w-fit">
                      <button
                        aria-label={`Reducir cantidad de ${item.productName}`}
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 text-gray-600 hover:bg-gray-100"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="px-3 text-sm font-semibold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        aria-label={`Aumentar cantidad de ${item.productName}`}
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                        disabled={item.quantity >= item.stock}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      aria-label={`Eliminar ${item.productName}`}
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 mt-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-checkout">
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500">
                El siguiente paso es conversar con nosotros.
              </p>
              <button
                onClick={handleFinalizePurchase}
                className="whatsapp-checkout"
              >
                <WhatsappIcon className="h-6 w-6" />
                <span>Enviar pedido por WhatsApp</span>
              </button>
              <p className="checkout-note">
                Revisaremos contigo disponibilidad, entrega y forma de pago.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;
