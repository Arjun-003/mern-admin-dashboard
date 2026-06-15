import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "../../api/axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const CheckoutForm = () => {
  const { token } = useAuth()
  const stripe = useStripe();
  const elements = useElements();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false)
  const { id } = useParams()

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    setProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:5173/payment-success",
      },
    });
    
    if (error) {
      console.error(error.message);
      setProcessing(false)
    }
  };


  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await api.get(`/singleProduct/${id}`);
        setProduct(response.data)


      } catch (error) {
        console.error(error);

      } finally {
        setLoading(false)
      }
    }
    getProduct()
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid md:grid-cols-2">

          {/* Order Summary */}
          <div className="p-8 border-r border-slate-200 bg-slate-50">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Order Summary
            </h2>

            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-500">Product Name</p>
              <h3 className="font-medium text-slate-900 mt-1">

                {product.name}
              </h3>

              <p className="text-sm text-slate-500 mt-4">
                Product ID
              </p>
              <p className="font-medium text-slate-800">
                {product.id}
              </p>

            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Price</span>
                <span>₹{product.price}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span>₹40</span>
              </div>

              <div className="mt-6 bg-slate-100 rounded-xl p-4">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>Subtotal</span>
                  <span>₹{product.price}</span>
                </div>

                <div className="flex justify-between text-sm text-slate-500 mb-3">
                  <span>Delivery</span>
                  <span>₹40</span>
                </div>

                <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>
                    ₹{(Number(product.price) + 40).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-4">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Payment
            </h2>

            <p className="text-sm text-slate-500 mb-6">
              Complete your payment securely using Stripe.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="border border-dashed border-slate-300 rounded-xl p-2 bg-slate-50 mb-6">
                <div className="text-center">
                  {/* <div className="w-12 h-12 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3">
                    💳
                  </div> */}


                  <PaymentElement />
                </div>
              </div>

              <button
                type="submit"
                disabled={!stripe || processing}
                className="border border-dashed border-green-200 rounded-xl p-2 bg-green-400"
              >
                {processing ? "Processing..." : `Pay ₹${(Number(product.price) + 40).toFixed(2)}`}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;