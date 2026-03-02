import { useEffect, useState } from "react";
import api from "../api/axios.js"
import { useNavigate } from "react-router-dom";
function OtpSent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        otp: ""
    });
    const OTP_TIMEOUT = 60;
    const [otperror, setOtpError] = useState("");
    const [timeLeft, setTimeLeft] = useState(OTP_TIMEOUT);
    
    const handleChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        setOtpError("");
        if (value.length <= 4) {
            setFormData({ otp: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const mobile_Number = localStorage.getItem("Mobile_Number");
            const respones = await api.post("/verify-otp",
                { otp: formData.otp, mobile_Number })
            navigate("/login")
            console.log("Otp verified:", respones.data);
            return
        } catch (error) {
            const code = error.response?.data?.error;
            console.log(code);
            if (code === "OTP has expired or is invalid") {
                setOtpError("OTP has expired. Please request a new one.");
                setFormData({ otp: "" });
                setTimeLeft(0); // stop timer
            }
            else if (code === "Invalid OTP") {
                setOtpError("OTP did not match.Please try again.");
                setFormData({ otp: "" });
                
            }
            else {
                setOtpError("Something went wrong");
                console.log('Somthing Wrong');
            }
             
        }

    }

    const handleResetOtp = async () => {
        try {
            setOtpError("");
            const mobile_Number = localStorage.getItem("Mobile_Number");
            const response = await api.post("/resend-otp", { mobile_Number }); // no need to send otp
            console.log("Resend:", response.data);
            alert("OTP sent again!");

        } catch (error) {
            console.error("Failed to resend OTP:", error.response?.data || error.message);
            alert("Failed to resend OTP");
        }
    };
    const OtpTimer = () => {
        useEffect(() => {
            if (timeLeft <= 0) {
                setOtpError("OTP has expired. Please request a new one.")
                return;
            }

            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        }, [timeLeft]);

        return (
            <div className="flex justify-end items-center mb-4">
                {timeLeft > 0 ? (
                    <h2>OTP expires in: {timeLeft} seconds</h2>
                ) : (
                    <button
                        onClick={() => {
                            handleResetOtp();
                            setTimeLeft(OTP_TIMEOUT); // restart countdown
                        }}
                        className="text-yellow-600 font-semibold underline"
                    >
                        Resend OTP
                    </button>
                )}
            </div>
        );
    }
    return (
        <div>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-36 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-center">Enter Otp</h2>
                {otperror?
                 <p className="text-red-500 mb-4">{otperror}</p>
                  : null}
                <OtpTimer />
                <div className="mb-4">
                    <input
                        type="text"
                        id="otp"
                        name="otp"
                        maxLength={4}
                        value={formData.otp}
                        inputMode="numeric"
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Enter One Time Password"
                        autoComplete="off"
                        required />
                </div>
                <button
                    type="submit"
                    className="w-full bg-yellow-500 text-white py-2 disabled:opacity-50 rounded-md hover:bg-yellow-600 transition-all duration-200"
                    disabled={formData.otp.length !== 4}
                >Submit Otp</button>
            </form>
        </div>
    )
};

export default OtpSent