import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-script')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const TRADEMARK_TYPES = [
    { value: 'Brand Name', label: 'Brand Name' },
    { value: 'Brand Name + Logo', label: 'Brand Name + Logo', sub: 'Name + Graphic representation of brand' },
    { value: 'Logo', label: 'Logo', sub: 'Graphic representation of your brand' },
    { value: 'Slogan', label: 'Slogan', sub: "Your brand's catchy tagline" },
    { value: 'Other Options', label: 'Other Options', sub: 'Unique sounds/marks/patterns for brand recognition' },
];

const PLANS = {
    standard: { label: 'Standard', icon: '⏳', time: 'Filing within 24 hours', mrp: 1999, price: 1499, discount: 500 },
    express: { label: 'Express', icon: '⚡', time: 'Filing within 6 hours', mrp: 2999, price: 1999, discount: 1000 },
};

export default function Onboarding() {
    const { props } = usePage();
    const application = props.application;

    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const [trademarkType, setTrademarkType] = useState(application?.trademark_type || '');
    const [businessActivity, setBusinessActivity] = useState(application?.business_activity || '');
    const [selectedClasses, setSelectedClasses] = useState(application?.selected_classes || []);
    const [selectedPlan, setSelectedPlan] = useState(application?.plan || 'express');

    const [searchingClasses, setSearchingClasses] = useState(false);
    const [matchedClasses, setMatchedClasses] = useState([]);

    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [selectedUpiApp, setSelectedUpiApp] = useState('PhonePe');
    const [paying, setPaying] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [orderDetails, setOrderDetails] = useState(null);

    const next = () => setStep((s) => Math.min(s + 1, totalSteps));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const saveStep = async (fields) => {
        try {
            await axios.post('/trademark/save-step', {
                application_id: application.id,
                ...fields,
            });
        } catch (err) {
            console.error('Save step failed', err);
        }
    };

    // ---------- Step 1 ----------
    const selectTrademarkType = (value) => {
        setTrademarkType(value);
    };

    const goToStep2 = () => {
        saveStep({ trademark_type: trademarkType });
        next();
    };

    // ---------- Step 2 ----------
    const toggleClass = (id) => {
        setSelectedClasses((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const handleSearchClasses = async () => {
        if (!businessActivity) return;
        setSearchingClasses(true);
        try {
            const res = await axios.post('/trademark/search-classes', {
                description: businessActivity,
            });
            setMatchedClasses(res.data.classes);
        } catch (err) {
            setMatchedClasses([]);
        } finally {
            setSearchingClasses(false);
        }
    };

    const goToStep3 = () => {
        saveStep({ business_activity: businessActivity, selected_classes: selectedClasses });
        next();
    };

    // ---------- Step 3 ----------
    const classCount = selectedClasses.length || 1;
    const plan = PLANS[selectedPlan];
    const totalPrice = plan.price * classCount;

    const choosePlanAndGoToPayment = () => {
        saveStep({ plan: selectedPlan });
        next();
    };

    // ---------- Step 4 : Payment ----------
    const gstAmount = Math.round(totalPrice * 0.18);
    const finalAmount = totalPrice + gstAmount;

    useEffect(() => {
        if (step === 4) {
            axios.post('/trademark/create-order', { application_id: application.id })
                .then((res) => setOrderDetails(res.data))
                .catch(() => setPaymentError('Could not initiate payment.'));
        }
    }, [step]);

    const handlePayNow = async () => {
        setPaymentError('');
        setPaying(true);

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !orderDetails) {
            setPaymentError('Razorpay not loaded.');
            setPaying(false);
            return;
        }

        const options = {
            key: orderDetails.key,
            amount: orderDetails.amount,
            currency: orderDetails.currency,
            name: 'IPR Veda',
            description: 'Trademark Registration',
            order_id: orderDetails.order_id,
            handler: async function (response) {
                try {
                    const verifyRes = await axios.post('/trademark/verify-payment', {
                        application_id: application.id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                    });

                    if (verifyRes.data.status === 'success') {
                        window.location.href = '/dashboard'; // redirect after success
                    } else {
                        setPaymentError('Payment not verified.');
                        setPaying(false);
                    }
                } catch (err) {
                    setPaymentError('Verification failed.');
                    setPaying(false);
                }
            },
            modal: { ondismiss: () => setPaying(false) },
            theme: { color: '#0f2f52' },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
            setPaymentError('Payment failed: ' + response.error.description);
            setPaying(false);
        });
        rzp.open();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <Head title="Onboarding" />

            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">

                {step <= 3 && (
                    <>
                        <div className="flex justify-end mb-4">
                            <div className="inline-flex bg-gray-100 rounded-full p-1 text-sm">
                                <span className="px-3 py-1 rounded-full bg-white shadow-sm font-medium">En</span>
                                <span className="px-3 py-1 text-gray-500">हिंदी</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-sm text-gray-500 mb-2">{step}/{totalSteps - 1}</p>
                            <div className="flex gap-2">
                                {Array.from({ length: totalSteps - 1 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-blue-900' : 'bg-gray-200'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ---------------- STEP 1 ---------------- */}
                {step === 1 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">What would you like to protect?</h2>

                        <div className="flex flex-col gap-4">
                            {TRADEMARK_TYPES.map((t) => (
                                <label
                                    key={t.value}
                                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                                        trademarkType === t.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="radio"
                                            name="trademarkType"
                                            value={t.value}
                                            checked={trademarkType === t.value}
                                            onChange={() => selectTrademarkType(t.value)}
                                            className="mt-1 w-4 h-4"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-base font-medium text-gray-800">{t.label}</span>
                                            {t.sub && <span className="text-sm text-gray-500">{t.sub}</span>}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={goToStep2}
                                disabled={!trademarkType}
                                className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-40 transition flex items-center gap-1"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* ---------------- STEP 2 ---------------- */}
                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">
                            Describe Your Business Activity <span className="font-normal text-gray-600">(To Identify Your Trademark Class)</span>
                            <span className="ml-2 text-gray-400 text-lg align-middle">ⓘ</span>
                        </h2>

                        <textarea
                            value={businessActivity}
                            onChange={(e) => setBusinessActivity(e.target.value)}
                            placeholder="Type here..."
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 resize-none mb-3"
                        />

                        <div className="flex justify-end mb-6">
                            <button
                                onClick={handleSearchClasses}
                                disabled={!businessActivity || searchingClasses}
                                className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition text-sm font-medium"
                            >
                                {searchingClasses ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        <div className="flex items-center justify-between border border-blue-100 bg-blue-50 rounded-lg px-4 py-3 mb-6">
                            <span className="text-sm text-gray-700">
                                Want to know how trademark class registration works?
                            </span>
                            <button
                                type="button"
                                onClick={() => window.open('/learn-more/trademark-class', '_blank')}
                                className="flex items-center gap-1 border border-gray-300 bg-white rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 transition whitespace-nowrap ml-3"
                            >
                                ⓘ Learn more
                            </button>
                        </div>

                        {matchedClasses.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-1">
                                    Matches found based on your description?
                                </h3>
                                <p className="text-sm text-gray-500 mb-3">
                                    Select more classes. Get 360° protection.
                                </p>

                                <div className="flex flex-col gap-2">
                                    {matchedClasses.map((cls) => (
                                        <label
                                            key={cls.id}
                                            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${
                                                selectedClasses.includes(cls.id) ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedClasses.includes(cls.id)}
                                                onChange={() => toggleClass(cls.id)}
                                                className="mt-1 w-4 h-4"
                                            />
                                            <div className="flex flex-col">
                                                {cls.recommended && (
                                                    <span className="text-xs font-semibold text-yellow-600 mb-1">
                                                        ★ Highly recommended ★
                                                    </span>
                                                )}
                                                <span className="text-sm font-medium text-gray-800">
                                                    Class {cls.id} — {cls.name}
                                                </span>
                                                <span className="text-xs text-gray-500">{cls.description}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-6">
                            <button onClick={back} className="flex items-center gap-1 border border-gray-300 rounded-lg px-6 py-2 text-gray-700 hover:bg-gray-50 transition">
                                ← Back
                            </button>
                            <button
                                onClick={goToStep3}
                                disabled={selectedClasses.length === 0}
                                className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-40 transition flex items-center gap-1"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* ---------------- STEP 3 ---------------- */}
                {step === 3 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Choose right plan for brand protection</h2>

                        <div className="flex flex-col gap-4 mb-6">
                            {Object.entries(PLANS).map(([key, p]) => (
                                <label
                                    key={key}
                                    className={`block border rounded-lg p-4 cursor-pointer transition ${selectedPlan === key ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="plan"
                                                checked={selectedPlan === key}
                                                onChange={() => setSelectedPlan(key)}
                                                className="w-4 h-4"
                                            />
                                            <span className="font-semibold text-gray-800">
                                                {p.label} - {p.icon} {p.time}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-gray-400 line-through text-sm mr-2">₹{p.mrp}</span>
                                            <span className="font-bold text-gray-900">₹{p.price}</span>
                                            <span className="text-sm text-gray-500">/class</span>
                                            <div className="text-xs text-gray-400">+ Govt. Fee</div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center gap-2 text-sm text-gray-700">
                                        🏷️ Great news! You're eligible for a ₹{p.discount} discount as part of our limited-time offer.
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-800">
                                Number of Class Selected ({classCount}) ✎
                            </h3>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <select disabled className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500">
                                <option>Class {selectedClasses[0] ?? 25}</option>
                            </select>
                            <div className="text-right">
                                <div className="font-bold text-gray-900">₹{totalPrice}</div>
                                <div className="text-xs text-gray-500">(₹{plan.price} x {classCount})</div>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 mb-6">
                            <span className="font-semibold">Note: </span>
                            Our experts will call you within your selected time range for the consultation.
                        </div>

                        <div className="flex justify-between">
                            <button onClick={back} className="flex items-center gap-1 border border-gray-300 rounded-lg px-6 py-2 text-gray-700 hover:bg-gray-50 transition">
                                ← Back
                            </button>
                            <button
                                onClick={choosePlanAndGoToPayment}
                                className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition flex items-center gap-1"
                            >
                                Pay Now →
                            </button>
                        </div>
                    </div>
                )}

                {/* ---------------- STEP 4 : PAYMENT ---------------- */}
                {step === 4 && (
                    <div>
                        <div className="mb-6">
                            <span className="text-lg font-bold">
                                <span className="bg-yellow-400 px-1">IPR</span>Veda
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold mb-1">Choose Payment Method</h2>
                        <p className="text-gray-500 mb-6">Payment Options</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 border border-gray-200 rounded-lg overflow-hidden">
                                <div className="flex">
                                    <div className="w-1/3 border-r border-gray-200">
                                        <button
                                            onClick={() => setPaymentMethod('upi')}
                                            className={`w-full text-left px-4 py-4 border-l-4 ${paymentMethod === 'upi' ? 'border-blue-900 bg-white font-semibold' : 'border-transparent bg-gray-50 text-gray-500'}`}
                                        >
                                            UPI
                                            <div className="text-xs font-normal text-gray-400">Gpay, PhonePe, Paytm & more</div>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={`w-full text-left px-4 py-4 border-l-4 ${paymentMethod === 'card' ? 'border-blue-900 bg-white font-semibold' : 'border-transparent bg-gray-50 text-gray-500'}`}
                                        >
                                            Credit/Debit/ATM Card
                                            <div className="text-xs font-normal text-gray-400">Visa, MasterCard, Rupay & more</div>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('netbanking')}
                                            className={`w-full text-left px-4 py-4 border-l-4 ${paymentMethod === 'netbanking' ? 'border-blue-900 bg-white font-semibold' : 'border-transparent bg-gray-50 text-gray-500'}`}
                                        >
                                            Net Banking
                                            <div className="text-xs font-normal text-gray-400">Pay using all Indian banks</div>
                                        </button>
                                    </div>

                                    <div className="w-2/3 p-6">
                                        {paymentMethod === 'upi' && (
                                            <>
                                                <h3 className="font-semibold text-lg mb-4">Pay with UPI</h3>
                                                <p className="text-sm text-gray-500 mb-3">Select UPI App</p>
                                                <div className="flex gap-4 mb-4">
                                                    {['Google pay', 'PhonePe', 'Paytm', 'Other UPI ID'].map((app) => (
                                                        <button key={app} onClick={() => setSelectedUpiApp(app)} className="flex flex-col items-center gap-1">
                                                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs ${selectedUpiApp === app ? 'border-blue-900' : 'border-gray-200'}`}>
                                                                {app.slice(0, 2)}
                                                            </div>
                                                            <span className="text-xs text-gray-600">{app}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Pay through the {selectedUpiApp} app on your phone
                                                </p>
                                            </>
                                        )}

                                        {paymentMethod === 'card' && <h3 className="font-semibold text-lg mb-4">Pay with Card</h3>}
                                        {paymentMethod === 'netbanking' && <h3 className="font-semibold text-lg mb-4">Pay with Net Banking</h3>}

                                        {paymentError && <p className="text-red-500 text-sm mb-3">{paymentError}</p>}

                                        <button
                                            onClick={handlePayNow}
                                            disabled={paying || !orderDetails}
                                            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 transition"
                                        >
                                            {paying ? 'Processing...' : `PAY ₹${orderDetails?.final_amount ?? finalAmount}`}
                                        </button>

                                        <p className="text-sm text-orange-600 mt-4">
                                            ⚡ Hurry! Your Expert will be assigned right after the Payment
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-5">
                                <h3 className="font-semibold mb-4">Trademark Registration</h3>
                                <p className="text-sm font-medium text-gray-700 mb-3">₹ Price details</p>

                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Professional Fees</span>
                                    <span>₹{orderDetails?.subtotal ?? totalPrice}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-3 pb-3 border-b border-gray-200">
                                    <span className="text-gray-600">GST @ 18%</span>
                                    <span>₹{orderDetails?.gst ?? gstAmount}</span>
                                </div>
                                <div className="flex justify-between font-bold mb-6">
                                    <span>Total Amount</span>
                                    <span>₹{orderDetails?.final_amount ?? finalAmount}</span>
                                </div>

                                <div className="flex justify-around text-center text-xs text-gray-600">
                                    <div><div className="text-2xl mb-1">🛡️</div>100% Secure Payment</div>
                                    <div><div className="text-2xl mb-1">💳</div>Guaranteed Satisfaction</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button onClick={back} className="flex items-center gap-1 border border-gray-300 rounded-lg px-6 py-2 text-gray-700 hover:bg-gray-50 transition">
                                ← Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}