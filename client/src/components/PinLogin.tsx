import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface PinLoginProps {
  onSubmit: (pin: string) => Promise<boolean>;
  loading?: boolean;
  error?: string | null;
}

interface FormData {
  pin: string;
}

export const PinLogin: React.FC<PinLoginProps> = ({ 
  onSubmit, 
  loading = false, 
  error 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>();

  const watchPin = watch('pin');

  const onFormSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(data.pin);
      if (!success) {
        // Error is handled by parent component
      }
    } catch (error) {
      console.error('Error submitting PIN:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ddLOG
            </h1>
            <p className="text-gray-600">
              Digite seu PIN para acessar suas tarefas
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                PIN de Acesso
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className={`input-field text-center text-xl tracking-widest ${errors.pin ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="000000"
                {...register('pin', {
                  required: 'PIN é obrigatório',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'PIN deve conter exatamente 6 dígitos'
                  }
                })}
                disabled={isSubmitting || loading}
                autoFocus
              />
              {errors.pin && (
                <p className="text-sm text-red-600 mt-1">{errors.pin.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading || !watchPin || watchPin.length !== 6}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Suas tarefas estão protegidas por criptografia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};