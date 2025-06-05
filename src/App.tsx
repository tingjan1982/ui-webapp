import {useState} from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

type ApiResponse = {
    message: String
}

type ErrorResponse = {
    code: number,
    message: string
}

function App() {
    const [response, setResponse] = useState<ApiResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const makeApiCall = async (
        apiCall: () => Promise<Response>
    ) => {
        try {
            setError(null)
            setResponse(null)

            const res = await apiCall()

            if (!res.ok) {
                const error: ErrorResponse = await res.json()
                throw new Error(error.message || 'Server error')
            }
            const data: ApiResponse = await res.json()
            setResponse(data)
        } catch (err: any) {
            setError(err.message)
        }
    }

    const postRequest = async (url: string) => {

        await makeApiCall(
            () => fetch(`http://localhost:8080/${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        )
    }

    return (
        <>
            <h1>UI Dashboard</h1>
            <p>Use the following links to access information</p>
            <a target="_blank" rel="noopener noreferrer"
               href="https://docs.google.com/spreadsheets/d/106RJju-J-NNvnu_TdfbxbZZUFUgIAp_Xheu3KKzE2dU/edit?pli=1&gid=638336203#gid=638336203">
                Cost Analysis
            </a>
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
                    <h3>Finance Functions</h3>
                    <div className="column">
                        <button onClick={() => postRequest('sheets/updateCashPosition')}>
                            Update Cash Position
                        </button>
                        <button onClick={() => postRequest('/sheets/syncPayments')}>
                            Sync Planned Payments
                        </button>
                        <button onClick={() => postRequest('transactions/sync')}>
                            Sync Bank Transactions
                        </button>
                    </div>
                </div>
                <div className="column">
                    <h3>Invoice Functions</h3>
                    <div className="column">
                        <button onClick={() => postRequest('invoices/populateRBGInvoices')}>
                            Populate RBG Invoices
                        </button>
                        <button onClick={() => postRequest('statements/card1212')}>
                            Import Credit Card Statement 1212
                        </button>
                        <button onClick={() => postRequest('statements/card0296')}>
                            Import Credit Card Statement 0296
                        </button>
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
            <p className="read-the-docs">
                Developed in house by Joe Lin 2025
            </p>
        </>
    )
}

export default App
