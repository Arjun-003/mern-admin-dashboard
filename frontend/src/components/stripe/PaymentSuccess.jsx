import { useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();

  const paymentIntent = searchParams.get("payment_intent");
  const status = searchParams.get("redirect_status");

  return (
    <div style={{ padding: "30px" }}>
      <h1>Payment Successful 🎉</h1>

      <p>Status: {status}</p>

      <p>Payment Intent: {paymentIntent}</p>
    </div>
  );
};

export default PaymentSuccess;