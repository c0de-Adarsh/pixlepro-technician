import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import InvoiceDetailContent from "../../components/InvoiceDetailContent";

export default function InvoiceDetailPage() {
  return (
    <Layout activeTab="invoices">
      {() => (
        <>
          <Head>
            <title>Invoice Details - PiXL Pro Admin</title>
            <meta name="description" content="View and manage invoice details" />
          </Head>
          <InvoiceDetailContent />
        </>
      )}
    </Layout>
  );
}
