import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import ReportIssueModal from '@/Components/ReportIssueModal';
import { useState, useEffect } from 'react';
import {
    Shield, FileText, FileCheck, Search, ChevronRight, ChevronDown,
    X, Check, Clock, Star, TrendingUp, AlertCircle,
} from 'lucide-react';
import { getCsrfToken } from '../utils/csrf';

export default function ServiceHub() {
    const [activeTab, setActiveTab] = useState('Trademark/IP');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);

    // ESC key to close modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setSelectedService(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const tabs = [
        'Trademark/IP',
        'Licenses/Registrations',    
        'Company Changes',
        'Taxation & Compliance',
        'New Business/Closure',
    ];

    const featuredCards = [
        {
            title: 'Trademark Registration',
            desc: 'Legal protection for your brand identity.',
            icon: Shield,
        },
        {
            title: 'ITR Filing',
            desc: 'Annual reporting of income, deductions, and taxes',
            icon: FileText,
        },
        {
            title: 'PT Registration',
            desc: 'Mandatory registration for...',
            icon: FileCheck,
        },
    ];

    const services = {
        Trademark: [
            {
                id: 'tm-reg',
                title: 'Trademark Registration',
                price: '₹3499',
                mrp: '₹6999',
                popular: true,
                tagline: 'Protect your brand identity legally',
                description:
                    'Trademark registration gives you exclusive rights to your brand name, logo, or tagline. It prevents others from using a similar mark and provides legal protection across India.',
                features: [
                    'Trademark search & availability check',
                    'Filing of TM-A application',
                    'Class selection guidance (45 classes)',
                    'Regular status updates',
                    'Legal protection for 10 years',
                    'Free renewal reminder',
                ],
                timeline: '7-10 business days',
                documents: ['Brand name/logo', 'Applicant ID proof', 'Address proof', 'TM-48 form'],
                rating: 4.8,
                reviews: 1240,
            },
            {
                id: 'tm-objection',
                title: 'Respond to Trademark Objection',
                price: '₹2999',
                mrp: '₹8999',
                tagline: 'Expert reply to TM objections',
                description:
                    'Received a trademark objection? Our IP attorneys draft a strong legal reply to overcome the objection and get your mark registered.',
                features: [
                    'Detailed analysis of objection',
                    'Professional reply drafting',
                    'Filing with Trademark Registry',
                    'Hearing representation if needed',
                    'Follow-up until resolution',
                ],
                timeline: '5-7 business days',
                documents: ['Objection notice', 'TM application details', 'Supporting documents'],
                rating: 4.7,
                reviews: 680,
            },
            {
                id: 'tm-hearing',
                title: 'Trademark Hearing Service',
                price: '₹3499',
                mrp: '₹8999',
                tagline: 'Attorney representation in hearings',
                description:
                    'Our experienced attorneys represent your case in trademark hearings before the Registrar and ensure the best outcome.',
                features: [
                    'Pre-hearing case preparation',
                    'Attorney representation',
                    'Written submissions',
                    'Post-hearing follow-up',
                    'Complete case documentation',
                ],
                timeline: 'Scheduled by Registry',
                documents: ['Hearing notice', 'Case documents', 'Power of Attorney'],
                rating: 4.9,
                reviews: 320,
            },
            {
                id: 'tm-renewal',
                title: 'Renewal of Trademark',
                price: '₹4999',
                mrp: '₹9999',
                tagline: 'Keep your TM protection active',
                description:
                    'Trademark is valid for 10 years. Renew it on time to maintain exclusive rights. Our team handles the entire renewal process end-to-end.',
                features: [
                    'Renewal application filing',
                    'TM-R form submission',
                    'Registry fee handling',
                    'Reminders for future renewals',
                    'Certificate procurement',
                ],
                timeline: '10-15 business days',
                documents: ['TM registration certificate', 'Applicant details', 'Address proof'],
                rating: 4.8,
                reviews: 450,
            },
            {
                id: 'tm-intl',
                title: 'International Trademark',
                price: '₹6999',
                mrp: '₹8999',
                tagline: 'Protect your brand globally',
                description:
                    'Register your trademark in multiple countries through Madrid Protocol. Expand your business globally with confidence.',
                features: [
                    'Madrid Protocol filing',
                    'Multi-country coverage',
                    'International class guidance',
                    'WIPO coordination',
                    'Local attorney network',
                ],
                timeline: '12-18 months',
                documents: ['Base application', 'MM2 form', 'Country list', 'Applicant details'],
                rating: 4.6,
                reviews: 180,
            },
        ],
        Copyright: [
            {
                id: 'cr-music',
                title: 'Copyright Music',
                price: '₹2999',
                mrp: '₹4999',
                tagline: 'Protect your original music',
                description:
                    'Register copyright for your music compositions, lyrics, and sound recordings. Get legal ownership proof and protection against infringement.',
                features: [
                    'Copyright registration filing',
                    'Work classification guidance',
                    'Legal ownership certificate',
                    'Protection for 60+ years',
                    'Infringement support',
                ],
                timeline: '6-8 months',
                documents: ['Music file', 'Lyrics sheet', 'Composer details', 'Work description'],
                rating: 4.8,
                reviews: 520,
            },
        ],
        Patent: [
            {
                id: 'pt-search',
                title: 'Patent Search',
                price: '₹1999',
                mrp: '₹3499',
                tagline: 'Check patentability of your invention',
                description:
                    'Comprehensive search across global patent databases to check if your invention is novel and patentable before filing.',
                features: [
                    'Global database search',
                    'Prior art analysis',
                    'Patentability report',
                    'Novelty assessment',
                    'Expert recommendations',
                ],
                timeline: '5-7 business days',
                documents: ['Invention description', 'Technical drawings', 'Inventor details'],
                rating: 4.7,
                reviews: 280,
            },
            {
                id: 'pt-provisional',
                title: 'Provisional Patent Application',
                price: '₹699',
                mrp: '₹999',
                tagline: 'Secure your priority date',
                description:
                    'File a provisional patent to lock your priority date while you develop the complete specification.',
                features: [
                    'Provisional spec drafting',
                    'Priority date protection',
                    'Form-1 & Form-2 filing',
                    '12 months window for complete filing',
                    'Expert drafting team',
                ],
                timeline: '3-5 business days',
                documents: ['Invention details', 'Drawings (if any)', 'Applicant info'],
                rating: 4.9,
                reviews: 390,
            },
            {
                id: 'pt-reg',
                title: 'Patent Registration',
                price: '₹699',
                mrp: '₹999',
                tagline: 'Complete patent filing service',
                description:
                    'End-to-end patent registration with complete specification drafting, filing, and prosecution support.',
                features: [
                    'Complete spec drafting',
                    'Claims drafting',
                    'Filing with IPO',
                    'Examination support',
                    'Grant assistance',
                ],
                timeline: '18-36 months',
                documents: ['Provisional spec', 'Complete invention details', 'Drawings', 'Form-5'],
                rating: 4.8,
                reviews: 210,
            },
        ],
        Infringement: [
            {
                id: 'ip-infringe',
                title: 'Patent Infringement',
                price: '₹499',
                mrp: '₹999',
                popular: true,
                tagline: 'Protect your patent rights',
                description:
                    'Legal action and defense against patent infringement. Our IP litigation team handles notice, cease & desist, and court proceedings.',
                features: [
                    'Infringement analysis',
                    'Legal notice drafting',
                    'Cease & desist letters',
                    'Court representation',
                    'Damages claim support',
                ],
                timeline: 'Varies by case',
                documents: ['Patent certificate', 'Infringement evidence', 'Case details'],
                rating: 4.9,
                reviews: 150,
            },
        ],
    };

    return (
        <AuthenticatedLayout>
            <Head title="Service Hub - IPR Veda" />

            <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-gray-50">

                {/* ============ SIDEBAR (Same as Dashboard) ============ */}
                <aside className="w-64 bg-[#0f2942] text-white flex-shrink-0 h-full overflow-y-auto">
                    {/* Logo Area */}
                    

                    <nav className="p-4 space-y-1">
                        <button
                            onClick={() => router.visit('/dashboard')}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 transition"
                        >
                            <span>🏠</span> Home
                        </button>
                        <button
                            onClick={() => router.visit('/services')}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/10 text-white font-medium transition"
                        >
                            <span>🛠️</span> Services
                        </button>
                        <button
                            onClick={() => router.visit('/account')}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 transition"
                        >
                            <span>👤</span> Account
                        </button>
                        <button
                            onClick={() => router.visit('/setting')}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 transition"
                        >
                            <span>⚙️</span> Settings
                        </button>
                        <button
                            onClick={() => router.visit('/consult')}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 transition"
                        >
                            <span>💬</span> Consult
                        </button>
                    </nav>
                </aside>

                {/* ============ MAIN CONTENT ============ */}
                <main className="flex-1 h-full overflow-y-auto bg-[#f7f9fb]">

                    {/* ============ TOP BAR (Same as Dashboard) ============ */}
                    <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-end gap-4">
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1"
                        >
                            ⚠️ Report an issue
                        </button>
                        <button className="text-gray-500 hover:text-gray-800 text-xl relative">
                            🔔
                        </button>
                        <button className="text-gray-500 hover:text-gray-800 text-xl relative">
                            🛒
                        </button>
                        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            👤
                        </button>
                    </div>

                    <div className="p-8 space-y-6">

                        {/* ============ HEADER ============ */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Service Hub</h1>
                                <p className="text-gray-500 mt-1 text-sm">
                                    Explore all services offered by IPR Veda.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        🔍
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search service, category, or keyword"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-72 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ============ FEATURED CARDS ============ */}
                        <div>
                            

                            <div className="grid grid-cols-3 gap-4">
                                {featuredCards.map((card, idx) => {
                                    const Icon = card.icon;
                                    return (
                                        <div
                                            key={idx}
                                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition cursor-pointer"
                                        >
                                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Icon size={22} className="text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm text-gray-900 truncate">
                                                    {card.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                    {card.desc}
                                                </p>
                                            </div>
                                            <ChevronRight size={18} className="text-gray-400" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ============ TABS ============ */}
                        <div className="bg-white border border-gray-200 rounded-xl">
                            <div className="flex border-b border-gray-200 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition relative ${
                                            activeTab === tab
                                                ? 'text-[#0f2942]'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f2942]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ============ SERVICE SECTIONS ============ */}
                        {Object.entries(services).map(([section, items]) => (
                            <div key={section}>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    {section}
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {items.map((service) => (
                                        <div
                                            key={service.id}
                                            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col hover:shadow-md transition relative"
                                        >
                                            {service.popular && (
                                                <span className="absolute top-2 right-2 text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-semibold">
                                                    Popular
                                                </span>
                                            )}
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                                                <Shield size={22} className="text-[#0f2942]" />
                                            </div>
                                            <h3 className="font-semibold text-sm text-gray-900 mb-3 leading-snug min-h-[40px]">
                                                {service.title}
                                            </h3>
                                            <div className="mt-auto">
                                                <p className="text-xs text-gray-500 mb-1">
                                                    Starts from
                                                </p>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {service.mrp}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {service.price}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedService(service)}
                                                    className="text-xs text-[#0f2942] hover:text-[#0a1e30] font-medium flex items-center gap-1"
                                                >
                                                    View details
                                                    <ChevronRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                    </div>
                </main>

                {/* ============ MODAL (View Details) ============ */}
                {selectedService && (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedService(null)}
    >
        {/* Blurred backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

        {/* Modal content */}
        <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header (Fixed) */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between z-10">
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-gray-900">
                            {selectedService.title}
                        </h2>
                        {selectedService.popular && (
                            <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-semibold">
                                Popular
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">
                        {selectedService.tagline}
                    </p>
                </div>
                <button
                    onClick={() => setSelectedService(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    aria-label="Close"
                >
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* Price + Rating */}
                <div className="flex items-center justify-between mb-5 p-4 bg-gray-50 rounded-xl">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Starts from</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                                {selectedService.price}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                                {selectedService.mrp}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                Save{' '}
                                {Math.round(
                                    ((parseInt(selectedService.mrp.replace(/\D/g, '')) -
                                        parseInt(
                                            selectedService.price.replace(/\D/g, '')
                                        )) /
                                        parseInt(
                                            selectedService.mrp.replace(/\D/g, '')
                                        )) *
                                        100
                                )}
                                %
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                            <Star
                                size={16}
                                className="fill-yellow-400 text-yellow-400"
                            />
                            <span className="font-semibold text-gray-900">
                                {selectedService.rating}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            {selectedService.reviews} reviews
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        About this service
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedService.description}
                    </p>
                </div>

                {/* Features */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        What's included
                    </h3>
                    <ul className="space-y-2">
                        {selectedService.features.map((feature, idx) => (
                            <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-gray-600"
                            >
                                <Check
                                    size={16}
                                    className="text-green-500 mt-0.5 flex-shrink-0"
                                />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Timeline + Documents */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-blue-600" />
                            <h4 className="text-xs font-semibold text-gray-900">
                                Timeline
                            </h4>
                        </div>
                        <p className="text-sm text-gray-700">
                            {selectedService.timeline}
                        </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-purple-600" />
                            <h4 className="text-xs font-semibold text-gray-900">
                                Documents Required
                            </h4>
                        </div>
                        <p className="text-sm text-gray-700">
                            {selectedService.documents.length} documents
                        </p>
                    </div>
                </div>

                {/* Documents List */}
                <div className="mb-2"> 
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Documents you'll need
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedService.documents.map((doc, idx) => (
                            <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full"
                            >
                                {doc}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Footer (Fixed at bottom) */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                <div className="flex gap-3">
                    <button
                        onClick={() => setSelectedService(null)}
                        className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={async () => {
                            const serviceId = selectedService.id;
                            const title = selectedService.title;
                            const price = selectedService.price.replace(/[^\d]/g, '');

                            try {
                                await fetch('/api/track-purchase-intent', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json',
                                        'X-XSRF-TOKEN': getCsrfToken(),
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                        service_id: serviceId,
                                        service_title: title,
                                        amount: price,
                                    }),
                                });
                            } catch (error) {
                                console.error("Tracking failed, but moving forward:", error);
                            } finally {
                                router.visit(`/onboarding?service_id=${serviceId}&service_price=${price}&service_title=${title}`);
                                setSelectedService(null);
                            }
                        }}
                        className="flex-1 py-3 bg-[#0f2942] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3c5c] transition flex items-center justify-center gap-2"
                    >
                        <TrendingUp size={16} />
                        Proceed to Buy
                    </button>
                </div>
            </div>

        </div>
    </div>
)}

                {/* ============ REPORT ISSUE MODAL ============ */}
                {showReportModal && (
                    <ReportIssueModal onClose={() => setShowReportModal(false)} />
                )}
            </div>
        </AuthenticatedLayout>
    );
}