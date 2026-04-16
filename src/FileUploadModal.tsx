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
                <Dialog.Overlay className="fileUploadOverlay"/>
                <Dialog.Content className="fileUploadContent">
                    <Dialog.Title>{name}</Dialog.Title>
                    <Dialog.Description>
                        Select a file and click upload to run the function.
                    </Dialog.Description>
                    <input className="fileUploadInput" type="file" onChange={handleFileChange}/>
                    {file && <p>Selected: {file.name}</p>}

                    <div className="fileUploadActions">
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
