import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    onSnapshot,
    setDoc,
    updateDoc,
    collection,
    query,
    setLogLevel
} from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : { apiKey: "DEFAULT_API_KEY", authDomain: "DEFAULT_AUTH_DOMAIN", projectId: "DEFAULT_PROJECT_ID" };

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Check if we have valid Firebase config
const hasValidFirebaseConfig = 
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== 'DEFAULT_API_KEY' && 
    firebaseConfig.projectId && 
    firebaseConfig.projectId !== 'DEFAULT_PROJECT_ID';

// --- Contexts ---
const FirebaseContext = createContext(null);
const useFirebase = () => useContext(FirebaseContext);

const AppContext = createContext(null);
const useAppContext = () => useContext(AppContext);

// --- Firebase Initialization Provider ---
const FirebaseProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [firebaseError, setFirebaseError] = useState(null);

    useEffect(() => {
        // If no valid Firebase config, run in mock mode
        if (!hasValidFirebaseConfig) {
            console.warn('?? Firebase config is invalid or missing. Running in DEMO MODE with mock data.');
            setUserId('demo-user-' + Math.random().toString(36).substr(2, 9));
            setIsAuthReady(true);
            setFirebaseError('Firebase not configured - using demo mode');
            return;
        }

        // Try to initialize Firebase with valid config
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            setLogLevel('error'); // Change to 'error' to reduce console noise
            setAuth(authInstance);
            setDb(dbInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    try {
                        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                            await signInWithCustomToken(authInstance, __initial_auth_token);
                        } else {
                            await signInAnonymously(authInstance);
                        }
                    } catch (error) {
                        console.error("Error signing in:", error);
                        setFirebaseError(error.message);
                        setUserId('fallback-user-' + Math.random().toString(36).substr(2, 9));
                        setIsAuthReady(true);
                    }
                }
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            setFirebaseError(error.message);
            setUserId('error-user-' + Math.random().toString(36).substr(2, 9));
            setIsAuthReady(true);
        }
    }, []);

    return (
        <FirebaseContext.Provider value={{ auth, db, userId, isAuthReady, appId, firebaseError }}>
            {isAuthReady ? children : <LoadingScreen message="Connecting to workspace..." />}
        </FirebaseContext.Provider>
    );
};

// --- Main Application Component (Router) ---
export default function App() {
    // Simple state-based router
    // view: { page: 'stage2' | 'stage3', rfpId: string, smeType: 'legal' | 'finance' | 'tech' }
    const [view, setView] = useState({ page: 'stage2', rfpId: 'RFP-2025-001' });

    return (
        <FirebaseProvider>
            <AppContext.Provider value={{ view, setView }}>
                <div className="antialiased text-gray-900 bg-gray-100 min-h-screen">
                    <DemoModeBanner />
                    <Header />
                    {/* --- Simple Router --- */}
                    {view.page === 'stage2' && <Stage2Dashboard rfpId={view.rfpId} />}
                    {view.page === 'stage3' && view.smeType === 'legal' && <Stage3Dashboard rfpId={view.rfpId} />}
                    {view.page === 'stage3' && view.smeType === 'finance' && <Stage3FinanceDashboard rfpId={view.rfpId} />}
                    {view.page === 'stage3' && view.smeType === 'tech' && <Stage3TechDashboard rfpId={view.rfpId} />}
                </div>
            </AppContext.Provider>
        </FirebaseProvider>
    );
}

