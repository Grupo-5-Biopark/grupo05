import { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';

function Loading() {
  return <div>Loading...</div>;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
