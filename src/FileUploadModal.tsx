import * as Dialog from '@radix-ui/react-dialog';
import React, {useState} from 'react';

interface FileUploadModalProps {
    name: string
    open: boolean,
    onClose: () => void,
    onUpload: (file: File) => void,
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({open, onClose, onUpload, name}) => {
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null
        setFile(selected);
    }

    const handleUpload = () => {
        if (file) {
            onUpload(file)
            onClose()
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={(state) => !state && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    position: 'fixed',
                    inset: 0
                }}/>
                <Dialog.Content style={{
                    background: 'gray',
                    borderRadius: 8,
                    padding: 20,
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    minWidth: 500
                }}>
                    <Dialog.Title>{name}</Dialog.Title>
                    <Dialog.Description>
                        Select a file and click upload to run the function.
                    </Dialog.Description>
                    <input type="file" onChange={handleFileChange}/>
                    {file && <p>Selected: {file.name}</p>}

                    <div style={{marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10}}>
                        <Dialog.Close asChild>
                            <button>Cancel</button>
                        </Dialog.Close>
                        <button onClick={handleUpload} disabled={!file}>
                            Upload
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default FileUploadModal;
