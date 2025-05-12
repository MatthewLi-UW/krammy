import { useState } from 'react';
import { shareADeck } from '@/utils/sendData';
import { ACCESS } from '@/types/Access';

interface ShareModalProps {
  deckId: number | null;
  deckName: string;
  onClose: () => void;
  isOpen: boolean;
}

export default function ShareModal({ deckId, deckName, onClose, isOpen }: ShareModalProps) {
  const [accessType, setAccessType] = useState<'READ' | 'WRITE'>(ACCESS.READ);
  const [shareLink, setShareLink] = useState('');
  const [expiryHours, setExpiryHours] = useState(24);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;
  
  const handleShare = async () => {
    if (!deckId) return;
    
    setIsLoading(true);
    try {
      const expiryMs = expiryHours * 60 * 60 * 1000;
      const { shareLink } = await shareADeck(deckId, accessType, expiryMs);
      setShareLink(shareLink);
    } catch (error) {
      console.error('Error sharing deck:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-background-light)] rounded-xl shadow-lg max-w-md w-full animate-scaleIn">
        <div className="p-5 border-b border-[var(--color-card-medium)]/30">
          <h3 className="text-xl font-bold text-[var(--color-text-dark)]">
            Share &quot;{deckName}&quot;
          </h3>
        </div>
        
        <div className="p-6">
          {!shareLink ? (
            <>
              <div className="mb-4">
                <label className="block text-[var(--color-text)] text-sm mb-2">
                  Access Type
                </label>
                <div className="flex rounded-lg overflow-hidden border border-[var(--color-card-medium)]/50">
                  <button
                    onClick={() => setAccessType(ACCESS.READ)}
                    className={`flex-1 py-2.5 text-center transition-colors ${
                      accessType === ACCESS.READ 
                        ? 'bg-[var(--color-primary)] text-white' 
                        : 'bg-[var(--color-card-light)] text-[var(--color-text)]'
                    }`}
                  >
                    Copy Access
                  </button>
                  <button
                    onClick={() => setAccessType(ACCESS.WRITE)}
                    className={`flex-1 py-2.5 text-center transition-colors ${
                      accessType === ACCESS.WRITE 
                        ? 'bg-[var(--color-primary)] text-white' 
                        : 'bg-[var(--color-card-light)] text-[var(--color-text)]'
                    }`}
                  >
                    Edit Access
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-[var(--color-text)] text-sm mb-2">
                  Link Expiry
                </label>
                <select
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(Number(e.target.value))}
                  className="w-full p-2.5 bg-[var(--color-card-light)] border border-[var(--color-card-medium)]/50 rounded-lg"
                >
                  <option value={1}>1 hour</option>
                  <option value={24}>24 hours</option>
                  <option value={72}>3 days</option>
                  <option value={168}>7 days</option>
                </select>
              </div>
              
              <button
                onClick={handleShare}
                disabled={isLoading}
                className="w-full py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  'Generate Share Code'
                )}
              </button>
            </>
          ) : (
            <div className="animate-fadeIn">
              <p className="text-[var(--color-text)] mb-3">
                Your share code is ready! Copy and share it with others:
              </p>
              <div className="flex mb-4">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 p-2.5 bg-[var(--color-card-light)] border border-[var(--color-card-medium)]/50 rounded-l-lg"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 bg-[var(--color-primary)] text-white rounded-r-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[var(--color-text-light)] text-sm">
                This code will expire in {expiryHours} hour{expiryHours !== 1 ? 's' : ''}.
              </p>
              <button
                onClick={() => setShareLink('')}
                className="mt-4 w-full py-2.5 bg-[var(--color-secondary)] text-[var(--color-text-dark)] rounded-lg hover:bg-[var(--color-secondary-dark)] transition-colors"
              >
                Create Another Code
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-[var(--color-card-medium)]/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--color-text)] hover:text-[var(--color-text-dark)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}