// --- Demo Mode Banner ---
const DemoModeBanner = () => {
    const { firebaseError } = useFirebase();
    
    if (!firebaseError) return null;

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between flex-wrap">
                    <div className="w-0 flex-1 flex items-center">
                        <span className="flex p-2 rounded-lg bg-blue-800">
                            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        <p className="ml-3 font-medium text-white">
                            <span className="md:hidden">
                                ?? Demo Mode
                            </span>
                            <span className="hidden md:inline">
                                ?? <strong>Demo Mode</strong> - Firebase not configured. Using simulated data for demonstration purposes.
                            </span>
                        </p>
                    </div>
                    <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                        <a
                            href="https://firebase.google.com/docs/web/setup"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                        >
                            Setup Firebase
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SVG Icons (MOVED TO TOP for use in components) ---
const CheckIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const XMarkIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- Header ---
const Header = () => {
    const { userId } = useFirebase();
    const { setView } = useAppContext();

    // Mock navigation for demo
    const goToStage2 = () => setView({ page: 'stage2', rfpId: 'RFP-2025-001' });
    const goToStage3Legal = () => setView({ page: 'stage3', rfpId: 'RFP-2025-001', smeType: 'legal' });
    const goToStage3Finance = () => setView({ page: 'stage3', rfpId: 'RFP-2025-001', smeType: 'finance' });
    const goToStage3Tech = () => setView({ page: 'stage3', rfpId: 'RFP-2025-001', smeType: 'tech' });

    return (
        <header className="bg-white shadow-sm sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-2">
                        <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12 12 0 0012 21.054a12 12 0 008.618-15.07z" />
                        </svg>
                        <h1 className="text-xl font-bold text-gray-800">RFP Qualification Platform</h1>
                    </div>
                    {/* Demo navigation links */}
                    <div className="flex space-x-4">
                        <button onClick={goToStage2} className="text-sm font-medium text-gray-600 hover:text-blue-600">Stage 2</button>
                        <button onClick={goToStage3Legal} className="text-sm font-medium text-gray-600 hover:text-blue-600">Legal</button>
                        <button onClick={goToStage3Finance} className="text-sm font-medium text-gray-600 hover:text-blue-600">Finance</button>
                        <button onClick={goToStage3Tech} className="text-sm font-medium text-gray-600 hover:text-blue-600">Tech</button>
                    </div>
                    <div className="text-xs text-gray-500">
                        <span className="font-medium">User ID:</span> {userId || '...'}
                    </div>
                </div>
            </div>
        </header>
    );
};

// --- Loading Component ---
const LoadingScreen = ({ message }) => (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{message}</span>
    </div>
);

// --- Reusable Modal Component (FIXED) ---
const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-30" aria-hidden="true">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                        <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600"
                            onClick={onClose}
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    {/* Body */}
                    <div className="p-6">
                        {children}
                    </div>
                    {/* Footer */}
                    {footer && (
                        <div className="flex justify-end space-x-3 p-4 bg-gray-50 rounded-b-lg">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Mock Data (FALLBACK ONLY) ---
const MOCK_RFP_DATA = {
    id: "RFP-2025-001",
    title: "Global Enterprise Cloud Migration Services",
    client: "MegaCorp Inc.",
    status: "Stage 2 - Business Review",
    triage: {
        tShirtSize: "XL", effortDays: 120, value: 5_000_000,
        nonNegotiableQualifiers: [
            { id: "nnq-1", type: "LEGAL", text: "Requires 'Unlimited Liability' clause.", status: "DEAL_BREAKER" },
            { id: "nnq-2", type: "FINANCE", text: "Requires Net 120 payment terms.", status: "DEAL_BREAKER" },
            { id: "nnq-3", type: "TECH", text: "Requires FedRAMP High certification.", status: "FLAG_FOR_REVIEW" },
        ]
    },
    strategy: {
        strategicFitScore: 8.5,
        summary: "High strategic fit. Aligns with our Q3 goal of expanding into the finance vertical. High value, but high risk.",
        historicalData: [
            { id: "hist-1", rfpId: "RFP-2023-045", client: "BigBank", outcome: "WON", similarity: 0.92, notes: "Similar FedRAMP requirement; we got an exception." },
            { id: "hist-2", rfpId: "RFP-2024-012", client: "TechGiant", outcome: "LOST", similarity: 0.88, notes: "Lost on price. 'Unlimited Liability' was a no-go." },
        ]
    }
};

const MOCK_LEGAL_QUEUE = [
    {
        id: "clause-001",
        type: "DEAL_BREAKER",
        text: "The Vendor agrees to assume unlimited liability for any and all damages arising from this agreement.",
        botAnalysis: "`LegalBot` analysis: This is a 100% match for a 'DEAL_BREAKER' clause. It conflicts with Corporate Policy 4.1.A.",
        botSuggestion: "REJECT",
        historicalPrecedent: { rfpId: "RFP-2024-012", notes: "We proposed a capped liability of 2x TCV. Client rejected." },
        humanStatus: 'Pending',
    },
    {
        id: "clause-002",
        type: "FLAG_FOR_REVIEW",
        text: "Vendor must provide all services using personnel based in the continental United States.",
        botAnalysis: "`LegalBot` analysis: This 'Data Residency' clause may conflict with our offshore support model. `TechBot` has also flagged this.",
        botSuggestion: "ESCALATE_TO_TECH",
        historicalPrecedent: null,
        humanStatus: 'Pending',
    },
    {
        id: "clause-003",
        type: "STANDARD",
        text: "This agreement shall be governed by the laws of the State of Delaware.",
        botAnalysis: "`LegalBot` analysis: This is our standard governing law. No issues detected.",
        botSuggestion: "APPROVE",
        historicalPrecedent: null,
        humanStatus: 'Pending',
    }
];

const MOCK_FINANCE_QUEUE = [
    {
        id: "finance-001",
        type: "DEAL_BREAKER",
        text: "Payment terms: Net 120 days from invoice date.",
        botAnalysis: "`FinanceBot` analysis: This exceeds our standard Net 60 policy by 2x. Cash flow impact: HIGH.",
        botSuggestion: "REJECT",
        historicalPrecedent: { rfpId: "RFP-2024-008", notes: "Negotiated down to Net 90. Client accepted." },
        humanStatus: 'Pending',
    },
    {
        id: "finance-002",
        type: "FLAG_FOR_REVIEW",
        text: "Vendor must provide a performance bond of 15% of TCV.",
        botAnalysis: "`FinanceBot` analysis: This is above our typical 10% threshold. Will require CFO approval.",
        botSuggestion: "ESCALATE",
        historicalPrecedent: null,
        humanStatus: 'Pending',
    }
];

const MOCK_TECH_QUEUE = [
    {
        id: "tech-001",
        type: "FLAG_FOR_REVIEW",
        text: "Solution must be FedRAMP High certified.",
        botAnalysis: "`TechBot` analysis: Our platform is FedRAMP Moderate. High certification would require 6-9 months and $500K investment.",
        botSuggestion: "ESCALATE",
        historicalPrecedent: { rfpId: "RFP-2023-045", notes: "Client accepted FedRAMP Moderate with additional security controls." },
        humanStatus: 'Pending',
    },
    {
        id: "tech-002",
        type: "STANDARD",
        text: "99.9% uptime SLA required.",
        botAnalysis: "`TechBot` analysis: This matches our standard Enterprise SLA. No issues detected.",
        botSuggestion: "APPROVE",
        historicalPrecedent: null,
        humanStatus: 'Pending',
    }
];

// --- Stage 2 Dashboard Component (WITH REAL FIRESTORE) ---
function Stage2Dashboard({ rfpId }) {
    const { db, isAuthReady, appId } = useFirebase();
    const { setView } = useAppContext();
    const [rfpData, setRfpData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [useMockData, setUseMockData] = useState(false);

    // Modal State: { isOpen: boolean, title: string, message: string, onConfirm: function }
    const [modalState, setModalState] = useState({ isOpen: false });

    // Load RFP Data from Firestore (WITH FALLBACK)
    useEffect(() => {
        if (!isAuthReady || !db) return;

        setIsLoading(true);
        const rfpDocRef = doc(db, 'artifacts', appId, 'public', 'rfps', rfpId);

        const unsubscribe = onSnapshot(
            rfpDocRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    setRfpData(docSnap.data());
                    setUseMockData(false);
                } else {
                    console.warn('RFP document not found in Firestore. Using mock data.');
                    setRfpData(MOCK_RFP_DATA);
                    setUseMockData(true);
                }
                setIsLoading(false);
            },
            (err) => {
                console.error('Error loading RFP data:', err);
                console.warn('Falling back to mock data.');
                setRfpData(MOCK_RFP_DATA);
                setUseMockData(true);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [rfpId, db, isAuthReady, appId]);

    // --- Decision Handler (WITH MODAL) ---
    const handleDecision = async (decision) => {
        if (!db) return;

        const rfpDocRef = doc(db, 'artifacts', appId, 'public', 'rfps', rfpId);

        if (decision === 'GO') {
            setModalState({
                isOpen: true,
                title: "Approve to Stage 3?",
                message: "This will move the RFP to SME Qualification and create tasks for Legal, Finance, and Tech. Are you sure?",
                onConfirm: async () => {
                    try {
                        if (!useMockData) {
                            await setDoc(rfpDocRef,
                                {
                                    status: "Stage 3 - SME Qualification",
                                    stage2: { decision: "GO", decidedAt: new Date().toISOString() }
                                },
                                { merge: true }
                            );
                        } else {
                            console.log('Mock mode: Would update Firestore with GO decision');
                        }

                        setModalState({ isOpen: false });
                        setView({ page: 'stage3', rfpId: rfpId, smeType: 'legal' });
                    } catch (err) {
                        console.error("Error approving RFP:", err);
                        setModalState({
                            isOpen: true,
                            title: "Error",
                            message: `Failed to save decision: ${err.message}`,
                            onConfirm: () => setModalState({ isOpen: false })
                        });
                    }
                }
            });

        } else { // 'NO-GO'
            setModalState({
                isOpen: true,
                title: "Reject (No-Go)?",
                message: "This will mark the RFP as 'Rejected' and archive it. This action cannot be undone. Are you sure?",
                onConfirm: async () => {
                    try {
                        if (!useMockData) {
                            await setDoc(rfpDocRef,
                                {
                                    status: "REJECTED (No-Go)",
                                    stage2: { decision: "NO-GO", decidedAt: new Date().toISOString() }
                                },
                                { merge: true }
                            );
                        } else {
                            console.log('Mock mode: Would update Firestore with NO-GO decision');
                        }

                        setModalState({ isOpen: false });
                        setRfpData(prev => ({ ...prev, status: 'REJECTED (No-Go)' }));
                    } catch (err) {
                        console.error("Error rejecting RFP:", err);
                        setModalState({
                            isOpen: true,
                            title: "Error",
                            message: `Failed to save decision: ${err.message}`,
                            onConfirm: () => setModalState({ isOpen: false })
                        });
                    }
                }
            });
        }
    };

    if (isLoading) return <LoadingScreen message="Loading Stage 2 Review..." />;
    if (error) return <div className="max-w-7xl mx-auto p-4"><DashboardCard><p className="text-red-600 font-medium">{error}</p></DashboardCard></div>;
    if (!rfpData) return null;

    const dealBreakers = rfpData.triage?.nonNegotiableQualifiers?.filter(nnq => nnq.status === 'DEAL_BREAKER') || [];
    const flags = rfpData.triage?.nonNegotiableQualifiers?.filter(nnq => nnq.status === 'FLAG_FOR_REVIEW') || [];

    return (
        <>
            {/* --- Data Source Indicator --- */}
            {useMockData && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Using <strong>mock data</strong>. Firestore document not found or connection failed.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- The Modal --- */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false })}
                title={modalState.title}
                footer={
                    <>
                        <Button text="Cancel" color="gray" onClick={() => setModalState({ isOpen: false })} />
                        <Button text="Confirm" color={modalState.title?.includes("Reject") ? "red" : "green"} onClick={modalState.onConfirm} />
                    </>
                }
            >
                <p className="text-sm text-gray-600">{modalState.message}</p>
            </Modal>

            {/* --- The Dashboard UI --- */}
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold leading-tight text-gray-900">{rfpData.title}</h2>
                    <p className="text-lg text-gray-600">{rfpData.client} (ID: {rfpData.id})</p>
                </div>

                <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Stage 2 Decision: Go / No-Go?</h3>
                    {rfpData.status === 'REJECTED (No-Go)' ? (
                        <div className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-md">
                            REJECTED
                        </div>
                    ) : (
                        <div className="flex space-x-3">
                            <DecisionButton
                                text="Reject (No-Go)"
                                Icon={XMarkIcon}
                                color="red"
                                onClick={() => handleDecision('NO-GO')}
                            />
                            <DecisionButton
                                text="Approve to Stage 3"
                                Icon={CheckIcon}
                                color="green"
                                onClick={() => handleDecision('GO')}
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {dealBreakers.length > 0 && (
                            <DashboardCard title="?? Deal-Breakers Detected" titleColor="text-red-700">
                                <p className="text-sm text-gray-600 mb-3">
                                    `TriageBot` detected {dealBreakers.length} non-negotiable items.
                                </p>
                                <ul className="space-y-2">
                                    {dealBreakers.map(nnq => <QualifierItem key={nnq.id} item={nnq} />)}
                                </ul>
                            </DashboardCard>
                        )}
                        {flags.length > 0 && (
                            <DashboardCard title="?? Flags for Review" titleColor="text-yellow-700">
                                <p className="text-sm text-gray-600 mb-3">
                                    `TriageBot` flagged {flags.length} items that require SME review.
                                </p>
                                <ul className="space-y-2">
                                    {flags.map(nnq => <QualifierItem key={nnq.id} item={nnq} />)}
                                </ul>
                            </DashboardCard>
                        )}
                        <DashboardCard title="?? `StrategyBot` Analysis">
                            <h4 className="text-lg font-semibold text-blue-700">Strategic Fit: {rfpData.strategy?.strategicFitScore || 0} / 10</h4>
                            <p className="mt-1 mb-4 text-gray-700 italic">"{rfpData.strategy?.summary || 'No summary available'}"</p>
                            <h5 className="font-semibold text-gray-800 mb-2">Historical Precedents:</h5>
                            <ul className="space-y-3">
                                {(rfpData.strategy?.historicalData || []).map(hist => (
                                    <li key={hist.id} className="border-l-4 p-3" style={{ borderColor: hist.outcome === 'WON' ? '#10B981' : '#EF4444' }}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800">{hist.client} - {hist.rfpId}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${hist.outcome === 'WON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {hist.outcome}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{hist.notes}</p>
                                    </li>
                                ))}
                            </ul>
                        </DashboardCard>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <DashboardCard title="`TriageBot` Summary">
                            <InfoMetric label="T-Shirt Size" value={rfpData.triage?.tShirtSize || 'N/A'} />
                            <InfoMetric label="Est. Effort (Days)" value={rfpData.triage?.effortDays || 'N/A'} />
                            <InfoMetric label="Est. TCV" value={`$${(rfpData.triage?.value || 0).toLocaleString()}`} />
                        </DashboardCard>
                        <DashboardCard title="Next Steps">
                            <p className="text-sm text-gray-600">
                                Approving this RFP will move it to **Stage 3: SME Qualification**.
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mt-2">
                                <li>LegalBot & Legal Team</li>
                                <li>FinanceBot & Finance Team</li>
                                <li>TechBot & Tech Team</li>
                            </ul>
                        </DashboardCard>
                    </div>
                </div>
            </div>
        </>
    );
}

// --- Stage 3 SME Dashboard (Legal) WITH REAL FIRESTORE ---
function Stage3Dashboard({ rfpId }) {
    const { db, isAuthReady, appId } = useFirebase();
    const [queueItems, setQueueItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [useMockData, setUseMockData] = useState(false);

    // Load Legal Queue Data from Firestore (WITH FALLBACK)
    useEffect(() => {
        if (!isAuthReady || !db) return;

        setIsLoading(true);
        const legalQueueRef = collection(db, 'artifacts', appId, 'public', 'rfps', rfpId, 'legalQueue');
        const q = query(legalQueueRef);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const items = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setQueueItems(items);
                    setUseMockData(false);
                } else {
                    console.warn('Legal queue empty or not found. Using mock data.');
                    setQueueItems(MOCK_LEGAL_QUEUE);
                    setUseMockData(true);
                }
                setIsLoading(false);
            },
            (err) => {
                console.error('Error loading legal queue:', err);
                console.warn('Falling back to mock data.');
                setQueueItems(MOCK_LEGAL_QUEUE);
                setUseMockData(true);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [rfpId, db, isAuthReady, appId]);

    const handleItemDecision = async (itemId, decision) => {
        // Optimistic update
        setQueueItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, humanStatus: decision } : item
            )
        );

        // Update Firestore (if not using mock data)
        if (!useMockData && db) {
            try {
                const itemRef = doc(db, 'artifacts', appId, 'public', 'rfps', rfpId, 'legalQueue', itemId);
                await updateDoc(itemRef, { 
                    humanStatus: decision,
                    reviewedAt: new Date().toISOString()
                });
                console.log(`Updated ${itemId} to ${decision} in Firestore`);
            } catch (err) {
                console.error(`Error updating item ${itemId}:`, err);
            }
        } else {
            console.log(`Mock mode: Updated ${itemId} to ${decision}`);
        }
    };

    const reviewedCount = queueItems.filter(item => item.humanStatus !== 'Pending').length;
    const totalCount = queueItems.length;

    if (isLoading) return <LoadingScreen message="Loading Stage 3 Legal Queue..." />;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {useMockData && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Using <strong>mock data</strong>. Legal queue collection not found or connection failed.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <h2 className="text-2xl font-bold leading-tight text-gray-900">Stage 3: Legal Qualification</h2>
                <p className="text-lg text-gray-600">{MOCK_RFP_DATA.title}</p>
            </div>

            {/* --- Progress & Submit --- */}
            <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Legal Review Queue</h3>
                    <p className="text-sm text-gray-600">
                        {reviewedCount} of {totalCount} items reviewed.
                    </p>
                </div>
                <Button
                    text="Submit Final Legal Review"
                    color="blue"
                    disabled={reviewedCount !== totalCount}
                />
            </div>

            {/* --- Queue Items --- */}
            <div className="space-y-6">
                {queueItems.map(item => (
                    <QualificationItem
                        key={item.id}
                        item={item}
                        onDecision={handleItemDecision}
                    />
                ))}
            </div>
        </div>
    );
}

// --- NEW: Stage 3 Finance Dashboard ---
function Stage3FinanceDashboard({ rfpId }) {
    const { db, isAuthReady, appId } = useFirebase();
    const [queueItems, setQueueItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [useMockData, setUseMockData] = useState(false);

    useEffect(() => {
        if (!isAuthReady || !db) return;

        setIsLoading(true);
        const financeQueueRef = collection(db, 'artifacts', appId, 'public', 'rfps', rfpId, 'financeQueue');
        const q = query(financeQueueRef);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const items = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setQueueItems(items);
                    setUseMockData(false);
                } else {
                    console.warn('Finance queue empty or not found. Using mock data.');
                    setQueueItems(MOCK_FINANCE_QUEUE);
                    setUseMockData(true);
                }
                setIsLoading(false);
            },
            (err) => {
                console.error('Error loading finance queue:', err);
                setQueueItems(MOCK_FINANCE_QUEUE);
                setUseMockData(true);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [rfpId, db, isAuthReady, appId]);

    const handleItemDecision = async (itemId, decision) => {
        setQueueItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, humanStatus: decision } : item
            )
        );

        if (!useMockData && db) {
            try {
                const itemRef = doc(db, 'artifacts', appId, 'public', 'rfps', rfpId, 'financeQueue', itemId);
                await updateDoc(itemRef, { 
                    humanStatus: decision,
                    reviewedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error(`Error updating item ${itemId}:`, err);
            }
        }
    };

    const reviewedCount = queueItems.filter(item => item.humanStatus !== 'Pending').length;
    const totalCount = queueItems.length;

    if (isLoading) return <LoadingScreen message="Loading Stage 3 Finance Queue..." />;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {useMockData && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Using <strong>mock data</strong>. Finance queue collection not found.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <h2 className="text-2xl font-bold leading-tight text-gray-900">Stage 3: Finance Qualification</h2>
                <p className="text-lg text-gray-600">{MOCK_RFP_DATA.title}</p>
            </div>

            <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Finance Review Queue</h3>
                    <p className="text-sm text-gray-600">
                        {reviewedCount} of {totalCount} items reviewed.
                    </p>
                </div>
                <Button
                    text="Submit Final Finance Review"
                    color="blue"
                    disabled={reviewedCount !== totalCount}
                />
            </div>

            <div className="space-y-6">
                {queueItems.map(item => (
                    <QualificationItem
                        key={item.id}
                        item={item}
                        onDecision={handleItemDecision}
                        botName="FinanceBot"
                    />
                ))}
            </div>
        </div>
    );
}

// --- NEW: Stage 3 Tech Dashboard ---
function Stage3TechDashboard({ rfpId }) {
    const { db, isAuthReady, appId } = useFirebase();
    const [queueItems, setQueueItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [useMockData, setUseMockData] = useState(false);

    useEffect(() => {
        if (!isAuthReady || !db) return;

        setIsLoading(true);
        const techQueueRef = collection(db, 'artifacts', appId, 'public', 'rfps', rfpId, 'techQueue');
        const q = query(techQueueRef);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const items = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setQueueItems(items);
                    setUseMockData(false);
                } else {
                    console.warn('Tech queue empty or not found. Using mock data.');
                    setQueueItems(MOCK_TECH_QUEUE);
                    setUseMockData(true);
                }
                setIsLoading(false);
            },
            (err) => {
                console.error('Error loading tech queue:', err);
                setQueueItems(MOCK_TECH_QUEUE);
                setUseMockData(true);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [rfpId, db, isAuthReady, appId]);

    const handleItemDecision = async (itemId, decision) => {
        setQueueItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, humanStatus: decision } : item
            )
        );

        if (!useMockData && db) {
            try {
                const itemRef = doc(db, 'artifacts', appId, 'public', 'rfps', rfpId, 'techQueue', itemId);
                await updateDoc(itemRef, { 
                    humanStatus: decision,
                    reviewedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error(`Error updating item ${itemId}:`, err);
            }
        }
    };

    const reviewedCount = queueItems.filter(item => item.humanStatus !== 'Pending').length;
    const totalCount = queueItems.length;

    if (isLoading) return <LoadingScreen message="Loading Stage 3 Tech Queue..." />;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {useMockData && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Using <strong>mock data</strong>. Tech queue collection not found.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <h2 className="text-2xl font-bold leading-tight text-gray-900">Stage 3: Technical Qualification</h2>
                <p className="text-lg text-gray-600">{MOCK_RFP_DATA.title}</p>
            </div>

            <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Technical Review Queue</h3>
                    <p className="text-sm text-gray-600">
                        {reviewedCount} of {totalCount} items reviewed.
                    </p>
                </div>
                <Button
                    text="Submit Final Tech Review"
                    color="blue"
                    disabled={reviewedCount !== totalCount}
                />
            </div>

            <div className="space-y-6">
                {queueItems.map(item => (
                    <QualificationItem
                        key={item.id}
                        item={item}
                        onDecision={handleItemDecision}
                        botName="TechBot"
                    />
                ))}
            </div>
        </div>
    );
}

// --- Stage 3 Qualification Item (ENHANCED) ---
function QualificationItem({ item, onDecision, botName = "LegalBot" }) {
    const { humanStatus } = item;

    const statusColors = {
        Pending: "bg-gray-100 text-gray-800",
        Approved: "bg-green-100 text-green-800",
        Rejected: "bg-red-100 text-red-800",
        Escalated: "bg-yellow-100 text-yellow-800",
    };

    const botSuggestionColors = {
        APPROVE: "text-green-600",
        REJECT: "text-red-600",
        ESCALATE_TO_TECH: "text-yellow-600",
        ESCALATE: "text-yellow-600",
    };

    return (
        <DashboardCard>
            <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[humanStatus]}`}>
                    Status: {humanStatus}
                </span>
                <span className={`text-sm font-bold ${botSuggestionColors[item.botSuggestion] || 'text-gray-600'}`}>
                    `{botName}` Suggestion: {item.botSuggestion}
                </span>
            </div>

            {/* Clause Text */}
            <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase">RFP Clause/Requirement</label>
                <p className="text-base text-gray-800 p-3 bg-gray-50 rounded-md border border-gray-200">
                    "{item.text}"
                </p>
            </div>

            {/* Bot Analysis */}
            <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase">`{botName}` Analysis</label>
                <p className="text-sm text-gray-700 p-3 bg-blue-50 rounded-md border border-blue-100">
                    {item.botAnalysis}
                </p>
            </div>

            {/* Historical Precedent */}
            {item.historicalPrecedent && (
                <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Historical Precedent</label>
                    <div className="text-sm text-gray-700 p-3 bg-yellow-50 rounded-md border border-yellow-100">
                        <span className="font-medium">{item.historicalPrecedent.rfpId}:</span> {item.historicalPrecedent.notes}
                    </div>
                </div>
            )}

            {/* Decision Buttons */}
            {humanStatus === 'Pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button text="Reject" color="red" onClick={() => onDecision(item.id, 'Rejected')} />
                    <Button text="Escalate" color="yellow" onClick={() => onDecision(item.id, 'Escalated')} />
                    <Button text="Approve" color="green" onClick={() => onDecision(item.id, 'Approved')} />
                </div>
            )}
        </DashboardCard>
    );
}


// --- Reusable UI Components ---

const DashboardCard = ({ title, titleColor = "text-gray-900", children }) => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
        {title && (
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                <h3 className={`text-lg font-semibold leading-6 ${titleColor}`}>
                    {title}
                </h3>
            </div>
        )}
        <div className="p-4 sm:p-6">
            {children}
        </div>
    </div>
);

const QualifierItem = ({ item }) => {
    const colors = {
        LEGAL: "bg-red-100 text-red-800",
        FINANCE: "bg-yellow-100 text-yellow-800",
        TECH: "bg-blue-100 text-blue-800",
    };
    return (
        <li className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
            <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[item.type] || 'bg-gray-100 text-gray-800'}`}>
                    {item.type}
                </span>
            </div>
            <p className="text-sm text-gray-700">{item.text}</p>
        </li>
    );
};

const InfoMetric = ({ label, value }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="text-lg font-semibold text-gray-900">{value}</span>
    </div>
);

const DecisionButton = ({ text, Icon, color, onClick, ...props }) => {
    const colors = {
        red: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        green: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    };
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${colors[color]} focus:outline-none focus:ring-2 focus:ring-offset-2`}
            {...props}
        >
            <Icon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {text}
        </button>
    );
};

const Button = ({ text, color, onClick, disabled = false, ...props }) => {
    const colors = {
        gray: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400",
        red: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        green: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
        yellow: "bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400",
        blue: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    };
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${colors[color]} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            {...props}
        >
            {text}
        </button>
    );
};
