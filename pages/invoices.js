import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import InvoicesContent from "../components/InvoicesContent";

export default function InvoicesPage() {
  return (
    <Layout activeTab="invoices">
      {() => (
        <>
          <Head>
            <title>Invoices Management - PiXL Pro Admin</title>
            <meta
              name="description"
              content="Review and manage all financial invoices and billing statements."
            />
          </Head>
          <InvoicesContent />
        </>
      )}
    </Layout>
  );
}
