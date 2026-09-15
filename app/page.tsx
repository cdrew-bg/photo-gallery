import { PhotoGrid } from '@/features/gallery/components/photo-grid.component';
import { PasswordGate } from '@/features/gate/components/password-gate.component';

export default function Home() {
  return (
    <main>
      <PasswordGate>
        <PhotoGrid />
      </PasswordGate>
    </main>
  );
}
