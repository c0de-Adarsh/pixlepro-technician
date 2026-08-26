import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CreateModal from "./CreateModal";
import AddClientModal from "./AddClientModal";
import AddEventDrawer from "./AddEventDrawer";

export default function Layout({ children, activeTab }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
          {typeof children === "function" ? children(searchQuery) : children}
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
