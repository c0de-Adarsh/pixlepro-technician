import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import TeamContent from "../components/TeamContent";

export default function TeamPage() {
  return (
    <Layout activeTab="team">
      {() => (
        <>
          <Head>
            <title>Team Management - PiXL Pro Admin</title>
            <meta name="description" content="Manage and add users to your field service team" />
          </Head>
          <TeamContent />
        </>
      )}
    </Layout>
  );
}
