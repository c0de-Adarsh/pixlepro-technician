import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import PriceBookContent from "../components/PriceBookContent";

export default function PriceBookPage() {
  return (
    <Layout activeTab="price-book">
      {() => (
        <>
          <Head>
            <title>Price book - PiXL Pro Admin</title>
            <meta
              name="description"
              content="Organize and manage your business offerings and pricing"
            />
          </Head>
          <PriceBookContent />
        </>
      )}
    </Layout>
  );
}
