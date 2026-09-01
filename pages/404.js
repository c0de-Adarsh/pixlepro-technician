import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import NotFoundState from "../components/NotFoundState";

export default function Custom404Page() {
  return (
    <Layout activeTab="home">
      {() => (
        <>
          <Head>
            <title>Page Not Found - PiXL Pro</title>
            <meta name="description" content="The page you requested could not be found." />
          </Head>
          <NotFoundState
            title="Page Not Found"
            message="This page was probably deleted, restricted or never existed."
            buttonText="Back to Home"
            backUrl="/"
            breadcrumbs={[
              { label: "HOME", url: "/" },
              { label: "404 ERROR" },
            ]}
          />
        </>
      )}
    </Layout>
  );
}
