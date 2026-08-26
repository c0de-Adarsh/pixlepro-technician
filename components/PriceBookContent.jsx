import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search,
  Plus,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import AddPriceBookItemModal from "./AddPriceBookItemModal";
import CreateItemGroupModal from "./CreateItemGroupModal";
import CreateCategoryModal from "./CreateCategoryModal";
import CreateBrandModal from "./CreateBrandModal";
import { Api } from "../services/service";

export default function PriceBookContent() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState("items");
  const [searchTerm, setSearchTerm] = useState("");
  const [showActiveFilter, setShowActiveFilter] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [itemGroups, setItemGroups] = useState([]);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);

  const [brands, setBrands] = useState([]);
  const [isCreateBrandModalOpen, setIsCreateBrandModalOpen] = useState(false);

  const subTabs = [
    { id: "items", label: "Items & products" },
    { id: "groups", label: "Item groups" },
    { id: "categories", label: "Item categories" },
    { id: "brands", label: "Item brands" },
    { id: "catalogs", label: "Catalogs" },
  ];

  const [priceBookItems, setPriceBookItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await Api("get", "api/price-book", null, router);
      const itemsList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      
      const formatted = itemsList.map((item) => ({
        id: item.item_id || String(item._id),
        _id: item._id,
        name: item.name,
        description: item.description || "",
        price: typeof item.price === "number" ? `$${item.price.toFixed(2)}` : item.price || "$0.00",
        cost: typeof item.cost === "number" ? `$${item.cost.toFixed(2)}` : item.cost || "$0.00",
        type: item.type || "Service",
        category: item.category || "",
        modelNo: item.model_no || "",
        brand: item.brand || "",
        booking: item.booking || "No",
        inventory: item.inventory || "No",
        hasImage: !!item.image_url,
      }));

      setPriceBookItems(formatted);
    } catch (err) {
      console.error("Error fetching price book items:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = priceBookItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredGroups = itemGroups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddNewClick = () => {
    if (activeSubTab === "groups") {
      setIsCreateGroupModalOpen(true);
    } else if (activeSubTab === "categories") {
      setIsCreateCategoryModalOpen(true);
    } else if (activeSubTab === "brands") {
      setIsCreateBrandModalOpen(true);
    } else {
      setIsAddModalOpen(true);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Price book
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            {activeSubTab === "groups"
              ? "Item groups help you add multiple items to invoices and estimates"
              : activeSubTab === "categories"
              ? "Item categories help manage and streamline your items, making it easy to navigate your price book and inventory"
              : "Price book streamlines your estimating process by letting you organize and manage your business offerings and pricing"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNewClick}
          className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-[#D31010] text-[#D31010] font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeSubTab === "groups" ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative">
              <select className="pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200 min-w-[120px]">
                <option value="Active">Active</option>
                <option value="All">All</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-800 dark:text-slate-200 shadow-sm"
                />
              </div>

              <div className="relative">
                <select className="pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200">
                  <option value="50">50</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => toast.success("Exporting Item Groups to CSV...")}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              >
                Export
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="py-3.5 px-6">Name</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6">Items</th>
                    <th className="py-3.5 px-6">Group type</th>
                    <th className="py-3.5 px-6">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center font-bold text-slate-700 dark:text-slate-300 text-sm">
                        No Records Found
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((grp) => (
                      <tr key={grp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{grp.name}</td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{grp.description}</td>
                        <td className="py-4 px-6 font-semibold">{grp.items}</td>
                        <td className="py-4 px-6 font-semibold">{grp.groupType}</td>
                        <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">{grp.total}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeSubTab === "categories" ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative">
              <select className="pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200 min-w-[120px]">
                <option value="Active">Active</option>
                <option value="All">All</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-800 dark:text-slate-200 shadow-sm"
                />
              </div>

              <div className="relative">
                <select className="pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => toast.success("Exporting Item Categories to CSV...")}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              >
                Export
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="py-3.5 px-6">Name</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6">Parent category</th>
                    <th className="py-3.5 px-6">No. of active items</th>
                    <th className="py-3.5 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center font-bold text-slate-700 dark:text-slate-300 text-sm">
                        No Records Found
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{cat.name}</td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{cat.description}</td>
                        <td className="py-4 px-6 font-semibold">{cat.parentCategory}</td>
                        <td className="py-4 px-6 font-semibold">{cat.activeItems}</td>
                        <td className="py-4 px-6 font-bold text-[#D31010]">Edit</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeSubTab === "brands" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-800 dark:text-slate-200 shadow-sm"
              />
            </div>

            <div className="relative">
              <select className="pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="py-3.5 px-6">Name</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredBrands.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-20 text-center font-bold text-slate-700 dark:text-slate-300 text-sm">
                        No Records Found
                      </td>
                    </tr>
                  ) : (
                    filteredBrands.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{b.name}</td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{b.description}</td>
                        <td className="py-4 px-6 font-bold text-[#D31010]">Edit</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Show:</span>
              {showActiveFilter && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200">
                  <span>status: Active items</span>
                  <button
                    type="button"
                    onClick={() => setShowActiveFilter(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-800 dark:text-slate-200 shadow-sm"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredItems.length > 0 &&
                          selectedIds.length === filteredItems.length
                        }
                        onChange={handleSelectAll}
                        className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">NAME</th>
                    <th className="py-3.5 px-4">DESCRIPTION</th>
                    <th className="py-3.5 px-4">PRICE</th>
                    <th className="py-3.5 px-4">COST</th>
                    <th className="py-3.5 px-4">TYPE</th>
                    <th className="py-3.5 px-4">CATEGORY</th>
                    <th className="py-3.5 px-4">MODEL #</th>
                    <th className="py-3.5 px-4">BRAND</th>
                    <th className="py-3.5 px-4">BOOKING</th>
                    <th className="py-3.5 px-4">INVENTORY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelectOne(item.id)}
                          className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-4 font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                            {item.hasImage ? (
                              <span className="text-[10px] font-bold text-blue-500">🖼️</span>
                            ) : (
                              <ImageIcon className="w-4 h-4" />
                            )}
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.id}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white max-w-[200px]">
                        {item.name}
                      </td>

                      <td className="py-4 px-4 font-normal text-slate-500 dark:text-slate-400 max-w-[200px]">
                        {item.description || "-"}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {item.price}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {item.cost}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.type}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-400">
                        {item.category || "-"}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-400">
                        {item.modelNo || "-"}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-400">
                        {item.brand || "-"}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.booking}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.inventory}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Showing 1 to {filteredItems.length} of 248 entries</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled
                  className="p-1 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#D31010] text-white font-bold text-xs shadow-sm"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
                >
                  2
                </button>
                <button
                  type="button"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
                >
                  3
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
                >
                  62
                </button>

                <button
                  type="button"
                  className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddPriceBookItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={(newItem) => setPriceBookItems((prev) => [newItem, ...prev])}
      />

      <CreateItemGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreated={(newGroup) => setItemGroups((prev) => [newGroup, ...prev])}
      />

      <CreateCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        onCreated={(newCat) => setCategories((prev) => [newCat, ...prev])}
      />

      <CreateBrandModal
        isOpen={isCreateBrandModalOpen}
        onClose={() => setIsCreateBrandModalOpen(false)}
        onCreated={(newBrand) => setBrands((prev) => [newBrand, ...prev])}
      />
    </div>
  );
}
