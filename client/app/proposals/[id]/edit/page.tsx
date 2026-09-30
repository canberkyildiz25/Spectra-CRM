'use client';

import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Page } from '@/components/app/PageHead';
import ProposalForm from '@/components/ProposalForm';

export default function EditProposal() {
  const { id } = useParams<{ id: string }>();
  return (
    <AppShell>
      <Page>
        <ProposalForm proposalId={id} />
      </Page>
    </AppShell>
  );
}
