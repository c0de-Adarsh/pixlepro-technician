import React from "react";
import Layout from "../components/Layout";
import MessagesContent from "../components/MessagesContent";
import Head from "next/head";

export default function MessagesPage() {
  return (
    <Layout>
      <Head>
        <title>Messages - PixelPro Admin</title>
      </Head>
      <MessagesContent />
    </Layout>
  );
}
