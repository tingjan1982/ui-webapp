import {useEffect, useState} from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import FileUploadModal from "./FileUploadModal.tsx";
import {ACTIONS} from "./constants.tsx";
import 'nprogress/nprogress.css';
import NProgress from 'nprogress';


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


function App() {
    const [response, setResponse] = useState<ApiResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [modalType, setModalType] = useState<string | null>(null)


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
        <>
            <h1>UI Dashboard</h1>
            <p>Use the following links to access information</p>

            {/*<div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>*/}
            <div className="container">
                <div className="column">
                    <h3>Transaction Functions</h3>
                    <a target="_blank" rel="noopener noreferrer"
                       href="https://docs.google.com/spreadsheets/d/106RJju-J-NNvnu_TdfbxbZZUFUgIAp_Xheu3KKzE2dU/edit?pli=1&gid=638336203#gid=638336203">
                        Cash Position
                    </a>
                    <div className="column">

                        <button onClick={() => setModalType(ACTIONS.updateCashPosition)}>{ACTIONS.updateCashPosition}</button>
                        <FileUploadModal key={'1' + modalType} name={ACTIONS.updateCashPosition} open={modalType === ACTIONS.updateCashPosition} onClose={() => setModalType(null)}
                                         onUpload={(file) => postFileRequest('sheets/updateCashPosition', file)}/>

                        <button onClick={() => setModalType('Bank Transaction')}>Sync Bank Transactions</button>
                        <FileUploadModal key={'2' + modalType} name={ACTIONS.syncBankTransactions} open={modalType === 'Bank Transaction'} onClose={() => setModalType(null)}
                                         onUpload={(file) => postFileRequest('transactions/sync', file)}/>

                        <button onClick={() => postRequest('sheets/syncPayments')}>
                            Sync Planned Payments
                        </button>
                    </div>
                </div>
                <div className="column">
                    <h3>Cost Analysis Functions</h3>
                    <a target="_blank" rel="noopener noreferrer"
                       href="https://docs.google.com/spreadsheets/d/1XLHMC8oM8jnfCtdh_KoFmd871lzaIBGOUVQATvzZFoE/edit?pli=1&gid=345099240#gid=345099240">
                        Cost Analysis
                    </a>
                    <div className="column">
                        <button onClick={() => postRequest('invoices/populateRBGInvoices')}>
                            Populate RBG Invoices
                        </button>
                        <button onClick={() => setModalType(ACTIONS.importCard1212)}>{ACTIONS.importCard1212}</button>
                        <FileUploadModal key={'3' + modalType} name={ACTIONS.importCard1212} open={modalType === ACTIONS.importCard1212} onClose={() => setModalType(null)}
                                         onUpload={(file) => postFileRequest('statements/card1212', file)}/>

                        <button onClick={() => setModalType(ACTIONS.importCard0296)}>{ACTIONS.importCard0296}</button>
                        <FileUploadModal key={'4' + modalType} name={ACTIONS.importCard0296} open={modalType === ACTIONS.importCard0296} onClose={() => setModalType(null)}
                                         onUpload={(file) => postFileRequest('statements/card0296', file)}/>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Response Pane</h3>
                <p>
                    {response?.message}
                </p>
                <p>
                    {error && <><span className="error">Error: </span>{error}</>}
                </p>
            </div>
            <p>
                Endpoint: {apiEndpoint} Health: {status}
            </p>
            <p className="read-the-docs">
                Developed in house by Joe Lin 2025
            </p>
        </>
    )
}

export default App
