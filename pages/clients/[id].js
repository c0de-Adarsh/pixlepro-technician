import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import ClientDetailContent from "../../components/ClientDetailContent";

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout activeTab="clients">
      {() => (
        <>
          <Head>
            <title>Client Details - PiXL Pro Admin</title>
            <meta name="description" content="View Field Service Client Details" />
          </Head>
          <ClientDetailContent clientId={id} />
        </>
      )}
    </Layout>
  );
}
