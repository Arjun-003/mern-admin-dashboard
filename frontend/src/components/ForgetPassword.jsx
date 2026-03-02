import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

const ForgetPassword = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [email, setEmail] = useState({
        email: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError(null);
        setEmail({
            ...email,
            [name]: value,
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/forgot-password", email);
            console.log(response, "Forget Password Response");
        } catch (error) {
            if (error.response.data.error === "User Not Found Please Sign Up") {
                setEmail({ email: "" });
                setError("User Not Found !");
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-36 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-center">Enter Your Email</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="mb-4">
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Enter your email"
                        autoComplete="off"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-all duration-200"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default ForgetPassword;
