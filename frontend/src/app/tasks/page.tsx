'use client';

import { Suspense } from 'react';
import TasksContent from './TasksContent';
import Layout from '@/components/Layout';

export default function TasksPage() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="text-center py-12">Loading tasks...</div>
      }>
        <TasksContent />
      </Suspense>
    </Layout>
  );
}
