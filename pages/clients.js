import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import ClientsContent from "../components/ClientsContent";

export default function ClientsPage() {
  return (
    <Layout activeTab="clients">
      {() => (
        <>
          <Head>
            <title>Clients - PiXL Pro Admin</title>
            <meta name="description" content="Manage and Track Field Service Clients" />
          </Head>
          <ClientsContent />
        </>
      )}
    </Layout>
  );
}
