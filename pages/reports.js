import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import AgingInvoicesContent from "../components/AgingInvoicesContent";

export default function ReportsPage() {
  return (
    <Layout activeTab="reports">
      {() => (
        <>
          <Head>
            <title>Aging Invoices Report - PiXL Pro Admin</title>
            <meta name="description" content="Aging Invoices Report & Overdue Analytics" />
          </Head>
          <AgingInvoicesContent />
        </>
      )}
    </Layout>
  );
}
