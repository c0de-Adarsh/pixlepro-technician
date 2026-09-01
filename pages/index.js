import React, { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import DashboardContent from "../components/DashboardContent";
import TechnicianDashboardContent from "../components/TechnicianDashboardContent";

export default function DashboardPage() {
  const [userRole, setUserRole] = useState("admin");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userDetail");
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.role === "tech" || u.role === "technician")) {
          setUserRole("tech");
        } else {
          setUserRole("admin");
        }
      }
    } catch (e) {}
  }, []);

  return (
    <Layout activeTab="home">
      {(searchQuery) => (
        <>
          <Head>
            <title>
              {userRole === "tech" ? "Technician Portal - PiXL Pro" : "Dashboard - PiXL Pro Admin"}
            </title>
            <meta name="description" content="PiXL Pro Dashboard" />
          </Head>
          {userRole === "tech" ? (
            <TechnicianDashboardContent />
          ) : (
            <DashboardContent searchQuery={searchQuery} />
          )}
        </>
      )}
    </Layout>
  );
}
