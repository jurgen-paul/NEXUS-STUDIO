import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, CreditCard, ChevronRight } from 'lucide-react';

interface CheckoutFormProps {
  onSuccess: (paymentMethodId: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
        setLoading(false);
        return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: name,
      },
    });

    if (error) {
      setError(error.message || 'An unexpected error occurred.');
      setLoading(false);
    } else {
      onSuccess(paymentMethod.id);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block px-1">Registrant Name</label>
            <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name on card"
                className="w-full bg-white border border-brand-primary/10 py-3 px-4 outline-none focus:border-brand-accent transition-all text-sm font-medium"
                required
            />
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block px-1">Credit or Debit Card</label>
            <div className="w-full bg-white border border-brand-primary/10 py-4 px-4 transition-all">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '14px',
                                color: '#1a1a1a',
                                '::placeholder': {
                                    color: '#a0a0a0',
                                },
                            },
                            invalid: {
                                color: '#ff4d4d',
                            },
                        },
                    }}
                />
            </div>
        </div>
      </div>

      {error && (
        <div className="text-[10px] font-bold uppercase tracking-widest text-brand-accent bg-brand-accent/5 p-3 border border-brand-accent/10">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-brand-primary text-white py-4 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-brand-accent transition-all disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CreditCard className="w-4 h-4" />
        )}
        Secure Payment Sequence
        <ChevronRight className="w-4 h-4" />
      </button>

      <p className="text-[9px] text-neutral-400 text-center uppercase tracking-widest leading-relaxed">
        Transmission encrypted via AES-256 binary protocols. <br />
        By proceeding, you authorize Nexus Studio to initialize account verification.
      </p>
    </form>
  );
};

export default CheckoutForm;
