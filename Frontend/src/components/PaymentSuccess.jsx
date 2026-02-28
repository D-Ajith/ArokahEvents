// PaymentSuccess.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve booking data
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    
    if (pendingBooking) {
      const bookingData = JSON.parse(pendingBooking);
      
      // You can now:
      // 1. Save to your local state/context
      // 2. Send confirmation email (if you add a backend later)
      // 3. Show success message
      
      toast.success("Payment successful! Booking confirmed.");
      
      // Clear the pending booking
      sessionStorage.removeItem('pendingBooking');
      
      // Redirect to confirmation page or home
      navigate('/confirmation', { state: { booking: bookingData } });
    } else {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-700 mx-auto"></div>
        <p className="mt-4 text-slate-600">Processing your payment...</p>
      </div>
    </div>
  );
}

export default PaymentSuccess;