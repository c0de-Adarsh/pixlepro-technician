import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CreateModal from "./CreateModal";
import AddClientModal from "./AddClientModal";
import AddEventDrawer from "./AddEventDrawer";
import NotFoundState from "./NotFoundState";

// Paths restricted for Technician role
const TECH_RESTRICTED_PREFIXES = [
  "/leads",
  "/phone",
  "/answering",
  "/team",
  "/marketing",
  "/messages",
];

const TECH_RESTRICTED_TABS = ["leads", "phone", "answering", "team", "marketing", "messages"];

export default function Layout({ children, activeTab }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState("admin");
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);

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
    } catch (e) {
    } finally {
      setIsRoleLoaded(true);
    }
  }, []);

  const isTech = userRole === "tech";
  const currentPath = router.pathname || "";

  // Check if current route is restricted for technician
  const isRestrictedForTech =
    isTech &&
    (TECH_RESTRICTED_TABS.includes(activeTab) ||
      TECH_RESTRICTED_PREFIXES.some((prefix) => currentPath.startsWith(prefix)) ||
      (currentPath.startsWith("/settings") && currentPath !== "/settings/account"));

  return (
    <div className="h-screen w-screen overflow-hidden flex text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateClick={() => setIsCreateModalOpen(true)}
        onOpenAddClient={() => setIsAddClientOpen(true)}
        onOpenAddEvent={() => setIsAddEventOpen(true)}
        activeTab={activeTab}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          onSearchChange={(query) => setSearchQuery(query)}
        />

        <main className="flex-1 overflow-y-auto">
          {isRestrictedForTech ? (
            <NotFoundState
              title="Access Restricted"
              message="This page was probably deleted, restricted or never existed."
              buttonText="Back to Schedule"
              backUrl="/schedule"
              breadcrumbs={[
                { label: "PIXL PRO", url: "/schedule" },
                { label: "RESTRICTED ACCESS" },
              ]}
            />
          ) : typeof children === "function" ? (
            children(searchQuery)
          ) : (
            children
          )}
        </main>
      </div>

      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />

      <AddEventDrawer
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
      />
    </div>
  );
}
