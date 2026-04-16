import {useEffect, useState} from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import cfLogo from './assets/cf-logo.svg'
import './App.css'
import FileUploadModal from "./FileUploadModal.tsx";
import {ACTIONS} from "./constants.tsx";
import 'nprogress/nprogress.css';
import NProgress from 'nprogress';
import RentReviewPage from "./RentReviewPage.tsx";


type ApiResponse = {
    message: String
}

type ErrorResponse = {
    code: number,
    message: string
}

const apiHost = import.meta.env.VITE_API_HOST
const apiPort = import.meta.env.VITE_API_PORT
const apiEndpoint = `${apiHost}:${apiPort}`

type Page = 'dashboard' | 'rent-review'

function App() {
    const [response, setResponse] = useState<ApiResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [modalType, setModalType] = useState<string | null>(null)
    const [page, setPage] = useState<Page>('dashboard')


    const makeApiCall = async (
        apiCall: () => Promise<Response>
    ) => {
        try {
            NProgress.start()

            setError(null)
            setResponse({message: 'Processing'})

            const res = await apiCall()

            if (!res.ok) {
                const error: ErrorResponse = await res.json()
                throw new Error(error.message || 'Server error')
            }
            const data: ApiResponse = await res.json()
            setResponse(data)
        } catch (err: any) {
            setError(err.message)
            setResponse(null)

        } finally {
            NProgress.done()
        }
    }

    const postRequest = async (url: string) => {

        await makeApiCall(
            () => fetch(`${apiEndpoint}/${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        )
    }

    const postFileRequest = async (url: string, file: File) => {

        const formData: FormData = new FormData()
        formData.append('file', file)

        await makeApiCall(
            () => fetch(`${apiEndpoint}/${url}`, {
                method: 'POST',
                body: formData
            })
        )
    }

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch(`${apiEndpoint}/actuator/health`)

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

                const json = await res.json()
                setStatus(json.status)
            } catch (err: any) {
                setStatus(err.message)
            }
        };

        fetchHealth();
    }, []);

    return (
        <div className="dashboardLayout">
            <aside className="sidebar">
                <div className="sidebarHeader">
                    <img src={cfLogo} className="logo" alt="Central Fair Group logo"/>
                </div>

                <div className="actionGroup">
                    <h3>Pages</h3>
                    <button className={page === 'dashboard' ? 'activeButton' : ''} onClick={() => setPage('dashboard')}>
                        Dashboard Home
                    </button>
                    <button className={page === 'rent-review' ? 'activeButton' : ''} onClick={() => setPage('rent-review')}>
                        {ACTIONS.rentReview}
                    </button>
                </div>

                <div className="actionGroup">
                    <h3>Transaction Functions</h3>
                    <button className="actionButton uploadAction" onClick={() => setModalType(ACTIONS.updateCashPosition)}>
                        <span>{ACTIONS.updateCashPosition}</span>
                        <span className="actionTypeTag">Upload</span>
                    </button>
                    <FileUploadModal key={'1' + modalType} name={ACTIONS.updateCashPosition} open={modalType === ACTIONS.updateCashPosition}
                                     onClose={() => setModalType(null)} onUpload={(file) => postFileRequest('sheets/updateCashPosition', file)}/>

                    <button className="actionButton uploadAction" onClick={() => setModalType('Bank Transaction')}>
                        <span>Sync Bank Transactions</span>
                        <span className="actionTypeTag">Upload</span>
                    </button>
                    <FileUploadModal key={'2' + modalType} name={ACTIONS.syncBankTransactions} open={modalType === 'Bank Transaction'} onClose={() => setModalType(null)}
                                     onUpload={(file) => postFileRequest('transactions/sync', file)}/>

                    <button className="actionButton directAction" onClick={() => postRequest('sheets/syncPayments')}>
                        <span>Sync Planned Payments</span>
                        <span className="actionTypeTag">Run</span>
                    </button>
                </div>

                <div className="actionGroup">
                    <h3>Cost Analysis Functions</h3>
                    <button className="actionButton directAction" onClick={() => postRequest('invoices/populateRBGInvoices')}>
                        <span>Populate RBG Invoices</span>
                        <span className="actionTypeTag">Run</span>
                    </button>
                    <button className="actionButton uploadAction" onClick={() => setModalType(ACTIONS.importCard)}>
                        <span>{ACTIONS.importCard}</span>
                        <span className="actionTypeTag">Upload</span>
                    </button>
                    <FileUploadModal key={'3' + modalType} name={ACTIONS.importCard} open={modalType === ACTIONS.importCard} onClose={() => setModalType(null)}
                                     onUpload={(file) => postFileRequest('statements/import', file)}/>

                    <button className="actionButton directAction" onClick={() => postRequest('statements/populateExpenseTasks')}>
                        <span>Populate CU Expense Tasks</span>
                        <span className="actionTypeTag">Run</span>
                    </button>
                </div>
            </aside>

            <main className="mainPane">
                <div className="mainContent">
                    {page === 'dashboard' && (
                        <section className="mainPanel">
                            <h2>UI Dashboard</h2>
                            <p>This area is reserved for additional pages.</p>
                        </section>
                    )}

                    {page === 'rent-review' && (
                        <RentReviewPage apiEndpoint={apiEndpoint}/>
                    )}
                </div>

                <section className="mainPanel responsePane">
                    <h3>Response Pane</h3>
                    <p>
                        {response?.message}
                    </p>
                    <p>
                        {error && <><span className="error">Error: </span>{error}</>}
                    </p>
                </section>

                <footer className="appFooter">
                    <p className="footerMeta">
                        Endpoint: {apiEndpoint} Health: {status} App Version: {__APP_VERSION__}
                    </p>
                    <p className="read-the-docs">
                        Developed in house by Joe Lin 2025
                    </p>
                </footer>
            </main>
        </div>
    )
}

export default App
