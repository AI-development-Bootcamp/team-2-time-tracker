import { useNavigate } from 'react-router-dom';
import { PasswordChangeForm } from '@client/ui';
import { useAuthStore } from '../app/stores/auth.store';
import { useState } from 'react';

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const { changePassword } = useAuthStore();
    const [pageError, setPageError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
        setIsSubmitting(true);
        setPageError('');
        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            });
            navigate('/');
        } catch (error: unknown) {
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { error?: string } })?.data?.error || 'Password change failed'
                : 'Password change failed';
            setPageError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        החלפת סיסמה
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        אנא בחר סיסמה חדשה למערכת
                    </p>
                </div>

                <div className="bg-white p-8 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                    <PasswordChangeForm
                        onSubmit={handleSubmit}
                        onCancel={() => navigate(-1)}
                        isLoading={isSubmitting}
                        error={pageError}
                    />
                </div>
            </div>
        </div>
    );
}
