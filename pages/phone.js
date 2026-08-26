import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import PixlPhoneContent from "../components/PixlPhoneContent";

export default function PhonePage() {
  return (
    <Layout activeTab="phone">
      {() => (
        <>
          <Head>
            <title>PiXL Phone - PiXL Pro Admin</title>
            <meta name="description" content="PiXL Phone Operations" />
          </Head>
          <PixlPhoneContent />
        </>
      )}
    </Layout>
  );
}
