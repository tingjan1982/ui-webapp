import {useEffect, useState} from "react";

type RentReviewPageProps = {
    apiEndpoint: string
}

const getLeaseLines = (payload: unknown): unknown[] => {
    if (Array.isArray(payload)) {
        return payload
    }

    if (payload && typeof payload === 'object') {
        const response = payload as Record<string, unknown>
        if (Array.isArray(response.leases)) {
            return response.leases
        }
        if (Array.isArray(response.data)) {
            return response.data
        }
    }

    return []
}

type LeaseRow = {
    tenant: string
    rentReviewDate: string
    reviewType: string
    newRent: string
    adoptedCpi: string
    awaitCPI: boolean
}

const getTextValue = (source: Record<string, unknown>, keys: string[]): string => {
    for (const key of keys) {
        const value = source[key]
        if (value !== undefined && value !== null && value !== '') {
            return String(value)
        }
    }
    return '-'
}

const getBooleanValue = (source: Record<string, unknown>, keys: string[]): boolean | undefined => {
    for (const key of keys) {
        const value = source[key]
        if (typeof value === 'boolean') {
            return value
        }
        if (typeof value === 'string') {
            const lowered = value.toLowerCase()
            if (lowered === 'true') {
                return true
            }
            if (lowered === 'false') {
                return false
            }
        }
    }
    return undefined
}

const getNestedValue = (source: Record<string, unknown>, path: string[]): unknown => {
    let current: unknown = source
    for (const part of path) {
        if (!current || typeof current !== 'object') {
            return undefined
        }
        current = (current as Record<string, unknown>)[part]
    }
    return current
}

const dateFormatter = new Intl.DateTimeFormat('en-GB')

const formatDateToDdMmYyyy = (value: string): string => {
    if (!value || value === '-') {
        return '-'
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return value
    }

    return dateFormatter.format(parsed)
}

const toLeaseRow = (item: unknown): LeaseRow => {
    if (!item || typeof item !== 'object') {
        return {
            tenant: String(item ?? '-'),
            rentReviewDate: '-',
            reviewType: '-',
            newRent: '-',
            adoptedCpi: '-',
            awaitCPI: false
        }
    }

    const lease = item as Record<string, unknown>
    const rentReviews = getNestedValue(lease, ['rentReviews'])
    let nestedNewRent = '-'
    let nestedAdoptedCpi = '-'
    let nestedAwaitCpi = false

    if (Array.isArray(rentReviews) && rentReviews.length > 0) {
        const firstReview = rentReviews[0]
        if (firstReview && typeof firstReview === 'object') {
            nestedNewRent = getTextValue(firstReview as Record<string, unknown>, ['newRent'])
            nestedAdoptedCpi = getTextValue(firstReview as Record<string, unknown>, ['adoptedCPI'])
            nestedAwaitCpi = getBooleanValue(firstReview as Record<string, unknown>, ['awaitCPI']) ?? false
        }
    } else if (rentReviews && typeof rentReviews === 'object') {
        nestedNewRent = getTextValue(rentReviews as Record<string, unknown>, ['newRent'])
        nestedAdoptedCpi = getTextValue(rentReviews as Record<string, unknown>, ['adoptedCPI'])
        nestedAwaitCpi = getBooleanValue(rentReviews as Record<string, unknown>, ['awaitCPI']) ?? false
    }

    const topLevelReviewType = getTextValue(lease, ['reviewType', 'type'])

    return {
        tenant: getTextValue(lease, ['tenant']),
        rentReviewDate: formatDateToDdMmYyyy(getTextValue(lease, ['rentReviewDate'])),
        reviewType: topLevelReviewType,
        newRent: nestedNewRent,
        adoptedCpi: nestedAdoptedCpi,
        awaitCPI: nestedAwaitCpi
    }
}

const RentReviewPage = ({apiEndpoint}: RentReviewPageProps) => {
    const [items, setItems] = useState<unknown[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState<string>('')
    const [emailActionMessage, setEmailActionMessage] = useState<string | null>(null)
    const [emailActionError, setEmailActionError] = useState<string | null>(null)
    const [emailSubmitting, setEmailSubmitting] = useState<boolean>(false)
    const currentYear = new Date().getFullYear()

    useEffect(() => {
        const fetchLeasesForReview = async () => {
            try {
                setLoading(true)
                setError(null)

                const res = await fetch(`${apiEndpoint}/services/rentReviewSummary`)
                if (!res.ok) {
                    throw new Error(`Unable to load leases for review (${res.status})`)
                }

                const data: unknown = await res.json()
                setItems(getLeaseLines(data))
            } catch (err: any) {
                setItems([])
                setError(err.message ?? 'Unable to load leases for review')
            } finally {
                setLoading(false)
            }
        }

        fetchLeasesForReview()
    }, [apiEndpoint]);

    const submitReviewEmail = async () => {
        const trimmedEmail = email.trim()
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
        if (!isEmailValid) {
            setEmailActionError('Please enter a valid email address.')
            setEmailActionMessage(null)
            return
        }

        try {
            setEmailSubmitting(true)
            setEmailActionError(null)
            setEmailActionMessage(null)

            const res = await fetch(`${apiEndpoint}/services/rentReviewSummary/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email: trimmedEmail})
            })

            if (!res.ok) {
                throw new Error(`Unable to send email (${res.status})`)
            }

            setEmailActionMessage(`Email has been sent: ${trimmedEmail}`)
        } catch (err: any) {
            setEmailActionError(err.message ?? 'Unable to send email')
        } finally {
            setEmailSubmitting(false)
        }
    }

    return (
        <section className="mainPanel">
            <h2>Rent Reviews</h2>
            <p>Leases that are up for rent review in {currentYear}.</p>
            <div className="rentReviewActions">
                <input
                    className="rentReviewEmailInput"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={submitReviewEmail} disabled={emailSubmitting}>
                    {emailSubmitting ? 'Sending...' : 'Send Rent Review'}
                </button>
            </div>
            {emailActionMessage && <p>{emailActionMessage}</p>}
            {emailActionError && <p><span className="error">Error: </span>{emailActionError}</p>}

            {loading && <p>Loading lease review data from backend...</p>}
            {error && <p><span className="error">Error: </span>{error}</p>}
            {!loading && !error && items.length === 0 && <p>No leases currently up for review.</p>}

            {!loading && !error && items.length > 0 && (
                <div className="tableWrap">
                    <table className="leaseTable">
                        <thead>
                        <tr>
                            <th>Tenant</th>
                            <th>Rent Review Date</th>
                            <th>Review Type</th>
                            <th>New Rent</th>
                            <th>Adopted CPI</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item, index) => {
                            const row = toLeaseRow(item)
                            return (
                                <tr key={`lease-${index}`}>
                                    <td>{row.tenant}</td>
                                    <td>{row.rentReviewDate}</td>
                                    <td>{row.reviewType}</td>
                                    <td>{row.awaitCPI ? "Await CPI" : row.newRent}</td>
                                    <td>{row.adoptedCpi}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default RentReviewPage;
