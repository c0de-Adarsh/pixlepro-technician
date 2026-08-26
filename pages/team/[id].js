import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "../../components/Layout";
import UserSettingsContent from "../../components/UserSettingsContent";

export default function UserSettingsPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout activeTab="team">
      {() => (
        <>
          <Head>
            <title>User Settings - PiXL Pro Admin</title>
            <meta name="description" content="Manage team member profile, availability, and advanced settings" />
          </Head>
          <UserSettingsContent memberId={id} />
        </>
      )}
    </Layout>
  );
}
