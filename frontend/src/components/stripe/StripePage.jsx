import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import api from "../../api/axios";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

const StripePage = () => {
  const [clientSecret, setClientSecret] = useState("");
  const { id } = useParams();
  const { token } = useAuth();

  useEffect(() => {
    const createIntent = async () => {
      const response = await api.post(
        "/create-payment-intent",
        { productId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClientSecret(response.data.clientSecret);
    };

    createIntent();
  }, [id, token]);

  if (!clientSecret) {
    return <div>Loading payment...</div>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      <CheckoutForm />
    </Elements>
  );
};

export default StripePage;