import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import DashboardContent from "../components/DashboardContent";

export default function DashboardPage() {
  return (
    <Layout activeTab="home">
      {(searchQuery) => (
        <>
          <Head>
            <title>Dashboard - PiXL Pro Admin</title>
            <meta name="description" content="PiXL Pro Admin Dashboard" />
          </Head>
          <DashboardContent searchQuery={searchQuery} />
        </>
      )}
    </Layout>
  );
}
