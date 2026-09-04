import { loadRazorpayScript } from '../utils/loadRazorpay';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api'; 

function CheckoutButton({ amount, userDetails }) {
  const handlePayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Razorpay SDK load nahi hua. Internet check karo.');
      return;
    }

    try {
      // Step 1: Backend se order create karo
      const { data } = await axios.post(`${API_BASE}/payment/create-order`, {
        amount: amount,
      });

      // Step 2: Razorpay checkout options
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Aapki Company Name',
        description: 'Order Payment',
        order_id: data.order_id,
        handler: async function (response) {
          // Step 3: Payment success -> verify backend pe
          try {
            const verifyRes = await axios.post(`${API_BASE}/payment/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.status === 'success') {
              alert('Payment successful!');
              // redirect ya UI update yahan karo
            }
          } catch (err) {
            alert('Verification fail ho gaya.');
          }
        },
        prefill: {
          name: userDetails?.name || '',
          email: userDetails?.email || '',
          contact: userDetails?.phone || '',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function () {
            console.log('Checkout closed by user');
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        alert('Payment failed: ' + response.error.description);
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      alert('Order create karne mein error aaya.');
    }
  };

  return (
    <button onClick={handlePayment} className="px-4 py-2 bg-blue-600 text-white rounded">
      Pay ₹{amount}
    </button>
  );
}

export default CheckoutButton;