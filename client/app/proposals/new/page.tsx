'use client';

import AppShell from '@/components/AppShell';
import { Page } from '@/components/app/PageHead';
import ProposalForm from '@/components/ProposalForm';

export default function NewProposal() {
  return (
    <AppShell>
      <Page>
        <ProposalForm />
      </Page>
    </AppShell>
  );
}
