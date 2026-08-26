import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import AgingInvoicesContent from "../../components/AgingInvoicesContent";

export default function AgingInvoicesPage() {
  return (
    <Layout activeTab="reports">
      {() => (
        <>
          <Head>
            <title>Aging Invoices Report - PiXL Pro Admin</title>
            <meta
              name="description"
              content="Aging Invoices Report & Client Overdue Billing Statement"
            />
          </Head>
          <AgingInvoicesContent />
        </>
      )}
    </Layout>
  );
}
