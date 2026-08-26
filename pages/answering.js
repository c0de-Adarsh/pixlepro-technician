import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import AnsweringContent from "../components/AnsweringContent";

export default function AnsweringPage() {
  return (
    <Layout activeTab="answering">
      {() => (
        <>
          <Head>
            <title>Answering - PiXL Pro Admin</title>
            <meta name="description" content="Answering Operations & Calls" />
          </Head>
          <AnsweringContent />
        </>
      )}
    </Layout>
  );
}
